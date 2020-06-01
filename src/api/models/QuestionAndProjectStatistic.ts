import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Project } from './Project';
import { Question } from './Question';

@Entity()
export class QuestionAndProjectStatistic {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'positive_counter', nullable: false, default: 0 })
    public positiveCounter: number;

    @Column({ name: 'negative_counter', nullable: false, default: 0 })
    public negativeCounter: number;

    @Column({
        name: 'project_id',
        nullable: false,
    })
    public projectId: number;

    @ManyToOne(type => Project, project => project.statistics)
    @JoinColumn({ name: 'project_id' })
    public project: Project;

    @Column({
        name: 'question_id',
        nullable: false,
    })
    public questionId: string;

    @ManyToOne(type => Question, question => question.statistics)
    @JoinColumn({ name: 'question_id' })
    public question: Question;

}
