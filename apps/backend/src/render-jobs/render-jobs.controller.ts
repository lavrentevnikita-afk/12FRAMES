import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common'
import {
  CreateRenderJobOptions,
  RenderJobCallbackDto,
  RenderJobDto,
  RenderPresetId,
  RenderJobsService,
} from './render-jobs.service'


class CreateRenderJobDto {
  format?: CreateRenderJobOptions['format']
  preset?: RenderPresetId
}

@Controller()
export class RenderJobsController {
  constructor(private readonly renderJobsService: RenderJobsService) {}

  private extractToken(authHeader?: string): string {
    if (!authHeader) return ''
    const [type, token] = authHeader.split(' ')
    if (type && type.toLowerCase() === 'bearer' && token) return token
    return ''
  }

  /**
   * POST /projects/:id/render — создать задачу рендера
   */
  @Post('projects/:projectId/render')
  async createRenderJob(
    @Param('projectId') projectId: string,
    @Body() body: CreateRenderJobDto,
    @Headers('x-user-id') ownerId: string,
  ): Promise<RenderJobDto> {
    return this.renderJobsService.createRenderJob(projectId, ownerId, {
      format: body.format ?? 'pdf',
      preset: body.preset ?? 'a4-vertical',
    })
  }

  /**
   * GET /render-jobs/:jobId — получить статус задачи
   */
  @Get('render-jobs/:jobId')
  async getRenderJob(
    @Param('jobId') jobId: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<RenderJobDto> {
    const token = this.extractToken(authHeader)
    return this.renderJobsService.findForOwner(jobId, token)
  }

  /**
   * (опционально) webhook/callback при завершении.
   * На данном этапе без авторизации, предполагается использование
   * внутреннего секрета/сети на уровне инфраструктуры.
   */
  @Post('render-jobs/:jobId/callback')
  async handleCallback(
    @Param('jobId') jobId: string,
    @Body() body: RenderJobCallbackDto,
  ): Promise<RenderJobDto> {
    return this.renderJobsService.applyCallback(jobId, body)
  }
}
