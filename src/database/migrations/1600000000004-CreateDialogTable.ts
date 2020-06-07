import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProjectTable1600000000002 implements MigrationInterface {

    private table = new Table({
        name: 'dialog',
        columns: [
            {
                name: 'id',
                type: 'serial',
                isPrimary: true,
                isNullable: false,
            }, {
                name: 'token',
                type: 'text',
                isPrimary: false,
                isNullable: false,
                isUnique: true,
            }, {
                name: 'status',
                type: 'text',
                isPrimary: false,
                isNullable: false,
            }, {
                name: 'history',
                type: 'text',
                isPrimary: false,
                isNullable: false,
            }, {
                name: 'projectsRating',
                type: 'text',
                isPrimary: false,
                isNullable: false,
            }, {
                name: 'current_question_id',
                type: 'integer',
                isPrimary: false,
                isNullable: false,
            },
        ],
    });

    private tableForeignKeyForCurrentQuestion = new TableForeignKey({
        name: 'fk_dialog_current_question',
        columnNames: ['current_question_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'question',
        onDelete: 'CASCADE',
    });

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(this.table);
        await queryRunner.createForeignKey(this.table, this.tableForeignKeyForCurrentQuestion);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable(this.table);
        await queryRunner.dropForeignKey(this.table, this.tableForeignKeyForCurrentQuestion);
    }

}
