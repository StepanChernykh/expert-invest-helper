import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { QuestionAndProjectStatistic } from './QuestionAndProjectStatistic';

@Entity()
export class Project {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column('text', { name: 'weight', nullable: false })
    public weight: number;

    @Column('text', { name: 'project_name', unique: true, nullable: false })
    public projectName: string;

    @OneToMany(type => QuestionAndProjectStatistic, questionAndProjectStatistic => questionAndProjectStatistic.question)
    public statistics: QuestionAndProjectStatistic[];
}
