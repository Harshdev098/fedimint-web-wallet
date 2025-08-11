interface Logger {
    // eslint-disable-next-line
    log: (...args: any[]) => void; // eslint-disable-next-line
    warn: (...args: any[]) => void; // eslint-disable-next-line
    error: (...args: any[]) => void;
}
const logger: Logger = {
    // eslint-disable-next-line
    log: (...args: any[]) => {
        if (window.localStorage.getItem('appDebug') === 'true') {
            console.log('[APP]', ...args);
        }
    }, // eslint-disable-next-line
    warn: (...args: any[]) => {
        if (window.localStorage.getItem('appDebug') === 'true') {
            console.warn('[APP]', ...args);
        }
    }, // eslint-disable-next-line
    error: (...args: any[]) => {
        if (window.localStorage.getItem('appDebug') === 'true') {
            console.error('[APP]', ...args);
        }
    },
};

export default logger;
