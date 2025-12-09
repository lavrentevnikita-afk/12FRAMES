import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL UNIQUE,
        "password_hash" varchar(255) NOT NULL,
        "is_admin" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "templates" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text NULL,
        "preview_url" varchar(500) NULL,
        "config" jsonb NULL,
        "is_public" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar(255) NOT NULL,
        "slug" varchar(255) NULL,
        "data" jsonb NULL,
        "owner_id" uuid NULL,
        "template_id" uuid NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_projects_owner" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE SET NULL,
        CONSTRAINT "fk_projects_template" FOREIGN KEY ("template_id") REFERENCES "templates" ("id") ON DELETE SET NULL
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "render_jobs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT 'pending',
        "result_url" varchar(500) NULL,
        "error" text NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_render_jobs_project" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "render_jobs";`)
    await queryRunner.query(`DROP TABLE IF EXISTS "projects";`)
    await queryRunner.query(`DROP TABLE IF EXISTS "templates";`)
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`)
  }
}
