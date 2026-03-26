import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';
import type { LoginInput, RegisterInput } from './auth.schema';
import { AuthRepository } from './auth.repository';

type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'developer';
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AuthResponse = {
  user: PublicUser;
  token: string;
};

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await this.authRepository.findByEmail(normalizedEmail);

    if (existingUser && existingUser.deletedat === null) {
      throw new AppError('Email is already in use', 409);
    }

    if (existingUser && existingUser.deletedat !== null) {
      throw new AppError('Email belongs to a soft-deleted user', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const createdUser = await this.authRepository.createUser({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: input.role,
      avatarUrl: input.avatarUrl ?? null,
    });

    const user: PublicUser = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      avatarUrl: createdUser.avatarurl,
      createdAt: createdUser.createdat,
      updatedAt: createdUser.updatedat,
    };

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const userRecord = await this.authRepository.findByEmail(normalizedEmail);

    if (!userRecord || userRecord.deletedat !== null) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, userRecord.passwordhash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const user: PublicUser = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      avatarUrl: userRecord.avatarurl,
      createdAt: userRecord.createdat,
      updatedAt: userRecord.updatedat,
    };

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  private generateToken(payload: {
    userId: number;
    email: string;
    role: 'admin' | 'project_manager' | 'developer';
  }): string {
    const options: SignOptions = {
      expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, env.jwtSecret, options);
  }
}

const authRepository = new AuthRepository();
export const authService = new AuthService(authRepository);