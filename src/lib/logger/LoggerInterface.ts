export interface LoggerInterface {
    debug<O extends object>(message: string, args?: O & (O extends any[] ? 'No Arrays!' : {})): void;
    info<O extends object>(message: string, args?: O & (O extends any[] ? 'No Arrays!' : {})): void;
    warn<O extends object>(message: string, args?: O & (O extends any[] ? 'No Arrays!' : {})): void;
    error<O extends object>(message: string, args?: O & (O extends any[] ? 'No Arrays!' : {})): void;
}
