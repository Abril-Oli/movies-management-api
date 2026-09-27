import { jest } from '@jest/globals';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RolesService } from '../../roles/services/roles.service';
import { Role } from '../../roles/entities/role.entity';
import { RegisterDto } from '../dto/register.dto';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock };
  let rolesService: { findByName: jest.Mock };
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    addSelect: jest.Mock;
    where: jest.Mock;
    getOne: jest.Mock;
  };
  const userRole = { id: 1, name: 'user' } as Role;

  beforeEach(() => {
    usersRepository = {
      findOneBy: jest.fn(),
      create: jest.fn((userData: unknown) => userData),
      save: jest.fn(async (user: User) => ({ ...user, id: 7 })),
      createQueryBuilder: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed-jwt') };
    rolesService = { findByName: jest.fn().mockResolvedValue(userRole) };
    queryBuilder = {
      leftJoinAndSelect: jest.fn(),
      addSelect: jest.fn(),
      where: jest.fn(),
      getOne: jest.fn(),
    };
    queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
    queryBuilder.addSelect.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);
    usersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    service = new AuthService(
      usersRepository as unknown as Repository<User>,
      jwtService as unknown as JwtService,
      rolesService as unknown as RolesService,
    );
  });

  it('registers a normalized email with a hashed password and the user role', async () => {
    usersRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.register({ email: ' USER@example.com ', password: 'StrongPass123!' }),
    ).resolves.toEqual({ message: 'User created successfully.' });

    const savedUser = usersRepository.save.mock.calls[0][0] as User;
    expect(savedUser.email).toBe('user@example.com');
    expect(savedUser.passwordHash).not.toBe('StrongPass123!');
    await expect(compare('StrongPass123!', savedUser.passwordHash)).resolves.toBe(true);
    expect(savedUser.roleId).toBe(userRole.id);
    expect(rolesService.findByName).toHaveBeenCalledWith('user');
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects duplicate email registration', async () => {
    usersRepository.findOneBy.mockResolvedValue({ id: 1, email: 'user@example.com' });

    await expect(
      service.register({ email: 'user@example.com', password: 'StrongPass123!' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersRepository.save).not.toHaveBeenCalled();
  });

  it('rejects registration when the default user role is missing', async () => {
    usersRepository.findOneBy.mockResolvedValue(null);
    rolesService.findByName.mockResolvedValue(null);

    await expect(
      service.register({ email: 'user@example.com', password: 'StrongPass123!' }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(usersRepository.save).not.toHaveBeenCalled();
  });

  it.each([
    { email: 'not-an-email', password: 'StrongPass123!' },
    { email: 'user@example.com', password: 'short' },
    { email: 'user@example.com', password: 'x'.repeat(73) },
  ])('rejects invalid registration credentials', async (credentials) => {
    await expect(service.register(credentials as RegisterDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(usersRepository.findOneBy).not.toHaveBeenCalled();
  });

  it('logs in with valid credentials and issues a role-bearing JWT', async () => {
    const passwordHash = await hash('StrongPass123!', 4);
    queryBuilder.getOne.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      roleId: 1,
      role: userRole,
      passwordHash,
    });

    await expect(
      service.login({ email: 'user@example.com', password: 'StrongPass123!' }),
    ).resolves.toEqual({
      access_token: 'signed-jwt',
      token_type: 'Bearer',
      expires_in: 3600,
    });
    expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', {
      email: 'user@example.com',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: 7, email: 'user@example.com', roleId: 1, role: 'user' },
      { expiresIn: 3600 },
    );
  });

  it('rejects login when the user does not exist', async () => {
    queryBuilder.getOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'user@example.com', password: 'StrongPass123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects login when the password does not match', async () => {
    queryBuilder.getOne.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      roleId: 1,
      role: userRole,
      passwordHash: await hash('OriginalPass123!', 4),
    });

    await expect(
      service.login({ email: 'user@example.com', password: 'WrongPass123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});