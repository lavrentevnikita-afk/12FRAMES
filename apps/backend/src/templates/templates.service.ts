import { Injectable } from '@nestjs/common';
import { Template } from './template.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class TemplatesService {
  private templates: Template[] = [];

  findAll() {
    return this.templates;
  }

  findOne(id: string) {
    return this.templates.find(t => t.id === id);
  }

  create(data: Partial<Template>) {
    const t: Template = {
      id: randomUUID(),
      name: data.name ?? 'New Template',
      description: data.description ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.templates.push(t);
    return t;
  }

  fork(id: string) {
    const original = this.findOne(id);
    if (!original) return null;
    return this.create({
      name: original.name + ' (fork)',
      description: original.description,
    });
  }
}
