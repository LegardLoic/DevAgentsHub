import type { LoginInput, RegisterInput } from '@devagentshub/validation';

import { AppError } from '../utils/app-error';
import { signAuthToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';
import { serializeAuthUser, userRepository, type UserRepository } from '../repositories/user.repository';

export class AuthService {
  constructor(private readonly users: UserRepository = userRepository) {}

  async register(input: RegisterInput) {
    const existingUser = await this.users.findForAuthByEmail(input.email);

    if (existingUser) {
      throw new AppError('An account already exists for this email.', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.users.createUser({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    });

    return {
      user: serializeAuthUser(user),
      token: signAuthToken(user.id),
    };
  }

  async login(input: LoginInput) {
    const user = await this.users.findForAuthByEmail(input.email);

    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const passwordIsValid = await comparePassword(input.password, user.passwordHash);

    if (!passwordIsValid) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    return {
      user: serializeAuthUser(user),
      token: signAuthToken(user.id),
    };
  }
}

export const authService = new AuthService();

