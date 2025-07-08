interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

const logger: Logger = {
  log: (...args: any[]) => {
    if (window.localStorage.getItem('appDebug') === 'true') {
      console.log('[APP]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (window.localStorage.getItem('appDebug') === 'true') {
      console.warn('[APP]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (window.localStorage.getItem('appDebug') === 'true') {
      console.error('[APP]', ...args);
    }
  }
};

export default logger;