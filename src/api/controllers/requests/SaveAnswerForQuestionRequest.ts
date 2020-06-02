import { IsEnum, IsString } from 'class-validator';

import { QuestionAnswerEnum } from '../../models/Question';

export class SaveAnswerForQuestionRequest {
    @IsString() public token: string;
    @IsEnum(QuestionAnswerEnum) public answer: QuestionAnswerEnum;
    constructor(
        token: string,
        answer: QuestionAnswerEnum
    ) {
        this.token = token;
        this.answer = answer;
    }
}
