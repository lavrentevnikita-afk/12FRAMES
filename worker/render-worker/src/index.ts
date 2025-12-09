import Queue from 'bull'

const redisHost = process.env.REDIS_HOST || 'localhost'
const redisPort = Number(process.env.REDIS_PORT || 6379)

const renderQueue = new Queue('render', {
  redis: { host: redisHost, port: redisPort },
})

console.log(`[render-worker] Connected to Redis at ${redisHost}:${redisPort}`)
console.log('[render-worker] Waiting for jobs in queue "render"...')

renderQueue.process(async (job) => {
  console.log('[render-worker] Got job:', job.id, job.data)
  // Пока только логируем и завершаем задачу.
  return {
    status: 'ok',
    note: 'Реальный рендеринг PDF будет реализован на следующем этапе.',
  }
})

renderQueue.on('error', (err) => {
  console.error('[render-worker] Queue error:', err)
})
