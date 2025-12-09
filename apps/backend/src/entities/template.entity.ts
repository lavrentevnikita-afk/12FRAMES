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

  @Column({ name: 'preview_url', type: 'text', nullable: true })
  previewUrl: string | null   // ← ключевое изменение: type: 'text'

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any> | null

  @Column({ default: true })
  isPublic: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @OneToMany(() => Project, (project) => project.template)
  projects: Project[]
}
