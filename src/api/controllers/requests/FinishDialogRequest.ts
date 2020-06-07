import { IsInt, IsString } from 'class-validator';

export class FinishDialogRequest {
    @IsString() public token: string;
    @IsInt() public projectId: number;
    constructor(
        token: string,
        projectId: number
    ) {
        this.token = token;
        this.projectId = projectId;
    }
}
