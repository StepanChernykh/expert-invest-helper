import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Dialog } from './Dialog';
import { QuestionAndProjectStatistic } from './QuestionAndProjectStatistic';

export enum QuestionAnswerEnum {
    // yes = 'Да',
    // partially_possible = 'Возможно частично',
    // probably_not = 'Скорее всего нет',
    // no = 'Нет',
    // i_don_not_know = 'я не знаю',
    yes = 'yes',
    partially_possible = 'partially_possible',
    probably_not = 'probably_not',
    no = 'no',
    i_don_not_know = 'i_don_not_know',
}

@Entity()
export class Question {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column('text', { name: 'question_message', unique: true, nullable: false })
    public questionMessage: string;

    // @Column('simple-json')
    // public answers: string[]; //TODO скорее всего лучше сделать фиксированный список ответов (да, нет, не знаю, возможно частично, скорее всего нет)

    @OneToMany(type => QuestionAndProjectStatistic, questionAndProjectStatistic => questionAndProjectStatistic.question)
    public statistics: QuestionAndProjectStatistic[];

    @OneToMany(type => Dialog, dialog => dialog.currentQuestion)
    public dialogs: Dialog[];
}
