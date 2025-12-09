import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { Template } from './template.entity'
import { RenderJob } from './render-job.entity'

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 255 })
  title: string

  @Column({ length: 255, nullable: true })
  slug: string | null

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null

  @ManyToOne(() => User, (user) => user.projects, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User | null

  @ManyToOne(() => Template, (template) => template.projects, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'template_id' })
  template: Template | null

  @OneToMany(() => RenderJob, (job) => job.project)
  renderJobs: RenderJob[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
