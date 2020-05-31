import { IsString } from 'class-validator';

export class CreateOrUpdateProjectRequest {
    @IsString() public projectName: string;
    constructor(
        projectName: string
    ) {
        this.projectName = projectName;
    }
}
