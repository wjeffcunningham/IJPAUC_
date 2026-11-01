// Link score. Main-page links count 1; dossier links (data-id "dos-…") count 0.01.
// Totals from the link audit of November 1st, 2026: 98 main-page links, 109 dossier links.
const LINK_TOTAL_MAIN = 98;
const LINK_TOTAL_DOSSIER = 109;
// Shown out of 101: 98 main-page links + 2 points reserved for bonuses (TBA) + 1 for the 109 dossier links.
// Reachable now: 98 + 1.09 = 99.09. Technical maximum once bonuses exist: 101.09.
const LINK_SCORE_SHOWN_OUT_OF = 101;
const linkWeight = id => (String(id).indexOf('dos-') === 0 ? 0.01 : 1);
const linkFmt = n => (Math.round(n * 100) / 100).toFixed(Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2);
window.linkScore = function () {
  let v = [];
  try { v = JSON.parse(localStorage.getItem('visitedLinks')) || []; } catch (e) {}
  return Math.round(v.reduce((n, id) => n + (id ? linkWeight(id) : 0), 0) * 100) / 100;
};

document.addEventListener('DOMContentLoaded', () => {
  const totalLinks = LINK_SCORE_SHOWN_OUT_OF;
  const storageKey = 'visitedLinks';
  const scoreElement = document.getElementById('score');
  const audioToggle = document.getElementById('audio-toggle');
  const chime = document.getElementById('score-chime');

  let visited = JSON.parse(localStorage.getItem(storageKey)) || [];

  function updateScore() {
    if (scoreElement) {
      scoreElement.textContent = `Score: ${linkFmt(window.linkScore())}/${linkFmt(totalLinks)}`;
    }
  }

  updateScore();

  document.querySelectorAll('.track-link').forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const id = link.dataset.id;
      let delay = 50;

      if (id && !visited.includes(id)) {
        visited.push(id);
        localStorage.setItem(storageKey, JSON.stringify(visited));
        updateScore();

        // 🔔 Pulse animation
        if (scoreElement) {
          scoreElement.classList.add('pulse');
          setTimeout(() => scoreElement.classList.remove('pulse'), 500);
        }

        // 🔊 Play sound if enabled
        if (audioToggle?.checked && chime && localStorage.getItem('radar-mute') !== 'true') {
          chime.currentTime = 0;
          chime.play().catch(() => {});
          delay = 450; // let the chime be heard before leaving the page
        }
      }

      setTimeout(() => {
        window.location.href = link.href;
      }, delay);
    });
  });
});
