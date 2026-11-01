// ========== AUDIO UNLOCK ==========
window.audioReady = false;
document.addEventListener("click", () => {
  window.audioReady = true;
  sessionStorage.setItem("audioReady", "true");
});
window.audioReady = sessionStorage.getItem("audioReady") === "true";

// ========== MAIN INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. MENU NAV TOGGLE LOGIC ---
  const menuToggle = document.getElementById("menu-btn");
  const menuLinks = document.querySelectorAll(".nav-link");

  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.checked = false;

      const sectionId = link.getAttribute("href").substring(1);
      const toggleId = sectionId.replace("section-", "handle-");
      const sectionToggle = document.getElementById(toggleId);
      if (sectionToggle) {
        sectionToggle.checked = true;
      }
    });
  });

  // --- 2. SYNC MAGNIFY TOGGLES ---
  const menuMagnify = document.getElementById("toggle-pa");
  const mainMagnify = document.getElementById("magnify-toggle");

  menuMagnify?.addEventListener("change", () => {
    if (mainMagnify && mainMagnify.checked !== menuMagnify.checked) {
      mainMagnify.checked = menuMagnify.checked;
    }
  });

  mainMagnify?.addEventListener("change", () => {
    if (menuMagnify && menuMagnify.checked !== mainMagnify.checked) {
      menuMagnify.checked = mainMagnify.checked;
    }
  });

  // --- 3. RESTORE CHECKBOX STATE ---
const persistIds = ['toggle-pa', 'toggle-ci', 'toggle-ch', 'toggle-x', 'audio-toggle', 'magnify-toggle'];

persistIds.forEach(id => {
  const el = document.getElementById(id);
  const saved = localStorage.getItem(id);
  if (el && saved !== null) el.checked = saved === 'true';

  if (el) {
    el.addEventListener('change', () => {
      localStorage.setItem(id, el.checked);
    });
  }
});

  // --- 4. SCORE + CHIME LOGIC ---
  const totalLinks = 101;
  const storageKey = 'visitedLinks';
  const scoreElement = document.getElementById('score');
  const musicToggle = document.getElementById('music-toggle');
  const chime = document.getElementById('score-chime');

  const visited = JSON.parse(localStorage.getItem(storageKey)) || [];
  const previousCount = parseInt(scoreElement?.textContent) || 0;
  const newCount = visited.length;

  if (scoreElement) {
    scoreElement.textContent = `${newCount}/${totalLinks}`;
  }

  if (newCount > previousCount && window.audioReady && chime && localStorage.getItem('radar-mute') !== 'true') {
    scoreElement.classList.add('pulse');
    setTimeout(() => scoreElement.classList.remove('pulse'), 600);
    chime.currentTime = 0;
    chime.play().catch(() => {});
  }

  document.querySelectorAll('.track-link').forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const id = link.dataset.id;

      if (!visited.includes(id)) {
        visited.push(id);
        localStorage.setItem(storageKey, JSON.stringify(visited));
      }

      setTimeout(() => {
        window.location.href = link.href;
      }, 50);
    });
  });
});

// Hero clip (as on YIJPAUC): where autoplay is refused (iOS Low Power Mode,
// data saver), swap in the animated GIF named by data-fallback.
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('hero-media');
  if (!hero || hero.tagName !== 'VIDEO' || !hero.dataset.fallback) return;
  let swapped = false;
  const swap = () => {
    if (swapped || !hero.paused) return;
    swapped = true;
    const img = document.createElement('img');
    img.src = hero.dataset.fallback;
    img.alt = hero.dataset.fallbackAlt || '';
    img.id = 'hero-media';
    img.className = 'hero-media';
    hero.replaceWith(img);
  };
  const playing = hero.play();
  if (playing) playing.catch(swap);
  // Safari can leave a muted autoplay clip sitting paused without
  // rejecting play(). Once the clip has data and still isn't playing,
  // fall back; if no data arrives at all, fall back after 8 seconds.
  const check = () => setTimeout(swap, 600);
  if (hero.readyState >= 3) check();
  else hero.addEventListener('canplay', check, { once: true });
  setTimeout(() => { if (hero.readyState < 2) swap(); }, 8000);
});
