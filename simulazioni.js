(function () {
  'use strict';

  var form = document.getElementById('riskSimulator');
  if (!form) return;

  var configs = {
    responsabilita: {
      label: 'Responsabilità civile',
      fields: [
        ['select','Attività prevalente','attivita',['Edilizia|4','Industria / produzione|4','Impiantistica|3','Commercio / servizi|2','Studio professionale|2']],
        ['number','Numero di dipendenti','dipendenti'],
        ['select','Utilizzi subappaltatori?','subappalti',['Mai|1','Occasionalmente|3','Regolarmente|4']],
        ['select','Lavori presso terzi o in cantiere?','presso_terzi',['No|1','A volte|3','Regolarmente|4']]
      ]
    },
    cantiere: {
      label: 'Opere e cantieri',
      fields: [
        ['number','Valore massimo di un’opera (€)','valore_opera'],
        ['number','Cantieri attivi medi','cantieri'],
        ['select','Tipologia di appalti','appalti',['Privati|2','Pubblici e privati|4','Prevalentemente pubblici|4']],
        ['select','Serve una garanzia postuma?','postuma',['Non so|3','No|1','Sì|4']]
      ]
    },
    property: {
      label: 'Azienda e continuità',
      fields: [
        ['number','Valore indicativo di fabbricati e beni (€)','beni'],
        ['select','Impianto antincendio','antincendio',['Completo e revisionato|1','Parziale|3','Non presente / non so|4']],
        ['select','Quanto può fermarsi l’attività?','fermo',['Oltre 30 giorni|1','Da 8 a 30 giorni|3','Massimo 7 giorni|4']],
        ['number','Sedi operative','sedi']
      ]
    },
    rc_auto: {
      label: 'RC Auto',
      fields: [
        ['select','Uso prevalente dell’auto','uso_auto',['Privato|1','Casa-lavoro|2','Anche professionale|3']],
        ['select','Chi guida abitualmente?','conducenti_auto',['Solo l’intestatario|1','Più persone della famiglia|2','Anche neopatentati o giovani|4']],
        ['select','Garanzie oltre la RC','extra_auto',['Già valutate|1','Solo alcune|2','Da valutare|3']],
        ['select','Sinistri negli ultimi 5 anni','sinistri_auto',['Nessuno|1','Uno|2','Due o più|4']]
      ]
    },
    rc_auto_furto_incendio: {
      label: 'RCA + Furto e Incendio',
      fields: [
        ['select','Uso prevalente dell’auto','uso_auto_combinata',['Privato|1','Casa-lavoro|2','Anche professionale|3']],
        ['select','Chi guida abitualmente?','conducenti_auto_combinata',['Solo l’intestatario|1','Più persone della famiglia|2','Anche neopatentati o giovani|4']],
        ['number','Valore commerciale indicativo dell’auto (€)','valore_auto_combinata'],
        ['select','Dove viene ricoverata di solito?','ricovero_auto_combinata',['Box privato|1','Area condominiale o cortile|2','Strada|4']],
        ['select','Protezione antifurto installata','antifurto_auto_combinata',['Satellitare o equivalente|1','Antifurto elettronico / meccanico|2','Nessuna / non so|4']],
        ['select','Sinistri negli ultimi 5 anni','sinistri_auto_combinata',['Nessuno|1','Uno|2','Due o più|4']]
      ]
    },
    rc_moto: {
      label: 'RC Moto',
      fields: [
        ['select','Utilizzo della moto','uso_moto',['Occasionale|1','Quotidiano|3','Anche per lavoro|4']],
        ['select','Chi guida abitualmente?','conducenti_moto',['Solo l’intestatario|1','Anche altre persone|2','Anche neopatentati o giovani|4']],
        ['select','Dove viene ricoverata di solito?','ricovero_moto',['Box privato|1','Cortile o posto auto|2','Strada|3']],
        ['select','Garanzie oltre la RC','extra_moto',['Già valutate|1','Solo alcune|2','Da valutare|3']]
      ]
    },
    mobilita: {
      label: 'Mobilità e trasporto',
      fields: [
        ['number','Numero di veicoli','veicoli'],
        ['select','Sono presenti mezzi d’opera?','mezzi_opera',['No|1','Sì, fino a 3|3','Sì, oltre 3|4']],
        ['select','Trasportate merci di terzi?','merci_terzi',['No|1','Occasionalmente|3','Regolarmente|4']],
        ['select','Area di circolazione','area',['Locale / regionale|1','Italia|2','Internazionale|4']]
      ]
    },
    cyber: {
      label: 'Cyber risk',
      fields: [
        ['number','Persone che usano i sistemi','utenti'],
        ['select','Gestite dati personali o pagamenti?','dati',['No|1','Dati personali|3','Dati sensibili o pagamenti|4']],
        ['select','Backup verificato','backup',['Giornaliero e testato|1','Presente ma non testato|3','Assente / non so|4']],
        ['select','Attacchi o blocchi negli ultimi 3 anni','incidenti',['No|1','Tentativi senza fermo|2','Sì, con fermo o perdita dati|4']]
      ]
    },
    casa: {
      label: 'Casa e immobili',
      fields: [
        ['number','Valore indicativo dell’immobile (€)','valore_casa'],
        ['select','Uso dell’immobile','uso',['Abitazione principale|1','Seconda casa|2','Locato / uso misto|3']],
        ['select','Impianto fotovoltaico','fotovoltaico',['No|1','Sì|3','In installazione|4']],
        ['select','Sinistri negli ultimi 5 anni','sinistri',['Nessuno|1','Uno|2','Due o più|4']]
      ]
    },
    persona: {
      label: 'Persona',
      fields: [
        ['number','Età','eta'],
        ['number','Reddito annuo indicativo (€)','reddito'],
        ['select','Persone economicamente dipendenti','familiari',['Nessuna|1','Una|2','Due o più|4']],
        ['select','Coperture già presenti','coperture',['Complete e recenti|1','Parziali|3','Nessuna / non so|4']]
      ]
    }
  };

  var step = 1;
  var answers = {};
  var result = {};
  var dynamicFields = document.getElementById('dynamicFields');
  var status = document.getElementById('simStatus');

  function fieldMarkup(field) {
    var type = field[0], label = field[1], name = field[2], options = field[3];
    if (type === 'select') {
      return '<div class="field"><label for="q-' + name + '">' + label + '</label><select id="q-' + name + '" name="' + name + '" required><option value="">Seleziona</option>' + options.map(function (option) {
        var parts = option.split('|'); return '<option value="' + parts[1] + '" data-label="' + parts[0] + '">' + parts[0] + '</option>';
      }).join('') + '</select></div>';
    }
    return '<div class="field"><label for="q-' + name + '">' + label + '</label><input id="q-' + name + '" name="' + name + '" type="number" min="0" inputmode="numeric" required></div>';
  }

  function selectedService() {
    var input = form.querySelector('input[name="service"]:checked');
    return input ? input.value : '';
  }

  function showStep(nextStep) {
    step = nextStep;
    document.querySelectorAll('.sim-step').forEach(function (section) { section.hidden = Number(section.getAttribute('data-step')) !== step; });
    document.querySelectorAll('.sim-progress span').forEach(function (bar, index) { bar.classList.toggle('is-active', index < step); });
    document.querySelector('.sim-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuestions() {
    var service = selectedService();
    if (!service) return false;
    dynamicFields.innerHTML = configs[service].fields.map(fieldMarkup).join('');
    return true;
  }

  function collectRisk() {
    var service = selectedService();
    var score = 0;
    var details = [];
    var valid = true;
    configs[service].fields.forEach(function (field) {
      var input = form.elements[field[2]];
      if (!input || !input.value || !input.checkValidity()) { valid = false; return; }
      var numeric = Number(input.value);
      if (field[0] === 'select') {
        score += numeric;
        details.push(field[1] + ': ' + input.options[input.selectedIndex].text);
      } else {
        score += numeric > 100000 ? 4 : numeric > 20 ? 3 : numeric > 3 ? 2 : 1;
        details.push(field[1] + ': ' + Number(input.value).toLocaleString('it-IT'));
      }
    });
    if (!valid) return false;
    var averageScore = score / configs[service].fields.length;
    var level = averageScore >= 3.25 ? 'Alta priorità' : averageScore >= 2.25 ? 'Priorità media' : 'Prima verifica consigliata';
    var copy = averageScore >= 3.25 ? 'I dati indicano più esposizioni da leggere insieme. È utile un confronto rapido sui contratti e sulle coperture in essere.' : averageScore >= 2.25 ? 'Ci sono elementi che meritano una verifica mirata, soprattutto su limiti, esclusioni e continuità.' : 'Il profilo appare lineare, ma una lettura delle garanzie esistenti può confermare che non ci siano vuoti.';
    answers = { service: configs[service].label, details: details };
    result = { level: level, copy: copy };
    document.getElementById('simResult').innerHTML = '<strong>' + level + '</strong><p>' + copy + '</p>';
    return true;
  }

  document.querySelectorAll('[data-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (step === 1) {
        if (!buildQuestions()) { alert('Seleziona il servizio da analizzare.'); return; }
        showStep(2);
      } else if (step === 2) {
        if (!collectRisk()) { alert('Compila tutti i campi per continuare.'); return; }
        showStep(3);
      }
    });
  });
  document.querySelectorAll('[data-back]').forEach(function (button) { button.addEventListener('click', function () { showStep(step - 1); }); });

  function buildMessage() {
    var name = form.elements.nome.value.trim();
    var phone = form.elements.telefono.value.trim();
    if (!name || !phone || !form.elements.privacy.checked || !form.checkValidity()) {
      status.className = 'form__status is-error';
      status.textContent = 'Completa correttamente nome, telefono ed eventuale email e accetta l’informativa privacy.';
      form.reportValidity();
      return '';
    }
    status.textContent = '';
    return ['Buongiorno Gennaro, vorrei richiedere un’analisi.', '', 'Servizio: ' + answers.service, 'Esito orientativo: ' + result.level].concat(answers.details, ['', 'Nome: ' + name, 'Azienda: ' + (form.elements.azienda.value || '-'), 'Telefono: ' + phone, 'Email: ' + (form.elements.email.value || '-'), 'Note: ' + (form.elements.note.value || '-')]).join('\n');
  }

  document.getElementById('sendRequest').addEventListener('click', async function () {
    var message = buildMessage();
    if (!message) return;
    if (form.elements._honey && form.elements._honey.value) return;
    var button = this;
    button.disabled = true;
    button.textContent = 'Invio in corso…';
    try {
      if (window.location.protocol === 'file:' && !window.__ALLOW_LOCAL_FORM_TESTS__) throw new Error('LOCAL_PREVIEW');
      var response = await fetch('https://formsubmit.co/ajax/viscardigennaro2001@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'Nuova simulazione dal sito — ' + answers.service,
          _template: 'table',
          servizio: answers.service,
          priorita_orientativa: result.level,
          nome: form.elements.nome.value.trim(),
          azienda: form.elements.azienda.value || 'Non indicata',
          telefono: form.elements.telefono.value.trim(),
          email: form.elements.email.value || 'Non indicata',
          note: form.elements.note.value || 'Nessuna',
          riepilogo: message
        })
      });
      var responseData = await response.json().catch(function () { return {}; });
      if (!response.ok || responseData.success === false || responseData.success === 'false') throw new Error(responseData.message || 'Invio non riuscito');
      status.className = 'form__status is-success';
      status.textContent = 'Richiesta inviata correttamente. Gennaro la riceverà direttamente via email.';
      button.textContent = 'Richiesta inviata';
      if (window.ViscardiForms) window.ViscardiForms.showSuccessDialog('La simulazione è stata inviata correttamente. Grazie per la richiesta: Gennaro ti ricontatterà appena possibile.');
    } catch (error) {
      status.className = 'form__status is-error';
      status.textContent = error.message === 'LOCAL_PREVIEW' ? 'L’invio email funziona dal sito pubblicato, non dall’anteprima locale. Apri il sito su Vercel e riprova.' : 'Invio non completato. Controlla la casella email di Gennaro per l’attivazione FormSubmit, quindi riprova.';
      button.disabled = false;
      button.textContent = 'Riprova l’invio';
    }
  });

  var preset = new URLSearchParams(window.location.search).get('service');
  var presetInput = preset && form.querySelector('input[name="service"][value="' + preset + '"]');
  if (presetInput) presetInput.checked = true;
})();
