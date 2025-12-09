import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Project } from '../entities/project.entity'
import { User } from '../entities/user.entity'

export interface CalendarSettings {
  primaryColor: string
  backgroundColor: string
  titleFont: string
  coverImage?: string | null
}

export interface ProjectDto {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  settings: CalendarSettings
}

const DEFAULT_SETTINGS: CalendarSettings = {
  primaryColor: '#ff6a3d',
  backgroundColor: '#050509',
  titleFont: "'Inter', system-ui",
  coverImage: null,
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  private toDto(project: Project): ProjectDto {
    const data = project.data || {}
    const settings: CalendarSettings = {
      ...DEFAULT_SETTINGS,
      ...(data.settings || {}),
    }
    return {
      id: project.id,
      name: project.title,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      settings,
    }
  }

  async findAllByOwner(userId: string): Promise<ProjectDto[]> {
    const projects = await this.projectsRepo.find({
      where: { owner: { id: userId } },
      order: { updatedAt: 'DESC' },
      relations: ['owner'],
    })
    return projects.map((p) => this.toDto(p))
  }

  async findOneByOwner(id: string, userId: string): Promise<ProjectDto> {
    const project = await this.projectsRepo.findOne({
      where: { id, owner: { id: userId } },
      relations: ['owner', 'template'],
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }
    return this.toDto(project)
  }

  async createForOwner(name: string, userId: string): Promise<ProjectDto> {
    const owner = await this.usersRepo.findOne({ where: { id: userId } })
    if (!owner) {
      throw new NotFoundException('Owner not found')
    }
    const project = this.projectsRepo.create({
      title: name,
      slug: null,
      owner,
      data: {
        settings: DEFAULT_SETTINGS,
      },
    })
    const saved = await this.projectsRepo.save(project)
    return this.toDto(saved)
  }

  async updateForOwner(id: string, userId: string, patch: Partial<ProjectDto>): Promise<ProjectDto> {
    const project = await this.projectsRepo.findOne({
      where: { id, owner: { id: userId } },
      relations: ['owner'],
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    if (patch.name !== undefined) {
      project.title = patch.name
    }

    const currentData = project.data || {}
    const currentSettings = currentData.settings || DEFAULT_SETTINGS
    const nextSettings = {
      ...currentSettings,
      ...(patch.settings || {}),
    }
    project.data = {
      ...currentData,
      settings: nextSettings,
    }

    const saved = await this.projectsRepo.save(project)
    return this.toDto(saved)
  }

  async removeForOwner(id: string, userId: string): Promise<void> {
    const project = await this.projectsRepo.findOne({
      where: { id, owner: { id: userId } },
      relations: ['owner'],
    })
    if (!project) return
    await this.projectsRepo.remove(project)
  }
}
