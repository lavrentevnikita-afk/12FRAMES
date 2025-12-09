import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import * as crypto from 'crypto'

export interface AuthUserDto {
  id: string
  email: string
  name: string
}

export interface AuthResponseDto {
  access_token: string
  user: AuthUserDto
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
  }

  private mapUser(user: User, nameFallback?: string): AuthUserDto {
    // В БД имени пока нет, поэтому используем email до @ как "name"
    const name = nameFallback || user.email.split('@')[0]
    return {
      id: user.id,
      email: user.email,
      name,
    }
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponseDto> {
    const existing = await this.usersRepo.findOne({ where: { email } })
    if (existing) {
      throw new ConflictException('User with this email already exists')
    }

    const user = this.usersRepo.create({
      email,
      passwordHash: this.hashPassword(password),
      isAdmin: false,
    })
    const saved = await this.usersRepo.save(user)

    const profile = this.mapUser(saved, name)
    return {
      access_token: saved.id,
      user: profile,
    }
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.usersRepo.findOne({ where: { email } })
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const passwordHash = this.hashPassword(password)
    if (user.passwordHash !== passwordHash) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return {
      access_token: user.id,
      user: this.mapUser(user),
    }
  }

  async getProfileByToken(token: string): Promise<AuthUserDto> {
    if (!token) {
      throw new UnauthorizedException('Missing token')
    }
    const user = await this.usersRepo.findOne({ where: { id: token } })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return this.mapUser(user)
  }
}
