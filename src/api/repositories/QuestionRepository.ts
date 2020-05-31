import { EntityRepository, Repository } from 'typeorm';

import { Question } from '../models/Question';

@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
}
