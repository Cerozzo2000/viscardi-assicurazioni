(function () {
  'use strict';

  var $ = function (selector, context) { return (context || document).querySelector(selector); };
  var $$ = function (selector, context) { return Array.prototype.slice.call((context || document).querySelectorAll(selector)); };

  function closeSuccessDialog(dialog) {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    dialog.classList.remove('is-fallback');
    document.documentElement.classList.remove('has-success-dialog');
  }

  function showSuccessDialog(message) {
    var dialog = document.getElementById('requestSuccessDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'requestSuccessDialog';
      dialog.className = 'success-dialog';
      dialog.setAttribute('aria-labelledby', 'requestSuccessTitle');
      dialog.setAttribute('aria-modal', 'true');
      dialog.innerHTML = '<div class="success-dialog__card"><button class="success-dialog__x" type="button" aria-label="Chiudi">×</button><span class="success-dialog__icon" aria-hidden="true">✓</span><h2 id="requestSuccessTitle">Richiesta inviata</h2><p data-success-message></p><button class="success-dialog__close" type="button">Chiudi</button></div>';
      document.body.appendChild(dialog);
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog || event.target.closest('.success-dialog__close,.success-dialog__x')) closeSuccessDialog(dialog);
      });
      dialog.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { event.preventDefault(); closeSuccessDialog(dialog); }
      });
    }
    $('[data-success-message]', dialog).textContent = message || 'La richiesta è stata inviata correttamente. Gennaro ti ricontatterà appena possibile.';
    dialog.classList.add('is-fallback');
    dialog.setAttribute('open', '');
    document.documentElement.classList.add('has-success-dialog');
    var closeButton = $('.success-dialog__close', dialog);
    if (closeButton) closeButton.focus();
  }
  function validateAttachments(input, required) {
    if (!input) return '';
    input.setCustomValidity('');
    var files = Array.prototype.slice.call(input.files || []);
    var allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    var allowedExtension = /\.(pdf|jpe?g|png)$/i;
    var message = '';
    if (required && !files.length) message = 'Allega la carta di circolazione per continuare.';
    else if (files.length > 3) message = 'Puoi allegare al massimo 3 file.';
    else if (files.some(function (file) { return !allowedTypes.includes(file.type) || !allowedExtension.test(file.name); })) message = 'Sono ammessi soltanto file PDF, JPG e PNG.';
    else if (files.reduce(function (total, file) { return total + file.size; }, 0) > 3 * 1024 * 1024) message = 'Gli allegati possono pesare al massimo 3 MB complessivi.';
    input.setCustomValidity(message);
    return message;
  }
  function formatFileSize(bytes) {
    return bytes < 1024 * 1024 ? Math.max(1, Math.round(bytes / 1024)) + ' KB' : (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
  }

  function enhanceAttachmentInput(input) {
    var picker = input.closest('.file-picker');
    if (!picker) return;
    var count = $('[data-file-count]', picker);
    var list = $('[data-file-list]', picker);
    var selectedFiles = [];

    function syncInput() {
      if (typeof DataTransfer !== 'undefined') {
        var transfer = new DataTransfer();
        selectedFiles.forEach(function (file) { transfer.items.add(file); });
        input.files = transfer.files;
      }
    }

    function render(limitReached) {
      count.textContent = selectedFiles.length ? selectedFiles.length + (selectedFiles.length === 1 ? ' file allegato' : ' file allegati') + (limitReached ? ' — limite di 3 raggiunto' : '') : 'Nessun file allegato';
      list.replaceChildren();
      selectedFiles.forEach(function (file, index) {
        var item = document.createElement('li');
        item.className = 'file-picker__item';
        var name = document.createElement('span');
        name.className = 'file-picker__name';
        name.textContent = file.name + ' · ' + formatFileSize(file.size);
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'file-picker__remove';
        remove.dataset.removeFile = String(index);
        remove.setAttribute('aria-label', 'Rimuovi ' + file.name);
        remove.textContent = 'Rimuovi';
        item.append(name, remove);
        list.appendChild(item);
      });
    }

    input.addEventListener('change', function () {
      var incoming = Array.prototype.slice.call(input.files || []);
      var limitReached = false;
      incoming.forEach(function (file) {
        var duplicate = selectedFiles.some(function (saved) { return saved.name === file.name && saved.size === file.size && saved.lastModified === file.lastModified; });
        if (duplicate) return;
        if (selectedFiles.length >= 3) { limitReached = true; return; }
        selectedFiles.push(file);
      });
      syncInput();
      validateAttachments(input, input.required);
      render(limitReached);
    });

    list.addEventListener('click', function (event) {
      var button = event.target.closest('[data-remove-file]');
      if (!button) return;
      selectedFiles.splice(Number(button.dataset.removeFile), 1);
      syncInput();
      validateAttachments(input, input.required);
      render(false);
    });

    if (input.form) input.form.addEventListener('reset', function () {
      setTimeout(function () { selectedFiles = []; syncInput(); render(false); }, 0);
    });
    render(false);
  }
  window.ViscardiForms = { showSuccessDialog: showSuccessDialog, validateAttachments: validateAttachments };
  $$('.file-picker__input').forEach(enhanceAttachmentInput);

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
    var serviceSelect = $('#fServizio', form);
    var attachmentInput = $('#fAttachments', form);
    var attachmentLabel = $('#fAttachmentsLabel', form);
    var attachmentHint = $('#fAttachmentsHint', form);
    var companyFields = $$('[data-company-field]', form);
    var servicesByProfile = {
      Azienda: ['Responsabilità civile', 'Opere e cantieri', 'Fabbricati e macchinari', 'Interruzione di attività', 'Amministratori e dirigenti', 'Cyber risk', 'Veicoli aziendali', 'Macchine in cantiere', 'Merci in viaggio', 'Responsabilità del vettore'],
      Privato: ['RC Auto', 'RCA + Furto e Incendio', 'RC Moto', 'Fabbricato e contenuto', 'Responsabilità del proprietario', 'Impianti fotovoltaici', 'Capacità di lavorare', 'Temporanea caso morte', 'Cure e assistenza', 'Progetto di lungo periodo']
    };
    var vehicleContactServices = ['RC Auto', 'RCA + Furto e Incendio', 'RC Moto', 'Veicoli aziendali', 'Macchine in cantiere'];
    var contactAttachmentRequired = false;

    function updateContactAttachment() {
      contactAttachmentRequired = vehicleContactServices.includes(serviceSelect.value);
      attachmentInput.required = contactAttachmentRequired;
      attachmentLabel.textContent = contactAttachmentRequired ? 'Carta di circolazione' : 'Allegati (facoltativi)';
      attachmentHint.textContent = (contactAttachmentRequired ? 'Obbligatoria per questo servizio. ' : '') + 'PDF, JPG o PNG. Massimo 3 file e 3 MB complessivi.';
      validateAttachments(attachmentInput, contactAttachmentRequired);
    }

    function renderContactServices(profile) {
      serviceSelect.replaceChildren();
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Seleziona il servizio';
      serviceSelect.appendChild(placeholder);
      servicesByProfile[profile].forEach(function (service) {
        var option = document.createElement('option');
        option.value = service;
        option.textContent = service;
        serviceSelect.appendChild(option);
      });
      updateContactAttachment();
    }

    function updateContactProfile() {
      var profile = form.elements.profilo.value || 'Azienda';
      var isCompany = profile === 'Azienda';
      companyFields.forEach(function (field) {
        field.hidden = !isCompany;
        $$('input,select,textarea', field).forEach(function (control) { control.disabled = !isCompany; });
      });
      form.elements.azienda.required = isCompany;
      renderContactServices(profile);
    }

    $$('input[name="profilo"]', form).forEach(function (radio) { radio.addEventListener('change', updateContactProfile); });
    serviceSelect.addEventListener('change', updateContactAttachment);
    form.addEventListener('reset', function () { setTimeout(updateContactProfile, 0); });
    updateContactProfile();

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var name = form.elements.nome.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.messaggio.value.trim();
      var privacy = form.elements.privacy.checked;
      var attachmentError = validateAttachments(form.elements.allegati, contactAttachmentRequired);
      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message || !privacy || attachmentError || !form.checkValidity()) {
        if (status) {
          status.className = 'form__status is-error';
          status.textContent = attachmentError || 'Completa i campi obbligatori, seleziona il servizio e accetta l’informativa privacy.';
        }
        form.reportValidity();
        return;
      }
      if (form.elements._honey && form.elements._honey.value) {
        form.reset();
        return;
      }
      var payload = new FormData(form);
      payload.delete('privacy');
      payload.set('_subject', 'Nuova richiesta ' + form.elements.profilo.value + ' — ' + form.elements.servizio.value);
      payload.set('_attachment_required', contactAttachmentRequired ? 'true' : 'false');
      contactSubmit.disabled = true;
      contactSubmit.textContent = 'Invio in corso…';
      try {
        var response = await fetch(requestEndpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: payload });
        var responseData = await response.json().catch(function () { return {}; });
        if (!response.ok || responseData.success === false) throw new Error(responseData.message || 'Invio non riuscito');
        status.className = 'form__status is-success';
        status.textContent = 'Richiesta inviata correttamente a Gennaro.';
        form.reset();
        contactSubmit.textContent = 'Richiesta inviata';
        showSuccessDialog('Grazie: la richiesta è stata inviata correttamente a Gennaro. Sarai ricontattato appena possibile.');
      } catch (error) {
        status.className = 'form__status is-error';
        status.textContent = error.message && error.message !== 'Failed to fetch' ? error.message : 'Invio non completato. Riprova tra poco oppure contatta Gennaro tramite WhatsApp.';
        contactSubmit.disabled = false;
        contactSubmit.textContent = 'Riprova l’invio';
      }
    });
  }

  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
