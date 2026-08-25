(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const storage = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const categories = { all:'Todos', essential:'Esenciales', care:'Cuidados', clothing:'Textiles', feeding:'Alimentación', contribution:'Aportes' };
  let activeFilter = 'all';
  let exitPromptShown = false;

  /* Limpieza única de los datos usados durante las pruebas de la invitación. */
  function cleanTestDataOnce() {
    const migrationKey = 'luciano-final-cleanup-v1';
    if (storage.get(migrationKey, false)) return;

    const reserved = storage.get('luciano-reserved', {});
    delete reserved['1'];
    storage.set('luciano-reserved', reserved);

    const wishes = storage.get('luciano-wishes', []);
    const davidWishes = wishes.filter(wish => String(wish.name || '').trim().toLocaleLowerCase('es-CL').startsWith('david'));
    storage.set('luciano-wishes', davidWishes);
    storage.set(migrationKey, true);
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

  function renderGifts() {
    const reserved = storage.get('luciano-reserved', {});
    const contributions = CONTRIBUTIONS.map(item => ({ ...item, category:'contribution', image:FALLBACK.essential, link:'', estimated:true }));
    const items = [...GIFTS, ...contributions]
      .filter(gift => activeFilter === 'all' || gift.category === activeFilter)
      .sort((a, b) => Number(Boolean(b.contributed)) - Number(Boolean(a.contributed)) || (b.price || 0) - (a.price || 0));
    $('#giftGrid').innerHTML = items.map(gift => `
      <article class="gift-card reveal visible${gift.contributed ? ' contributed' : ''}">
        <img src="${escapeHtml(giftImage(gift))}" alt="Imagen de referencia de ${escapeHtml(gift.name)}" loading="lazy" width="900" height="900">
        <div class="gift-body">
          <small>${categories[gift.category]}</small>
          <h3>${escapeHtml(gift.name)}</h3>
          ${Number.isFinite(gift.price) ? `<p class="price">${money.format(gift.price)}</p>` : ''}
          ${gift.estimated ? '<p class="estimated">Valor referencial</p>' : ''}
          ${gift.contributed
            ? `<p class="contributed-state">Este regalo será llevado con mucho cariño por<strong>${escapeHtml(gift.contributors)}</strong></p>`
            : reserved[gift.id]
            ? `<p class="reserved-state">Reservado por<br><strong>${escapeHtml(reserved[gift.id])}</strong></p>`
            : `<button type="button" data-gift="${gift.id}">Yo llevaré este regalo</button><button class="secondary" type="button" data-contribute="${gift.id}">Prefiero hacer un aporte</button>`}
        </div>
      </article>`
    ).join('');
  }

  function openGiftDialog(id, contribution = false) {
    const gift = [...GIFTS, ...CONTRIBUTIONS].find(item => String(item.id) === String(id));
    if (!gift) return;
    const dialog = $('#giftDialog');
    $('#giftDialogContent').innerHTML = contribution
      ? `<p class="eyebrow">Un aporte para Luciano</p><h3>${escapeHtml(gift.name)}</h3><p>Puedes aportar el valor completo o una parte desde la sección bancaria.</p><a class="button" href="#aporte" data-close>Ver aporte bancario</a>`
      : `<p class="eyebrow">Un regalo para Luciano</p><h3>${escapeHtml(gift.name)}</h3><p><strong>${money.format(gift.price)}</strong></p>${gift.link ? `<p><a class="text-link" href="${escapeHtml(gift.link)}" target="_blank" rel="noopener">Ver producto ↗</a></p>` : ''}<form id="reserveForm" data-id="${gift.id}"><label>Tu nombre<input name="nombre" required autocomplete="name"></label><button class="button" type="submit">Confirmar que llevaré este regalo</button></form>`;
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
    return [...SAMPLE_WISHES, ...storage.get('luciano-wishes', [])];
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
    if (exitPromptShown || storage.get('luciano-wishes', []).length) return;
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
    document.addEventListener('submit', event => {
      if (event.target.id !== 'reserveForm') return;
      event.preventDefault();
      if (!event.target.reportValidity()) return;
      const id = event.target.dataset.id;
      const name = new FormData(event.target).get('nombre').trim();
      const reserved = storage.get('luciano-reserved', {});
      reserved[id] = name; storage.set('luciano-reserved', reserved);
      $('#giftDialog').close(); renderGifts();
    });
    $('#rsvpForm').addEventListener('submit', event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const response = Object.fromEntries(new FormData(event.currentTarget));
      storage.set('luciano-rsvp', response);
      const absent = response.asistire === 'No asistiré';
      $('#rsvpStatus').textContent = absent
        ? 'Lo entendemos y muchas gracias por avisarnos que no podrás ir. Antes de irte, por favor deja un mensaje lleno de amor para Luciano en El Cielo de Lucianito.'
        : '¡Gracias! Lucianito, David y Vanessa estarán muy felices de compartir este día contigo. No olvides dejar una estrella al final de la invitación.';
      window.setTimeout(() => $('#cielo').scrollIntoView({ behavior:'smooth' }), 1800);
    });
    $('#wishForm').addEventListener('submit', event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const wishes = storage.get('luciano-wishes', []);
      wishes.push({ name:data.nombre, message:data.deseo, date:new Intl.DateTimeFormat('es-CL', { day:'numeric', month:'long', year:'numeric' }).format(new Date()) });
      storage.set('luciano-wishes', wishes);
      event.currentTarget.reset();
      $('#wishStatus').textContent = `Gracias, ${data.nombre}. Tu estrella ya acompaña a Luciano.`;
      renderWishes();
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
    window.addEventListener('beforeunload', event => { if (!storage.get('luciano-wishes', []).length) { event.preventDefault(); event.returnValue = ''; } });
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
    cleanTestDataOnce();
    initOpening(); updateCountdown(); window.setInterval(updateCountdown, 60000);
    renderFilters(); renderGifts(); renderExperiences(); renderBank(); renderWishes();
    initEvents(); initReveals();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
