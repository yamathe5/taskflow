import { AppError } from '../../shared/errors/app-error';
import type { UpdateMyProfileInput, UpdateUserInput } from './users.schema';
import { UsersRepository, type UserRow } from './users.repository';

type UserRole = 'admin' | 'project_manager' | 'developer';

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async listUsers(): Promise<PublicUser[]> {
    const users = await this.usersRepository.findAllActive();
    return users.map((user) => this.toPublicUser(user));
  }

  async listDevelopers(): Promise<PublicUser[]> {
    const users = await this.usersRepository.findAllActive();
    return users
      .filter((user) => user.role === 'developer')
      .map((user) => this.toPublicUser(user));
  }

  async getUserById(id: number): Promise<PublicUser> {
    const user = await this.usersRepository.findActiveById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.toPublicUser(user);
  }

  async getMyProfile(userId: number): Promise<PublicUser> {
    const user = await this.usersRepository.findActiveById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.toPublicUser(user);
  }

  async updateUser(id: number, input: UpdateUserInput): Promise<PublicUser> {
    const existingUser = await this.usersRepository.findActiveById(id);

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    const normalizedEmail = input.email?.trim().toLowerCase();

    if (normalizedEmail && normalizedEmail !== existingUser.email) {
      const userWithSameEmail = await this.usersRepository.findByEmail(normalizedEmail);

      if (
        userWithSameEmail &&
        userWithSameEmail.deletedAt === null &&
        Number(userWithSameEmail.id) !== id
      ) {
        throw new AppError('Email is already in use', 409);
      }

      if (userWithSameEmail && userWithSameEmail.deletedAt !== null) {
        throw new AppError('Email belongs to a soft-deleted user', 409);
      }
    }

    const updatedUser = await this.usersRepository.updateUser({
      id,
      name: input.name?.trim() ?? existingUser.name,
      email: normalizedEmail ?? existingUser.email,
      role: input.role ?? existingUser.role,
      avatarUrl:
        input.avatarUrl !== undefined ? input.avatarUrl : existingUser.avatarUrl,
    });

    return this.toPublicUser(updatedUser);
  }

  async updateMyProfile(userId: number, input: UpdateMyProfileInput): Promise<PublicUser> {
    const existingUser = await this.usersRepository.findActiveById(userId);

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    const normalizedEmail = input.email?.trim().toLowerCase();

    if (normalizedEmail && normalizedEmail !== existingUser.email) {
      const userWithSameEmail = await this.usersRepository.findByEmail(normalizedEmail);

      if (
        userWithSameEmail &&
        userWithSameEmail.deletedAt === null &&
        Number(userWithSameEmail.id) !== userId
      ) {
        throw new AppError('Email is already in use', 409);
      }

      if (userWithSameEmail && userWithSameEmail.deletedAt !== null) {
        throw new AppError('Email belongs to a soft-deleted user', 409);
      }
    }

    const updatedUser = await this.usersRepository.updateUser({
      id: userId,
      name: input.name?.trim() ?? existingUser.name,
      email: normalizedEmail ?? existingUser.email,
      role: existingUser.role,
      avatarUrl:
        input.avatarUrl !== undefined ? input.avatarUrl : existingUser.avatarUrl,
    });

    return this.toPublicUser(updatedUser);
  }

  async softDeleteUser(id: number, currentUserId?: number): Promise<void> {
    const user = await this.usersRepository.findActiveById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (currentUserId && id === currentUserId) {
      throw new AppError('You cannot delete your own account', 400);
    }

    const deleted = await this.usersRepository.softDeleteUser(id);

    if (!deleted) {
      throw new AppError('User could not be deleted', 400);
    }
  }

  private toPublicUser(user: UserRow): PublicUser {
    return {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

const usersRepository = new UsersRepository();
export const usersService = new UsersService(usersRepository);