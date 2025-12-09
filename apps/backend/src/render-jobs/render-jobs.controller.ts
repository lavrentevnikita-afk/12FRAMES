import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common'
import {
  CreateRenderJobOptions,
  RenderJobCallbackDto,
  RenderJobDto,
  RenderJobsService,
} from './render-jobs.service'

class CreateRenderJobDto {
  format?: CreateRenderJobOptions['format']
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
  @Post('projects/:id/render')
  async createRenderJob(
    @Param('id') projectId: string,
    @Body() body: CreateRenderJobDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<RenderJobDto> {
    const token = this.extractToken(authHeader)
    return this.renderJobsService.createForProject(projectId, token, {
      format: body.format,
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
