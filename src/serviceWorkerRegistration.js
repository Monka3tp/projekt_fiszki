export async function register() {
    if (!('serviceWorker' in navigator)) {
        return null;
    }

    try {
        await navigator.serviceWorker.register('/sw.js', {scope: '/'});
    } catch (err) {
        console.error('[diag] register failed', err);
    }
}

