# Viscardi Assicurazioni — app installabile

Il sito è configurato come Progressive Web App (PWA). Dopo la pubblicazione su Vercel può essere installato dal browser e utilizzato dalla schermata Home come un'app autonoma.

## Pubblicazione

Caricare su GitHub tutti i file e le cartelle del pacchetto, compresi:

- `manifest.webmanifest`
- `service-worker.js`
- `pwa.js`
- `assets/icons/`

Vercel eseguirà automaticamente il nuovo deploy. L'installazione funziona dal sito online in HTTPS, non aprendo `index.html` direttamente dal computer.

## Android

1. Aprire il sito con Chrome.
2. Toccare **Installa l'app** nella pagina oppure **Installa app** nel menu del browser.
3. Confermare l'installazione.

## iPhone e iPad

1. Aprire il sito con Safari.
2. Toccare **Installa l'app** per visualizzare il promemoria.
3. Toccare il pulsante **Condividi** di Safari.
4. Scegliere **Aggiungi alla schermata Home** e confermare.

## Aggiornamenti

L'app continua a utilizzare il sito pubblicato su Vercel. Le modifiche future caricate su GitHub vengono distribuite tramite lo stesso deploy, senza creare un'app separata.

Questa versione è installabile direttamente dal browser. La pubblicazione su Google Play o App Store richiede un successivo pacchetto nativo e gli account sviluppatore dei rispettivi store.
