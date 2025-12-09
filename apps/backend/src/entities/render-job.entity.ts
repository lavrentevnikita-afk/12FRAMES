import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Project } from './project.entity'

export type RenderJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

@Entity('render_jobs')
export class RenderJob {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Project, (project) => project.renderJobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status: RenderJobStatus

  @Column({ name: 'result_url', type: 'varchar', length: 500, nullable: true })
  resultUrl: string | null

  @Column({ type: 'text', nullable: true })
  error: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
