import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // CORS, чтобы фронтенд мог ходить к API
  app.enableCors({
    origin: true,
    credentials: true,
  })

  const port = process.env.PORT || 3000
  await app.listen(port)

  // Лог, чтобы в docker logs было понятно, что сервис поднялся
  // eslint-disable-next-line no-console
  console.log(`12Frames backend is running on port ${port}`)
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap Nest application', err)
  process.exit(1)
})
