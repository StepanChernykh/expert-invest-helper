import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateQuestionTable1600000000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'question',
            columns: [
                {
                    name: 'id',
                    type: 'serial',
                    isPrimary: true,
                    isNullable: false,
                }, {
                    name: 'question_message',
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
