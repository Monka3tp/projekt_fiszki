export async function register() {
    console.log("test123");
    if (!('serviceWorker' in navigator)) {
        console.info('ServiceWorker nieobsługiwany w tej przeglądarce.');
        return null;
    }

    try {
        const reg = await navigator.serviceWorker.register('/sw.js', {scope: '/'});
        console.info('[diag] registered', reg.scope, reg);
    } catch (err) {
        console.error('[diag] register failed', err);
    }
}

export async function checkRegistration() {
    if (!('serviceWorker' in navigator)) {
        console.info('[sw] checkRegistration: brak wsparcia serviceWorker');
        return null;
    }
    try {
        const paths = ['/sw.js', '/service-worker.js', 'sw.js', 'service-worker.js'];
        for (const p of paths) {
            try {
                const reg = await navigator.serviceWorker.getRegistration(p);
                console.info(`[sw] getRegistration(${p}) =>`, reg);
                if (reg) return reg;
            } catch (err) {
                console.info(`[sw] getRegistration(${p}) nieudane:`, err);
            }
        }

        const regs = await navigator.serviceWorker.getRegistrations();
        console.info('[sw] getRegistrations count:', regs.length, regs);
        return regs.length ? regs[0] : null;
    } catch (err) {
        console.error('Sprawdzenie ServiceWorker nie powiodło się:', err);
        return null;
    }
}

export async function unregisterAll() {
    if (!('serviceWorker' in navigator)) return;
    try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
        console.info('Wszystkie SW wyrejestrowane');
    } catch (err) {
        console.error('Wyrejestrowanie SW nie powiodło się:', err);
    }
}

