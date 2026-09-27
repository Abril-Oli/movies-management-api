import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SwapiFilmResource, SwapiResponse } from './swapi.types';

@Injectable()
export class SwapiService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl = configService.getOrThrow<string>('SWAPI_BASE_URL').replace(/\/+$/, '');
  }

  async findFilms(): Promise<SwapiFilmResource[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SwapiResponse<SwapiFilmResource>>(`${this.baseUrl}/films`),
      );
      if (response.data.message !== 'ok' || !Array.isArray(response.data.result)) {
        throw new BadGatewayException('SWAPI returned an unexpected films response.');
      }
      return response.data.result;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new BadGatewayException('Unable to retrieve films from SWAPI.');
    }
  }

}