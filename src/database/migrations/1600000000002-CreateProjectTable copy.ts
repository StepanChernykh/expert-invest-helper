import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProjectTable1600000000002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'project',
            columns: [
                {
                    name: 'id',
                    type: 'serial',
                    isPrimary: true,
                    isNullable: false,
                }, {
                    name: 'project_name',
                    type: 'text',
                    isPrimary: false,
                    isNullable: false,
                    isUnique: true,
                },
            ],
        });
        await queryRunner.createTable(table);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('question');
    }

}
