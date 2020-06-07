import { Body, Delete, Get, JsonController, Param, Post, Put } from 'routing-controllers';
import { DeleteResult, UpdateResult } from 'typeorm';

import { Project } from '../models/Project';
import { ProjectService } from '../services/ProjectService';
import { CreateOrUpdateProjectRequest } from './requests/CreateOrUpdateProjectRequest';

// @Authorized()
@JsonController('/project')
export class ProjectController {

    constructor(
        private projectService: ProjectService
    ) { }

    @Get('/all')
    public getAll(): Promise<Project[]> {
        return this.projectService.getAll();
    }

    @Get('/id/:id')
    public getQuestions(@Param('id') id: string): Promise<Project> {
        return this.projectService.getById(Number(id));
    }

    @Post()
    public create(@Body({ validate: true }) body: CreateOrUpdateProjectRequest): Promise<Project> {
        return this.projectService.create(body);
    }

    @Put('/:id')
    public update(@Param('id') id: string, @Body({ validate: true }) body: CreateOrUpdateProjectRequest): Promise<UpdateResult> {
        return this.projectService.update(Number(id), body);
    }

    @Delete('/:id')
    public delete(@Param('id') id: string): Promise<DeleteResult> {
        return this.projectService.deleteById(Number(id));
    }

    @Post('/fetch') // TODO POST
    public fetchProjectsByUrl(@Body() body: { uri: string }): Promise<Project[]> {
        return this.projectService.fetchProjectsByUrl(body.uri);
    }

}
