import { EntityRepository, Repository } from 'typeorm';

import { QuestionAndProjectStatistic } from '../models/QuestionAndProjectStatistic';

@EntityRepository(QuestionAndProjectStatistic)
export class QuestionAndProjectStatisticRepository extends Repository<QuestionAndProjectStatistic> {
}
