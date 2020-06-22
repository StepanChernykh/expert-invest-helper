import { Service } from 'typedi';
import { DeleteResult, In, Not, UpdateResult } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';

// import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import {
    CreateOrUpdateQuestionRequest
} from '../controllers/requests/CreateOrUpdateQuestionRequest';
import { Dialog } from '../models/Dialog';
import { Question, QuestionAnswerEnum } from '../models/Question';
import { QuestionAndProjectStatistic } from '../models/QuestionAndProjectStatistic';
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

        const allStatistic = await this.questionAndProjectStatisticRepository.find();\
        /** Map projectId->questionAndProjectStatistics */
        const statisticsByProjects = new Map<number, QuestionAndProjectStatistic[]>();
        allStatistic.forEach(x => {
            const statisticsByProject = statisticsByProjects.get(x.projectId);
            if (statisticsByProject === undefined) {
                statisticsByProjects.set(x.projectId, [x]);
            } else {
                statisticsByProject.push(x);
                statisticsByProjects.set(x.projectId, statisticsByProject);
            }
        });

        const PBAiArray = new Array<{ projectId: number, PBAi: number }>();
        for (const [projectId, statistic] of statisticsByProjects) {
            // P(B|Ai) - вероятность получение конкретного набора пар вопрос/ответ при условии истинности гипотезы Ai;
            // P(B|Ai) равна произведению (по j) вероятностей P(Bj|Ai), где Bj — событие вида «На вопрос Qj был дан ответ Oj»
            let PBAi = 1;
            for (const projectStatistic of statistic) {
                // P(Bj|Ai) - отношение числа раз, когда при предлагаемом проекте i на вопрос Qj был дан ответ Oj к числу раз,
                // когда при предлагаемом проекте i был задан вопрос Qj.
                for (const key of Object.keys(QuestionAnswerEnum)) {
                    const PBjkAi = projectStatistic[key] / projectStatistic.getSumAnswers();
                    PBAi *= PBjkAi;
                }
            }
            PBAiArray.push({ projectId, PBAi });
        }

        const PAiB = (PBAiArray.find(x => x.projectId === 'projectId').PBAi * PAi) / (PBAiArray.reduce((acc, prev) => acc + prev.PBAi * PAiSTRICH, 0));
    }

}
