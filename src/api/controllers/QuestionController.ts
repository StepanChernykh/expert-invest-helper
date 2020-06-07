import { Body, Delete, Get, JsonController, Param, Post, Put } from 'routing-controllers';
import { DeleteResult, UpdateResult } from 'typeorm';

import { Question } from '../models/Question';
import { QuestionService } from '../services/QuestionService';
import { CreateOrUpdateQuestionRequest } from './requests/CreateOrUpdateQuestionRequest';

// @Authorized()
@JsonController('/question')
export class QuestionController {

    constructor(
        private questionService: QuestionService
    ) { }

    @Get('/all')
    public getAll(): Promise<Question[]> {
        return this.questionService.getAll();
    }

    @Get('/id/:id')
    public getQuestions(@Param('id') id: string): Promise<Question> {
        return this.questionService.getById(Number(id));
    }

    @Post()
    public create(@Body({ validate: true }) body: CreateOrUpdateQuestionRequest): Promise<Question> {
        return this.questionService.create(body);
    }

    @Put('/:id')
    public update(@Param('id') id: string, @Body({ validate: true }) body: CreateOrUpdateQuestionRequest): Promise<UpdateResult> {
        return this.questionService.update(Number(id), body);
    }

    @Delete('/:id')
    public delete(@Param('id') id: string): Promise<DeleteResult> {
        return this.questionService.deleteById(Number(id));
    }

}
