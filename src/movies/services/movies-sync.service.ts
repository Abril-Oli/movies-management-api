import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SwapiService } from '../../integrations/swapi/swapi.service';
import { SwapiFilmAdapter } from '../adapters/swapi-film.adapter';
import { Movie } from '../entities/movie.entity';

@Injectable()
export class MoviesSyncService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly swapiService: SwapiService,
  ) {}

  async syncAllFilms(): Promise<number> {
    const films = await this.swapiService.findFilms();
    const movies = films.map((film) => SwapiFilmAdapter.toMovie(film));

    if (movies.length > 0) {
      await this.moviesRepository.upsert(movies, ['swapiId']);
    }

    return movies.length;
  }

}