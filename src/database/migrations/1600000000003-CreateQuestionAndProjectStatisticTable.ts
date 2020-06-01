import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateQuestionAndProjectStatisticTable1600000000003 implements MigrationInterface {

    private table = new Table({
        name: 'question_and_project_statistic',
        columns: [
            {
                name: 'id',
                type: 'serial',
                isPrimary: true,
                isNullable: false,
            }, {
                name: 'project_id',
                type: 'number',
                isPrimary: false,
                isNullable: false,
            },
        ],
    });

    private tableForeignKeyForProject = new TableForeignKey({
        name: 'fk_project_question_and_project_statistic',
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'project',
        onDelete: 'CASCADE',
    });

    private tableForeignKeyForQuestion = new TableForeignKey({
        name: 'fk_question_question_and_project_statistic',
        columnNames: ['question_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'question',
        onDelete: 'CASCADE',
    });

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(this.table);
        await queryRunner.createForeignKey(this.table, this.tableForeignKeyForProject);
        await queryRunner.createForeignKey(this.table, this.tableForeignKeyForQuestion);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('question_and_project_statistic');
    }

}
