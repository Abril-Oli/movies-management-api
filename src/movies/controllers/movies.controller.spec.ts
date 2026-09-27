import { jest } from '@jest/globals';
import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { MoviesController } from './movies.controller';

describe('MoviesController', () => {
  let controller: MoviesController;
  let moviesService: Record<string, jest.Mock<(...args: unknown[]) => Promise<unknown>>>;
  let moviesSyncService: { syncAllFilms: jest.Mock<() => Promise<number>> };

  beforeEach(() => {
    moviesService = {
      findAll: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
      findOne: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
      create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
      update: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
      remove: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    };
    moviesSyncService = { syncAllFilms: jest.fn<() => Promise<number>>() };
    controller = new MoviesController(moviesService as never, moviesSyncService as never);
  });

  it('delegates list requests to MoviesService', async () => {
    const movies = [{ id: 1 }];
    moviesService.findAll.mockResolvedValue(movies);

    await expect(controller.findAll()).resolves.toBe(movies);
  });

  it('delegates item requests to MoviesService', async () => {
    const movie = { id: 2 };
    moviesService.findOne.mockResolvedValue(movie);

    await expect(controller.findOne(2)).resolves.toBe(movie);
    expect(moviesService.findOne).toHaveBeenCalledWith(2);
  });

  it('synchronizes all SWAPI films and returns the count', async () => {
    moviesSyncService.syncAllFilms.mockResolvedValue(6);

    await expect(controller.syncAll()).resolves.toEqual({ synchronized: 6 });
  });

  it('delegates movie creation', async () => {
    const dto = { title: 'New film' } as CreateMovieDto;
    const movie = { id: 3, ...dto };
    moviesService.create.mockResolvedValue(movie);

    await expect(controller.create(dto)).resolves.toBe(movie);
    expect(moviesService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates movie updates', async () => {
    const dto = { title: 'Updated' } as UpdateMovieDto;
    const movie = { id: 3, ...dto };
    moviesService.update.mockResolvedValue(movie);

    await expect(controller.update(3, dto)).resolves.toBe(movie);
    expect(moviesService.update).toHaveBeenCalledWith(3, dto);
  });

  it('delegates movie deletion', async () => {
    moviesService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(3)).resolves.toBeUndefined();
    expect(moviesService.remove).toHaveBeenCalledWith(3);
  });

  it('exposes the sync route only to admins', () => {
    const syncHandler = MoviesController.prototype.syncAll;

    expect(Reflect.getMetadata(PATH_METADATA, syncHandler)).toBe('/sync');
    expect(Reflect.getMetadata(METHOD_METADATA, syncHandler)).toBe(RequestMethod.POST);
    expect(Reflect.getMetadata(ROLES_KEY, syncHandler)).toEqual(['admin']);
  });

  it('restricts movie writes to admins and item reads to users', () => {
    expect(Reflect.getMetadata(ROLES_KEY, MoviesController.prototype.create)).toEqual(['admin']);
    expect(Reflect.getMetadata(ROLES_KEY, MoviesController.prototype.update)).toEqual(['admin']);
    expect(Reflect.getMetadata(ROLES_KEY, MoviesController.prototype.remove)).toEqual(['admin']);
    expect(Reflect.getMetadata(ROLES_KEY, MoviesController.prototype.findOne)).toEqual(['user']);
  });
});