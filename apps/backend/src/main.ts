import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true
  })

  const port = process.env.BACKEND_PORT || 3000
  await app.listen(port)
  console.log(`Backend listening on http://localhost:${port}/api`)
}

bootstrap()
