import Queue, { Job } from 'bull'
import path from 'path'
import { promises as fs } from 'fs'
import puppeteer from 'puppeteer-core'

type RenderFormat = 'pdf' | 'png'
type RenderPresetId = 'a4-vertical' | 'a3-vertical'

interface RenderJobData {
  projectId: string
  format: RenderFormat
  preset?: RenderPresetId
}

const VIEWPORT_DPI = 150
const MM_PER_INCH = 25.4

function mmToPx(mm: number, dpi = VIEWPORT_DPI): number {
  return Math.round((mm / MM_PER_INCH) * dpi)
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
  const preset = getPreset(job.data.preset)
  const url = `${frontendRenderBaseUrl}/${projectId}?preset=${preset.id}`


  console.log(`[render-worker] Opening URL: ${url}`)
  console.log(`[render-worker] Target file: ${filePath}`)

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

  const preset = getPreset(job.data.preset)

  await page.setViewport({
    width: mmToPx(preset.pageWidthMm),
    height: mmToPx(preset.pageHeightMm),
  })

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

const PRINT_PRESETS: Record<
  RenderPresetId,
  {
    id: RenderPresetId
    label: string
    pageWidthMm: number
    pageHeightMm: number
    // поля (внутренние отступы, куда нельзя залезать основным контентом)
    marginMm: { top: number; right: number; bottom: number; left: number }
    // безопасная зона (доп. отступ от края контента до края бумаги)
    safeZoneMm: number
    // bleed — на сколько за край бумаги мы выносим фон/картинку
    bleedMm: number
  }
> = {
  'a4-vertical': {
    id: 'a4-vertical',
    label: 'A4 vertical',
    pageWidthMm: 210,
    pageHeightMm: 297,
    marginMm: { top: 10, right: 10, bottom: 10, left: 10 },
    safeZoneMm: 5,
    bleedMm: 3,
  },
  'a3-vertical': {
    id: 'a3-vertical',
    label: 'A3 vertical',
    pageWidthMm: 297,
    pageHeightMm: 420,
    marginMm: { top: 12, right: 12, bottom: 12, left: 12 },
    safeZoneMm: 6,
    bleedMm: 3,
  },
}

function getPreset(id: RenderPresetId | undefined): (typeof PRINT_PRESETS)[RenderPresetId] {
  return PRINT_PRESETS[id ?? 'a4-vertical']
}

if (format === 'pdf') {
  const preset = getPreset(job.data.preset)

  await page.pdf({
    path: filePath,
    printBackground: true,
    preferCSSPageSize: true,
    // Сам формат (для Puppeteer)
    format: preset.id === 'a4-vertical' ? 'A4' : 'A3',
    // Поля печати в миллиметрах
    margin: {
      top: `${preset.marginMm.top}mm`,
      right: `${preset.marginMm.right}mm`,
      bottom: `${preset.marginMm.bottom}mm`,
      left: `${preset.marginMm.left}mm`,
    },
  })
} else {
  await page.screenshot({
    path: filePath,
    fullPage: true,
  })
}
