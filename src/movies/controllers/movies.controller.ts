import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { Movie } from '../entities/movie.entity';
import { MoviesService } from '../services/movies.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { MoviesSyncService } from '../services/movies-sync.service';

@Controller('movies')
@ApiTags('Movies')
@ApiBearerAuth()
@Roles('user', 'admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly moviesSyncService: MoviesSyncService,
  ) {}

  @Get('/list')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'List movies' })
  @ApiOkResponse({ description: 'List of movies.', type: Movie, isArray: true })
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @Get('/item/:id')
  @Roles('user')
  @ApiOperation({ summary: 'Get a movie by ID' })
  @ApiOkResponse({ description: 'Movie found.', type: Movie })
  @ApiBadRequestResponse({ description: 'The ID must be an integer.' })
  @ApiNotFoundResponse({ description: 'No movie exists with that ID.' })
  @ApiForbiddenResponse({ description: 'Only users with the user role can access this endpoint.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.moviesService.findOne(id);
  }

  @Post('/sync')
  @Roles('admin')
  @ApiOperation({
    summary: 'Synchronize all Star Wars films from SWAPI',
    description:
      'Fetches GET {SWAPI_BASE_URL}/films, adapts each film, and inserts or updates local movies using each SWAPI UID.',
  })
  @ApiOkResponse({
    description: 'All returned films were inserted or updated.',
    schema: { type: 'object', properties: { synchronized: { type: 'integer', example: 6 } } },
  })
  @ApiUnauthorizedResponse({ description: 'A valid Bearer access token is required.' })
  @ApiForbiddenResponse({ description: 'Only administrators can sync movies.' })
  @ApiBadGatewayResponse({ description: 'SWAPI is unavailable or returned invalid film data.' })
  async syncAll(): Promise<{ synchronized: number }> {
    return { synchronized: await this.moviesSyncService.syncAllFilms() };
  }

  @Post('/create-item')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a movie' })
  @ApiCreatedResponse({ description: 'Movie created.', type: Movie })
  @ApiForbiddenResponse({ description: 'Only administrators can create movies.' })
  create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @Patch('/update-item/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a movie' })
  @ApiOkResponse({ description: 'Movie updated.', type: Movie })
  @ApiBadRequestResponse({ description: 'The ID must be an integer.' })
  @ApiNotFoundResponse({ description: 'No movie exists with that ID.' })
  @ApiForbiddenResponse({ description: 'Only administrators can update movies.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete('/delete-item/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a movie' })
  @ApiOkResponse({ description: 'Movie deleted.' })
  @ApiBadRequestResponse({ description: 'The ID must be an integer.' })
  @ApiNotFoundResponse({ description: 'No movie exists with that ID.' })
  @ApiForbiddenResponse({ description: 'Only administrators can delete movies.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.moviesService.remove(id);
  }
}