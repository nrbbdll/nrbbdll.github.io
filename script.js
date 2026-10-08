'use strict';

const themeButton = document.querySelector('#theme-toggle');
function syncThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.textContent = dark ? 'Light mode' : 'Dark mode';
  themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  document.querySelector('meta[name="theme-color"]').content = dark ? '#211e1e' : '#faf8f6';
}
themeButton.hidden = false;
syncThemeButton();
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('nei-theme', theme); } catch { /* Optional persistence. */ }
  syncThemeButton();
});

// Navigation stays visible when JavaScript is unavailable.
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const navLinks = [...nav.querySelectorAll('a')];
const mobile = window.matchMedia('(max-width: 800px)');

function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.menu-label').textContent = 'Menu';
  nav.classList.remove('is-open');
  if (returnFocus) menuButton.focus();
}
menuButton.hidden = false;
header.classList.add('nav-ready');
menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  if (!opening) return closeMenu();
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.querySelector('.menu-label').textContent = 'Close';
  nav.classList.add('is-open');
});
navLinks.forEach(link => link.addEventListener('click', () => {
  closeMenu();
  if (mobile.matches) {
    const section = document.querySelector(link.hash);
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  }
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) closeMenu(); });
mobile.addEventListener('change', () => closeMenu());

// Update the active section with one scheduled layout read per frame.
const sections = [...document.querySelectorAll('main > section')];
let navFrame = 0;
function updateCurrentSection() {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
  const marker = window.innerHeight * 0.35;
  let active = 'home';
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= marker) active = section.id;
  }
  if (active === 'focus') active = 'about';
  navLinks.forEach(link => {
    if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  navFrame = 0;
}
window.addEventListener('scroll', () => { if (!navFrame) navFrame = requestAnimationFrame(updateCurrentSection); }, { passive: true });
window.addEventListener('resize', updateCurrentSection);
updateCurrentSection();
document.querySelector('#year').textContent = new Date().getFullYear();

// Motion is opt-in: the device poster is useful before any video download.
const video = document.querySelector('#pixel-video');
const playButton = document.querySelector('.video-toggle');
const mediaError = document.querySelector('.media-error');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
video.controls = false;
playButton.hidden = false;
function syncPlaybackButton() {
  playButton.innerHTML = video.paused ? '<span aria-hidden="true">â–·</span> Play preview' : '<span aria-hidden="true">â…¡</span> Pause preview';
}
playButton.addEventListener('click', async () => {
  if (!video.paused) return video.pause();
  try { await video.play(); } catch { mediaError.hidden = false; }
});
video.addEventListener('play', syncPlaybackButton);
video.addEventListener('pause', syncPlaybackButton);
video.addEventListener('error', () => { mediaError.hidden = false; playButton.hidden = true; });
video.querySelector('source').addEventListener('error', () => { mediaError.hidden = false; playButton.hidden = true; });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) video.pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { if (!entries[0].isIntersecting) video.pause(); }, { threshold: 0.1 }).observe(video);
}

// Decorative section bands can be paused independently of the video.
const motionButton = document.querySelector('#motion-toggle');
let motionPaused = reducedMotion.matches;
function syncMotion() {
  const paused = motionPaused || reducedMotion.matches;
  document.body.dataset.motion = paused ? 'paused' : 'playing';
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = reducedMotion.matches ? 'Reduced motion on' : paused ? 'Resume motion' : 'Pause motion';
  motionButton.disabled = reducedMotion.matches;
}
motionButton.hidden = false;
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; syncMotion(); });
reducedMotion.addEventListener('change', syncMotion);
syncMotion();
