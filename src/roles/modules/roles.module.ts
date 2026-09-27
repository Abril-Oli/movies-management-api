import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from '../../auth/modules/security.module';
import { RolesController } from '../controllers/roles.controller';
import { Role } from '../entities/role.entity';
import { RolesService } from '../services/roles.service';

@Module({
  imports: [SecurityModule, TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}