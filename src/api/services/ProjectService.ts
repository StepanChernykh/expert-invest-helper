import rp from 'request-promise';
import { Service } from 'typedi';
import { DeleteResult, UpdateResult } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';

// import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import { CreateOrUpdateProjectRequest } from '../controllers/requests/CreateOrUpdateProjectRequest';
import { Project } from '../models/Project';
import { QuestionAndProjectStatistic } from '../models/QuestionAndProjectStatistic';
import { ProjectRepository } from '../repositories/ProjectRepository';
import {
    QuestionAndProjectStatisticRepository
} from '../repositories/QuestionAndProjectStatisticRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';

// import { events } from '../subscribers/events';

@Service()
export class ProjectService {

    constructor(
        @OrmRepository() private projectRepository: ProjectRepository,
        @OrmRepository() private questionRepository: QuestionRepository,
        @OrmRepository() private questionAndProjectStatisticRepository: QuestionAndProjectStatisticRepository
        // @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        // @Logger(__filename) private log: LoggerInterface
    ) { }

    public async getAll(): Promise<Project[]> {
        return this.projectRepository.find();
    }

    public async getById(id: number): Promise<Project> {
        return this.projectRepository.findOne({ where: { id }});
    }

    public async create(body: CreateOrUpdateProjectRequest): Promise<Project> {
        return this.projectRepository.save({ projectName: body.projectName });
    }

    public async update(id: number, body: CreateOrUpdateProjectRequest): Promise<UpdateResult> {
        return this.projectRepository.update({ id }, { projectName: body.projectName });
    }

    public async deleteById(id: number): Promise<DeleteResult> {
        return this.projectRepository.delete({ id });
    }

    public async fetchProjectsByUrl(uri: string): Promise<Project[]> {
        const response = await rp({ uri, json: true });
        const projectsFromDB = await this.projectRepository.find();
        const questions = await this.questionRepository.find();
        let projects = Array<Project>();
        const questionAndProjectStatistics = Array<QuestionAndProjectStatistic>();
        response.data.forEach(x => {
            if (projectsFromDB.find(y => y.projectName === x.name ) === undefined) {
                const project = new Project();
                project.projectName = x.name;
                projects.push(project);
            }
        });
        projects = projects.length > 0 ? await this.projectRepository.save(projects) : [];
        projects.forEach(project => {
            questions.forEach(question => {
                const statistic = new QuestionAndProjectStatistic();
                statistic.projectId = project.id;
                statistic.questionId = question.id;
                statistic.yesCounter = 1; // для стартовой балансировки (при увеличении вес каждого отдельного проекта
                statistic.partiallyPossibleCounter = 1; // становится менее выдающимся относительно других проектов)
                statistic.probablyNotCounter = 1;
                statistic.noCounter = 1;
                statistic.iDonNotKnowCounter = 1;
                questionAndProjectStatistics.push(statistic);
            });
        });
        if (questionAndProjectStatistics.length > 0) {
            await this.questionAndProjectStatisticRepository.save(questionAndProjectStatistics);
        }
        return projects;
    }

    public async getStartProjectRatings(): Promise<Array<{ projectId: number, rating: number }>> {
        const projects = await this.projectRepository.find();
        // tslint:disable-next-line:arrow-return-shorthand
        return projects.map(x => { return { projectId: x.id, rating: 1 / projects.length }; });
    }

}
