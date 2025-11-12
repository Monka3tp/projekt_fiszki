export async function register() {
  if (!('serviceWorker' in navigator)) {
    console.info('ServiceWorker nieobsługiwany w tej przeglądarce.');
    return null;
  }

  const isSecure = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
  if (!isSecure) {
    console.info('Brak bezpiecznego kontekstu (HTTPS / localhost). Nie rejestruję SW.');
    return null;
  }

  try {
    await new Promise((res) => {
      if (document.readyState === 'complete') return res();
      window.addEventListener('load', res, { once: true });
    });

    // priorytetowo próbujemy public/service-worker.js (często używany), potem inne warianty
    const candidates = [
      '/service-worker.js',
      '/sw.js',
      '/service-worker.js', // kept for completeness
      'sw.js',
      './sw.js',
      'service-worker.js',
      './service-worker.js'
    ];
    let lastError = null;

    for (const swUrlRaw of candidates) {
      try {
        // Upewnij się, że używamy absolutnego URL (unikanie problemów z relative base)
        const swUrl = new URL(swUrlRaw, location.origin).toString();
        console.info(`[sw] Sprawdzam dostępność pliku: ${swUrl}`);
        const resp = await fetch(swUrl, { method: 'GET', cache: 'no-store' });

        console.info(`[sw] fetch ${swUrl} => status ${resp.status}`);
        const contentType = (resp.headers.get('content-type') || '').toLowerCase();
        console.info(`[sw] content-type: ${contentType}`);

        // podgląd fragmentu odpowiedzi (pierwsze 300 znaków) - pomoc diagnostyczna
        let snippet = '';
        try {
          snippet = await resp.clone().text().then(t => t.slice(0, 300));
          console.info(`[sw] response snippet for ${swUrl}:`, snippet.replace(/\s+/g, ' ').slice(0, 300));
        } catch (snipErr) {
          console.info('[sw] nie udało się pobrać snippet response:', snipErr);
        }

        // Jeżeli serwer zwrócił HTML (np. index.html / SPA fallback), pomiń tę ścieżkę
        if (contentType.includes('text/html') || snippet.trim().startsWith('<!doctype html') || snippet.trim().startsWith('<html')) {
          console.warn(`[sw] Plik ${swUrl} wygląda jak HTML (serwer zwraca SPA fallback). Pomijam.`);
          continue;
        }

        if (!resp.ok) {
          console.info(`[sw] Plik ${swUrl} zwrócił status ${resp.status} — pomijam`);
          continue;
        }

        // opcjonalna kontrola czy zawartość wygląda jak JS
        if (!/javascript|ecmascript|text\/plain|application\/octet-stream/.test(contentType)) {
          console.warn(`[sw] content-type (${contentType}) nie wygląda standardowo na JS — spróbuję rejestracji, ale może się nie powieść`);
        }

        try {
          console.info(`[sw] Próbuję navigator.serviceWorker.register('${swUrl}', { scope: '/' })`);
          const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });
          console.info('[sw] Rejestracja powiodła się:', registration);

          const observeWorker = (worker) => {
            if (!worker) return;
            console.info('[sw] obserwuję worker:', worker, 'initial state:', worker.state);
            worker.addEventListener('statechange', () => {
              console.info('[sw] worker statechange ->', worker.state);
              if (worker.state === 'redundant') {
                console.warn('[sw] worker became redundant (błąd instalacji lub zastąpiony)');
              }
            });
          };

          observeWorker(registration.installing);
          observeWorker(registration.waiting);
          observeWorker(registration.active);

          registration.addEventListener('updatefound', () => {
            console.info('[sw] updatefound -> nowy worker');
            observeWorker(registration.installing);
          });

          console.info('[sw] navigator.serviceWorker.controller =>', navigator.serviceWorker.controller);

          return registration;
        } catch (regErr) {
          lastError = regErr;
          console.warn(`[sw] Rejestracja ${swUrl} nie powiodła się:`, regErr);
        }
      } catch (fetchErr) {
        lastError = fetchErr;
        console.info(`[sw] Nie udało się pobrać kandydata ${swUrlRaw}:`, fetchErr);
      }
    }

    // Spróbuj zebrać istniejące rejestracje i je zwrócić
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      console.info('[sw] getRegistrations() zwróciło:', regs.length, regs);
      if (regs.length > 0) return regs[0];
    } catch (err) {
      console.info('[sw] getRegistrations() nieudane:', err);
    }

    // Ostateczna próba bez wcześniejszego fetch (może być konieczne)
    try {
      console.info('[sw] Ostateczna próba rejestracji /service-worker.js bez wcześniejszego fetch');
      const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
      console.info('[sw] Rejestracja /service-worker.js powiodła się:', registration);
      return registration;
    } catch (finalErr) {
      console.error('[sw] Ostateczna rejestracja również nie powiodła się:', finalErr);
      if (lastError) console.info('[sw] Pierwotny błąd podczas prób:', lastError);
      return null;
    }
  } catch (err) {
    console.error('Rejestracja ServiceWorker nie powiodła się (ogólny błąd):', err);
    return null;
  }
}

export async function checkRegistration() {
  if (!('serviceWorker' in navigator)) {
    console.info('[sw] checkRegistration: brak wsparcia serviceWorker');
    return null;
  }
  try {
    // najpierw pobierz wszystkie rejestracje
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      console.info('[sw] getRegistrations() =>', regs);
      if (regs && regs.length) return regs[0];
    } catch (gErr) {
      console.info('[sw] getRegistrations() nieudane:', gErr);
    }

    // fallback na getRegistration dla kilku ścieżek
    const paths = ['/service-worker.js', '/sw.js', 'sw.js', 'service-worker.js'];
    for (const p of paths) {
      try {
        const reg = await navigator.serviceWorker.getRegistration(new URL(p, location.origin).toString());
        console.info(`[sw] getRegistration(${p}) =>`, reg);
        if (reg) return reg;
      } catch (err) {
        console.info(`[sw] getRegistration(${p}) nieudane:`, err);
      }
    }

    return null;
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

