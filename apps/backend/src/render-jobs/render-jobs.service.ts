import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import Queue from 'bull'
import { RenderJob, RenderJobStatus } from '../entities/render-job.entity'
import { Project } from '../entities/project.entity'

export type RenderFormat = 'pdf' | 'png'

export type RenderPresetId = 'a4-vertical' | 'a3-vertical'

interface RenderQueueJobData {
  projectId: string
  format: RenderFormat
  preset?: RenderPresetId // <-- новое поле, опционально
}


export interface RenderJobDto {
  id: string
  projectId: string | null
  ownerId: string
  status: RenderJobStatus
  resultUrl: string | null
  error: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRenderJobOptions {
  format?: RenderFormat
  preset?: RenderPresetId
}

export interface RenderJobCallbackDto {
  status: RenderJobStatus
  resultUrl?: string | null
  error?: string | null
}

@Injectable()
export class RenderJobsService {
  private readonly logger = new Logger(RenderJobsService.name)
  private readonly queue: Queue<RenderQueueJobData>

  constructor(
    @InjectRepository(RenderJob)
    private readonly jobsRepo: Repository<RenderJob>,
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
  ) {
    const redisHost = process.env.REDIS_HOST || 'localhost'
    const redisPort = Number(process.env.REDIS_PORT || 6379)

    this.queue = new Queue<RenderQueueJobData>('render', {
      redis: { host: redisHost, port: redisPort },
    })

    this.logger.log(
      `Render queue initialized (redis://${redisHost}:${redisPort}/0)`,
    )
  }

  private toDto(entity: RenderJob): RenderJobDto {
    return {
      id: entity.id,
      projectId: entity.project ? entity.project.id : null,
      ownerId: entity.ownerId,
      status: entity.status,
      resultUrl: entity.resultUrl,
      error: entity.error,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    }
  }

  async createForProject(
    projectId: string,
    ownerId: string,
    options: CreateRenderJobOptions = {},
  ): Promise<RenderJobDto> {
    const format: RenderFormat = options.format || 'pdf'

    const project = await this.projectsRepo.findOne({
      where: { id: projectId, owner: { id: ownerId } },
      relations: ['owner'],
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const jobEntity = this.jobsRepo.create({
      project,
      ownerId,
      status: 'pending',
      resultUrl: null,
      error: null,
    })

    const savedJob = await this.jobsRepo.save(jobEntity)

    this.logger.log(
      `Enqueue render job ${savedJob.id} for project ${projectId}, owner ${ownerId}, format=${format}`,
    )

    await this.queue.add(
      {
        projectId,
        format,
      },
      {
        attempts: 3,
        backoff: 5000,
        removeOnComplete: true,
        removeOnFail: false,
        jobId: savedJob.id,
      },
    )

    return this.toDto(savedJob)
  }

  async findForOwner(jobId: string, ownerId: string): Promise<RenderJobDto> {
    const job = await this.jobsRepo.findOne({
      where: { id: jobId, ownerId },
      relations: ['project'],
    })

    if (!job) {
      throw new NotFoundException('Render job not found')
    }

    return this.toDto(job)
  }

  /**
   * Optional callback endpoint for worker.
   * Can be wired later from the render-worker service.
   */
  async applyCallback(
    jobId: string,
    payload: RenderJobCallbackDto,
  ): Promise<RenderJobDto> {
    const job = await this.jobsRepo.findOne({
      where: { id: jobId },
      relations: ['project'],
    })

    if (!job) {
      throw new NotFoundException('Render job not found')
    }

    if (payload.status) {
      job.status = payload.status
    }
    if (typeof payload.resultUrl !== 'undefined') {
      job.resultUrl = payload.resultUrl
    }
    if (typeof payload.error !== 'undefined') {
      job.error = payload.error
    }

    const saved = await this.jobsRepo.save(job)

    const payload: RenderQueueJobData = {
      projectId: project.id,
      format: options?.format ?? 'pdf',
      preset: options?.preset ?? 'a4-vertical',
    }

    await this.renderQueue.add(payload, {
      attempts: 3,
    })

    this.logger.log(
      `Render job ${jobId} updated from callback: status=${saved.status}, resultUrl=${saved.resultUrl}`,
    )

    return this.toDto(saved)
  }
}
