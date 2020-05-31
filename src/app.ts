import 'reflect-metadata';

import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { Logger } from './lib/logger';
import { eventDispatchLoader } from './loaders/eventDispatchLoader';
import { expressLoader } from './loaders/expressLoader';
// import { graphqlLoader } from './loaders/graphqlLoader';
import { homeLoader } from './loaders/homeLoader';
import { iocLoader } from './loaders/iocLoader';
import { monitorLoader } from './loaders/monitorLoader';
import { publicLoader } from './loaders/publicLoader';
import { swaggerLoader } from './loaders/swaggerLoader';
import { typeormLoader } from './loaders/typeormLoader';
import { winstonLoader } from './loaders/winstonLoader';

/**
 * EXPRESS TYPESCRIPT BOILERPLATE
 * ----------------------------------------
 *
 * This is a boilerplate for Node.js Application written in TypeScript.
 * The basic layer of this app is express. For further information visit
 * the 'README.md' file.
 */
const log = new Logger(__filename);

bootstrapMicroframework({
    /**
     * Loader is a place where you can configure all your modules during microframework
     * bootstrap process. All loaders are executed one by one in a sequential order.
     */
    loaders: [
        winstonLoader,
        iocLoader,
        eventDispatchLoader,
        typeormLoader,
        expressLoader,
        swaggerLoader,
        monitorLoader,
        homeLoader,
        publicLoader,
        // graphqlLoader,
    ],
})
    .then((mf) => {
        (global as any).frameworkSettings = mf.settings;

        // Graceful shutdown handler
        process.on('SIGINT', async () => {
            mf.shutdown()
                .then(() => {
                    log.info('Graceful shutdown');
                    process.exit(0);
                })
                .catch(() => {
                    log.warn('Application shutdown, but some of mf shutdown handlers was corrupted');
                    process.exit(2);
                });
        });
        (global as any).frameworkSettings = mf.settings;
        if (typeof process.send === 'function') {
            process.send('ready');
        }

        banner(log);
    })
    .catch(error => { log.error('Application is crashed: ' + error.message);  process.exit(1); });
