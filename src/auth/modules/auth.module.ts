import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../../roles/modules/roles.module';
import { SecurityModule } from './security.module';
import { AuthController } from '../controllers/auth.controller';
import { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RolesModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}