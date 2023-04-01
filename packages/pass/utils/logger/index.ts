import log from 'loglevel';

log.setLevel('info');

export const logId = (id: string) =>
    id.length > 10 ? `[${id.slice(0, 5)}…${id.slice(id.length - 5, id.length)}]` : `[${id}]`;
export const logger = log;
