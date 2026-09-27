import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEpisodeIdFromMovies1790395200000 implements MigrationInterface {
  name = 'RemoveEpisodeIdFromMovies1790395200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('movies', 'episodeId')) {
      await queryRunner.query('ALTER TABLE "movies" DROP COLUMN "episodeId"');
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('movies', 'episodeId'))) {
      await queryRunner.query('ALTER TABLE "movies" ADD "episodeId" integer');
    }
  }
}