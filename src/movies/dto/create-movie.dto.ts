import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({ description: 'Movie title.', maxLength: 200, example: 'A New Hope' })
  title: string;

  @ApiProperty({
    description: 'Movie description.',
    example: 'Luke Skywalker joins the Rebellion.',
  })
  description: string;

  @ApiProperty({ description: 'Movie director.', maxLength: 255, example: 'George Lucas' })
  director: string;

  @ApiProperty({ description: 'Movie producer.', maxLength: 255, example: 'Gary Kurtz' })
  producer: string;

  @ApiProperty({
    description: 'Release date in YYYY-MM-DD format.',
    format: 'date',
    example: '1977-05-25',
  })
  releaseDate: string;
}