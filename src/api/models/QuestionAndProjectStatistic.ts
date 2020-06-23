import { HttpError } from 'routing-controllers';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Project } from './Project';
import { Question, QuestionAnswerEnum } from './Question';

@Entity()
export class QuestionAndProjectStatistic {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'yes_counter', nullable: false, default: 0 })
    public yesCounter: number;

    @Column({ name: 'partially_possible_counter', nullable: false, default: 0 })
    public partiallyPossibleCounter: number;

    @Column({ name: 'probably_not_counter', nullable: false, default: 0 })
    public probablyNotCounter: number;

    @Column({ name: 'no_counter', nullable: false, default: 0 })
    public noCounter: number;

    @Column({ name: 'i_don_not_know_counter', nullable: false, default: 0 })
    public iDonNotKnowCounter: number;

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
    public questionId: number;

    @ManyToOne(type => Question, question => question.statistics)
    @JoinColumn({ name: 'question_id' })
    public question: Question;

    public getSumAnswers(): number {
        return this.yesCounter + this.partiallyPossibleCounter + this.probablyNotCounter + this.noCounter + this.iDonNotKnowCounter;
    }

    public getCounterByAnswerEnum(answer: QuestionAnswerEnum): number {
        switch (answer) {
            case QuestionAnswerEnum.yes:
                return this.yesCounter;
            case QuestionAnswerEnum.partially_possible:
                return this.partiallyPossibleCounter;
            case QuestionAnswerEnum.probably_not:
                return this.probablyNotCounter;
            case QuestionAnswerEnum.no:
                return this.noCounter;
            case QuestionAnswerEnum.i_don_not_know:
                return this.iDonNotKnowCounter;
            default:
                throw new HttpError(500, `incorrect answer in getCounterByAnswerEnum: ${answer}`);
        }
    }

}
