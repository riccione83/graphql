import {MigrationInterface, QueryRunner} from "typeorm";

export class ImagePathOnPost1626786093799 implements MigrationInterface {
    name = 'ImagePathOnPost1626786093799'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "imagePath" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "imagePath"`);
    }

}
