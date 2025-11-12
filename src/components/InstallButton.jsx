// javascript
// File: src/components/InstallButton.jsx
import React, {useEffect, useState, useRef} from 'react';

export default function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [visible, setVisible] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [infoKind, setInfoKind] = useState('generic');
    const [diag, setDiag] = useState({
        supportsPrompt: null,
        hasManifest: null,
        iconsOk: null,
        hasServiceWorker: null,
        isSecure: null,
        startUrlOk: null,
    });

    const installedRef = useRef(false);
    const isIosRef = useRef(false);
    const isFirefoxRef = useRef(false);
    const mqlRef = useRef(null);
    const swControllerChangeRef = useRef(null);

    useEffect(() => {
        const ua = (window.navigator && window.navigator.userAgent) || '';
        const isIos = /iphone|ipad|ipod/i.test(ua);
        const isFirefox = /\bFirefox\b/i.test(ua);

        isIosRef.current = isIos;
        isFirefoxRef.current = isFirefox;

        const supportsPrompt = 'onbeforeinstallprompt' in window;
        const isSecure = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';

        const mql = window.matchMedia && window.matchMedia('(display-mode: standalone)');
        mqlRef.current = mql;
        const isDisplayStandalone = Boolean(mql && mql.matches);
        const isIosStandalone = ('standalone' in window.navigator) && window.navigator.standalone === true;
        installedRef.current = Boolean(isDisplayStandalone || isIosStandalone);

        // Pokaż przycisk tylko gdy:
        // - aplikacja NIE jest zainstalowana
        // - oraz: albo to iOS/Firefox (instrukcja), albo pokaż go dopiero gdy otrzymasz beforeinstallprompt (handler)
        const shouldShowInitial = !installedRef.current && (isIos || isFirefox);
        setVisible(shouldShowInitial);

        setInfoKind(supportsPrompt ? 'chrome' : (isIos ? 'ios' : isFirefox ? 'firefox' : 'generic'));
        setDiag(d => ({...d, supportsPrompt, isSecure}));

        const onBeforeInstallPrompt = (e) => {
            e.preventDefault();
            // zapisz event i pokaż przycisk - native prompt będzie wywołany przy kliknięciu
            setDeferredPrompt(e);
            setDiag(d => ({...d, supportsPrompt: true}));
            if (!installedRef.current) {
                setVisible(true);
                setInfoKind('chrome');
            } else {
                console.info('[diag] beforeinstallprompt ignored: already installed');
            }
        };

        const onAppInstalled = () => {
            installedRef.current = true;
            setVisible(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.addEventListener('appinstalled', onAppInstalled);

        const onDisplayModeChange = (ev) => {
            if (ev && ev.matches) onAppInstalled();
        };

        if (mqlRef.current) {
            if (typeof mqlRef.current.addEventListener === 'function') mqlRef.current.addEventListener('change', onDisplayModeChange);
            else mqlRef.current.onchange = onDisplayModeChange;
        }

        (async () => {
            try {
                const resp = await fetch('/manifest.json', {cache: 'no-store'});
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const manifest = await resp.json();
                const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
                const sizes = icons.flatMap(i => (i.sizes || '').split(/\s+/));
                const iconsOk = sizes.some(s => {
                    const n = parseInt(s, 10);
                    return !Number.isNaN(n) && (n >= 192);
                });
                const startUrlOk = typeof manifest.start_url === 'string' && manifest.start_url.length > 0;
                setDiag(d => ({...d, hasManifest: true, iconsOk, startUrlOk}));
                console.info('PWA diagnostics: manifest found', {iconsOk, startUrlOk, manifest});
            } catch (err) {
                setDiag(d => ({...d, hasManifest: false, iconsOk: false, startUrlOk: false}));
                console.info('PWA diagnostics: manifest not found or invalid', err);
            }

            try {
                if (navigator.serviceWorker) {
                    const regs = await (navigator.serviceWorker.getRegistrations ? navigator.serviceWorker.getRegistrations() : []);
                    const hasSW = Array.isArray(regs) ? regs.length > 0 : Boolean(regs);
                    setDiag(d => ({...d, hasServiceWorker: hasSW}));
                    console.info('PWA diagnostics: service worker registrations', regs);

                    swControllerChangeRef.current = async () => {
                        try {
                            const newRegs = await navigator.serviceWorker.getRegistrations();
                            const has = Array.isArray(newRegs) ? newRegs.length > 0 : Boolean(newRegs);
                            setDiag(d => ({...d, hasServiceWorker: has}));
                            console.info('PWA diagnostics: service worker registrations updated', newRegs);
                        } catch (e) {
                            console.warn('failed reading registrations on controllerchange', e);
                            setDiag(d => ({...d, hasServiceWorker: false}));
                        }
                    };

                    if (typeof navigator.serviceWorker.addEventListener === 'function' && swControllerChangeRef.current) {
                        navigator.serviceWorker.addEventListener('controllerchange', swControllerChangeRef.current);
                    }
                } else {
                    setDiag(d => ({...d, hasServiceWorker: false}));
                }
            } catch (err) {
                setDiag(d => ({...d, hasServiceWorker: false}));
                console.info('PWA diagnostics: service worker check failed', err);
            }

            if (!supportsPrompt && !installedRef.current) {
                if (isIos) setInfoKind('ios');
                else if (isFirefox) setInfoKind('firefox');
                else setInfoKind('generic');
            }
        })();

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
            window.removeEventListener('appinstalled', onAppInstalled);
            if (mqlRef.current) {
                if (typeof mqlRef.current.removeEventListener === 'function') mqlRef.current.removeEventListener('change', onDisplayModeChange);
                else mqlRef.current.onchange = null;
            }
            if (swControllerChangeRef.current && navigator.serviceWorker && typeof navigator.serviceWorker.removeEventListener === 'function') {
                navigator.serviceWorker.removeEventListener('controllerchange', swControllerChangeRef.current);
            }
        };
    }, []);

    const handleClick = async () => {
        if (deferredPrompt) {
            try {
                console.info('[install] calling prompt()');
                await deferredPrompt.prompt();
                const choice = await deferredPrompt.userChoice;
                console.log('PWA install choice:', choice.outcome);
            } catch (err) {
                console.error('[install] prompt failed', err);
            } finally {
                setDeferredPrompt(null);
                setVisible(false);
            }
            return;
        }

        // brak natywnego promptu — pokaż instrukcje/diagnostykę
        setShowInfo(true);
        console.info('PWA diagnostics (user triggered):', diag);
    };

    if (!visible) return null;

    return (
        <>
            <button onClick={handleClick} className="install-btn" style={buttonStyle} aria-label="Pobierz aplikację">
                Pobierz aplikację
            </button>

            {showInfo && (
                <div role="dialog" aria-modal="true" style={overlayStyle} onClick={() => setShowInfo(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{marginTop: 0}}>Jak zainstalować aplikację</h3>

                        <div>
                            <p>Jeśli natywny prompt nie pojawia się, sprawdź poniższe punkty:</p>
                            <ul>
                                <li>HTTPS: <strong>{diag.isSecure ? 'OK' : 'Brak'}</strong></li>
                                <li>Manifest: <strong>{diag.hasManifest === null ? '…' : diag.hasManifest ? 'OK' : 'Brak / nieprawidłowy'}</strong></li>
                                <li>Ikony (&gt;= 192px): <strong>{diag.iconsOk === null ? '…' : diag.iconsOk ? 'OK' : 'Brak odpowiednich rozmiarów'}</strong></li>
                                <li>start_url w manifeście: <strong>{diag.startUrlOk === null ? '…' : diag.startUrlOk ? 'OK' : 'Brak / pusty'}</strong></li>
                                <li>Service Worker zarejestrowany: <strong>{diag.hasServiceWorker === null ? '…' : diag.hasServiceWorker ? 'OK' : 'Brak'}</strong></li>
                                <li>Przeglądarka wspiera natywny prompt: <strong>{diag.supportsPrompt ? 'Tak' : 'Nie / ograniczone'}</strong></li>
                            </ul>

                            {infoKind === 'chrome' && (
                                <p>Jesteś na Chrome — jeśli wszystko powyżej jest OK, natywny prompt powinien się pojawić. Jeśli nie, użyj menu przeglądarki → <em>Add to Home screen</em>.</p>
                            )}

                            {infoKind === 'firefox' && (
                                <p>Firefox często nie emituje `beforeinstallprompt`. Użyj menu przeglądarki (np. „Install”).</p>
                            )}

                            {infoKind === 'ios' && (
                                <p>iOS: użyj przycisku <strong>Udostępnij</strong> w Safari → <strong>Dodaj do ekranu początkowego</strong>.</p>
                            )}

                            {infoKind === 'generic' && (
                                <p>Jeśli natywny prompt nie działa, spróbuj w Chrome/Edge na Androidzie lub użyj instrukcji powyżej.</p>
                            )}
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem'}}>
                            <button onClick={() => setShowInfo(false)} style={closeBtnStyle}>Zamknij</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


const buttonStyle = {
    background: "linear-gradient(90deg, #d633ff, #9b4dff)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontWeight: 600,
};

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
};

const modalStyle = {
    background: 'white',
    color: '#111',
    borderRadius: '8px',
    maxWidth: '520px',
    width: '100%',
    padding: '1rem 1.25rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
};

const closeBtnStyle = {
    background: '#eee',
    border: 'none',
    padding: '0.45rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
};