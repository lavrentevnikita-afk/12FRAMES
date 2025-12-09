import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Project } from './project.entity'

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 255 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ name: 'preview_url', type: 'varchar', length: 500, nullable: true })
  previewUrl: string | null

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any> | null

  @Column({ name: 'is_public', default: true })
  isPublic: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @OneToMany(() => Project, (project) => project.template)
  projects: Project[]
}
