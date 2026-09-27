import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthTokenDto } from '../dto/auth-token.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { User } from '../entities/user.entity';
import { RolesService } from '../../roles/services/roles.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, password } = this.validateCredentials(
      registerDto?.email,
      registerDto?.password,
    );
    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }
    const userRole = await this.rolesService.findByName('user');
    if (!userRole) {
      throw new InternalServerErrorException('The default "user" role is not configured.');
    }

    const user = this.usersRepository.create({
      email,
      passwordHash: await hash(password, 12),
      roleId: userRole.id,
      role: userRole,
    });
    await this.usersRepository.save(user);
    return { message: 'User created successfully.' };
  }

  async login(loginDto: LoginDto): Promise<AuthTokenDto> {
    const { email, password } = this.validateCredentials(
      loginDto?.email,
      loginDto?.password,
    );
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createToken(user);
  }

  private validateCredentials(
    email: unknown,
    password: unknown,
  ): { email: string; password: string } {
    if (
      typeof email !== 'string' ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      throw new BadRequestException('A valid email address is required.');
    }

    if (
      typeof password !== 'string' ||
      Buffer.byteLength(password, 'utf8') < 8 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      throw new BadRequestException('Password must be between 8 and 72 UTF-8 bytes.');
    }

    return { email: email.trim().toLowerCase(), password };
  }

  private async createToken(user: User): Promise<AuthTokenDto> {
    const expiresIn = 3600;
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, roleId: user.roleId, role: user.role?.name },
      { expiresIn },
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }
}