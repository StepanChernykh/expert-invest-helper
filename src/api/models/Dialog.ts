import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Question, QuestionAnswerEnum } from './Question';

export enum DialogStatusEnum {
    start = 'start',
    process = 'process',
    finish = 'finish',
}

@Entity()
export class Dialog {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public token: string;

    @Column('text')
    public status: DialogStatusEnum;

    @Column('simple-json')
    public history: Array<{ question: Question, answer: QuestionAnswerEnum }>;

    @Column('simple-json')
    public projectsRating: Array<{ projectId: number, rating: number }>;

    @Column({
        name: 'current_question_id',
    })
    public currentQuestionId: number;

    @ManyToOne(type => Question, question => question.dialogs)
    @JoinColumn({ name: 'current_question_id' })
    public currentQuestion: Question;

}
