import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RenderJob } from '../entities/render-job.entity'
import { Project } from '../entities/project.entity'
import { RenderJobsController } from './render-jobs.controller'
import { RenderJobsService } from './render-jobs.service'

@Module({
  imports: [TypeOrmModule.forFeature([RenderJob, Project])],
  controllers: [RenderJobsController],
  providers: [RenderJobsService],
})
export class RenderJobsModule {}
