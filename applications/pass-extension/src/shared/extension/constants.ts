declare const WEBPACK_ENV: string;
export const ENV = typeof WEBPACK_ENV === 'undefined' ? 'development' : WEBPACK_ENV;

declare const WEBPACK_RUNTIME_RELOAD: boolean;
export const RUNTIME_RELOAD = typeof WEBPACK_RUNTIME_RELOAD === 'undefined' ? false : WEBPACK_RUNTIME_RELOAD;

declare const WEBPACK_RESUME_FALLBACK: boolean;
export const RESUME_FALLBACK = typeof WEBPACK_RESUME_FALLBACK === 'undefined' ? false : WEBPACK_RESUME_FALLBACK;
