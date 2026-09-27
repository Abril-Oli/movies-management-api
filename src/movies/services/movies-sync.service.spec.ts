import { jest } from '@jest/globals';
import { Repository } from 'typeorm';
import { SwapiService } from '../../integrations/swapi/swapi.service';
import { SwapiFilmResource } from '../../integrations/swapi/swapi.types';
import { Movie } from '../entities/movie.entity';
import { MoviesSyncService } from './movies-sync.service';

describe('MoviesSyncService', () => {
  let service: MoviesSyncService;
  let repository: { upsert: jest.Mock<(...args: unknown[]) => Promise<unknown>> };
  let swapiService: { findFilms: jest.Mock<() => Promise<SwapiFilmResource[]>> };

  const film = {
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

  beforeEach(() => {
    repository = {
      upsert: jest.fn<(...args: unknown[]) => Promise<unknown>>().mockResolvedValue(undefined),
    };
    swapiService = { findFilms: jest.fn<() => Promise<SwapiFilmResource[]>>() };
    service = new MoviesSyncService(
      repository as unknown as Repository<Movie>,
      swapiService as unknown as SwapiService,
    );
  });

  it('adapts and upserts every film by SWAPI UID', async () => {
    swapiService.findFilms.mockResolvedValue([film, { ...film, uid: '2' }]);

    await expect(service.syncAllFilms()).resolves.toBe(2);
    expect(repository.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({ swapiId: '1', title: 'A New Hope' }),
        expect.objectContaining({ swapiId: '2', title: 'A New Hope' }),
      ],
      ['swapiId'],
    );
  });

  it('does not issue an upsert when SWAPI returns no films', async () => {
    swapiService.findFilms.mockResolvedValue([]);

    await expect(service.syncAllFilms()).resolves.toBe(0);
    expect(repository.upsert).not.toHaveBeenCalled();
  });

  it('propagates errors from SWAPI', async () => {
    swapiService.findFilms.mockRejectedValue(new Error('SWAPI unavailable'));

    await expect(service.syncAllFilms()).rejects.toThrow('SWAPI unavailable');
    expect(repository.upsert).not.toHaveBeenCalled();
  });
});