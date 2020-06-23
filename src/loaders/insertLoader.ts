import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { getConnection } from 'typeorm';

import { Project } from '../api/models/Project';
import { Question } from '../api/models/Question';
import { QuestionAndProjectStatistic } from '../api/models/QuestionAndProjectStatistic';

export const insertLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {

    const connection = getConnection();
    const questionRepository = connection.getRepository(Question);
    const projectRepository = connection.getRepository(Project);
    const questionAndProjectStatisticRepository = connection.getRepository(QuestionAndProjectStatistic);

    const questions = [
        { questionMessage: 'Вас интересуют благотворительные проекты?' },
        { questionMessage: 'Вас интересуют социальные проекты?' },
        { questionMessage: 'Вас интересуют инвестиционные проекты?' },
        { questionMessage: 'Вас интересуют большие проекты?' },
        { questionMessage: 'Вы желаете по-скорее увидеть реализацию проекта?' },
        { questionMessage: 'Выгода вложения для Вас наиболее важна?' },
        { questionMessage: 'Желаете почистить карму?' },
    ];

    const questionsFromDB = await questionRepository.find();
    const projects = await projectRepository.find();
    const newQuestions = questions.filter(x => questionsFromDB.find(y => y.questionMessage === x.questionMessage) === undefined);
    const questionAndProjectStatistics = new Array<QuestionAndProjectStatistic>();
    const savedQuestions = await questionRepository.save(newQuestions.map(x => {
        const newQuestion = new Question();
        newQuestion.questionMessage = x.questionMessage;
        return newQuestion;
    }));
    savedQuestions.forEach(question => {
        projects.forEach(project => {
            const statistic = new QuestionAndProjectStatistic();
            statistic.projectId = project.id;
            statistic.questionId = question.id;
            statistic.yesCounter = 1; // для стартовой балансировки (при увеличении вес каждого отдельного проекта
            statistic.partiallyPossibleCounter = 1; // становится менее выдающимся относительно других проектов)
            statistic.probablyNotCounter = 1;
            statistic.noCounter = 1;
            statistic.iDonNotKnowCounter = 1;
            questionAndProjectStatistics.push(statistic);
        });
    });
    if (questionAndProjectStatistics.length > 0) {
        await questionAndProjectStatisticRepository.save(questionAndProjectStatistics);
    }
};
