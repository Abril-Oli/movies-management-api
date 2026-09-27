import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import type { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 60, select: false })
  passwordHash: string;

  @ApiProperty({ description: 'Foreign key to the assigned role.', example: 1 })
  @Column({ type: 'integer' })
  roleId: number;

  @ManyToOne('Role', 'users', { nullable: false })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ApiProperty({ format: 'date-time' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}