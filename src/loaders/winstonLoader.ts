import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import * as path from 'path';
import { configure, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { env } from '../env';

export const winstonLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    const neededTransports = [];
    if (env.log.file) {
        const filepath = env.log.filepath ? env.log.filepath : './';
        let filename = env.log.filename ? env.log.filename : 'app.log';

        if (env.log.rotate && filename.indexOf('%DATE%') === -1) {
            const splitted = filename.split('.');
            splitted[0] += '-%DATE%';
            filename = splitted.join('.');
        }

        if (env.log.rotate) {
            neededTransports.push(new DailyRotateFile({
                filename,
                dirname: filepath,
                level: env.log.level,
                zippedArchive: true,
                handleExceptions: true,
                maxFiles: '5d',
                frequency: '48h',
                datePattern: 'YYYY.MM.DD-HH:mm',
                format: env.node !== 'development'
                    ? format.combine(
                        format.json()
                    )
                    : format.combine(
                        format.colorize(),
                        format.simple()
                    ),
            }));
        } else {
            const fullFilepath = path.resolve(filepath, filename);
            neededTransports.push(new transports.File({
                filename: fullFilepath,
                level: env.log.level,
                handleExceptions: true,
                format: env.node !== 'development'
                    ? format.combine(
                        format.json()
                    )
                    : format.combine(
                        format.colorize(),
                        format.simple()
                    ),
            }));
        }
    } else {
        neededTransports.push(new transports.Console({
            level: env.log.level,
            handleExceptions: true,
            format: env.node !== 'development'
                ? format.combine(
                    format.json()
                )
                : format.combine(
                    format.colorize(),
                    format.simple()
                ),
        }));
    }

    configure({
        transports: neededTransports,
    });
};
