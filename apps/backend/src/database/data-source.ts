import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entities/user.entity'
import { Project } from '../entities/project.entity'
import { Template } from '../entities/template.entity'
import { RenderJob } from '../entities/render-job.entity'
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema'

const {
  POSTGRES_HOST = 'localhost',
  POSTGRES_PORT = '5432',
  POSTGRES_USER = '12frames',
  POSTGRES_PASSWORD = '12frames_password',
  POSTGRES_DB = '12frames_db',
} = process.env

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT, 10),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  entities: [User, Project, Template, RenderJob],
  migrations: [InitialSchema1700000000000],
  synchronize: false,
  logging: false,
})

export default AppDataSource
