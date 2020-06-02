import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Question, QuestionAnswerEnum } from './Question';

@Entity()
export class Dialog {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public token: string;

    @Column('simple-json')
    public history: Array<{ question: Question, answer: QuestionAnswerEnum }>;

    @Column({
        name: 'current_question_id',
    })
    public currentQuestionId: number;

    @ManyToOne(type => Question, question => question.dialogs)
    @JoinColumn({ name: 'current_question_id' })
    public currentQuestion: Question;

}
