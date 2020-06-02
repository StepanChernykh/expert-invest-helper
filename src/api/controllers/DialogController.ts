import { Authorized, Body, Get, JsonController, Post } from 'routing-controllers';

import { Dialog } from '../models/Dialog';
import { DialogService } from '../services/DialogService';
import { SaveAnswerForQuestionRequest } from './requests/SaveAnswerForQuestionRequest';

@Authorized()
@JsonController('/dialog')
export class DialogController {

    constructor(
        private dialogService: DialogService
    ) { }

    @Get('/start')
    public startDialog(): Promise<Dialog> {
        return this.dialogService.startDialog();
    }

    @Post('/answer-and-next')
    public saveAnswerForQuestionAndGetNextQuestion(@Body() body: SaveAnswerForQuestionRequest): Promise<Dialog> {
        return this.dialogService.saveAnswerForQuestionAndGetNextQuestion(body);
    }

}
