import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSwapiIdToMovies1790391600000 implements MigrationInterface {
  name = 'AddSwapiIdToMovies1790391600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('movies', 'swapiId'))) {
      await queryRunner.query(
        'ALTER TABLE "movies" ADD "swapiId" character varying(50)',
      );
    }
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_movies_swapiId" ON "movies" ("swapiId")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_movies_swapiId"');
    if (await queryRunner.hasColumn('movies', 'swapiId')) {
      await queryRunner.query('ALTER TABLE "movies" DROP COLUMN "swapiId"');
    }
  }
}