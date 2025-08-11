import NProgress from 'nprogress';

let isActive = false;

export function startProgress() {
    if (!isActive) {
        NProgress.start();
        isActive = true;
    }
}

export function doneProgress() {
    if (isActive) {
        NProgress.done();
        isActive = false;
    }
}
