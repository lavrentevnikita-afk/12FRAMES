import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common'
import { ProjectsService, ProjectDto } from './projects.service'

class CreateProjectDto {
  name: string
}

class UpdateProjectDto {
  name?: string
  settings?: ProjectDto['settings']
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  private extractToken(authHeader?: string): string {
    if (!authHeader) return ''
    const [type, token] = authHeader.split(' ')
    if (type.toLowerCase() === 'bearer' && token) return token
    return ''
  }

  @Get()
  findAll(@Headers('authorization') authHeader?: string): Promise<ProjectDto[]> {
    const token = this.extractToken(authHeader)
    return this.projectsService.findAllByOwner(token)
  }

  @Post()
  create(
    @Body() body: CreateProjectDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<ProjectDto> {
    const token = this.extractToken(authHeader)
    return this.projectsService.createForOwner(body.name, token)
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<ProjectDto> {
    const token = this.extractToken(authHeader)
    return this.projectsService.findOneByOwner(id, token)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<ProjectDto> {
    const token = this.extractToken(authHeader)
    return this.projectsService.updateForOwner(id, token, body)
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<void> {
    const token = this.extractToken(authHeader)
    return this.projectsService.removeForOwner(id, token)
  }
}
