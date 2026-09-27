import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from '../../auth/modules/security.module';
import { MoviesController } from '../controllers/movies.controller';
import { Movie } from '../entities/movie.entity';
import { MoviesService } from '../services/movies.service';
import { MoviesSyncService } from '../services/movies-sync.service';
import { SwapiService } from '../../integrations/swapi/swapi.service';

@Module({
  imports: [
    SecurityModule,
    ConfigModule,
    HttpModule.register({ timeout: 10000, maxRedirects: 2 }),
    TypeOrmModule.forFeature([Movie]),
  ],
  controllers: [MoviesController],
  providers: [
    MoviesService,
    MoviesSyncService,
    SwapiService,
  ],
})
export class MoviesModule {}