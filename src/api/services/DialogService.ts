import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { SaveAnswerForQuestionRequest } from '../controllers/requests/SaveAnswerForQuestionRequest';
// import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Dialog } from '../models/Dialog';
import { DialogRepository } from '../repositories/DialogRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';

// import { events } from '../subscribers/events';

@Service()
export class DialogService {

    constructor(
        @OrmRepository() private questionRepository: QuestionRepository,
        @OrmRepository() private dialogRepository: DialogRepository
        // @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        // @Logger(__filename) private log: LoggerInterface
    ) { }

    public async startDialog(): Promise<Dialog> {
        const currentQuestion = await this.questionRepository.findOne(); // TODO метод для получения первого вопроса
        const dialog = new Dialog();
        dialog.token = this.getRandomString(6);
        dialog.currentQuestionId = currentQuestion.id;
        dialog.history = [];
        return await this.dialogRepository.save(dialog);
    }

    public async saveAnswerForQuestionAndGetNextQuestion(body: SaveAnswerForQuestionRequest): Promise<Dialog> {
        const dialog = await this.dialogRepository.findOne({ where: { token: body.token }, relations: ['currentQuestion']});
        dialog.history.push({ question: dialog.currentQuestion, answer: body.answer });
        // const currentQuestion = await this.questionRepository.findOne(); // TODO метод для получения следующего вопроса
        // dialog.currentQuestionId = currentQuestion.id;
        return await this.dialogRepository.save(dialog);
    }

    private getRandomString(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }

}
