import { HttpError } from 'routing-controllers';
import { Service } from 'typedi';
import { getConnection } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { FinishDialogRequest } from '../controllers/requests/FinishDialogRequest';
import { SaveAnswerForQuestionRequest } from '../controllers/requests/SaveAnswerForQuestionRequest';
// import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Dialog, DialogStatusEnum } from '../models/Dialog';
import { Project } from '../models/Project';
import { QuestionAnswerEnum } from '../models/Question';
import { QuestionAndProjectStatistic } from '../models/QuestionAndProjectStatistic';
import { DialogRepository } from '../repositories/DialogRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectService } from './ProjectService';
import { QuestionService } from './QuestionService';

// import { events } from '../subscribers/events';

@Service()
export class DialogService {

    constructor(
        // @OrmRepository() private questionRepository: QuestionRepository,
        @OrmRepository() private dialogRepository: DialogRepository,
        @OrmRepository() private projectRepository: ProjectRepository,
        // @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        // @Logger(__filename) private log: LoggerInterface
        private questionService: QuestionService,
        private projectService: ProjectService
    ) { }

    public async startDialog(): Promise<Dialog> {
        let dialog = new Dialog();
        dialog.status = DialogStatusEnum.start;
        dialog.token = this.getRandomString(6);
        dialog.history = [];
        const currentQuestion = await this.questionService.getNextQuestionForDialog(dialog);
        dialog.currentQuestionId = currentQuestion.id;
        dialog.projectsRating = await this.projectService.getStartProjectRatings();
        dialog = await this.dialogRepository.save(dialog);
        return await this.dialogRepository.findOne({ where: { id: dialog.id }, relations: ['currentQuestion']});
    }

    public async saveAnswerForQuestionAndGetNextQuestion(body: SaveAnswerForQuestionRequest): Promise<Dialog | Project[]> {
        let dialog = await this.dialogRepository.findOne({ where: { token: body.token }, relations: ['currentQuestion']});
        dialog.history.push({ question: dialog.currentQuestion, answer: body.answer });
        dialog.projectsRating = await this.recalculateRating(dialog.projectsRating, dialog.currentQuestion, body.answer);
        const significantProjects = await this.getSignificantProjects(dialog, 0.9);
        if (significantProjects.length < 3) {
            dialog.status = DialogStatusEnum.finish;
            dialog.currentQuestionId = undefined;
            await this.dialogRepository.save(dialog);
            return significantProjects;
        }
        dialog.status = DialogStatusEnum.process;
        const currentQuestion = await this.questionService.getNextQuestionForDialog(dialog);
        dialog.currentQuestionId = currentQuestion.id;
        dialog.currentQuestion = undefined;
        dialog = await this.dialogRepository.save(dialog);
        return await this.dialogRepository.findOne({ where: { id: dialog.id }, relations: ['currentQuestion']});
    }

    public async finishDialog(body: FinishDialogRequest): Promise<{ success: boolean }> {
        await getConnection().transaction('SERIALIZABLE', async txEM => {
            const dialog = await txEM.findOne(Dialog, { where: { token: body.token }, relations: ['currentQuestion']});
            const statistics = new Array<QuestionAndProjectStatistic>();
            for (const element of dialog.history) {
                const statistic = await txEM.findOne(QuestionAndProjectStatistic, {
                    where: {
                        projectId: body.projectId,
                        questionId: element.question.id,
                    },
                });
                switch (element.answer) {
                    case QuestionAnswerEnum.yes:
                        statistic.yesCounter++;
                        break;
                    case QuestionAnswerEnum.partially_possible:
                        statistic.partiallyPossibleCounter++;
                        break;
                    case QuestionAnswerEnum.probably_not:
                        statistic.probablyNotCounter++;
                        break;
                    case QuestionAnswerEnum.no:
                        statistic.noCounter++;
                        break;
                    case QuestionAnswerEnum.i_don_not_know:
                        statistic.iDonNotKnowCounter++;
                        break;
                    default:
                }
                statistics.push(statistic);
            }
            await txEM.save(QuestionAndProjectStatistic, statistics);
        }).catch(error => {
            if (error.httpCode !== undefined) { throw error; }
            throw new HttpError(500, `Server Error. Message: ${error.message}`);
        });
        return { success: true };
    }

    private async getSignificantProjects(dialog: Dialog, limitWeight: number): Promise<Project[]> {
        const sortedProjectRatings = dialog.projectsRating.sort((a, b) => b.rating - a.rating); // TODO грязная функция сортировки
        const significantProjects = new Array<Project>();
        for (let sumWeight = 0, i = 0; sumWeight < limitWeight; i++) {
            significantProjects.push(await this.projectRepository.findOne({ where: { id: sortedProjectRatings[i].projectId }}));
            sumWeight += sortedProjectRatings[i].rating;
        }
        return significantProjects;
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
