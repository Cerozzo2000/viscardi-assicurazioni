(function () {
  'use strict';

  var imageBase = 'assets/images/';
  function field(name, label, type, options, hint) {
    return { name: name, label: label, type: type || 'text', options: options || [], hint: hint || '' };
  }

  var services = {
    'responsabilita': {
      area: 'Impresa', title: 'Responsabilità civile', image: 'responsabilita.webp',
      lead: 'Protegge l’attività quando un danno a persone o cose coinvolge clienti, dipendenti, fornitori o altri terzi.',
      tags: ['RCT', 'RCO', 'Danni a terzi'],
      fields: [field('attivita', 'Qual è l’attività svolta?'), field('dipendenti', 'Quante persone lavorano nell’attività?', 'number'), field('presso_terzi', 'Lavorate presso clienti o cantieri?', 'select', ['Mai', 'Occasionalmente', 'Spesso']), field('subappalti', 'Affidate lavori a terzi?', 'select', ['No', 'Sì, in parte', 'Sì, frequentemente'])]
    },
    'cantiere': {
      area: 'Impresa', title: 'Opere e cantieri', image: 'edilizia.webp',
      lead: 'Una lettura coordinata di opera, responsabilità, mezzi e obblighi contrattuali, prima che il cantiere inizi.',
      tags: ['CAR', 'Postuma decennale', 'Danni all’opera'],
      fields: [field('opera', 'Che tipo di opera devi realizzare?'), field('valore', 'Qual è il valore indicativo dei lavori?', 'number', [], 'Euro'), field('durata', 'Qual è la durata prevista?', 'text', [], 'Mesi o data di fine'), field('postuma', 'È richiesta una postuma decennale?', 'select', ['No', 'Sì', 'Non lo so'])]
    },
    'property': {
      area: 'Impresa', title: 'Fabbricati e macchinari', image: 'industria.webp',
      lead: 'Fabbricati, impianti e attrezzature vanno stimati per il loro reale costo di ripristino, non solo per il valore contabile.',
      tags: ['Incendio', 'Eventi naturali', 'Guasti'],
      fields: [field('uso', 'Come viene utilizzato l’immobile?'), field('valore_immobile', 'Valore di ricostruzione indicativo', 'number', [], 'Euro'), field('valore_beni', 'Valore di macchinari e contenuto', 'number', [], 'Euro'), field('prevenzione', 'Sono presenti sistemi antincendio?', 'select', ['Sì', 'No', 'In parte'])]
    },
    'interruzione': {
      area: 'Impresa', title: 'Interruzione di attività', image: 'continuita.webp',
      lead: 'Stima cosa accadrebbe a ricavi, costi fissi e stipendi se un danno fermasse temporaneamente l’attività.',
      tags: ['Margine di contribuzione', 'Costi fissi', 'Fermo attività'],
      fields: [field('fatturato', 'Fatturato annuo indicativo', 'number', [], 'Euro'), field('fermo', 'Per quanti giorni un fermo sarebbe critico?', 'number'), field('costi', 'Costi fissi mensili indicativi', 'number', [], 'Euro'), field('dipendenze', 'Esistono fornitori o impianti indispensabili?', 'select', ['No', 'Sì, uno', 'Sì, diversi'])]
    },
    'do': {
      area: 'Impresa', title: 'Amministratori e dirigenti', image: 'amministratori.webp',
      lead: 'Tutela il patrimonio personale di chi prende decisioni gestionali quando viene contestato un errore o un’omissione.',
      tags: ['D&O', 'Spese legali', 'Patrimonio personale'],
      fields: [field('forma', 'Forma societaria'), field('amministratori', 'Numero di amministratori e dirigenti', 'number'), field('fatturato', 'Fatturato annuo indicativo', 'number', [], 'Euro'), field('operazioni', 'Sono previste operazioni straordinarie?', 'select', ['No', 'Sì', 'Da valutare'])]
    },
    'cyber': {
      area: 'Impresa', title: 'Cyber risk', image: 'cyber.webp',
      lead: 'Dati, sistemi e continuità operativa: misura l’impatto concreto di un blocco informatico o di una violazione.',
      tags: ['Dati', 'Interruzione digitale', 'Assistenza'],
      fields: [field('utenti', 'Quante persone usano i sistemi aziendali?', 'number'), field('dati', 'Trattate dati personali o sensibili?', 'select', ['No', 'Sì, personali', 'Sì, anche sensibili']), field('backup', 'Come vengono gestiti i backup?', 'select', ['Automatici e separati', 'Automatici', 'Manuali', 'Non lo so']), field('incidenti', 'Avete già subito incidenti informatici?', 'select', ['No', 'Sì', 'Non lo so'])]
    },
    'rc-auto': {
      area: 'Mobilità', title: 'RC Auto', image: 'rc-auto.png',
      lead: 'Raccogli i dati essenziali del veicolo e dell’utilizzo reale per impostare una richiesta di preventivo coerente.',
      tags: ['Responsabilità civile', 'Garanzie accessorie', 'Assistenza'],
      fields: [field('veicolo', 'Marca, modello e anno del veicolo'), field('targa', 'Targa'), field('uso', 'Utilizzo prevalente', 'select', ['Privato', 'Casa-lavoro', 'Professionale', 'Aziendale']), field('guida', 'Chi guida il veicolo?', 'select', ['Solo il proprietario', 'Conducenti esperti', 'Anche conducenti giovani', 'Più persone']), field('sinistri', 'Sinistri negli ultimi 5 anni', 'select', ['Nessuno', 'Uno', 'Più di uno']), field('garanzie', 'Garanzie da valutare', 'select', ['Solo RC', 'Furto e incendio', 'Eventi naturali', 'Kasko / collisione', 'Da consigliare'])]
    },
    'rc-moto': {
      area: 'Mobilità', title: 'RC Moto', image: 'rc-moto.png',
      lead: 'Uso, stagionalità e ricovero del mezzo aiutano a costruire una copertura moto realmente adatta alle tue abitudini.',
      tags: ['Responsabilità civile', 'Sospensione', 'Furto e incendio'],
      fields: [field('moto', 'Marca, modello, anno e cilindrata'), field('targa', 'Targa'), field('uso', 'Come usi la moto?', 'select', ['Tutto l’anno', 'Stagionale', 'Tempo libero', 'Casa-lavoro']), field('ricovero', 'Dove viene ricoverata?', 'select', ['Box privato', 'Area condominiale', 'Strada', 'Altro']), field('guida', 'Chi la guida?', 'select', ['Solo il proprietario', 'Più conducenti']), field('garanzie', 'Garanzie da valutare', 'select', ['Solo RC', 'Furto e incendio', 'Assistenza', 'Da consigliare'])]
    },
    'flotte': {
      area: 'Mobilità', title: 'Veicoli aziendali', image: 'flotte.webp',
      lead: 'Una visione unica di mezzi, conducenti e impieghi consente di evitare vuoti e duplicazioni nella flotta.',
      tags: ['Flotte', 'Veicoli commerciali', 'Gestione sinistri'],
      fields: [field('mezzi', 'Numero di veicoli', 'number'), field('tipi', 'Quali tipi di veicolo comprende la flotta?'), field('uso', 'Utilizzo prevalente'), field('conducenti', 'I conducenti sono assegnati ai singoli mezzi?', 'select', ['Sì', 'No', 'In parte'])]
    },
    'mezzi-opera': {
      area: 'Mobilità', title: 'Macchine in cantiere', image: 'movimento-terra.webp',
      lead: 'La macchina può causare o subire danni anche mentre lavora da ferma: descriviamo mezzi e condizioni operative.',
      tags: ['Mezzi d’opera', 'Danni durante il lavoro', 'Furto'],
      fields: [field('mezzi', 'Quanti mezzi vuoi valutare?', 'number'), field('tipologia', 'Tipologia dei mezzi'), field('valore', 'Valore complessivo indicativo', 'number', [], 'Euro'), field('cantieri', 'Dove operano prevalentemente?')]
    },
    'merci': {
      area: 'Mobilità', title: 'Merci in viaggio', image: 'logistica.webp',
      lead: 'Tipo di merce, valore massimo e percorso determinano quanto è esposta durante trasporto, soste e movimentazioni.',
      tags: ['Trasporto', 'Furto', 'Danneggiamento'],
      fields: [field('merce', 'Quali merci vengono trasportate?'), field('valore', 'Valore massimo per singolo viaggio', 'number', [], 'Euro'), field('tratte', 'Tratte prevalenti'), field('modalita', 'Modalità di trasporto', 'select', ['Conto proprio', 'Vettore terzo', 'Entrambe'])]
    },
    'rc-vettore': {
      area: 'Mobilità', title: 'Responsabilità del vettore', image: 'responsabilita-vettore-v2.png',
      lead: 'Per chi trasporta merci di terzi, peso, valore e tratte aiutano a leggere correttamente limiti e responsabilità.',
      tags: ['Merci di terzi', 'Limiti di risarcimento', 'Trasporto'],
      fields: [field('mezzi', 'Numero di mezzi impiegati', 'number'), field('merci', 'Tipologia di merci trasportate'), field('tratte', 'Tratte abituali'), field('valore', 'Valore medio per viaggio', 'number', [], 'Euro')]
    },
    'casa': {
      area: 'Casa', title: 'Fabbricato e contenuto', image: 'casa.webp',
      lead: 'Casa, contenuto e responsabilità familiare in un quadro coerente con il valore reale e il modo in cui vivi l’immobile.',
      tags: ['Fabbricato', 'Contenuto', 'Assistenza'],
      fields: [field('immobile', 'Tipologia di immobile', 'select', ['Appartamento', 'Villa', 'Casa indipendente', 'Altro']), field('uso', 'Utilizzo', 'select', ['Abitazione principale', 'Seconda casa', 'Locato']), field('valore', 'Valore indicativo di ricostruzione', 'number', [], 'Euro'), field('contenuto', 'Valore indicativo del contenuto', 'number', [], 'Euro')]
    },
    'rc-proprietario': {
      area: 'Casa', title: 'Responsabilità del proprietario', image: 'responsabilita-proprietario-v2.png',
      lead: 'Valuta i danni che l’immobile o la sua conduzione potrebbero causare a vicini, ospiti e altri terzi.',
      tags: ['Proprietà', 'Conduzione', 'Danni a terzi'],
      fields: [field('immobile', 'Tipologia di immobile'), field('locazione', 'L’immobile è locato?', 'select', ['No', 'Sì', 'Parzialmente']), field('parti', 'Sono presenti parti comuni?', 'select', ['Sì', 'No']), field('sinistri', 'Ci sono stati danni a terzi negli ultimi 5 anni?', 'select', ['No', 'Sì'])]
    },
    'fotovoltaico': {
      area: 'Casa', title: 'Impianti fotovoltaici', image: 'impiantisti.webp',
      lead: 'Proteggi impianto, componenti e mancata produzione con dati coerenti su potenza, valore e installazione.',
      tags: ['Guasti', 'Eventi atmosferici', 'Mancata produzione'],
      fields: [field('potenza', 'Potenza dell’impianto', 'text', [], 'kW'), field('anno', 'Anno di installazione', 'number'), field('valore', 'Valore indicativo dell’impianto', 'number', [], 'Euro'), field('produzione', 'Vuoi valutare la mancata produzione?', 'select', ['Sì', 'No', 'Non lo so'])]
    },
    'infortuni': {
      area: 'Persona', title: 'Capacità di lavorare', image: 'salute.webp',
      lead: 'Misura l’effetto economico di un infortunio sulla tua attività, sul reddito e sugli impegni familiari.',
      tags: ['Infortuni', 'Invalidità', 'Diaria'],
      fields: [field('professione', 'Professione e mansioni'), field('eta', 'Età', 'number'), field('reddito', 'Reddito annuo indicativo', 'number', [], 'Euro'), field('durata', 'Per quanto tempo potresti sostenere le spese senza lavorare?', 'select', ['Meno di 1 mese', '1–3 mesi', '3–6 mesi', 'Oltre 6 mesi'])]
    },
    'tcm': {
      area: 'Persona', title: 'Temporanea caso morte', image: 'vita-previdenza.webp',
      lead: 'Definisci il capitale necessario a proteggere familiari, debiti o continuità aziendale per un periodo stabilito.',
      tags: ['Protezione', 'Capitale', 'Famiglia'],
      fields: [field('eta', 'Età', 'number'), field('capitale', 'Capitale da valutare', 'number', [], 'Euro'), field('durata', 'Durata desiderata', 'text', [], 'Anni'), field('obiettivo', 'Obiettivo principale', 'select', ['Protezione familiare', 'Mutuo o finanziamento', 'Continuità aziendale', 'Da definire'])]
    },
    'salute': {
      area: 'Persona', title: 'Cure e assistenza', image: 'cure-assistenza-v2.png',
      lead: 'Tempi, strutture e ampiezza delle prestazioni: raccogliamo le preferenze per orientare la soluzione sanitaria.',
      tags: ['Ricovero', 'Diagnostica', 'Assistenza'],
      fields: [field('eta', 'Età della persona più adulta', 'number'), field('nucleo', 'Quante persone vuoi includere?', 'number'), field('livello', 'Cosa vuoi privilegiare?', 'select', ['Ricoveri e interventi', 'Visite e diagnostica', 'Copertura completa', 'Da consigliare']), field('esistente', 'Hai già una copertura sanitaria?', 'select', ['No', 'Sì, individuale', 'Sì, aziendale'])]
    },
    'previdenza': {
      area: 'Persona', title: 'Progetto di lungo periodo', image: 'progetto-lungo-periodo-v2.png',
      lead: 'Obiettivi, orizzonte e capacità di contribuzione aiutano a trasformare il futuro in un progetto concreto.',
      tags: ['Previdenza', 'Obiettivi', 'Orizzonte temporale'],
      fields: [field('eta', 'Età', 'number'), field('obiettivo', 'Qual è l’obiettivo principale?'), field('orizzonte', 'Orizzonte temporale', 'select', ['Meno di 10 anni', '10–20 anni', 'Oltre 20 anni']), field('contributo', 'Contributo mensile indicativo', 'number', [], 'Euro')]
    }
  };

  var params = new URLSearchParams(window.location.search);
  var serviceId = params.get('service');
  var service = services[serviceId] || services['rc-auto'];
  var form = document.getElementById('coverageForm');
  var fieldsBox = document.getElementById('coverageFields');
  var result = document.getElementById('coverageResult');
  var status = document.getElementById('coverageStatus');
  var submitButton = document.getElementById('coverageSubmit');
  var deliveryEndpoint = 'https://formsubmit.co/ajax/viscardigennaro2001@gmail.com';

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
    });
  }

  function renderField(item) {
    var id = 'f-' + item.name;
    var control;
    if (item.type === 'select') {
      control = '<select id="' + id + '" name="' + item.name + '" required><option value="">Seleziona</option>' + item.options.map(function (option) { return '<option>' + escapeHtml(option) + '</option>'; }).join('') + '</select>';
    } else {
      control = '<input id="' + id + '" name="' + item.name + '" type="' + item.type + '"' + (item.type === 'number' ? ' min="0" inputmode="numeric"' : '') + ' required>';
    }
    return '<div class="field"><label for="' + id + '">' + escapeHtml(item.label) + '</label>' + control + (item.hint ? '<small>' + escapeHtml(item.hint) + '</small>' : '') + '</div>';
  }

  document.title = service.title + ' | Viscardi Assicurazioni';
  document.getElementById('coverageArea').textContent = service.area;
  document.getElementById('coverageTitle').textContent = service.title;
  document.getElementById('coverageLead').textContent = service.lead;
  document.getElementById('formTitle').textContent = 'Dati per ' + service.title;
  document.getElementById('coverageTags').innerHTML = service.tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('');
  var image = document.getElementById('coverageImage');
  image.src = imageBase + service.image;
  image.alt = 'Immagine dedicata al servizio ' + service.title;
  fieldsBox.innerHTML = service.fields.map(renderField).join('');

  function labelFor(name) {
    var element = form.elements[name];
    var label = element && document.querySelector('label[for="' + element.id + '"]');
    return label ? label.textContent.trim() : name;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      status.className = 'form__status is-error';
      status.textContent = 'Completa tutti i campi richiesti e accetta l’informativa privacy.';
      form.reportValidity();
      return;
    }
    var data = new FormData(form);
    if (data.get('_honey')) {
      form.hidden = true;
      result.hidden = false;
      return;
    }
    var lines = ['Richiesta dal sito — ' + service.title, 'Area: ' + service.area, ''];
    service.fields.forEach(function (item) { lines.push(labelFor(item.name) + ': ' + data.get(item.name)); });
    lines.push('', 'Nome e cognome: ' + data.get('nome'), 'Telefono: ' + data.get('telefono'), 'Email: ' + (data.get('email') || '-'), 'Comune: ' + (data.get('comune') || '-'), 'Note: ' + (data.get('note') || '-'));
    var payload = {
      _subject: 'Nuova richiesta dal sito — ' + service.title,
      _template: 'table',
      servizio: service.title,
      area: service.area,
      nome: data.get('nome'),
      telefono: data.get('telefono'),
      email: data.get('email') || 'Non indicata',
      comune: data.get('comune') || 'Non indicato',
      note: data.get('note') || 'Nessuna',
      riepilogo: lines.join('\n')
    };
    service.fields.forEach(function (item) { payload[item.label] = data.get(item.name); });

    submitButton.disabled = true;
    submitButton.textContent = 'Invio in corso…';
    status.className = 'form__status';
    status.textContent = '';
    try {
      if (window.location.protocol === 'file:' && !window.__ALLOW_LOCAL_FORM_TESTS__) throw new Error('LOCAL_PREVIEW');
      var response = await fetch(deliveryEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      var responseData = await response.json().catch(function () { return {}; });
      if (!response.ok || responseData.success === false || responseData.success === 'false') throw new Error(responseData.message || 'Invio non riuscito');
      document.getElementById('coverageSummary').textContent = 'La richiesta per “' + service.title + '” è stata consegnata all’indirizzo lavorativo di Gennaro. Sarai ricontattato ai recapiti indicati.';
      form.hidden = true;
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (window.ViscardiForms) window.ViscardiForms.showSuccessDialog('La richiesta per “' + service.title + '” è stata inviata correttamente. Grazie: Gennaro ti ricontatterà appena possibile.');
    } catch (error) {
      status.className = 'form__status is-error';
      status.textContent = error.message === 'LOCAL_PREVIEW' ? 'L’invio email funziona dal sito pubblicato, non dall’anteprima locale. Apri il sito su Vercel e riprova.' : 'Invio non completato. Controlla la casella email di Gennaro per l’attivazione FormSubmit, quindi riprova.';
      submitButton.disabled = false;
      submitButton.textContent = 'Riprova l’invio';
    }
  });
})();
