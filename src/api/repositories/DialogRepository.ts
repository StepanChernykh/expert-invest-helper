import { EntityRepository, Repository } from 'typeorm';

import { Dialog } from '../models/Dialog';

@EntityRepository(Dialog)
export class DialogRepository extends Repository<Dialog> {
}
