import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('movies')
export class Movie {
  @ApiProperty({ description: 'Auto-generated identifier.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Movie title.', maxLength: 200, example: 'A New Hope' })
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @ApiProperty({ description: 'Movie description.' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Movie director.', maxLength: 255, example: 'George Lucas' })
  @Column({ type: 'varchar', length: 255 })
  director: string;

  @ApiProperty({ description: 'Movie producer.', maxLength: 255, example: 'Gary Kurtz' })
  @Column({ type: 'varchar', length: 255 })
  producer: string;

  @ApiProperty({ description: 'Release date.', format: 'date', example: '1977-05-25' })
  @Column({ type: 'date' })
  releaseDate: string;

  @ApiProperty({ description: 'Episode number.', nullable: true, example: 4 })
  @Column({ type: 'integer', nullable: true })
  episodeId: number | null;

  @ApiProperty({ description: 'Creation timestamp.', format: 'date-time' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp.', format: 'date-time' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}