import { Body, Get, JsonController, Param, Post } from 'routing-controllers';

import { Dialog } from '../models/Dialog';
import { Project } from '../models/Project';
import { DialogService } from '../services/DialogService';
import { FinishDialogRequest } from './requests/FinishDialogRequest';
import { SaveAnswerForQuestionRequest } from './requests/SaveAnswerForQuestionRequest';

// @Authorized()
@JsonController('/dialog')
export class DialogController {

    constructor(
        private dialogService: DialogService
    ) { }

    @Get('/token/:token')
    public one(@Param('token') token: string): Promise<Dialog> {
        return this.dialogService.findByToken(token);
    }

    @Post('/start')
    public startDialog(): Promise<Dialog> {
        return this.dialogService.startDialog();
    }

    @Post('/answer-and-next-question')
    public saveAnswerForQuestionAndGetNextQuestion(@Body() body: SaveAnswerForQuestionRequest): Promise<Dialog | Project[]> {
        return this.dialogService.saveAnswerForQuestionAndGetNextQuestion(body);
    }

    @Post('/finish')
    public finishDialog(@Body() body: FinishDialogRequest): Promise<any> {
        return this.dialogService.finishDialog(body);
    }

}
