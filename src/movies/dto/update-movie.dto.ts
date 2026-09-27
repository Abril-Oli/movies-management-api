import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMovieDto {
  @ApiPropertyOptional({ description: 'Movie title.', maxLength: 200, example: 'A New Hope' })
  title?: string;

  @ApiPropertyOptional({ description: 'Movie description.' })
  description?: string;

  @ApiPropertyOptional({ description: 'Movie director.', maxLength: 255 })
  director?: string;

  @ApiPropertyOptional({ description: 'Movie producer.', maxLength: 255 })
  producer?: string;

  @ApiPropertyOptional({
    description: 'Release date in YYYY-MM-DD format.',
    format: 'date',
    example: '1977-05-25',
  })
  releaseDate?: string;

}