(function () {
  'use strict';

  var installButton = document.getElementById('appInstall');
  var deferredPrompt = null;
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/service-worker.js').catch(function () {});
    });
  }

  function closeHelp(dialog) {
    dialog.hidden = true;
    document.documentElement.classList.remove('has-install-dialog');
  }

  function showInstallHelp() {
    var dialog = document.getElementById('appInstallDialog');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'appInstallDialog';
      dialog.className = 'app-install-dialog';
      dialog.hidden = true;
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'appInstallTitle');
      dialog.innerHTML = '<div class="app-install-dialog__card"><button class="app-install-dialog__x" type="button" aria-label="Chiudi">×</button><span class="app-install-dialog__icon" aria-hidden="true">↓</span><h2 id="appInstallTitle">Installa l’app</h2><p data-install-instructions></p><button class="app-install-dialog__close" type="button">Ho capito</button></div>';
      document.body.appendChild(dialog);
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog || event.target.closest('.app-install-dialog__close,.app-install-dialog__x')) closeHelp(dialog);
      });
      dialog.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeHelp(dialog);
      });
    }
    var instructions = dialog.querySelector('[data-install-instructions]');
    instructions.textContent = isIOS
      ? 'Su iPhone o iPad tocca il pulsante Condividi del browser e scegli “Aggiungi alla schermata Home”.'
      : 'Apri il menu del browser e scegli “Installa app” oppure “Aggiungi alla schermata Home”.';
    dialog.hidden = false;
    document.documentElement.classList.add('has-install-dialog');
    dialog.querySelector('.app-install-dialog__close').focus();
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredPrompt = event;
    if (installButton && !standalone) installButton.hidden = false;
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    if (installButton) installButton.hidden = true;
  });

  if (installButton) {
    if (isIOS && !standalone) installButton.hidden = false;
    installButton.addEventListener('click', async function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        var choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (choice.outcome === 'accepted') installButton.hidden = true;
      } else {
        showInstallHelp();
      }
    });
  }
})();
