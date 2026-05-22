/* ═══════════════════════════════════════════════════════
   RILEY SÜPER OPERASYONEL ENGINE — TAM SÜRÜM v6
════════════════════════════════════════════════════════ */

const EMOTIONS = {
  joy: { label: 'Neşe', color: '#ffd700', emo: '💛' },
  sadness: { label: 'Üzüntü', color: '#00bfff', emo: '💙' },
  anger: { label: 'Öfke', color: '#ff3333', emo: '❤️' },
  disgust: { label: 'Tiksinti', color: '#32cd32', emo: '💚' },
  fear: { label: 'Korku', color: '#9370db', emo: '💜' },
  anxiety: { label: 'Kaygı', color: '#ff7f50', emo: '🧡' },
  envy: { label: 'Kıskançlık', color: '#00ced1', emo: '🌀' },
  embarrassment: { label: 'Utanç', color: '#ffb6c1', emo: '🌸' },
  ennui: { label: 'Bıkkınlık', color: '#7a22cf', emo: '🔮' },
  serenity: { label: 'Huzur', color: '#ffffff', emo: '🤍' },
  trust: { label: 'Güven', color: '#1e3a8a', emo: '🔷' },
  hope: { label: 'Umut', color: '#7fff00', emo: '🌿' },
  love: { label: 'Sevgi', color: '#ff3377', emo: '💖' },
  excitement: { label: 'Heyecan', color: '#ffcc00', emo: '✨' },
  loneliness: { label: 'Yalnızlık', color: '#222222', emo: '🖤' },
  guilt: { label: 'Suçluluk', color: '#8b4513', emo: '🟤' },
  admiration: { label: 'Hayranlık', color: '#d8bfd8', emo: '🍇' },
  indecision: { label: 'Kararsızlık', color: '#808080', emo: '⚙️' },
  pride: { label: 'Gurur', color: '#cd7f32', emo: '👑' },
  longing: { label: 'Özlem', color: '#c8a2c8', emo: '🎐' }
};

let activeColor = null, activeEmotionKey = null, isDrawing = false;
let selectedDateStr = new Date().toDateString();
let currentMonth = new Date().getMonth(), currentYear = new Date().getFullYear();
let carouselAngle = 0, isDraggingCarousel = false, startX = 0;

let currentDistribution = {};
Object.keys(EMOTIONS).forEach(k => currentDistribution[k] = 0);

let paintedMemories = JSON.parse(localStorage.getItem('riley_final_memories')) || [];
let dailyPhotos = JSON.parse(localStorage.getItem('riley_final_photos')) || {}; 
let userProfileName = localStorage.getItem('riley_user_name') || "";

const canvas = document.getElementById('orbCanvas');
const ctx = canvas.getContext('2d');

// 👤 PROFİL YÖNETİMİ
function checkUserProfile() {
  const modal = document.getElementById('profileSetupModal');
  const mainTitle = document.getElementById('appMainTitle');
  if (!userProfileName) {
    modal.classList.add('show');
  } else {
    modal.classList.remove('show');
    mainTitle.innerHTML = `🧠 Riley — <span>${userProfileName}</span>`;
  }
}
function saveUserProfile() {
  const name = document.getElementById('usernameInput').value.trim();
  if (!name) return;
  localStorage.setItem('riley_user_name', name);
  userProfileName = name;
  checkUserProfile();
  render3DCarousel();
}
function resetProfileName() {
  if(confirm("Profil adını değiştirmek istiyor musun? 👤")) {
    localStorage.removeItem('riley_user_name'); userProfileName = "";
    document.getElementById('usernameInput').value = ""; checkUserProfile();
  }
}

// 📱 SEKME GEÇİŞ MOTORU
function switchTab(tabId, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  el.classList.add('active');
  if (tabId === 'mind') render3DCarousel();
  if (tabId === 'memories') { renderMemoriesFeed(); loadDailyPhoto(); }
}

// 🖌️ AKILLI SAYAÇLI FIRÇA SİSTEMİ (ZİHİN SAYFASI)
function initCanvas() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  updateTotalHTML();
}
function getCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: ((clientX - rect.left) / rect.width) * canvas.width, y: ((clientY - rect.top) / rect.height) * canvas.height };
}
function draw(e) {
  if (!isDrawing || !activeColor) return;
  e.preventDefault();
  const coords = getCoords(e);

  ctx.beginPath(); ctx.arc(coords.x, coords.y, 16, 0, Math.PI * 2);
  ctx.fillStyle = activeColor; ctx.shadowBlur = 22; ctx.shadowColor = activeColor;
  ctx.globalAlpha = 0.18; ctx.fill();

  const total = Object.values(currentDistribution).reduce((a, b) => a + b, 0);
  if (total < 100) {
    currentDistribution[activeEmotionKey] = Math.min(100, currentDistribution[activeEmotionKey] + 1);
  } else if (currentDistribution[activeEmotionKey] < 100) {
    // Akıllı Yer Değiştirme (Pay Çalma)
    const others = Object.keys(currentDistribution).filter(k => k !== activeEmotionKey && currentDistribution[k] > 0);
    if (others.length > 0) {
      others.sort((a, b) => currentDistribution[b] - currentDistribution[a]);
      currentDistribution[others[0]] -= 1; currentDistribution[activeEmotionKey] += 1;
    }
  }
  updateTotalHTML(); updateOuterGlow();
}
function updateOuterGlow() {
  const activeEmotions = Object.keys(currentDistribution).filter(k => currentDistribution[k] > 0);
  if(activeEmotions.length > 0) {
    activeEmotions.sort((a, b) => currentDistribution[b] - currentDistribution[a]);
    document.getElementById('orbContainer').style.boxShadow = `0 0 25px ${EMOTIONS[activeEmotions[0]].color}, inset -8px -8px 20px rgba(0,0,0,0.7)`;
  }
}

canvas.addEventListener('mousedown', () => isDrawing = true);
canvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('touchstart', (e) => { isDrawing = true; draw(e); });
canvas.addEventListener('touchmove', draw);
window.addEventListener('touchend', () => isDrawing = false);

function clearCanvas() {
  ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; ctx.clearRect(0, 0, canvas.width, canvas.height);
  Object.keys(currentDistribution).forEach(k => currentDistribution[k] = 0);
  initCanvas();
  document.getElementById('orbContainer').style.boxShadow = 'inset -8px -8px 20px rgba(0,0,0,0.6)';
}

function renderBrushes() {
  const wrapper = document.getElementById('brushWrapper');
  wrapper.innerHTML = Object.keys(EMOTIONS).map(key => {
    return `<div class="brush-card" id="brush-${key}" onclick="selectBrush('${key}')"><div class="brush-preview" style="background: ${EMOTIONS[key].color}"></div><div class="brush-label" style="color: ${EMOTIONS[key].color==='#ffffff'?'#aaa':EMOTIONS[key].color}">${EMOTIONS[key].label}</div></div>`;
  }).join('');
}
function selectBrush(key) {
  activeEmotionKey = key; activeColor = EMOTIONS[key].color;
  document.querySelectorAll('.brush-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`brush-${key}`).classList.add('active');
  const lbl = document.getElementById('activeBrushLabel');
  lbl.textContent = `${EMOTIONS[key].emo} ${EMOTIONS[key].label}`; lbl.style.color = EMOTIONS[key].color;
}

function updateTotalHTML() {
  const total = Object.values(currentDistribution).reduce((a, b) => a + b, 0);
  const badge = document.getElementById('totalBadge');
  const btn = document.getElementById('submitBtn');
  const orbBtn = document.getElementById('submitOrbBtn');
  
  if(badge) badge.textContent = `%${total} / %100`;
  
  if(total === 100) {
    if(badge) badge.className = "total-badge full";
    if(btn) { btn.style.opacity = "1"; btn.style.pointerEvents = "auto"; }
    if(orbBtn) { orbBtn.style.opacity = "1"; orbBtn.style.pointerEvents = "auto"; }
  } else {
    if(badge) badge.className = "total-badge";
    if(btn) { btn.style.opacity = "0.4"; btn.style.pointerEvents = "none"; }
    if(orbBtn) { orbBtn.style.opacity = "0.4"; orbBtn.style.pointerEvents = "none"; }
  }
}

// 🔮 1. SAYFADAN SADECE KÜREYİ KAYDETME BUTON MOTORU
function saveOnlyOrb() {
  const total = Object.values(currentDistribution).reduce((a, b) => a + b, 0);
  if (total < 100) { alert("Küreye gönderebilmek için duygu dağılımının %100 olması gerekiyor! 🔮"); return; }

  const dataURL = canvas.toDataURL();
  const sortedEmos = Object.keys(currentDistribution).filter(k => currentDistribution[k] > 0).sort((a,b) => currentDistribution[b] - currentDistribution[a]);
  const dominantKey = sortedEmos[0] || 'joy';

  const newMemory = {
    id: Date.now(), text: "Bu güne ait sadece duygu küresi çizildi, günlük yazısı bırakılmadı. 🌌", orbImage: dataURL, distribution: { ...currentDistribution },
    dominant: { label: EMOTIONS[dominantKey].label, emo: EMOTIONS[dominantKey].emo, color: EMOTIONS[dominantKey].color },
    targetDate: selectedDateStr, dateLabel: new Date(selectedDateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  };

  paintedMemories.push(newMemory);
  localStorage.setItem('riley_final_memories', JSON.stringify(paintedMemories));
  clearCanvas(); render3DCarousel();
  alert("Küre başarıyla Zihin Sarayı sarmalına fırlatıldı! 🚀🔮");
}

// ✍️ 3. SAYFADAN SADECE GÜNLÜK NOTUNU KAYDETME BUTON MOTORU
function saveDiaryEntry() {
  const input = document.getElementById('noteInput');
  const text = input.value.trim();
  if(!text) { alert("Lütfen önce günlüğüne o günkü anılarını yaz Nisa! ✍️"); return; }

  const newMemory = {
    id: Date.now(), text: text,
    orbImage: "https://cdn-icons-png.flaticon.com/512/3067/3067362.png", // Yazı için şık sabit logo
    distribution: { 'serenity': 100 },
    dominant: { label: 'Günlük', emo: '✍️', color: '#7c3aed' },
    targetDate: selectedDateStr, dateLabel: new Date(selectedDateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  };

  paintedMemories.push(newMemory);
  localStorage.setItem('riley_final_memories', JSON.stringify(paintedMemories));
  input.value = ''; render3DCarousel();
  alert("Günlük kaydın başarıyla zihne işlendi! 📝");
  switchTab('mind', document.querySelectorAll('.nav-item')[0]);
}

// 🌀 3D CAROUSEL SARMAL MOTORU
function render3DCarousel() {
  const track = document.getElementById('carouselTrack');
  if(!track) return; track.innerHTML = '';
  if(paintedMemories.length === 0) { track.innerHTML = `<div style="position:absolute; width:220px; text-align:center; left:-85px; font-size:0.8rem; opacity:0.4;">Zihnin henüz bomboş ${userProfileName || 'Nisa'}... 🌸</div>`; return; }
  const radius = 110;
  paintedMemories.forEach((mem, index) => {
    const angle = (index / paintedMemories.length) * 360;
    const orb = document.createElement('div');
    orb.className = 'carousel-item-orb';
    if(mem.orbImage.startsWith('data:')) { orb.style.background = `url(${mem.orbImage})`; } 
    else { orb.style.background = `radial-gradient(circle, #7c3aed 0%, #0a0e29 100%)`; }
    orb.style.backgroundSize = 'cover';
    orb.style.boxShadow = `0 0 15px ${mem.dominant.color}, inset -5px -5px 12px rgba(0,0,0,0.6)`;
    orb.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    orb.onclick = () => showMemoryDetails(mem.id);
    track.appendChild(orb);
  });
  rotateCarousel(0);
}
function rotateCarousel(deltaX) { carouselAngle += deltaX * 0.4; const track = document.getElementById('carouselTrack'); if(track) track.style.transform = `rotateY(${carouselAngle}deg)`; }

const container = document.getElementById('carouselContainer');
container.addEventListener('mousedown', (e) => { isDraggingCarousel = true; startX = e.clientX; });
window.addEventListener('mousemove', (e) => { if(!isDraggingCarousel) return; const dx = e.clientX - startX; startX = e.clientX; rotateCarousel(dx); });
window.addEventListener('mouseup', () => isDraggingCarousel = false);
container.addEventListener('touchstart', (e) => { isDraggingCarousel = true; startX = e.touches[0].clientX; });
container.addEventListener('touchmove', (e) => { if(!isDraggingCarousel) return; const dx = e.touches[0].clientX - startX; startX = e.touches[0].clientX; rotateCarousel(dx); });
container.addEventListener('touchend', () => isDraggingCarousel = false);

// 📷 FOTOĞRAF & 🔍 ARAMA & 📅 TAKVİM
function triggerPhotoUpload() { document.getElementById('photoUploadInput').click(); }
function handlePhotoUpload(e) { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = function(event) { dailyPhotos[selectedDateStr] = event.target.result; localStorage.setItem('riley_final_photos', JSON.stringify(dailyPhotos)); loadDailyPhoto(); }; reader.readAsDataURL(file); }
function loadDailyPhoto() { const img = document.getElementById('dailyPhotoImg'); const overlay = document.getElementById('photoOverlay'); const savedPhoto = dailyPhotos[selectedDateStr]; if(savedPhoto) { img.src = savedPhoto; img.style.display = 'block'; overlay.style.display = 'none'; } else { img.style.display = 'none'; overlay.style.display = 'flex'; } }
function renderMemoriesFeed(filterText = '') { const feed = document.getElementById('memoriesFeed'); if(!feed) return; let filtered = filterText ? paintedMemories.filter(m => m.text.toLowerCase().includes(filterText.toLowerCase())) : paintedMemories.filter(m => m.targetDate === selectedDateStr); if(filtered.length === 0) { feed.innerHTML = `<div style="text-align:center; font-size:0.8rem; opacity:0.4; padding:20px;">Anı bulunamadı... 🌸</div>`; return; } feed.innerHTML = filtered.map(mem => `<div class="memory-card-row" onclick="showMemoryDetails(${mem.id})"><div class="row-orb-img" style="background: ${mem.orbImage.startsWith('data:')?`url(${mem.orbImage})`:`radial-gradient(circle, #7c3aed, #000)`}; background-size:cover; box-shadow: 0 0 10px ${mem.dominant.color}"></div><div class="row-content"><div class="row-date">${mem.dateLabel} — Baskın: ${mem.dominant.emo} ${mem.dominant.label}</div><div class="row-text">${mem.text.substring(0, 60)}${mem.text.length > 60 ? '...' : ''}</div></div></div>`).join(''); }
function searchMemories() { renderMemoriesFeed(document.getElementById('searchInput').value); }
function openCalendarModal() { document.getElementById('calendarModal').classList.add('show'); renderModalCalendar(); }
function closeCalendarModal() { document.getElementById('calendarModal').classList.remove('show'); }
function renderModalCalendar() { const currentMonthYear = document.getElementById('currentMonthYear'); const grid = document.getElementById('calendarGrid'); currentMonthYear.textContent = `${months[currentMonth]} ${currentYear}`; grid.innerHTML = ''; const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); for (let i = 1; i <= daysInMonth; i++) { const dObj = new Date(currentYear, currentMonth, i); const dateStr = dObj.toDateString(); const dayOrb = paintedMemories.find(m => m.targetDate === dateStr); const isCurrent = dateStr === selectedDateStr; const cell = document.createElement('div'); cell.className = `cal-day-cell ${isCurrent ? 'current-sel' : ''}`; cell.innerHTML = `<span>${i}</span>`; if(dayOrb) cell.innerHTML += `<span class="cal-mini-orb-dot" style="--d-glow: ${dayOrb.dominant.color}"></span>`; cell.onclick = () => { selectedDateStr = dateStr; document.getElementById('headerDateLabel').textContent = new Date(dateStr).toLocaleDateString('tr-TR', { day:'numeric', month:'long' }); closeCalendarModal(); render3DCarousel(); renderMemoriesFeed(); loadDailyPhoto(); }; grid.appendChild(cell); } }
function changeMonth(delta) { currentMonth += delta; if(currentMonth>11){currentMonth=0; currentYear++;} if(currentMonth<0){currentMonth=11;currentYear--;} renderModalCalendar(); }
function showMemoryDetails(id) { const mem = paintedMemories.find(m => m.id === id); if(!mem) return; const modal = document.getElementById('memoryModal'); document.getElementById('modalDate').textContent = mem.dateLabel; document.getElementById('modalText').textContent = mem.text; const breakdown = document.getElementById('modalBreakdown'); breakdown.innerHTML = Object.keys(mem.distribution).filter(k => mem.distribution[k] > 0).map(k => `<div class="b-row" style="color: ${EMOTIONS[k].color}"><span>${EMOTIONS[k].emo} ${EMOTIONS[k].label}</span><span>%${mem.distribution[k]}</span></div>`).join(''); modal.classList.add('show'); }
function closeMemoryModal() { document.getElementById('memoryModal').classList.remove('show'); }
const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
function toggleTheme() { let th = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', th); localStorage.setItem('riley_theme', th); document.getElementById('themeBtn').textContent = th === 'dark' ? '🌙' : '☀️'; }

// 🔔 KİŞİYE ÖZEL AKŞAM 22:00 BİLDİRİMİ
function start2200NotificationTimer() {
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 22 && now.getMinutes() === 0 && now.getSeconds() === 0) {
      const currentUserName = localStorage.getItem('riley_user_name') || 'Nisa';
      alert(`🔮 Riley Zihin Merkezinden Mesaj:\nMerhaba ${currentUserName}, bugün gününü doldurmaya hazır mısın? Zihnine bir küre bırakmayı unutma! 🌸`);
    }
  }, 1000);
}

if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }

window.onload = function() {
  checkUserProfile(); initCanvas(); renderBrushes(); render3DCarousel(); start2200NotificationTimer();
  document.getElementById('headerDateLabel').textContent = new Date().toLocaleDateString('tr-TR', { day:'numeric', month:'long' });
};