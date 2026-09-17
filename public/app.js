const TICKETS = {
  standard3: { label: 'Standard · 3 jours', price: 450, days: 3 },
  standard2: { label: 'Standard · 2 jours', price: 400, days: 2 },
  standard1: { label: 'Standard · 1 jour', price: 250, days: 1 },
  reduced: { label: 'Étudiant, demandeur d’emploi, retraité', price: 130, days: 3 },
  du: { label: 'Cursus DU', price: 82, days: 3 },
  speaker: { label: 'Invité communicant', price: 0, days: 3 },
  vip: { label: 'Invité VIP', price: 0, days: 3 },
  guest: { label: 'Invité hors communicant et staffs', price: 0, days: 3 },
  committee: { label: 'Staff comité', price: 0, days: 3 },
  studentStaff: { label: 'Staff étudiant', price: 0, days: 3 }
};
function registrationTotal(ticket, gala) {
  if (!Object.hasOwn(TICKETS, ticket) || !['yes', 'no'].includes(gala)) throw new Error('Sélection incomplète.');
  return TICKETS[ticket].price + (gala === 'yes' ? 75 : 0);
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
if (typeof module !== 'undefined') module.exports = { registrationTotal, TICKETS, escapeHTML };

if (typeof document !== 'undefined') {
  const form = document.querySelector('#registration-form');
  const panels = [...document.querySelectorAll('.form-step')];
  const next = document.querySelector('#next');
  const error = document.querySelector('#form-error');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const money = value => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value);
  const field = name => form.elements.namedItem(name);
  const value = name => field(name).value.trim();
  const selected = name => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
  let step = 0;
  let moving = false;
  let billingOrganizationEdited = false;

  // Native country names keep the selector small and translated without a dependency.
  const countryCodes = 'AF AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW'.split(' ');
  const regionNames = new Intl.DisplayNames(['fr'], { type: 'region' });
  const countries = countryCodes.map(code => regionNames.of(code)).sort((a, b) => a.localeCompare(b, 'fr'));
  for (const country of countries) field('country').add(new Option(country, country, country === 'France', country === 'France'));

  function area(id, visible, required = false) {
    const element = document.getElementById(id);
    element.hidden = !visible;
    element.querySelectorAll('input, select, textarea').forEach(input => {
      input.disabled = !visible;
      input.required = visible && required;
      if (!visible) {
        input.removeAttribute('aria-invalid');
        input.setCustomValidity('');
      }
    });
  }

  function syncOptions() {
    const ticket = value('ticket');
    area('proof-area', ticket === 'reduced', true);
    area('code-area', ticket === 'du', true);
    const days = TICKETS[ticket]?.days;
    area('attendance-area', days === 1 || days === 2);
    document.querySelector('#attendance-hint').textContent = `Sélectionnez ${days === 1 ? 'une journée' : 'deux journées'} parmi les dates suivantes.`;
    const attendance = selected('attendance');
    form.querySelectorAll('[name="lunch"]').forEach(input => {
      input.disabled = days < 3 && !attendance.includes(input.value);
      if (input.disabled) input.checked = false;
    });
    area('allergy-area', value('diet') !== 'Pas de restrictions');
    area('menu-area', value('gala') === 'yes', true);
    area('billing-org-area', value('billingProfile') === 'organization', true);
    if (step === 1) {
      const caption = document.querySelector('#step-caption');
      caption.hidden = !ticket;
      caption.textContent = ticket ? `Total : ${money(registrationTotal(ticket, value('gala') || 'no'))}` : '';
    }
  }

  function summary() {
    const ticket = TICKETS[value('ticket')];
    const gala = value('gala') === 'yes';
    const attendance = ticket.days === 3 ? '25, 26 et 27 mars' : selected('attendance').join(', ');
    const meal = gala ? `<p><strong>Menu de gala</strong><br>${['starter', 'mainCourse', 'dessert', 'drink'].map(name => escapeHTML(value(name))).join('<br>')}</p>` : '';
    document.querySelector('#review').innerHTML = `
      <div class="review-heading"><span>Votre inscription</span><button type="button" class="text-button" data-edit="0">Modifier ↗</button></div>
      <p class="review-person">${escapeHTML(value('firstName'))} ${escapeHTML(value('lastName'))}</p>
      <p class="review-contact">${escapeHTML(value('organization'))}<br>${escapeHTML(value('email'))}${value('ccEmail') ? `<br>Copie : ${escapeHTML(value('ccEmail'))}` : ''}</p>
      <div class="review-lines"><div class="review-line"><span>${ticket.label}</span><strong>${money(ticket.price)}</strong></div>${gala ? `<div class="review-line"><span>Dîner de gala · 26 mars</span><strong>${money(75)}</strong></div>` : ''}</div>
      <details><summary>Voir les détails de mon séjour</summary><p>Présence : ${attendance}<br>Déjeuners : ${selected('lunch').join(', ') || 'Aucun'}<br>Préférences : ${escapeHTML(value('diet'))}${value('diet') !== 'Pas de restrictions' && value('allergy') ? ` · ${escapeHTML(value('allergy'))}` : ''}<br>Dîner de gala : ${gala ? 'Oui' : 'Non'}</p>${meal}${value('ticket') === 'reduced' ? `<p>Justificatif : ${escapeHTML(field('proof').files[0]?.name || '')}</p>` : ''}${value('ticket') === 'du' ? `<p>Code DU : ${escapeHTML(value('duCode'))}</p>` : ''}<p>Actualités par e-mail : ${field('newsletter').checked ? 'Oui' : 'Non'}<br>Information sur les photos et vidéos : prise en compte</p></details>
      <div class="review-line review-total"><span>Montant total</span><strong>${money(registrationTotal(value('ticket'), value('gala')))}</strong></div>`;
  }

  function clearError() {
    error.hidden = true;
    error.textContent = '';
  }
  function showError(message, input) {
    error.textContent = message;
    error.hidden = false;
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.closest('details')?.setAttribute('open', '');
      input.focus();
    }
  }
  function validate() {
    clearError();
    const inputs = [...panels[step].querySelectorAll('input, select, textarea')].filter(input => !input.matches(':disabled'));
    for (const input of inputs) {
      input.removeAttribute('aria-invalid');
      input.setCustomValidity('');
      if (input.required && ['text', 'textarea'].includes(input.type) && !input.value.trim()) input.setCustomValidity('Renseignez ce champ.');
      if (!input.checkValidity()) {
        const label = input.labels?.[0]?.textContent.replace(/\*/g, '').trim();
        let message = input.validity.typeMismatch ? 'Saisissez une adresse e-mail valide.' : `Complétez le champ « ${label || 'obligatoire'} » pour continuer.`;
        if (input.type === 'checkbox') message = input.name === 'terms' ? 'Acceptez les conditions pour confirmer votre inscription.' : 'Confirmez avoir pris connaissance des informations sur les photos et vidéos.';
        if (input.type === 'radio') message = 'Indiquez si vous souhaitez participer au dîner de gala.';
        if (input.type === 'file') message = 'Ajoutez un justificatif pour bénéficier du tarif réduit.';
        showError(message, input);
        return false;
      }
    }
    if (step === 1) {
      const days = TICKETS[value('ticket')].days;
      if (days < 3 && selected('attendance').length !== days) {
        showError(`Votre formule comprend ${days === 1 ? 'une journée' : 'deux journées'}. Sélectionnez exactement ${days === 1 ? 'un jour' : 'deux jours'} de participation.`, field('attendance')[0]);
        return false;
      }
      if (value('ticket') === 'reduced') {
        const file = field('proof').files[0];
        if (file.size > 5 * 1024 * 1024 || !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
          showError('Choisissez un fichier PDF, JPG ou PNG de 5 Mo maximum.', field('proof'));
          return false;
        }
      }
    }
    return true;
  }

  async function goTo(target) {
    if (moving || target === step) return;
    moving = true;
    next.disabled = true;
    const oldStep = step;
    panels[oldStep].classList.add('leaving');
    if (!reducedMotion.matches) await new Promise(resolve => setTimeout(resolve, 180));
    step = target;
    clearError();
    panels.forEach((panel, index) => {
      panel.hidden = index !== step;
      panel.disabled = index !== step;
      panel.classList.remove('leaving');
      panel.classList.toggle('reverse', target < oldStep);
    });
    if (step === 3) {
      if (!billingOrganizationEdited) field('billingOrg').value = value('organization');
      summary();
    }
    document.querySelectorAll('.stepper li').forEach((item, index) => {
      item.classList.toggle('active', index === step);
      item.classList.toggle('done', index < step);
      const button = item.querySelector('button');
      button.disabled = index > step;
      if (index === step) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
      item.querySelector('.step-number').textContent = index < step ? '✓' : index + 1;
    });
    document.querySelector('#back').hidden = step === 0;
    document.querySelector('#step-caption').hidden = step !== 0;
    document.querySelector('#step-caption').textContent = 'À votre rythme, en 4 étapes.';
    syncOptions();
    next.querySelector('span').textContent = step === 3 ? 'Confirmer mon inscription' : 'Continuer';
    next.disabled = false;
    moving = false;
    panels[step].querySelector('h2').focus({ preventScroll: true });
    const mainTop = document.querySelector('#main').getBoundingClientRect().top;
    if (mainTop < -10 || window.innerWidth <= 900) document.querySelector('#main').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  function complete() {
    const fullName = `${value('firstName')} ${value('lastName')}`;
    const ticket = TICKETS[value('ticket')];
    const total = registrationTotal(value('ticket'), value('gala'));
    document.querySelector('#success-name').textContent = `${value('firstName')}.`;
    document.querySelector('#ticket-name').textContent = fullName;
    document.querySelector('#ticket-organization').textContent = value('organization');
    document.querySelector('#ticket-formula').textContent = ticket.label + (value('gala') === 'yes' ? ' + dîner de gala' : '');
    document.querySelector('#ticket-total').textContent = money(total);
    const dates = document.querySelector('.ticket-details strong');
    dates.textContent = ticket.days === 3 ? '25—27 mars' : selected('attendance').map(day => day.replace(' mars', '')).join(' & ') + ' mars';
    const payment = document.querySelector('#payment-result');
    if (total === 0) payment.innerHTML = '<strong>Votre invitation est enregistrée.</strong><br>Aucun règlement n’est nécessaire pour cette formule.';
    else if (value('payment') === 'transfer') payment.innerHTML = `<strong>Prochaine étape : votre règlement par virement.</strong><br>Montant à régler : ${money(total)}. Dans le parcours définitif, les instructions de virement seraient transmises par l’organisateur. Aucun virement n’est à effectuer pour cette démonstration.`;
    else payment.innerHTML = '<strong>Votre inscription est enregistrée.</strong><br>Le règlement par carte bancaire est simulé dans cette démonstration.';
    document.querySelector('#registration').hidden = true;
    document.querySelector('#success').hidden = false;
    document.querySelector('#success-title').focus({ preventScroll: true });
    document.querySelector('#main').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    document.title = 'À bientôt à Bordeaux · Inscription enregistrée';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (moving || !validate()) return;
    if (step < 3) await goTo(step + 1); else complete();
  });
  form.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
    event.target.setCustomValidity?.('');
    if (event.target.name === 'billingOrg') billingOrganizationEdited = true;
    clearError();
  });
  form.addEventListener('change', event => {
    if (['ticket', 'gala', 'diet', 'attendance', 'billingProfile'].includes(event.target.name)) syncOptions();
  });
  document.querySelector('#back').addEventListener('click', () => goTo(step - 1));
  document.querySelector('.stepper').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button && !button.disabled) goTo(Number(button.dataset.step));
  });
  document.querySelector('#review').addEventListener('click', event => {
    if (event.target.closest('[data-edit]')) goTo(0);
  });
  document.querySelector('#print').addEventListener('click', () => window.print());
  document.querySelector('#calendar').addEventListener('click', () => {
    const ticket = TICKETS[value('ticket')];
    const days = ticket.days === 3 ? ['25 mars', '26 mars', '27 mars'] : selected('attendance');
    const events = days.map(day => {
      const date = Number(day.split(' ')[0]);
      return ['BEGIN:VEVENT', `UID:jdb-2026-${date}@preview.adera.fr`, 'DTSTAMP:20260101T000000Z', `DTSTART;VALUE=DATE:202603${date}`, `DTEND;VALUE=DATE:202603${date + 1}`, 'SUMMARY:Journées de Bordeaux — Ergonomie', 'LOCATION:Bordeaux\\, France', 'DESCRIPTION:Événement de démonstration. Inscription non contractuelle.', 'END:VEVENT'].join('\r\n');
    });
    const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Adera//JDB Preview//FR', ...events, 'END:VCALENDAR', ''].join('\r\n');
    const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'journees-bordeaux-2026.ics';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.querySelector('#restart').addEventListener('click', () => window.location.reload());
  syncOptions();
}
