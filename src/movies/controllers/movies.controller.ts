import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { Movie } from '../entities/movie.entity';
import { MoviesService } from '../services/movies.service';

@Controller('movies')
@ApiTags('Movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('/list')
  @ApiOperation({ summary: 'List movies' })
  @ApiOkResponse({ description: 'List of movies.', type: Movie, isArray: true })
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @Get('/item/:id')
  @ApiOperation({ summary: 'Get a movie by ID' })
  @ApiOkResponse({ description: 'Movie found.', type: Movie })
  @ApiBadRequestResponse({ description: 'The ID must be an integer.' })
  @ApiNotFoundResponse({ description: 'No movie exists with that ID.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.moviesService.findOne(id);
  }

  @Post('/create-item')
  @ApiOperation({ summary: 'Create a movie' })
  @ApiCreatedResponse({ description: 'Movie created.', type: Movie })
  create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @Patch('/update-item/:id')
  @ApiOperation({ summary: 'Update a movie' })
  @ApiOkResponse({ description: 'Movie updated.', type: Movie })
  @ApiBadRequestResponse({ description: 'The ID must be an integer.' })
  @ApiNotFoundResponse({ description: 'No movie exists with that ID.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete('/delete-item/:id')
  @ApiOperation({ summary: 'Delete a movie' })
  @ApiOkResponse({ description: 'Movie deleted.' })
  @ApiBadRequestResponse({ description: 'The ID must be an integer.' })
  @ApiNotFoundResponse({ description: 'No movie exists with that ID.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.moviesService.remove(id);
  }
}