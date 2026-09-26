import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMoviesTable1790380800000 implements MigrationInterface {
  name = 'CreateMoviesTable1790380800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('movies')) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE "movies" (
        "id" SERIAL NOT NULL,
        "title" character varying(200) NOT NULL,
        "description" text NOT NULL,
        "director" character varying(255) NOT NULL,
        "producer" character varying(255) NOT NULL,
        "releaseDate" date NOT NULL,
        "episodeId" integer,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_movies_id" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "movies"');
  }
}