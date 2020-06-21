import { Service } from 'typedi';
import { DeleteResult, In, Not, UpdateResult } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';

// import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import {
    CreateOrUpdateQuestionRequest
} from '../controllers/requests/CreateOrUpdateQuestionRequest';
import { Dialog } from '../models/Dialog';
import { Question } from '../models/Question';
import {
    QuestionAndProjectStatisticRepository
} from '../repositories/QuestionAndProjectStatisticRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';

// import { events } from '../subscribers/events';

@Service()
export class QuestionService {

    constructor(
        @OrmRepository() private questionRepository: QuestionRepository,
        @OrmRepository() private questionAndProjectStatisticRepository: QuestionAndProjectStatisticRepository
        // @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        // @Logger(__filename) private log: LoggerInterface
    ) { }

    public async getAll(): Promise<Question[]> {
        return this.questionRepository.find();
    }
    // TODO в качестве обработки исходной информации об инвесторе можно делать следующее
    // например, если пользователь указывает, что следует учесть его место жительства,
    // то автоматически засчитать этому пользоавтелю ответ "да" в вопросе "вы желаете найти проект из города N"
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

    public async getNextQuestionForDialog(dialog: Dialog): Promise<Question> {
        if (dialog.history.length === 0) {
            return await this.questionRepository.findOne();
        }
        const notAnsweredQuestions = await this.questionRepository.find({
            where: { id: Not(In(dialog.history.map(x => x.question.id))),
        }});
        return notAnsweredQuestions[Math.floor(Math.random() * notAnsweredQuestions.length)];

        // P(B|Ai) - вероятность получение конкретного набора пар вопрос/ответ при условии истинности гипотезы Ai;
        // P(B|Ai) равна произведению (по j) вероятностей P(Bj|Ai), где Bj — событие вида «На вопрос Qj был дан ответ Oj»
        let PBAi = 1;

        const projectStatistics = await this.questionAndProjectStatisticRepository.find({ where: { projectId }});
        for (const projectStatistic of projectStatistics) {
            // P(Bj|Ai) - отношение числа раз, когда при предлагаемом проекте i на вопрос Qj был дан ответ Oj к числу раз,
            // когда при предлагаемом проекте i был задан вопрос Qj.
            const currStat = await this.questionAndProjectStatisticRepository.findOne({ where: { projectId, questionId: question.id }});
            const PBjAi = projectStatistic[answer] / projectStatistic.getSumAnswers();
            PBAi *= PBjAi;
        }
    }

}
