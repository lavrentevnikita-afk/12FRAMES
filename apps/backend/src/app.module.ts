import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { User } from './entities/user.entity'
import { Project } from './entities/project.entity'
import { Template } from './entities/template.entity'
import { RenderJob } from './entities/render-job.entity'
import { AuthModule } from './auth/auth.module'
import { ProjectsModule } from './projects/projects.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || '12frames',
      password: process.env.POSTGRES_PASSWORD || '12frames_password',
      database: process.env.POSTGRES_DB || '12frames_db',
      entities: [User, Project, Template, RenderJob],
      synchronize: true,           // 🔥 было false
      autoLoadEntities: false,
    }),
    
    AuthModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
