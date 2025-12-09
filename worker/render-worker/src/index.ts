import Queue, { Job } from 'bull'
import path from 'path'
import { promises as fs } from 'fs'
import puppeteer from 'puppeteer-core'

type RenderFormat = 'pdf' | 'png'

interface RenderJobData {
  projectId: string
  format: RenderFormat
}

const redisHost = process.env.REDIS_HOST || 'localhost'
const redisPort = Number(process.env.REDIS_PORT || 6379)

const frontendRenderBaseUrl =
  process.env.FRONTEND_RENDER_URL || 'http://localhost:4173/render'
const outputDir = process.env.RENDER_OUTPUT_DIR || '/tmp/renders'
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH

const renderQueue = new Queue<RenderJobData>('render', {
  redis: { host: redisHost, port: redisPort },
})

console.log(`[render-worker] Connected to Redis at ${redisHost}:${redisPort}`)
console.log('[render-worker] Waiting for jobs in queue "render"...')
console.log(`[render-worker] FRONTEND_RENDER_URL=${frontendRenderBaseUrl}`)
console.log(`[render-worker] RENDER_OUTPUT_DIR=${outputDir}`)

renderQueue.process(async (job: Job<RenderJobData>) => {
  const { projectId, format } = job.data

  console.log(
    `[render-worker] Got job ${job.id}: projectId=${projectId}, format=${format}`,
  )

  if (!projectId) {
    throw new Error('projectId is required')
  }

  if (format !== 'pdf' && format !== 'png') {
    throw new Error(`Unsupported format: ${format}`)
  }

  await fs.mkdir(outputDir, { recursive: true })

  const timestamp = Date.now()
  const filename = `${projectId}-${timestamp}.${format}`
  const filePath = path.join(outputDir, filename)
  const publicUrl = `/renders/${filename}`
  const url = `${frontendRenderBaseUrl}/${projectId}`

  console.log(`[render-worker] Opening URL: ${url}`)
  console.log(`[render-worker] Target file: ${filePath}`)

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Базовый viewport под A4 вертикально, можно будет вынести в настройки позже.
    await page.setViewport({ width: 1240, height: 1754 })

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 60_000,
    })

    if (format === 'pdf') {
      await page.pdf({
        path: filePath,
        printBackground: true,
        preferCSSPageSize: true,
        format: 'A4',
      })
    } else {
      await page.screenshot({
        path: filePath,
        fullPage: true,
      })
    }

    console.log(`[render-worker] Rendered ${format.toUpperCase()} to ${filePath}`)

    return {
      status: 'completed',
      format,
      filePath,
      publicUrl,
    }
  } catch (err) {
    console.error('[render-worker] Render failed:', err)
    throw err
  } finally {
    await browser.close()
  }
})

renderQueue.on('completed', (job, result) => {
  console.log(
    `[render-worker] Job ${job.id} completed with result:`,
    JSON.stringify(result),
  )
})

renderQueue.on('failed', (job, err) => {
  console.error(
    `[render-worker] Job ${job?.id} failed:`,
    err instanceof Error ? err.message : err,
  )
})

renderQueue.on('error', (err) => {
  console.error('[render-worker] Queue error:', err)
})
