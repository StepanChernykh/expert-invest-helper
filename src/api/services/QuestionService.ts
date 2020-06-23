import { Service } from 'typedi';
import { DeleteResult, UpdateResult } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';

// import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import {
    CreateOrUpdateQuestionRequest
} from '../controllers/requests/CreateOrUpdateQuestionRequest';
import { Dialog } from '../models/Dialog';
import { Question, QuestionAnswerEnum } from '../models/Question';
import { QuestionAndProjectStatistic } from '../models/QuestionAndProjectStatistic';
import { ProjectRepository } from '../repositories/ProjectRepository';
import {
    QuestionAndProjectStatisticRepository
} from '../repositories/QuestionAndProjectStatisticRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';

// import { events } from '../subscribers/events';

@Service()
export class QuestionService {

    constructor(
        @OrmRepository() private questionRepository: QuestionRepository,
        @OrmRepository() private questionAndProjectStatisticRepository: QuestionAndProjectStatisticRepository,
        @OrmRepository() private projectRepository: ProjectRepository
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
        /*if (dialog.history.length === 0) {
            return await this.questionRepository.findOne();
        }
        const notAnsweredQuestions = await this.questionRepository.find({
            where: { id: Not(In(dialog.history.map(x => x.question.id))),
        }});
        return notAnsweredQuestions[Math.floor(Math.random() * notAnsweredQuestions.length)];*/
        const answeredQuestionsIds: number[] = dialog.history.map(x => x.question.id);

        const projects = await this.projectRepository.find();
        /** Map projectId -> priorWeight */
        const projectPriorWeightMap = new Map<number, number>();
        projects.forEach(x => projectPriorWeightMap.set(x.id, x.weight));

        const allStatistic = await this.questionAndProjectStatisticRepository.find();
        /** Map questionId->questionAndProjectStatistics */
        const statisticsByQuestions = new Map<number, QuestionAndProjectStatistic[]>();
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
            const statisticsByQuestion = statisticsByQuestions.get(x.questionId);
            if (statisticsByQuestion === undefined) {
                statisticsByQuestions.set(x.questionId, [x]);
            } else {
                statisticsByQuestion.push(x);
                statisticsByQuestions.set(x.questionId, statisticsByQuestion);
            }
        });

        const PBAiArray = new Array<{ projectId: number, PBAi: number }>();
        for (const [projectId, statistic] of statisticsByProjects) {
            // P(B|Ai) - вероятность получение конкретного набора пар вопрос/ответ при условии истинности гипотезы Ai;
            // P(B|Ai) равна произведению (по j) вероятностей P(Bj|Ai), где Bj — событие вида «На вопрос Qj был дан ответ Oj»
            let PBAi = 1;
            for (const questionStatistic of statistic) {
                // P(Bj|Ai) - отношение числа раз, когда при предлагаемом проекте i на вопрос Qj был дан ответ Oj к числу раз,
                // когда при предлагаемом проекте i был задан вопрос Qj.
                for (const value of Object.values(QuestionAnswerEnum)) {
                    const PBjkAi = questionStatistic.getCounterByAnswerEnum(value) / questionStatistic.getSumAnswers();
                    PBAi *= PBjkAi;
                }
            }
            PBAiArray.push({ projectId, PBAi });
        }

        const sumPBAiprodPAi = PBAiArray.reduce((acc, prev) => acc + prev.PBAi * projectPriorWeightMap.get(prev.projectId), 0);

        /** Map projectId -> PAiB */
        const PAiBMap = new Map<number, number>();
        PBAiArray.forEach(x => PAiBMap.set(x.projectId, x.PBAi * projectPriorWeightMap.get(x.projectId) / sumPBAiprodPAi));

        /** Map questionId -> Map(answer -> Pa) */
        const PaForQMap = new Map<number, Map<QuestionAnswerEnum, number>>();
        for (const [questionId, statistic] of statisticsByQuestions) {
            console.log('questionId', questionId);
            const PaMap = new Map<QuestionAnswerEnum, number>();
            for (const value of Object.values(QuestionAnswerEnum)) {
                let Pa = 0;
                for (const projectStatistic of statistic) {
                    Pa += (projectStatistic.getCounterByAnswerEnum(value) / projectStatistic.getSumAnswers()) * PAiBMap.get(projectStatistic.projectId);
                }
                PaMap.set(value, Pa);
            }
            PaForQMap.set(questionId, PaMap);
        }
        console.log(answeredQuestionsIds);
        console.log(PaForQMap);
        const sumsEntropyByQ = new Array<{ questionId: number, sumEntropy: number }>();
        for (const [questionId, PaMap] of PaForQMap) {
            if (!answeredQuestionsIds.includes(questionId)) {
                let sumEntropy = 0;
                for (const [, Pa] of PaMap) {
                    sumEntropy += Pa * (- projects.reduce((acc, prev) => acc + (PAiBMap.get(prev.id) * Math.log(PAiBMap.get(prev.id))), 0));
                }
                sumsEntropyByQ.push({ questionId, sumEntropy });
            }
        }
        console.log(sumsEntropyByQ);
        console.log(sumsEntropyByQ.reduce((minEntropy, prev) =>
            minEntropy >= prev.sumEntropy ? prev.sumEntropy : minEntropy,
            sumsEntropyByQ[0].sumEntropy
        ));
        const nextQuestionId = sumsEntropyByQ.find(x => x.sumEntropy === sumsEntropyByQ.reduce((minEntropy, prev) =>
            minEntropy >= prev.sumEntropy ? prev.sumEntropy : minEntropy,
            sumsEntropyByQ[0].sumEntropy
        )).questionId;

        return await this.questionRepository.findOne({ where: { id: nextQuestionId }});
    }

}
