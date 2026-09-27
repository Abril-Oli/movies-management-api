import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ description: 'Auto-generated role identifier.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Unique role name.', example: 'user' })
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}