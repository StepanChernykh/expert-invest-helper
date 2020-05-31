import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Question {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column('text', { name: 'question_message', unique: true, nullable: false })
    public questionMessage: string;

    // @Column('simple-json')
    // public answers: string[]; //TODO скорее всего лучше сделать фиксированный список ответов (да, нет, не знаю, возможно частично, скорее всего нет)

}
