import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/modules/auth.module';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { MoviesController } from '../controllers/movies.controller';
import { Movie } from '../entities/movie.entity';
import { MoviesService } from '../services/movies.service';
import { MoviesSyncService } from '../services/movies-sync.service';
import { SwapiService } from '../../integrations/swapi/swapi.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    HttpModule.register({ timeout: 10000, maxRedirects: 2 }),
    TypeOrmModule.forFeature([Movie]),
  ],
  controllers: [MoviesController],
  providers: [
    MoviesService,
    MoviesSyncService,
    SwapiService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class MoviesModule {}