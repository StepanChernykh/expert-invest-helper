import { IsString } from 'class-validator';

export class CreateOrUpdateQuestionRequest {
    @IsString() public questionMessage: string;
    constructor(
        questionMessage: string
    ) {
        this.questionMessage = questionMessage;
    }
}
