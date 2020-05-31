import { Service } from 'typedi';
import { DeleteResult, UpdateResult } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';

// import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import { CreateOrUpdateProjectRequest } from '../controllers/requests/CreateOrUpdateProjectRequest';
import { Project } from '../models/Project';
import { ProjectRepository } from '../repositories/ProjectRepository';

// import { events } from '../subscribers/events';

@Service()
export class ProjectService {

    constructor(
        @OrmRepository() private projectRepository: ProjectRepository
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

}
