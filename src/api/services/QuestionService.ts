import { Service } from 'typedi';
import { DeleteResult, UpdateResult } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';

// import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import {
    CreateOrUpdateQuestionRequest
} from '../controllers/requests/CreateOrUpdateQuestionRequest';
import { Question } from '../models/Question';
import { QuestionRepository } from '../repositories/QuestionRepository';

// import { events } from '../subscribers/events';

@Service()
export class QuestionService {

    constructor(
        @OrmRepository() private questionRepository: QuestionRepository
        // @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        // @Logger(__filename) private log: LoggerInterface
    ) { }

    public async getAll(): Promise<Question[]> {
        return this.questionRepository.find();
    }
    // TODO в качестве обработки исходной информации об инвесторе можно делать следующее
    // например, если пользователь указывает, что следует учесть его место жительства, то автоматически засчитать этому пользоавтелю ответ "да" в вопросе "вы желаете найти проект из города N"
    // P.S. видимо для каждого нового города нужно будет создавать новый вопрос..
    public async getById(id: number): Promise<Question> {
        return this.questionRepository.findOne({ where: { id }});
    }

    public async create(body: CreateOrUpdateQuestionRequest): Promise<Question> {
        return this.questionRepository.save({ questionMessage: body.questionMessage });
    }

    public async update(id: number, body: CreateOrUpdateQuestionRequest): Promise<UpdateResult> {
        return this.questionRepository.update({ id }, { questionMessage: body.questionMessage });
    }

    public async deleteById(id: number): Promise<DeleteResult> {
        return this.questionRepository.delete({ id });
    }

}
