import { jest } from '@jest/globals';
import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { SwapiService } from './swapi.service';

describe('SwapiService', () => {
  let service: SwapiService;
  let get: jest.Mock;

  const film = {
    uid: '1',
    properties: {
      title: 'A New Hope',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      release_date: '1977-05-25',
      opening_crawl: 'Opening crawl',
    },
  };

  beforeEach(() => {
    get = jest.fn();
    const httpService = { get } as unknown as HttpService;
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('https://www.swapi.tech/api///'),
    } as unknown as ConfigService;
    service = new SwapiService(httpService, configService);
  });

  it('requests and returns the SWAPI films collection', async () => {
    get.mockReturnValue(of({ data: { message: 'ok', result: [film] } }));

    await expect(service.findFilms()).resolves.toEqual([film]);
    expect(get).toHaveBeenCalledWith('https://www.swapi.tech/api/films');
  });

  it('rejects an unexpected SWAPI response', async () => {
    get.mockReturnValue(of({ data: { message: 'error', result: [] } }));

    await expect(service.findFilms()).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('translates transport failures to BadGatewayException', async () => {
    get.mockReturnValue(throwError(() => new Error('network error')));

    await expect(service.findFilms()).rejects.toBeInstanceOf(BadGatewayException);
  });
});