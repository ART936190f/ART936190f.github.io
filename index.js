// js/main.js — corrected and complete

// ----------------------------
// Загальні змінні (DOM refs ініціалізуються в DOMContentLoaded)
// ----------------------------
let roomPricePerNight = 0;
let numberOfNights = 0;
let totalRoomCost = 0;
let totalServiceCost = 0;
let discountRate = 0;
let guestCount = 1;
const serviceCounts = {};

// Poll
const POLL_VERSION = '2025_12';
const POLL_KEY = `cozy_hotel_poll_voted_${POLL_VERSION}`;
const pollCounts = { yes:0, no:0, maybe:0 };

// SERVICES
const SERVICES = [
  { id:'restaurant', name:'Вечеря (1 день)', description:'Спеціальне меню.', price:500, icon:'<path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>' },
  { id:'guide', name:'Гід (1 день)', description:'Екскурсії по горах.', price:1500, icon:'<path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 9a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a4 4 0 014-4h10a4 4 0 014 4v1z"></path>' },
  { id:'sauna', name:'Сауна (1 сеанс)', description:'Фінська парна.', price:800, icon:'<path d="M13 10V3L4 14h7v7l9-11h-7z"></path>' },
  { id:'chan', name:'Чан (1 сеанс)', description:'Купання в травах.', price:1200, icon:'<path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9h-3M12 21a9 9 0 01-9-9m9 9v-3M3 12h3M12 3v3"></path>' },
  { id:'transport', name:'Трансфер', description:'З/до вокзалу.', price:400, icon:'<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>' },
  { id:'massage', name:'Масаж (1 год)', description:'Релакс та відновлення.', price:900, icon:'<path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>' }
];

// DOM refs (assigned in DOMContentLoaded)
let checkInInput, checkOutInput, roomTypeSelect, servicesSlider, orderSummaryDiv, finalTotalSpan, discountInfoDiv, payFullAmountSpan, payDepositAmountSpan, payFullBtn, payDepositBtn, guestCountDisplay, minusGuestBtn, plusGuestBtn;

// Calendar/time/weather helpers
let currentDate = new Date();
const monthNames = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
let serverOffsetMs = 0;
const PROMO_END_UTC = Date.UTC(2025,11,31,23,59,59);
let WEATHER_DATA = null;

// small date helpers
function pad(n){ return n<10 ? '0'+n : ''+n; }
function formatDateISO(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function parseLocalDate(s){ if(!s) return null; const p = s.split('-').map(Number); if(p.length!==3) return null; return new Date(p[0], p[1]-1, p[2]); }

// slider helper
function scrollSlider(id, amount){ const el = document.getElementById(id); if(!el) return; el.scrollBy({ left: amount, behavior: 'smooth' }); }

// guest counter
function updateGuestCount(delta){
  const newCount = guestCount + delta;
  if(newCount < 1 || newCount > 6) return;
  guestCount = newCount;
  if(guestCountDisplay) guestCountDisplay.textContent = guestCount;
  if(minusGuestBtn) minusGuestBtn.disabled = guestCount <= 1;
  if(plusGuestBtn) plusGuestBtn.disabled = guestCount >= 6;
  calculateTotal();
}

// generate service cards
function generateServiceCards(){
  if(!servicesSlider) return;
  servicesSlider.innerHTML = SERVICES.map(s=>{
    serviceCounts[s.id] = 0;
    return `
      <div class="min-w-[280px] bg-white rounded-xl border-2 border-transparent p-4 text-center snap-center service-card" data-service-id="${s.id}">
        <div class="flex items-center justify-center h-12 w-12 bg-amber-100 text-amber-500 rounded-full mx-auto mb-3">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">${s.icon}</svg>
        </div>
        <h3 class="font-bold text-gray-800">${s.name}</h3>
        <p class="text-xs text-gray-500 mb-2">${s.description}</p>
        <p class="text-amber-600 font-bold mb-3">${s.price} грн</p>
        <div class="flex justify-center items-center space-x-3">
          <button type="button" class="counter-btn minus-btn" data-service-id="${s.id}">-</button>
          <span id="count-${s.id}" class="font-bold text-gray-800 w-6 text-center">0</span>
          <button type="button" class="counter-btn plus-btn" data-service-id="${s.id}">+</button>
        </div>
      </div>
    `;
  }).join('');
}

// delegated handler for service buttons
function onServicesClick(e){
  const btn = e.target.closest('.counter-btn');
  if(!btn || !servicesSlider) return;
  const serviceId = btn.getAttribute('data-service-id');
  if(!serviceId) return;
  const isPlus = btn.classList.contains('plus-btn') || btn.textContent.trim()==='+';
  let cnt = serviceCounts[serviceId] || 0;
  if(isPlus) cnt++; else if(cnt>0) cnt--;
  serviceCounts[serviceId] = cnt;
  const span = document.getElementById(`count-${serviceId}`);
  if(span) span.textContent = cnt;
  const card = document.querySelector(`.service-card[data-service-id="${serviceId}"]`);
  if(card) card.classList.toggle('service-card-selected', cnt>0);
  calculateTotal();
}

// server time
async function getServerTime(){
  try {
    const r = await fetch(location.href, { method:'HEAD' });
    const dateHeader = r.headers.get('Date');
    if(dateHeader){ const st = new Date(dateHeader); serverOffsetMs = st.getTime() - Date.now(); return st; }
  } catch(e){}
  serverOffsetMs = 0;
  return new Date();
}
function getNowServer(){ return new Date(Date.now() + serverOffsetMs); }
function isPromoActiveNow(){ return getNowServer().getTime() <= PROMO_END_UTC; }

// sale timer
function startSaleTimerInto(elId){
  const el = document.getElementById(elId); if(!el) return;
  function tick(){
    const diff = PROMO_END_UTC - getNowServer().getTime();
    if(diff <= 0){ el.textContent = 'Акція завершена ❌'; if(discountInfoDiv) discountInfoDiv.classList.add('hidden'); return; }
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor(diff / (1000*60*60) % 24);
    const m = Math.floor(diff / (1000*60) % 60);
    const s = Math.floor(diff / 1000 % 60);
    el.textContent = `До кінця знижок -5%: ${d}д ${h}г ${m}х ${s}с`;
  }
  tick();
  return setInterval(tick, 1000);
}

// weather helpers
function extractCoordsFromMapIframe(){
  try {
    const iframe = document.getElementById('hotel-map-iframe');
    if(!iframe) return null;
    const src = iframe.getAttribute('src') || '';
    const re = /!2d([-\d.]+)!3d([-\d.]+)/;
    const m = src.match(re);
    if(m) return { lat: parseFloat(m[2]), lon: parseFloat(m[1]) };
    const url = new URL(src, location.href);
    if(url.searchParams.has('ll')){
      const [lat,lon] = url.searchParams.get('ll').split(',').map(Number);
      return { lat, lon };
    }
  } catch(e){}
  return null;
}

async function fetchWeatherForCoords(lat, lon){
  try {
    const now = getNowServer();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start.getTime() + 6*24*60*60*1000);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${formatDateISO(start)}&end_date=${formatDateISO(end)}`;
    const r = await fetch(url);
    if(!r.ok) throw new Error('weather failed');
    const data = await r.json();
    WEATHER_DATA = data;
    updateWeatherWidgetForDate(formatDateISO(getNowServer()));
  } catch(e){
    console.error('weather error', e);
    const icon = document.getElementById('weather-icon'); if(icon) icon.textContent = '⚠️';
    const temp = document.getElementById('weather-temp'); if(temp) temp.textContent = '—';
    const day = document.getElementById('weather-day'); if(day) day.textContent = 'Помилка завантаження';
    const cond = document.getElementById('weather-condition'); if(cond) cond.textContent = '';
  }
}

function weatherCodeToEmoji(c){
  if(c===null||c===undefined) return '🌈';
  const code = Number(c);
  if(code===0) return '☀️';
  if(code<=3) return '⛅';
  if(code>=45 && code<=48) return '🌫️';
  if((code>=51 && code<=57) || (code>=61 && code<=67) || (code>=80 && code<=82)) return '🌧️';
  if((code>=71 && code<=77) || (code>=85 && code<=86)) return '❄️';
  if(code>=95) return '🌩️';
  return '🌤️';
}

function updateWeatherWidgetForDate(dateStr){
  const iconEl = document.getElementById('weather-icon');
  const tempEl = document.getElementById('weather-temp');
  const dayEl = document.getElementById('weather-day');
  const condEl = document.getElementById('weather-condition');
  if(!WEATHER_DATA){ if(condEl) condEl.textContent = 'Дані відсутні'; return; }
  const cur = WEATHER_DATA.current_weather;
  const daily = WEATHER_DATA.daily;
  const todayStr = formatDateISO(getNowServer());
  if(dateStr === todayStr && cur){
    const icon = weatherCodeToEmoji(cur.weathercode);
    if(iconEl) iconEl.textContent = icon;
    if(tempEl) tempEl.textContent = `${cur.temperature}°C`;
    if(dayEl) dayEl.textContent = `Сьогодні — ${new Date(cur.time).toLocaleString('uk-UA',{weekday:'long', day:'numeric', month:'long'})}`;
    if(condEl) condEl.textContent = `Вітер ${cur.windspeed} м/с`;
    return;
  }
  if(daily && daily.time && daily.time.length){
    const idx = daily.time.indexOf(dateStr);
    if(idx >= 0){
      const tmax = daily.temperature_2m_max[idx];
      const tmin = daily.temperature_2m_min[idx];
      const wcode = daily.weathercode ? daily.weathercode[idx] : null;
      const icon = weatherCodeToEmoji(wcode);
      if(iconEl) iconEl.textContent = icon;
      if(tempEl) tempEl.textContent = `${tmax}°C / ${tmin}°C`;
      if(dayEl) dayEl.textContent = new Date(dateStr).toLocaleDateString('uk-UA',{weekday:'long', day:'numeric', month:'long'});
      if(condEl) condEl.textContent = `Прогноз: ${icon}`;
      return;
    }
  }
  if(iconEl) iconEl.textContent = '—';
  if(tempEl) tempEl.textContent = '—';
  if(dayEl) dayEl.textContent = dateStr;
  if(condEl) condEl.textContent = 'Дані недоступні';
}

// calendar
function renderCalendar(year, month){
  const grid = document.getElementById('calendar-grid');
  if(!grid) return;
  grid.innerHTML = '';
  const header = document.getElementById('calendar-month-year'); if(header) header.textContent = `${monthNames[month]} ${year}`;
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayStr = formatDateISO(getNowServer());
  const startIdx = (firstDay === 0) ? 6 : firstDay - 1;
  for(let i=0;i<startIdx;i++) grid.innerHTML += '<span class="calendar-day text-gray-300"></span>';
  for(let d=1; d<=daysInMonth; d++){
    const dt = new Date(year, month, d);
    const s = formatDateISO(dt);
    const isToday = s === todayStr;
    const cls = isToday ? 'calendar-day calendar-day-current' : 'calendar-day';
    grid.innerHTML += `<span class="${cls}" data-date="${s}" onclick="selectCalendarDay(this)">${d}</span>`;
  }
}
function changeMonth(delta){ currentDate.setMonth(currentDate.getMonth()+delta); renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); }
function selectCalendarDay(el){ document.querySelectorAll('.calendar-day').forEach(x=>x.classList.remove('calendar-day-selected')); el.classList.add('calendar-day-selected'); updateWeatherWidgetForDate(el.getAttribute('data-date')); }

// modals & booking helpers
function openRoomModal(card){
  const name = card.getAttribute('data-room-name') || card.querySelector('h3')?.textContent || 'Номер';
  const price = card.getAttribute('data-room-price') || '—';
  const body = document.getElementById('room-modal-body');
  if(body) body.innerHTML = `<h4 class="font-bold text-lg mb-1">${name}</h4><p class="text-gray-600 mb-2">Ціна: <strong>${price} грн/ніч</strong></p><p class="text-sm text-gray-700">Опис: чудовий номер...</p><div class="mt-3"><button class="w-full bg-amber-600 text-white py-2 rounded" onclick="prefillBooking('${name}', ${price})">Забронювати цей номер</button></div>`;
  const quick = document.getElementById('quick-room'); if(quick) quick.value = name;
  const overlay = document.getElementById('room-modal-overlay'); if(overlay) { overlay.classList.add('show'); overlay.setAttribute('aria-hidden','false'); }
}
function closeRoomModal(){ const o = document.getElementById('room-modal-overlay'); if(o) { o.classList.remove('show'); o.setAttribute('aria-hidden','true'); } }
function prefillBooking(roomName, price){
  if(roomTypeSelect){
    const opt = Array.from(roomTypeSelect.options).find(o=> o.textContent.includes(roomName.split('(')[0].trim()));
    if(opt) roomTypeSelect.value = opt.value;
  }
  calculateTotal();
  const ci = document.getElementById('check-in'); if(ci) ci.focus();
  closeRoomModal();
  const bk = document.getElementById('booking'); if(bk) bk.scrollIntoView({behavior:'smooth'});
}
function quickBook(){ const name = document.getElementById('quick-name').value || 'Гість'; const phone = document.getElementById('quick-phone').value || ''; if(!phone){ alert('Вкажіть телефон'); return;} prefillBooking(document.getElementById('quick-room')?.value || ''); alert(`Дякуємо, ${name}! Ми зв'яжемося.`); }

// exit-intent
let exitShown = sessionStorage.getItem('exitShown') === 'true';
document.addEventListener('mouseout', e => { if(exitShown) return; if(e.clientY <= 0){ showExitModal(); exitShown = true; sessionStorage.setItem('exitShown','true'); }});
function showExitModal(){ const el = document.getElementById('exit-modal'); if(el) { el.classList.add('show'); el.setAttribute('aria-hidden','false'); } const bar = document.getElementById('exit-bar'); if(bar) bar.classList.add('show'); }
function closeExitModal(){ const el = document.getElementById('exit-modal'); if(el) { el.classList.remove('show'); el.setAttribute('aria-hidden','true'); } const bar = document.getElementById('exit-bar'); if(bar) bar.classList.remove('show'); }
function applyExitCode(){ alert('Код WELCOME5 застосовано'); closeExitModal(); }

// poll
function votePoll(opt){ if(localStorage.getItem(POLL_KEY)){ alert('Ви вже голосували'); return; } if(!pollCounts.hasOwnProperty(opt)) return; pollCounts[opt]++; localStorage.setItem(POLL_KEY, opt); renderPoll(); }
function renderPoll(){ const total = pollCounts.yes + pollCounts.no + pollCounts.maybe; const el = document.getElementById('poll-result'); if(el) el.textContent = `Так: ${pollCounts.yes} • Ні: ${pollCounts.no} • Можливо: ${pollCounts.maybe} — (всього ${total})`; }

// click-ball effect
let sparkleEnabled = false;
(function addEffectsToggle(){
  const btn = document.createElement('button');
  btn.className = 'hidden md:inline-flex bg-white border px-3 py-1 rounded ml-4 text-sm';
  btn.textContent = 'Ефект: вимк.';
  btn.onclick = ()=> { sparkleEnabled = !sparkleEnabled; btn.textContent = sparkleEnabled ? 'Ефект: вкл.' : 'Ефект: вимк.'; };
  const nav = document.querySelector('header nav');
  nav?.appendChild(btn);
})();

document.addEventListener('click', ev => {
  if(!sparkleEnabled) return;
  const x = ev.clientX, y = ev.clientY;
  const ball = document.createElement('div');
  ball.className = 'click-ball';
  const size = 14 + Math.random()*10;
  ball.style.left = (x - size/2) + 'px';
  ball.style.top = (y - size/2) + 'px';
  ball.style.width = ball.style.height = size + 'px';
  document.body.appendChild(ball);
  setTimeout(()=> ball.remove(), 650);
});

// calculation & summary
function calculateTotal(){
  if(!checkInInput || !checkOutInput || !roomTypeSelect) return updateSummary(false);
  const ci = parseLocalDate(checkInInput.value);
  const co = parseLocalDate(checkOutInput.value);
  const opt = roomTypeSelect.options[roomTypeSelect.selectedIndex];
  if(!ci || !co || co <= ci || !opt || !opt.value) { updateSummary(false); return; }
  numberOfNights = Math.ceil(Math.abs(co.getTime() - ci.getTime()) / (1000*60*60*24));
  roomPricePerNight = parseFloat(opt.getAttribute('data-price')) || 0;
  totalRoomCost = roomPricePerNight * numberOfNights;
  totalServiceCost = 0;
  const selectedServices = [];
  SERVICES.forEach(s => {
    const c = serviceCounts[s.id] || 0;
    if(c>0){ selectedServices.push({ name:`${s.name} (x${c})`, cost: s.price * c }); totalServiceCost += s.price * c; }
  });
  let subtotal = totalRoomCost + totalServiceCost;
  let finalTotal = subtotal;
  discountRate = 0;
  if(numberOfNights >= 7 && isPromoActiveNow()){ discountRate = 0.05; finalTotal = subtotal * (1 - discountRate); if(discountInfoDiv) discountInfoDiv.classList.remove('hidden'); }
  else if(discountInfoDiv) discountInfoDiv.classList.add('hidden');
  updateSummary(true, opt.textContent, numberOfNights, totalRoomCost, selectedServices, subtotal, finalTotal, guestCount);
}

function updateSummary(isValid, roomName="", nights=0, roomCost=0, services=[], subtotal=0, finalTotal=0, guests=1){
  if(!orderSummaryDiv) return;
  if(!isValid){ orderSummaryDiv.innerHTML = '<p class="text-gray-500">Оберіть коректні параметри.</p>'; if(finalTotalSpan) finalTotalSpan.textContent = '0 грн'; if(payFullBtn) payFullBtn.disabled = true; if(payDepositBtn) payDepositBtn.disabled = true; return; }
  const servicesHtml = services.length ? services.map(s => `<li class="flex justify-between border-b border-gray-100 pb-1"><span class="text-sm text-gray-600">${s.name}</span><span class="text-sm font-medium">${s.cost} грн</span></li>`).join('') : '<li class="text-sm text-gray-400">Без додаткових послуг</li>';
  orderSummaryDiv.innerHTML = `
    <ul class="space-y-2">
      <li class="flex justify-between font-medium"><span class="text-gray-800">${roomName.split('(')[0]} (${nights} ніч.)</span><span class="text-amber-700">${roomCost} грн</span></li>
      <li class="text-sm text-gray-600">Гостей: ${guests}</li>
      <li class="pt-2 font-semibold text-gray-700 text-sm">Послуги:</li>
      ${servicesHtml}
    </ul>
  `;
  if(finalTotalSpan) finalTotalSpan.textContent = `${finalTotal.toFixed(0)} грн`;
  if(payFullAmountSpan) payFullAmountSpan.textContent = finalTotal.toFixed(0);
  if(payDepositAmountSpan) payDepositAmountSpan.textContent = (finalTotal*0.1).toFixed(0);
  if(payFullBtn) payFullBtn.disabled = false;
  if(payDepositBtn) payDepositBtn.disabled = false;
}

// init
document.addEventListener('DOMContentLoaded', async () => {
  // assign DOM refs
  checkInInput = document.getElementById('check-in');
  checkOutInput = document.getElementById('check-out');
  roomTypeSelect = document.getElementById('room-type');
  servicesSlider = document.getElementById('services-slider');
  orderSummaryDiv = document.getElementById('order-summary');
  finalTotalSpan = document.getElementById('final-total');
  discountInfoDiv = document.getElementById('discount-info');
  payFullAmountSpan = document.getElementById('pay-full-amount');
  payDepositAmountSpan = document.getElementById('pay-deposit-amount');
  payFullBtn = document.getElementById('pay-full-btn');
  payDepositBtn = document.getElementById('pay-deposit-btn');
  guestCountDisplay = document.getElementById('guest-count-display');
  minusGuestBtn = document.getElementById('minus-guest-btn');
  plusGuestBtn = document.getElementById('plus-guest-btn');

  // min dates
  const todayIso = formatDateISO(new Date());
  if(checkInInput) checkInInput.setAttribute('min', todayIso);
  if(checkOutInput) checkOutInput.setAttribute('min', todayIso);

  // services slider
  generateServiceCards();
  if(servicesSlider) servicesSlider.addEventListener('click', onServicesClick);

  // calendar
  renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

  // poll load
  const existing = localStorage.getItem(POLL_KEY);
  if(existing && pollCounts.hasOwnProperty(existing)) pollCounts[existing] = 1;
  renderPoll();

  // server offset + sale timer
  await getServerTime();
  startSaleTimerIntoCreate();

  // weather: iframe coords -> #weather-coords fallback
  const iframeCoords = extractCoordsFromMapIframe();
  if(iframeCoords){
    await fetchWeatherForCoords(iframeCoords.lat, iframeCoords.lon);
  } else {
    const wc = document.getElementById('weather-coords');
    if(wc && wc.dataset && wc.dataset.lat && wc.dataset.lon){
      await fetchWeatherForCoords(parseFloat(wc.dataset.lat), parseFloat(wc.dataset.lon));
    } else {
      const cond = document.getElementById('weather-condition');
      if(cond) cond.textContent = 'Координати з карти не знайдено';
    }
  }

  // booking form submit
  const bookingForm = document.getElementById('booking-form');
  if(bookingForm) bookingForm.addEventListener('submit', e => { e.preventDefault(); calculateTotal(); const msg = document.getElementById('booking-message'); if(msg) msg.classList.remove('hidden'); scrollToMap(); });

  // room card click opens modal (not when clicking a button inside)
  document.addEventListener('click', function(e){ if(e.target.closest && e.target.closest('.room-card') && !e.target.closest('button')){ openRoomModal(e.target.closest('.room-card')); } });
});

// startSaleTimer wrapper
let saleTimerInterval = null;
function startSaleTimerIntoCreate(){
  if(saleTimerInterval) clearInterval(saleTimerInterval);
  const timerPlace = document.createElement('div');
  timerPlace.id = 'global-sale-timer';
  timerPlace.className = 'text-center text-sm text-amber-700 font-semibold mb-3';
  const hero = document.getElementById('hero');
  hero?.querySelector('.max-w-xl')?.prepend(timerPlace);
  saleTimerInterval = startSaleTimerInto('global-sale-timer');
}

// helpers
function scrollToMap(){ document.getElementById('location-map')?.scrollIntoView({ behavior:'smooth' }); }
function scrollToPlanning(){ document.getElementById('planning-section')?.scrollIntoView({ behavior:'smooth' }); }
function scrollToServices(){ document.getElementById('services-select')?.scrollIntoView({ behavior:'smooth' }); }

document.addEventListener('keydown', e => { if(e.key === 'Escape'){ closeRoomModal(); closeExitModal(); } });

// expose functions for inline onclicks
window.scrollSlider = scrollSlider;
window.openRoomModal = openRoomModal;
window.closeRoomModal = closeRoomModal;
window.prefillBooking = prefillBooking;
window.quickBook = quickBook;
window.startSaleTimerInto = startSaleTimerInto;
window.selectCalendarDay = selectCalendarDay;
window.changeMonth = changeMonth;
window.updateWeatherWidgetForDate = updateWeatherWidgetForDate;
window.votePoll = votePoll;
