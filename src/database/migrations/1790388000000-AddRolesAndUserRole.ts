import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddRolesAndUserRole1790388000000 implements MigrationInterface {
  name = 'AddRolesAndUserRole1790388000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('roles'))) {
      await queryRunner.query(`
        CREATE TABLE "roles" (
          "id" SERIAL NOT NULL,
          "name" character varying(50) NOT NULL,
          CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
          CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
        )
      `);
    }

    await queryRunner.query(`
      INSERT INTO "roles" ("name") VALUES ('user')
      ON CONFLICT ("name") DO NOTHING
    `);

    if (!(await queryRunner.hasColumn('users', 'roleId'))) {
      await queryRunner.query('ALTER TABLE "users" ADD "roleId" integer');
    }

    await queryRunner.query(`
      UPDATE "users"
      SET "roleId" = (SELECT "id" FROM "roles" WHERE "name" = 'user')
      WHERE "roleId" IS NULL
    `);
    await queryRunner.query('ALTER TABLE "users" ALTER COLUMN "roleId" SET NOT NULL');

    const usersTable = await queryRunner.getTable('users');
    const hasRoleForeignKey = usersTable?.foreignKeys.some((foreignKey) =>
      foreignKey.columnNames.includes('roleId'),
    );

    if (!hasRoleForeignKey) {
      await queryRunner.createForeignKey(
        'users',
        new TableForeignKey({
          name: 'FK_users_roleId_roles_id',
          columnNames: ['roleId'],
          referencedTableName: 'roles',
          referencedColumnNames: ['id'],
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const usersTable = await queryRunner.getTable('users');
    const roleForeignKey = usersTable?.foreignKeys.find((foreignKey) =>
      foreignKey.columnNames.includes('roleId'),
    );

    if (roleForeignKey) {
      await queryRunner.dropForeignKey('users', roleForeignKey);
    }
    if (await queryRunner.hasColumn('users', 'roleId')) {
      await queryRunner.query('ALTER TABLE "users" DROP COLUMN "roleId"');
    }
    if (await queryRunner.hasTable('roles')) {
      await queryRunner.query('DROP TABLE "roles"');
    }
  }
}