(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const categories = { all:'Todos', essential:'Esenciales', care:'Cuidados', clothing:'Textiles', feeding:'Alimentación', contribution:'Aportes' };
  let activeFilter = 'all';
  let exitPromptShown = false;
  let remoteWishes = [];
  let remoteReservations = {};
  let pendingWishes = readPendingWishes();
  let pendingReservations = readPendingReservations();
  let reservationsReady = false;
  let wishSentThisVisit = false;

  function readPendingWishes() {
    try { return JSON.parse(localStorage.getItem('luciano-pending-wishes')) || []; }
    catch { return []; }
  }

  function savePendingWishes() {
    try { localStorage.setItem('luciano-pending-wishes', JSON.stringify(pendingWishes)); }
    catch { /* El deseo seguirá visible durante la sesión actual. */ }
  }

  function readPendingReservations() {
    try { return JSON.parse(localStorage.getItem('luciano-pending-reservations')) || {}; }
    catch { return {}; }
  }

  function savePendingReservations() {
    try { localStorage.setItem('luciano-pending-reservations', JSON.stringify(pendingReservations)); }
    catch { /* La reserva seguirá visible durante la sesión actual. */ }
  }

  function normalizeHeader(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (char === '"') {
        if (quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
        else quoted = !quoted;
      } else if (char === ',' && !quoted) {
        row.push(cell); cell = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && text[index + 1] === '\n') index += 1;
        row.push(cell); cell = '';
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
      } else cell += char;
    }
    if (cell || row.length) { row.push(cell); if (row.some(value => value.trim())) rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map(normalizeHeader);
    return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()])));
  }

  function postGoogleForm(config, values) {
    if (!config?.url) throw new Error('Formulario sin configurar');
    const body = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      const entry = config.entries[key];
      if (entry && value !== undefined && value !== null) body.append(entry, String(value));
    });
    const request = fetch(config.url, { method:'POST', mode:'no-cors', body });
    /* Google guarda la respuesta correctamente, pero su conexión puede quedar
       abierta varios segundos. Liberamos la interfaz sin cancelar el envío. */
    return new Promise((resolve, reject) => {
      const interfaceTimeout = window.setTimeout(resolve, 900);
      request.then(() => {
        window.clearTimeout(interfaceTimeout);
        resolve();
      }).catch(error => {
        window.clearTimeout(interfaceTimeout);
        reject(error);
      });
    });
  }

  async function fetchCsv(url) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, { cache:'no-store', signal:controller.signal });
      if (!response.ok) throw new Error(`No se pudo leer la hoja (${response.status})`);
      return parseCsv(await response.text());
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function wishKey(wish) {
    return `${normalizeHeader(wish.name)}|${normalizeHeader(wish.message)}`;
  }

  async function loadSharedWishes() {
    try {
      const rows = await fetchCsv(SITE.sheets.wishes);
      remoteWishes = rows.map(row => ({
        name:row.nombre,
        message:row['deseo para luciano'],
        date:row['marca temporal']
      })).filter(wish => wish.name && wish.message);
      const remoteKeys = new Set(remoteWishes.map(wishKey));
      pendingWishes = pendingWishes.filter(wish => !remoteKeys.has(wishKey(wish)));
      savePendingWishes();
      renderWishes();
    } catch (error) {
      console.warn('No fue posible actualizar el cielo compartido.', error);
      if (!allWishes().length) $('#starCount').textContent = 'Cielo temporalmente no disponible';
    }
  }

  async function loadSharedReservations() {
    try {
      const rows = await fetchCsv(SITE.sheets.reservations);
      const next = {};
      rows.forEach(row => {
        const id = row['codigo del regalo'];
        const name = row['reservado por'];
        if (id && name && !next[id]) next[id] = name;
      });
      remoteReservations = next;
      Object.keys(pendingReservations).forEach(id => {
        if (remoteReservations[id]) delete pendingReservations[id];
      });
      savePendingReservations();
      reservationsReady = true;
      renderGifts();
    } catch (error) {
      console.warn('No fue posible actualizar las reservas compartidas.', error);
      reservationsReady = true;
      renderGifts();
    }
  }

  function refreshSharedData() {
    loadSharedWishes();
    loadSharedReservations();
  }

  function initOpening() {
    window.setTimeout(() => {
      const opening = $('#opening');
      opening.classList.add('hide');
      window.setTimeout(() => opening.remove(), 900);
    }, 2900);
  }

  function updateCountdown() {
    const remaining = new Date(SITE.birthDate).getTime() - Date.now();
    if (remaining <= 0) {
      $('#days').textContent = '0';
      $('#countdownText').textContent = 'Luciano ya está aquí.';
      return;
    }
    $('#days').textContent = Math.ceil(remaining / 86400000);
  }

  function renderFilters() {
    $('#giftFilters').innerHTML = Object.entries(categories).map(([key, label]) =>
      `<button class="filter-button ${activeFilter === key ? 'active' : ''}" type="button" data-filter="${key}" aria-pressed="${activeFilter === key}">${label}</button>`
    ).join('');
  }

  function giftImage(gift) {
    return gift.image || FALLBACK[gift.category] || FALLBACK.essential;
  }

  function initImageFallbacks() {
    document.addEventListener('error', event => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || !image.dataset.fallback || image.dataset.fallbackApplied) return;
      image.dataset.fallbackApplied = 'true';
      image.src = image.dataset.fallback;
    }, true);
  }

  function renderGifts() {
    const reserved = { ...pendingReservations, ...remoteReservations };
    const contributions = CONTRIBUTIONS.map(item => ({ ...item, category:'contribution', image:FALLBACK.essential, link:'', estimated:true }));
    const items = [...GIFTS, ...contributions]
      .filter(gift => activeFilter === 'all' || gift.category === activeFilter)
      .sort((a, b) => Number(Boolean(b.contributed)) - Number(Boolean(a.contributed)) || (b.price || 0) - (a.price || 0));
    $('#giftGrid').innerHTML = items.map(gift => `
      <article class="gift-card reveal visible${gift.contributed ? ' contributed' : ''}">
        <img src="${escapeHtml(giftImage(gift))}" data-fallback="${escapeHtml(FALLBACK[gift.category] || FALLBACK.essential)}" alt="Imagen de referencia de ${escapeHtml(gift.name)}" loading="lazy" decoding="async" width="900" height="900">
        <div class="gift-body">
          <small>${categories[gift.category]}</small>
          <h3>${escapeHtml(gift.name)}</h3>
          ${Number.isFinite(gift.price) ? `<p class="price">${money.format(gift.price)}</p>` : ''}
          ${gift.estimated ? '<p class="estimated">Valor referencial</p>' : ''}
          ${gift.contributed
            ? `<p class="contributed-state">Este regalo será llevado con mucho cariño por<strong>${escapeHtml(gift.contributors)}</strong></p>`
            : gift.category === 'contribution'
            ? `<button class="secondary" type="button" data-contribute="${gift.id}">Hacer este aporte</button>`
            : reserved[String(gift.id)]
            ? `<p class="reserved-state">Reservado por<br><strong>${escapeHtml(reserved[gift.id])}</strong></p>`
            : `<button type="button" data-gift="${gift.id}" ${reservationsReady ? '' : 'disabled'}>${reservationsReady ? 'Yo llevaré este regalo' : 'Comprobando disponibilidad…'}</button><button class="secondary" type="button" data-contribute="${gift.id}">Prefiero hacer un aporte</button>`}
        </div>
      </article>`
    ).join('');
  }

  function openGiftDialog(id, contribution = false) {
    const gift = [...GIFTS, ...CONTRIBUTIONS].find(item => String(item.id) === String(id));
    if (!gift) return;
    const dialog = $('#giftDialog');
    $('#giftDialogContent').innerHTML = contribution
      ? `<p class="eyebrow">Un aporte para Luciano</p><h3 id="giftDialogTitle">${escapeHtml(gift.name)}</h3><p>Puedes aportar el valor completo o una parte desde la sección bancaria.</p><a class="button" href="#aporte" data-close>Ver aporte bancario</a>`
      : `<p class="eyebrow">Un regalo para Luciano</p><h3 id="giftDialogTitle">${escapeHtml(gift.name)}</h3><p><strong>${money.format(gift.price)}</strong></p>${gift.link ? `<p><a class="text-link" href="${escapeHtml(gift.link)}" target="_blank" rel="noopener">Ver producto ↗</a></p>` : ''}<form id="reserveForm" data-id="${gift.id}"><label>Tu nombre<input name="nombre" required autocomplete="name"></label><button class="button" type="submit">Confirmar que llevaré este regalo</button></form>`;
    dialog.showModal();
  }

  function renderExperiences() {
    $('#experienceGrid').innerHTML = EXPERIENCES.map((item, index) => `
      <article class="experience reveal visible">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" width="490" height="490">
        <h3>${escapeHtml(item.title)}</h3>
        <strong>${money.format(item.price)}</strong>
        <p>${escapeHtml(item.copy)}</p>
        <button class="experience-contribute" type="button" data-experience-contribute="${index}">Hacer este aporte</button>
      </article>`
    ).join('');
  }

  function renderBank() {
    const values = Object.values(SITE.bank).filter(Boolean);
    const labels = { bank:'Banco', accountType:'Tipo de cuenta', accountNumber:'Número de cuenta', holder:'Titular', rut:'RUT', email:'Correo' };
    $('#bankData').innerHTML = values.length > 2
      ? `<p id="bankChoice" class="bank-choice" role="status">Selecciona una experiencia para recordar el aporte.</p>${Object.entries(SITE.bank).filter(([, value]) => value).map(([key, value]) => `<p><small>${labels[key] || escapeHtml(key)}</small><br><strong>${escapeHtml(value)}</strong></p>`).join('')}`
      : '<p>Próximamente incorporaremos aquí los datos para aportes.</p>';
  }

  function allWishes() {
    return [...SAMPLE_WISHES, ...remoteWishes, ...pendingWishes];
  }

  function renderWishes() {
    const wishes = allWishes();
    $('#starCount').textContent = `${wishes.length} ${wishes.length === 1 ? 'estrella' : 'estrellas'}`;
    $('#wishSky').innerHTML = wishes.map((wish, index) => {
      const left = 7 + ((index * 37) % 86);
      const top = 8 + ((index * 53) % 78);
      const size = 20 + (index % 5) * 4;
      return `<button class="wish-star" type="button" style="left:${left}%;top:${top}%;width:${size}px;height:${size}px;animation-delay:${index * .35}s" aria-label="Deseo de ${escapeHtml(wish.name)}" aria-expanded="false"><span class="wish-card"><strong>${escapeHtml(wish.name)}</strong><span>${escapeHtml(wish.message)}</span><small>${escapeHtml(wish.date)}</small></span></button>`;
    }).join('');
  }

  function showExitReminder() {
    if (exitPromptShown || wishSentThisVisit) return;
    exitPromptShown = true;
    $('#exitReminder').hidden = false;
  }

  function initEvents() {
    $('#giftFilters').addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      activeFilter = button.dataset.filter;
      renderFilters(); renderGifts();
    });
    $('#giftGrid').addEventListener('click', event => {
      const reserve = event.target.closest('[data-gift]');
      const contribute = event.target.closest('[data-contribute]');
      if (reserve) openGiftDialog(reserve.dataset.gift);
      if (contribute) openGiftDialog(contribute.dataset.contribute, true);
    });
    $('#experienceGrid').addEventListener('click', event => {
      const button = event.target.closest('[data-experience-contribute]');
      if (!button) return;
      const experience = EXPERIENCES[Number(button.dataset.experienceContribute)];
      $('#bankChoice').textContent = `Aporte elegido: ${experience.title} — ${money.format(experience.price)}`;
      $('#aporte').scrollIntoView({ behavior:'smooth' });
    });
    $('#giftDialog').addEventListener('click', event => {
      if (event.target.closest('.dialog-close') || event.target.closest('[data-close]')) $('#giftDialog').close();
    });
    document.addEventListener('submit', async event => {
      if (event.target.id !== 'reserveForm') return;
      event.preventDefault();
      if (!event.target.reportValidity()) return;
      const id = event.target.dataset.id;
      const name = new FormData(event.target).get('nombre').trim();
      const gift = GIFTS.find(item => String(item.id) === String(id));
      const button = event.target.querySelector('[type="submit"]');
      button.disabled = true;
      button.textContent = 'Confirmando…';
      try {
        await postGoogleForm(SITE.forms.reservation, { giftId:id, giftName:gift?.name || '', reservedBy:name });
        pendingReservations[id] = name;
        savePendingReservations();
        $('#giftDialog').close();
        renderGifts();
        window.setTimeout(loadSharedReservations, 3500);
      } catch {
        button.disabled = false;
        button.textContent = 'Confirmar que llevaré este regalo';
        button.insertAdjacentHTML('afterend', '<p class="form-status">No pudimos confirmar ahora. Revisa tu conexión e inténtalo nuevamente.</p>');
      }
    });
    $('#rsvpForm').addEventListener('submit', async event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const response = Object.fromEntries(new FormData(event.currentTarget));
      const button = event.currentTarget.querySelector('[type="submit"]');
      button.disabled = true;
      button.textContent = 'Enviando confirmación…';
      try {
        await postGoogleForm(SITE.forms.rsvp, response);
      } catch {
        $('#rsvpStatus').className = 'form-status error';
        $('#rsvpStatus').textContent = 'No pudimos enviar la confirmación. Revisa tu conexión e inténtalo nuevamente.';
        button.disabled = false;
        button.textContent = 'Confirmar asistencia ✦';
        return;
      }
      const absent = response.asistire === 'No asistiré';
      $('#rsvpStatus').className = 'form-status success';
      $('#rsvpStatus').textContent = absent
        ? 'Lo entendemos y muchas gracias por avisarnos que no podrás ir. Por favor, sigue bajando para conocer las opciones de regalos, experiencias y aportes. Antes de irte, no olvides dejarle un buen deseo a Luciano en El Cielo de Lucianito, al final de la página.'
        : '¡Gracias por confirmar! Sigue bajando para conocer las opciones de regalos, experiencias y aportes. Antes de irte, no olvides dejarle un buen deseo a Luciano en El Cielo de Lucianito, al final de la página.';
      button.textContent = 'Confirmación enviada ✓';
    });
    $('#wishForm').addEventListener('submit', event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const button = event.currentTarget.querySelector('[type="submit"]');
      button.disabled = true;
      let submission;
      try {
        submission = postGoogleForm(SITE.forms.wish, data);
      } catch {
        $('#wishStatus').className = 'form-status error';
        $('#wishStatus').textContent = 'No pudimos enviar tu estrella. Revisa tu conexión e inténtalo nuevamente.';
        button.disabled = false;
        button.textContent = 'Dejar mi estrella ✦';
        return;
      }
      pendingWishes.push({ name:data.nombre, message:data.deseo, date:new Intl.DateTimeFormat('es-CL', { day:'numeric', month:'long', year:'numeric' }).format(new Date()) });
      savePendingWishes();
      wishSentThisVisit = true;
      event.currentTarget.reset();
      $('#wishStatus').className = 'form-status success';
      $('#wishStatus').textContent = `¡Gracias por dejar tu buen deseo para Lucianito, ${data.nombre}! Tu estrella ya brilla en su cielo.`;
      button.disabled = false;
      button.textContent = 'Dejar otra estrella ✦';
      renderWishes();
      submission.catch(() => {
        $('#wishStatus').className = 'form-status error';
        $('#wishStatus').textContent = 'La estrella quedó visible, pero no pudimos guardarla. Revisa tu conexión e inténtalo nuevamente.';
      });
      window.setTimeout(loadSharedWishes, 3500);
    });
    $('#wishSky').addEventListener('click', event => {
      const star = event.target.closest('.wish-star');
      if (!star) return;
      const isOpen = star.classList.contains('active');
      document.querySelectorAll('.wish-star.active').forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        star.classList.add('active');
        star.setAttribute('aria-expanded', 'true');
      }
    });
    window.setTimeout(() => document.addEventListener('mouseout', event => { if (event.clientY <= 0 && !event.relatedTarget) showExitReminder(); }), 12000);
    window.addEventListener('beforeunload', event => { if (!wishSentThisVisit) { event.preventDefault(); event.returnValue = ''; } });
    $('#goToSky').addEventListener('click', () => { $('#exitReminder').hidden = true; });
    $('#continueExit').addEventListener('click', () => { $('#exitReminder').hidden = true; });
  }

  function initReveals() {
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('.reveal').forEach(item => item.classList.add('visible')); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold:.12 });
    document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
  }

  function init() {
    initImageFallbacks();
    initOpening(); updateCountdown(); window.setInterval(updateCountdown, 60000);
    renderFilters(); renderGifts(); renderExperiences(); renderBank(); renderWishes();
    initEvents(); initReveals();
    refreshSharedData();
    window.setInterval(refreshSharedData, 20000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshSharedData(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
