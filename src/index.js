// `src/index.js`
import { register } from './serviceWorkerRegistration.js';

// early capture of beforeinstallprompt so late-mounted components can use it
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    try {
      e.preventDefault();
    } catch {
      // ignore
    }
    // store so InstallButton (or other late code) can pick it up
    window.__DEFERRED_BEFORE_INSTALL_PROMPT = e;
    console.info('[pwa] beforeinstallprompt captured early');
  });
}

console.log('Rejestracja ServiceWorker...');
window.addEventListener('load', () => {
  console.log('Rejestracja ServiceWorker...');
  register();
});