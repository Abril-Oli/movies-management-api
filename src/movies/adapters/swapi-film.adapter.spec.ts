import { BadGatewayException } from '@nestjs/common';
import { SwapiFilmResource } from '../../integrations/swapi/swapi.types';
import { SwapiFilmAdapter } from './swapi-film.adapter';

describe('SwapiFilmAdapter', () => {
  const film: SwapiFilmResource = {
    uid: '1',
    description: 'A Star Wars Film',
    properties: {
      title: 'A New Hope',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      release_date: '1977-05-25',
      opening_crawl: 'Opening crawl',
    },
  };

  it('maps SWAPI film properties to Movie fields', () => {
    expect(SwapiFilmAdapter.toMovie(film)).toEqual({
      swapiId: '1',
      title: 'A New Hope',
      description: 'Opening crawl',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      releaseDate: '1977-05-25',
    });
  });

  it('falls back to the SWAPI resource description when opening crawl is empty', () => {
    const result = SwapiFilmAdapter.toMovie({
      ...film,
      properties: { ...film.properties, opening_crawl: '' },
    });

    expect(result.description).toBe('A Star Wars Film');
  });

  it.each([
    { ...film, uid: 'not-numeric' },
    { ...film, properties: { ...film.properties, title: '' } },
    { ...film, properties: { ...film.properties, release_date: '25-05-1977' } },
  ])('rejects invalid film data', (invalidFilm) => {
    expect(() => SwapiFilmAdapter.toMovie(invalidFilm)).toThrow(BadGatewayException);
  });
});