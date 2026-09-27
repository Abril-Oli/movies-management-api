import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { Movie } from '../entities/movie.entity';
import { MoviesService } from './movies.service';

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: {
    find: jest.Mock<() => Promise<Movie[]>>;
    findOneBy: jest.Mock<(criteria: { id: number }) => Promise<Movie | null>>;
    create: jest.Mock<(dto: CreateMovieDto) => Movie>;
    save: jest.Mock<(movie: Movie) => Promise<Movie>>;
    preload: jest.Mock<(movie: Partial<Movie>) => Promise<Movie | undefined>>;
    delete: jest.Mock<(id: number) => Promise<{ affected: number }>>;
  };

  beforeEach(() => {
    repository = {
      find: jest.fn<() => Promise<Movie[]>>(),
      findOneBy: jest.fn<(criteria: { id: number }) => Promise<Movie | null>>(),
      create: jest.fn<(dto: CreateMovieDto) => Movie>(),
      save: jest.fn<(movie: Movie) => Promise<Movie>>(),
      preload: jest.fn<(movie: Partial<Movie>) => Promise<Movie | undefined>>(),
      delete: jest.fn<(id: number) => Promise<{ affected: number }>>(),
    };
    service = new MoviesService(repository as unknown as Repository<Movie>);
  });

  it('returns all movies', async () => {
    const movies = [{ id: 1, title: 'A New Hope' }] as Movie[];
    repository.find.mockResolvedValue(movies);

    await expect(service.findAll()).resolves.toBe(movies);
  });

  it('returns a movie by ID', async () => {
    const movie = { id: 1, title: 'A New Hope' } as Movie;
    repository.findOneBy.mockResolvedValue(movie);

    await expect(service.findOne(1)).resolves.toBe(movie);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('throws when a movie does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(44)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates and saves a movie', async () => {
    const dto = { title: 'A New Hope' } as CreateMovieDto;
    const movie = { ...dto } as Movie;
    repository.create.mockReturnValue(movie);
    repository.save.mockResolvedValue(movie);

    await expect(service.create(dto)).resolves.toBe(movie);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(movie);
  });

  it('updates an existing movie', async () => {
    const dto = { title: 'Updated title' } as UpdateMovieDto;
    const movie = { id: 1, ...dto } as Movie;
    repository.preload.mockResolvedValue(movie);
    repository.save.mockResolvedValue(movie);

    await expect(service.update(1, dto)).resolves.toBe(movie);
    expect(repository.preload).toHaveBeenCalledWith({ id: 1, ...dto });
    expect(repository.save).toHaveBeenCalledWith(movie);
  });

  it('throws when updating a missing movie', async () => {
    repository.preload.mockResolvedValue(undefined);

    await expect(service.update(44, {})).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('deletes an existing movie', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it('throws when deleting a missing movie', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(44)).rejects.toBeInstanceOf(NotFoundException);
  });
});