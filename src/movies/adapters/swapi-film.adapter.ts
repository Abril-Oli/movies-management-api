import { BadGatewayException } from '@nestjs/common';
import { SwapiFilmResource } from '../../integrations/swapi/swapi.types';
import { Movie } from '../entities/movie.entity';

export class SwapiFilmAdapter {
  static toMovie(film: SwapiFilmResource): Partial<Movie> {
    const properties = film.properties;
    const swapiId = film.uid;

    if (
      !/^\d+$/.test(swapiId) ||
      !properties.title ||
      !properties.director ||
      !properties.producer ||
      !/^\d{4}-\d{2}-\d{2}$/.test(properties.release_date)
    ) {
      throw new BadGatewayException('SWAPI film data is missing required fields.');
    }

    return {
      swapiId,
      title: properties.title,
      description: properties.opening_crawl || film.description || properties.title,
      director: properties.director,
      producer: properties.producer,
      releaseDate: properties.release_date,
    };
  }
}