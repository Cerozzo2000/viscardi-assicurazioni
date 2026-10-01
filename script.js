(function () {
  'use strict';

  var $ = function (selector, context) { return (context || document).querySelector(selector); };
  var $$ = function (selector, context) { return Array.prototype.slice.call((context || document).querySelectorAll(selector)); };

  function showSuccessDialog(message) {
    var dialog = document.getElementById('requestSuccessDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'requestSuccessDialog';
      dialog.className = 'success-dialog';
      dialog.setAttribute('aria-labelledby', 'requestSuccessTitle');
      dialog.innerHTML = '<div class="success-dialog__card"><button class="success-dialog__x" type="button" aria-label="Chiudi">×</button><span class="success-dialog__icon" aria-hidden="true">✓</span><h2 id="requestSuccessTitle">Richiesta inviata</h2><p data-success-message></p><button class="success-dialog__close" type="button">Chiudi</button></div>';
      document.body.appendChild(dialog);
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog || event.target.closest('.success-dialog__close,.success-dialog__x')) dialog.close();
      });
    }
    $('[data-success-message]', dialog).textContent = message || 'La richiesta è stata inviata correttamente. Gennaro ti ricontatterà appena possibile.';
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
  }
  window.ViscardiForms = { showSuccessDialog: showSuccessDialog };

  var header = $('#siteHeader');
  var wa = $('#waFab');
  function updateChrome() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 32);
    if (wa) wa.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.55);
  }
  window.addEventListener('scroll', updateChrome, { passive: true });
  updateChrome();

  var serviceGroups = [
    { name: 'Impresa', items: [
      ['Responsabilità civile', 'responsabilita'], ['Opere e cantieri', 'cantiere'], ['Fabbricati e macchinari', 'property'],
      ['Interruzione di attività', 'interruzione'], ['Amministratori e dirigenti', 'do'], ['Cyber risk', 'cyber']
    ] },
    { name: 'Mobilità', items: [
      ['RC Auto', 'rc-auto'], ['RC Moto', 'rc-moto'], ['Veicoli aziendali', 'flotte'],
      ['Macchine in cantiere', 'mezzi-opera'], ['Merci in viaggio', 'merci'], ['Responsabilità del vettore', 'rc-vettore']
    ] },
    { name: 'Casa', items: [
      ['Fabbricato e contenuto', 'casa'], ['Responsabilità del proprietario', 'rc-proprietario'], ['Impianti fotovoltaici', 'fotovoltaico']
    ] },
    { name: 'Persona', items: [
      ['Capacità di lavorare', 'infortuni'], ['Temporanea caso morte', 'tcm'], ['Cure e assistenza', 'salute'], ['Progetto di lungo periodo', 'previdenza']
    ] }
  ];

  var menu = $('#megaMenu');
  var menuButton = $('#menuBtn');
  var menuClose = $('#megaClose');
  var catList = $('#megaCats');
  var serviceList = $('#megaServices');

  function renderServices(index) {
    if (!serviceList) return;
    serviceList.innerHTML = serviceGroups[index].items.map(function (item) {
      return '<li><a href="copertura.html?service=' + item[1] + '" data-mega-close>' + item[0] + '<span aria-hidden="true">↗</span></a></li>';
    }).join('');
    $$('#megaCats button').forEach(function (button, i) {
      button.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  if (catList) {
    catList.innerHTML = serviceGroups.map(function (group, index) {
      return '<li><button type="button" role="tab" aria-selected="' + (index === 0 ? 'true' : 'false') + '" data-service-index="' + index + '">' + group.name + '</button></li>';
    }).join('');
    catList.addEventListener('click', function (event) {
      var button = event.target.closest('[data-service-index]');
      if (button) renderServices(Number(button.getAttribute('data-service-index')));
    });
    catList.addEventListener('mouseover', function (event) {
      var button = event.target.closest('[data-service-index]');
      if (button) renderServices(Number(button.getAttribute('data-service-index')));
    });
    renderServices(0);
  }

  var previousFocus = null;
  function openMenu() {
    if (!menu) return;
    previousFocus = document.activeElement;
    menu.hidden = false;
    document.body.style.overflow = 'hidden';
    if (menuButton) menuButton.setAttribute('aria-expanded', 'true');
    var first = $('[data-service-index]', menu);
    if (first) first.focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.hidden = true;
    document.body.style.overflow = '';
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }
  if (menuButton) menuButton.addEventListener('click', function () { menu && menu.hidden ? openMenu() : closeMenu(); });
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  $$('[data-mega-close]').forEach(function (link) { link.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && menu && !menu.hidden) closeMenu(); });

  var readoutCopy = {
    impresa: ['Impresa', 'Il cuore della mappa', 'Responsabilità, patrimonio, continuità e obblighi contrattuali: rischi da leggere insieme.'],
    mobilita: ['Mobilità', 'Mezzi che tengono in moto il lavoro', 'Flotte, furgoni, mezzi d’opera e merci: la circolazione è solo una parte del rischio.'],
    casa: ['Casa e immobili', 'Proteggere gli spazi che contano', 'Fabbricato, contenuto, impianti e responsabilità del proprietario, anche per immobili aziendali.'],
    persona: ['Persona', 'La continuità passa dalle persone', 'Infortuni, salute e previdenza per il titolare, i collaboratori e la famiglia.']
  };
  var readoutK = $('[data-readout-k]');
  var readoutT = $('[data-readout-t]');
  var readoutD = $('[data-readout-d]');
  var defaultReadout = readoutK && readoutT && readoutD ? [readoutK.textContent, readoutT.textContent, readoutD.textContent] : null;
  var sectors = $$('.rs-sector');
  var nodes = $$('.rs-node');
  var chords = $$('.rs-chord');

  function setRiskArea(key) {
    var copy = key ? readoutCopy[key] : defaultReadout;
    if (copy && readoutK) {
      readoutK.textContent = copy[0];
      readoutT.textContent = copy[1];
      readoutD.textContent = copy[2];
    }
    sectors.forEach(function (item) { item.classList.toggle('is-active', !!key && item.getAttribute('data-sector') === key); });
    nodes.forEach(function (item) { item.classList.toggle('is-active', !!key && item.getAttribute('data-sector') === key); });
    chords.forEach(function (item) {
      item.classList.toggle('is-active', !!key && (item.getAttribute('data-a') === key || item.getAttribute('data-b') === key));
    });
  }
  sectors.forEach(function (item) {
    var key = item.getAttribute('data-sector');
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('mouseenter', function () { setRiskArea(key); });
    item.addEventListener('mouseleave', function () { setRiskArea(null); });
    item.addEventListener('focus', function () { setRiskArea(key); });
    item.addEventListener('blur', function () { setRiskArea(null); });
    item.addEventListener('click', function () { setRiskArea(key); });
    item.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setRiskArea(key); }
    });
  });

  $$('.acc__btn').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = button.closest('.acc__item').querySelector('.acc__panel');
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.hidden = expanded;
    });
  });

  var serviceQuestions = {
    'Responsabilità civile': 'Se un cliente, un passante o un dipendente subisse un danno, sai chi sarebbe considerato terzo?',
    'Opere e cantieri': 'Il capitolato dell’ultimo lavoro richiede garanzie o massimali che la tua polizza non prevede?',
    'Fabbricati e macchinari': 'Quanto servirebbe per ripristinare davvero un macchinario o un capannone dopo un danno?',
    'Interruzione di attività': 'Se la produzione si fermasse tre mesi, chi pagherebbe stipendi, affitti e costi fissi?',
    'Amministratori e dirigenti': 'Una decisione di gestione potrebbe coinvolgere direttamente il tuo patrimonio personale?',
    'Attacchi e dati': 'Quanto tempo potrebbe lavorare la tua attività senza sistemi, email o accesso ai dati?',
    'RC Auto': 'Se l’auto viene guidata anche da un familiare, la formula di guida scelta è adatta?',
    'RC Moto': 'Usi la moto ogni giorno o solo in alcuni mesi? La polizza rispecchia il tuo utilizzo reale?',
    'Veicoli aziendali': 'Tutti i conducenti e gli usi reali dei mezzi sono indicati correttamente in polizza?',
    'Macchine in cantiere': 'Il mezzo è coperto anche mentre lavora da fermo, fuori dalla circolazione?',
    'Merci in viaggio': 'Chi sostiene il danno se la merce viene rubata o danneggiata durante una sosta?',
    'Responsabilità del vettore': 'Conosci il limite di rimborso per chilogrammo applicato ai trasporti che effettui?',
    'Fabbricato e contenuto': 'Il valore dichiarato oggi basterebbe per ricostruire e sostituire ciò che possiedi?',
    'Responsabilità del proprietario': 'Se un elemento dell’immobile danneggiasse un vicino, la copertura interverrebbe?',
    'Impianti fotovoltaici': 'Sono coperti anche guasti, grandine e mancata produzione?',
    'Capacità di lavorare': 'Per quanto tempo potresti sostenere le spese se un infortunio ti impedisse di lavorare?',
    'Temporanea caso morte': 'Chi avrebbe le risorse per mantenere impegni familiari o aziendali se tu non ci fossi?',
    'Cure e assistenza': 'Quali cure vorresti poter scegliere senza dipendere soltanto dai tempi di attesa?',
    'Progetto di lungo periodo': 'Il reddito pensionistico previsto sarà sufficiente per lo stile di vita che immagini?'
  };
  var servicePageIds = {
    'Responsabilità civile': 'responsabilita', 'Opere e cantieri': 'cantiere', 'Fabbricati e macchinari': 'property',
    'Interruzione di attività': 'interruzione', 'Amministratori e dirigenti': 'do', 'Attacchi e dati': 'cyber',
    'RC Auto': 'rc-auto', 'RC Moto': 'rc-moto', 'Veicoli aziendali': 'flotte',
    'Macchine in cantiere': 'mezzi-opera', 'Merci in viaggio': 'merci', 'Responsabilità del vettore': 'rc-vettore',
    'Fabbricato e contenuto': 'casa', 'Responsabilità del proprietario': 'rc-proprietario', 'Impianti fotovoltaici': 'fotovoltaico',
    'Capacità di lavorare': 'infortuni', 'Temporanea caso morte': 'tcm', 'Cure e assistenza': 'salute',
    'Progetto di lungo periodo': 'previdenza'
  };
  $$('.service-card').forEach(function (card) {
    var heading = $('h3', card);
    var link = $('a', card);
    var question = heading && serviceQuestions[heading.textContent.trim()];
    if (!question || !link || $('.service-card__question', card)) return;
    var paragraph = document.createElement('p');
    paragraph.className = 'service-card__question';
    paragraph.textContent = question;
    link.parentNode.insertBefore(paragraph, link);
    if (servicePageIds[heading.textContent.trim()]) {
      link.href = 'copertura.html?service=' + servicePageIds[heading.textContent.trim()];
      link.textContent = 'Approfondisci e simula';
    }
  });

  var form = $('#contactForm');
  var status = $('#formStatus');
  var contactSubmit = $('#contactSubmit');
  var requestEndpoint = window.__FORM_ENDPOINT__ || '/api/send-request';
  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var name = form.elements.nome.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.messaggio.value.trim();
      var privacy = form.elements.privacy.checked;
      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message || !privacy) {
        if (status) {
          status.className = 'form__status is-error';
          status.textContent = 'Compila nome, email e messaggio e accetta l’informativa privacy.';
        }
        return;
      }
      if (form.elements._honey && form.elements._honey.value) {
        form.reset();
        return;
      }
      var payload = { _subject: 'Nuova richiesta dal sito — Contatto generale', nome: name, azienda: form.elements.azienda.value || 'Non indicata', settore: form.elements.settore.value || 'Non indicato', dipendenti: form.elements.dipendenti.value || 'Non indicati', telefono: form.elements.telefono.value || 'Non indicato', email: email, messaggio: message };
      contactSubmit.disabled = true;
      contactSubmit.textContent = 'Invio in corso…';
      try {
        var response = await fetch(requestEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) });
        var responseData = await response.json().catch(function () { return {}; });
        if (!response.ok || responseData.success === false) throw new Error(responseData.message || 'Invio non riuscito');
        status.className = 'form__status is-success';
        status.textContent = 'Richiesta inviata correttamente a Gennaro.';
        form.reset();
        contactSubmit.textContent = 'Richiesta inviata';
        showSuccessDialog('Grazie: la richiesta è stata inviata correttamente a Gennaro. Sarai ricontattato appena possibile.');
      } catch (error) {
        status.className = 'form__status is-error';
        status.textContent = 'Invio non completato. Riprova tra poco oppure contatta Gennaro tramite WhatsApp.';
        contactSubmit.disabled = false;
        contactSubmit.textContent = 'Riprova l’invio';
      }
    });
  }

  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
