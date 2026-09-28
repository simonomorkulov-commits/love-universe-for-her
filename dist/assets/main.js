const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const menuButton = document.querySelector('.menu-toggle');
menuButton?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('a[href$=".html"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || reduced) return;
    const href = link.getAttribute('href');
    if (!href || href === location.pathname.split('/').pop()) return;
    event.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(() => location.href = href, 560);
  });
});

if (!reduced) {
  const glow = document.querySelector('.cursor-glow');
  addEventListener('pointermove', e => {
    glow?.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 700, fill: 'forwards' });
  });

  const canvas = document.querySelector('#stardust');
  const ctx = canvas?.getContext('2d');
  let stars = [];
  const resize = () => {
    if (!canvas || !ctx) return;
    const ratio = Math.min(devicePixelRatio, 2);
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({length: Math.min(120, Math.floor(innerWidth / 9))}, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: Math.random() * 1.3 + .2, a: Math.random(), s: Math.random() * .012 + .004
    }));
  };
  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    stars.forEach(star => {
      star.a += star.s;
      const alpha = .15 + Math.abs(Math.sin(star.a)) * .65;
      ctx.beginPath(); ctx.arc(star.x,star.y,star.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,220,239,${alpha})`; ctx.fill();
      star.y -= .025;
      if(star.y < -3) star.y = innerHeight + 3;
    });
    requestAnimationFrame(draw);
  };
  resize(); draw(); addEventListener('resize', resize);
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .16 });
document.querySelectorAll('.observe').forEach(element => revealObserver.observe(element));

document.querySelectorAll('.reason-card').forEach(card => {
  card.addEventListener('click', () => {
    const open = card.classList.toggle('open');
    card.setAttribute('aria-pressed', String(open));
  });
});

const envelope = document.querySelector('.envelope');
const letter = document.querySelector('.love-letter');
const closeLetter = document.querySelector('.letter-close');
const showLetter = () => {
  letter?.classList.add('visible');
  letter?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('letter-open');
  closeLetter?.focus();
};
const hideLetter = () => {
  letter?.classList.remove('visible');
  letter?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('letter-open');
  envelope?.classList.remove('open');
  envelope?.focus();
};
envelope?.addEventListener('click', () => {
  envelope.classList.add('open');
  setTimeout(showLetter, reduced ? 20 : 850);
});
closeLetter?.addEventListener('click', hideLetter);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && letter?.classList.contains('visible')) hideLetter();
});

const heart = document.querySelector('.catch-heart');
const gameField = document.querySelector('.game-field');
const progress = [...document.querySelectorAll('.game-progress span')];
const progressWrap = document.querySelector('.game-progress');
const gameSection = document.querySelector('.heart-game');
const finalReveal = document.querySelector('.final-reveal');
const photoReveal = document.querySelector('.photo-reveal');
const photoPanels = [...document.querySelectorAll('.photo-veil i')];
let caught = 0;

function moveHeart() {
  if (!heart || !gameField) return;
  const pad = 16;
  const x = pad + Math.random() * Math.max(10, gameField.clientWidth - heart.offsetWidth - pad * 2);
  const y = pad + Math.random() * Math.max(10, gameField.clientHeight - heart.offsetHeight - pad * 2);
  heart.style.left = `${x + heart.offsetWidth / 2}px`;
  heart.style.top = `${y + heart.offsetHeight / 2}px`;
}

function burstConfetti() {
  if (reduced) return;
  const canvas = document.querySelector('#confetti');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  canvas.width = innerWidth * Math.min(devicePixelRatio, 2);
  canvas.height = innerHeight * Math.min(devicePixelRatio, 2);
  const scale = canvas.width / innerWidth;
  ctx.scale(scale, scale);
  const palette = ['#ff4d8d','#ff9ab9','#ad63ff','#ffffff','#ff7a72'];
  const pieces = Array.from({length:140}, () => ({
    x: innerWidth/2, y: innerHeight*.44, vx:(Math.random()-.5)*15,
    vy:-Math.random()*13-4, g:.18+Math.random()*.12, r:Math.random()*6+3,
    rot:Math.random()*6, spin:(Math.random()-.5)*.22, color:palette[Math.floor(Math.random()*palette.length)]
  }));
  let frame = 0;
  const paint = () => {
    ctx.clearRect(0,0,innerWidth,innerHeight);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.spin;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color;
      ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r); ctx.restore();
    });
    if (++frame < 260) requestAnimationFrame(paint);
  };
  paint();
}

function finishGame() {
  gameSection?.setAttribute('hidden', '');
  finalReveal?.setAttribute('aria-hidden', 'false');
  finalReveal?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  burstConfetti();
}

heart?.addEventListener('click', () => {
  if (caught >= 5) return;
  caught += 1;
  progress[caught - 1]?.classList.add('filled');
  photoPanels[caught - 1]?.classList.add('revealed');
  progressWrap?.setAttribute('aria-label', `Прогресс: ${caught} из 5`);
  heart.classList.remove('caught');
  void heart.offsetWidth;
  heart.classList.add('caught');
  if (caught === 5) {
    photoReveal?.classList.add('complete');
    setTimeout(finishGame, reduced ? 150 : 2200);
  }
  else moveHeart();
});

document.querySelector('.restart-game')?.addEventListener('click', () => {
  caught = 0;
  progress.forEach(dot => dot.classList.remove('filled'));
  photoPanels.forEach(panel => panel.classList.remove('revealed'));
  photoReveal?.classList.remove('complete');
  progressWrap?.setAttribute('aria-label', 'Прогресс: 0 из 5');
  finalReveal?.setAttribute('aria-hidden', 'true');
  gameSection?.removeAttribute('hidden');
  moveHeart();
  scrollTo({top:0,behavior:reduced?'auto':'smooth'});
});
