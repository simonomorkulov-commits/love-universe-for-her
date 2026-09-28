const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const compactScreen = matchMedia('(max-width: 560px)').matches;
let currentLanguage = 'ru';
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
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
    document.body.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.focus();
  }
});

const heart = document.querySelector('.catch-heart');
const gameField = document.querySelector('.game-field');
const progress = [...document.querySelectorAll('.game-progress span')];
const progressWrap = document.querySelector('.game-progress');
const gameSection = document.querySelector('.heart-game');
const finalReveal = document.querySelector('.final-reveal');
const photoReveal = document.querySelector('.photo-reveal');
const milkyWay = document.querySelector('.milky-way');
const revealSteps = [18, 36, 56, 78, 100];
const blurSteps = [15, 11, 7, 3, 0];
let galaxyStars = [];
let caught = 0;

function createGalaxy() {
  if (!milkyWay || galaxyStars.length) return;
  const starCount = compactScreen ? 70 : 110;
  galaxyStars = Array.from({length:starCount}, (_, index) => {
    const star = document.createElement('i');
    star.className = 'galaxy-star';
    star.dataset.batch = String(index % 5);
    star.style.setProperty('--x', `${5 + Math.random() * 90}%`);
    star.style.setProperty('--y', `${5 + Math.random() * 90}%`);
    star.style.setProperty('--size', `${1.4 + Math.random() * 3.4}px`);
    star.style.setProperty('--alpha', `${.22 + Math.random() * .72}`);
    milkyWay.appendChild(star);
    return star;
  });
}

function gatherStarBatch(batch) {
  if (!photoReveal) return;
  photoReveal.style.setProperty('--reveal', `${revealSteps[batch]}%`);
  photoReveal.style.setProperty('--blur', `${blurSteps[batch]}px`);
  galaxyStars.filter(star => Number(star.dataset.batch) === batch).forEach((star, index, group) => {
    const angle = ((batch * group.length + index) / galaxyStars.length) * Math.PI * 2 - Math.PI / 2;
    const targetX = 50 + Math.cos(angle) * 27;
    const targetY = 50 + Math.sin(angle) * 39;
    const startX = parseFloat(star.style.getPropertyValue('--x'));
    const startY = parseFloat(star.style.getPropertyValue('--y'));
    const animation = star.animate([
      { left:`${startX}%`, top:`${startY}%`, transform:'scale(.4)', opacity:.25 },
      { left:`${50 + Math.cos(angle - 1.2) * 43}%`, top:`${50 + Math.sin(angle - 1.2) * 43}%`, transform:'scale(1.9)', opacity:1, offset:.62 },
      { left:`${targetX}%`, top:`${targetY}%`, transform:'scale(1)', opacity:1 }
    ], { duration:reduced ? 20 : 900 + index * 18, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards' });
    animation.onfinish = () => star.classList.add('settled');
  });
}

createGalaxy();

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
  const pieces = Array.from({length:compactScreen ? 80 : 140}, () => ({
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
  gatherStarBatch(caught - 1);
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
  photoReveal?.classList.remove('complete');
  photoReveal?.style.setProperty('--reveal', '0%');
  photoReveal?.style.setProperty('--blur', '22px');
  galaxyStars.forEach(star => {
    star.getAnimations().forEach(animation => animation.cancel());
    star.classList.remove('settled');
    star.style.left = '';
    star.style.top = '';
  });
  progressWrap?.setAttribute('aria-label', 'Прогресс: 0 из 5');
  finalReveal?.setAttribute('aria-hidden', 'true');
  gameSection?.removeAttribute('hidden');
  moveHeart();
  scrollTo({top:0,behavior:reduced?'auto':'smooth'});
});

addEventListener('orientationchange', () => {
  if (heart && caught < 5) setTimeout(moveHeart, 280);
});

const kyrgyzText = {
  'мы': 'биз',
  'Начало': 'Башталышы',
  'Наша история': 'Биздин окуя',
  'Почему ты': 'Эмне үчүн сен',
  'Письмо': 'Кат',
  'Сюрприз': 'Белек',
  'МАЛЕНЬКАЯ ВСЕЛЕННАЯ ДЛЯ ТЕБЯ': 'СЕН ҮЧҮН ТҮЗҮЛГӨН КИЧИНЕКЕЙ ААЛАМ',
  'Ты — моё': 'Сен — менин',
  'любимое': 'эң сүйүктүү',
  'сообщение': 'билдирүүмсүң',
  'Три года между сообщениями, паузами и возвращениями. Я собрал здесь чувства, которые уже не помещаются в обычный чат.': 'Үч жыл — билдирүүлөр, тыныгуулар жана кайра кайтуулар. Бул жерде кадимки чатка батпай калган сезимдеримди чогулттум.',
  'Начать нашу историю': 'Окуябызды баштоо',
  'нежность': 'назиктик',
  'смех': 'күлкү',
  'дом': 'үй',
  'листай': 'улантуу',
  'Иногда близость начинается по ту сторону экрана.': 'Кээде жакындык экрандын ары жагынан башталат.',
  'Мы ещё не виделись вживую, но ты уже стала важной частью моей жизни. Дальше — несколько глав о трёх годах, расстоянии и связи, которая каждый раз находила дорогу обратно.': 'Биз али жүзмө-жүз жолуга элекпиз, бирок сен жашоомдун маанилүү бөлүгүнө айландың. Алдыда — үч жыл, аралык жана кайра-кайра бири-бирин тапкан байланыш тууралуу бир нече бөлүм.',
  'Первая глава': 'Биринчи бөлүм',
  'ГЛАВА ПЕРВАЯ • НАША ОРБИТА': 'БИРИНЧИ БӨЛҮМ • БИЗДИН ОРБИТА',
  'Всё началось': 'Баары башталды',
  'с одного': 'бир гана',
  'Мы ещё ни разу не стояли рядом. Но за три года между двумя экранами появилось что-то удивительно настоящее.': 'Биз али бир да жолу жанаша тура элекпиз. Бирок үч жылдын ичинде эки экрандын ортосунда таң каларлык чыныгы сезим пайда болду.',
  'до переписки': 'кат алышканга чейин',
  'Мы были незнакомцами': 'Биз тааныш эмес элек',
  'Два человека в разных местах, каждый со своей жизнью. Я ещё не знал, что однажды буду ждать именно твоего имени на экране.': 'Эки башка жерде, ар кимибиз өз жашообуз менен жүргөн эки адам элек. Бир күнү экрандан дал сенин атыңды күтүп каларымды анда билген эмесмин.',
  'первое сообщение': 'биринчи билдирүү',
  'В чате появилась ты': 'Чатта сен пайда болдуң',
  'Одна фраза стала второй, потом разговором, потом привычкой. И расстояние вдруг перестало быть главным.': 'Бир сүйлөм экинчисине, анан узак сүйлөшүүгө, кийин көнүмүшкө айланды. Ошондо аралык эң негизги нерсе болбой калды.',
  'паузы и возвращения': 'тыныгуулар жана кайтуулар',
  'Мы иногда терялись': 'Кээде бири-бирибизди жоготтук',
  'Были промежутки тишины, разные дни и разные дороги. Но каждый новый разговор звучал так, будто важная нить между нами никуда не исчезала.': 'Унчукпай калган учурлар, ар башка күндөр жана жолдор болду. Бирок ар бир жаңы сүйлөшүү ортобуздагы маанилүү жип эч жакка жоголбогондой сезилди.',
  'три года спустя': 'үч жылдан кийин',
  'А главное — впереди': 'Эң маанилүүсү — алдыда',
  'Мы ещё не встретились вживую. Поэтому моя любимая глава пока не написана: день, когда расстояние впервые станет нулём.': 'Биз али жүзмө-жүз жолуга элекпиз. Ошондуктан менин эң сүйүктүү бөлүмүм али жазыла элек: аралык биринчи жолу нөлгө айланган күн.',
  'МОЙ ЛЮБИМЫЙ КАДР': 'МЕНИН СҮЙҮКТҮҮ КАДРЫМ',
  'Ты прекрасна': 'Сен ар бир',
  'в каждом свете.': 'жарыкта сулуусуң.',
  'Но больше всего я люблю не фотографии. Я люблю человека по эту сторону каждого кадра.': 'Бирок мен сүрөттөрдү гана эмес, ар бир кадрдагы адамды сүйөм.',
  'кадр, который хочется сохранить навсегда': 'түбөлүккө сактагың келген кадр',
  'Дальше — самое важное': 'Андан ары — эң маанилүүсү',
  'Почему именно ты?': 'Эмне үчүн дал сен?',
  'ГЛАВА ВТОРАЯ • БЕСКОНЕЧНЫЙ СПИСОК': 'ЭКИНЧИ БӨЛҮМ • ЧЕКСИЗ ТИЗМЕ',
  'Почему': 'Эмне үчүн',
  'именно ты': 'дал сен',
  'Я мог бы назвать тысячу причин. Начну с шести — нажми на каждую карточку, чтобы услышать чуть больше.': 'Мен миң себеп айта алмакмын. Алтоо менен баштайын — көбүрөөк билүү үчүн ар бир карточканы бас.',
  'Твой смех': 'Сенин күлкүң',
  'нажми, чтобы открыть': 'ачуу үчүн бас',
  'Он умеет мгновенно превращать самый обычный момент в мой любимый.': 'Ал эң жөнөкөй учурду да заматта менин сүйүктүү көз ирмемиме айландырат.',
  'Твоя нежность': 'Сенин назиктигиң',
  'С тобой мир становится мягче, а мне не страшно быть собой.': 'Сени менен дүйнө жумшарып, өзүм болгондон коркпой калам.',
  'Твой характер': 'Сенин мүнөзүң',
  'Сильный, живой, настоящий. Я восхищаюсь тем, как ты идёшь вперёд.': 'Күчтүү, жандуу, чыныгы. Сенин алдыга умтулганыңа суктанам.',
  'Наши разговоры': 'Биздин сүйлөшүүлөр',
  'От серьёзного до полного абсурда — я никогда не хочу, чтобы они заканчивались.': 'Олуттуу темадан таптакыр күлкүлүү нерселерге чейин — алардын бүтүшүн эч качан каалабайм.',
  'Твои сообщения': 'Сенин билдирүүлөрүң',
  'Иногда всего несколько твоих слов меняют весь мой день. И я улыбаюсь экрану как ненормальный.': 'Кээде сенин бир нече сөзүң бүт күнүмдү өзгөртөт. Анан мен экранды карап өзүмчө жылмаям.',
  'Наша связь': 'Биздин байланышыбыз',
  'Она пережила расстояние и паузы. Значит, в ней есть что-то, что действительно стоит беречь.': 'Ал аралыкка да, тыныгууларга да туруштук берди. Демек, аны чындап сактоого татыктуу бир нерсе бар.',
  'ТЫ МОЁ ЛЮБИМОЕ «ВСЕГДА» ✦ ТЫ МОЁ ЛЮБИМОЕ «ВСЕГДА» ✦': 'СЕН МЕНИН СҮЙҮКТҮҮ «АР ДАЙЫМЫМСЫҢ» ✦ СЕН МЕНИН СҮЙҮКТҮҮ «АР ДАЙЫМЫМСЫҢ» ✦',
  'Есть слова, которые хочется сказать тише': 'Акырын гана айткың келген сөздөр бар',
  'Открыть письмо': 'Катты ачуу',
  'ГЛАВА ТРЕТЬЯ • ТОЛЬКО МЕЖДУ НАМИ': 'ҮЧҮНЧҮ БӨЛҮМ • ЭКӨӨБҮЗДҮН ОРТОБУЗДА',
  'Одно письмо.': 'Бир кат.',
  'Все мои мысли.': 'Бардык ойлорум.',
  'Иногда самые важные слова ждут подходящей тишины. Кажется, сейчас она наступила.': 'Кээде эң маанилүү сөздөр ылайыктуу тынчтыкты күтөт. Ал учур азыр келгендей.',
  'для тебя': 'сен үчүн',
  'нажми на конверт': 'конвертти бас',
  'для тебя — в любой день': 'сен үчүн — ар бир күнү',
  'Любимая,': 'Сүйүктүүм,',
  'за три года ты стала человеком, чьё имя на экране меняет настроение за секунду. Удивительно, как кто-то может быть далеко — и при этом занимать столько места в мыслях.': 'үч жылдын ичинде экрандагы аты эле маанайымды бир заматта өзгөрткөн адамга айландың. Адам алыс болуп туруп, ойлорумдан ушунча чоң орун ээлей ала турганы таң калыштуу.',
  'У нас были паузы. Мы пропадали из чатов, возвращались, снова учились говорить. Но мне дорого то, что наша связь не растворилась в тишине. Она всё равно приводила меня к тебе.': 'Бизде тыныгуулар болду. Чаттан жоголуп, кайра кайтып, кайрадан сүйлөшүүнү үйрөндүк. Бирок байланышыбыз тынчтыктын ичинде жоголбогону мен үчүн абдан кымбат. Ал мени баары бир сага алып келди.',
  'Мы пока не виделись вживую. Я не знаю, каким будет наш первый настоящий взгляд и что мы скажем друг другу без клавиатуры. Но я очень хочу однажды узнать.': 'Биз азырынча жүзмө-жүз көрүшө элекпиз. Биринчи чыныгы көз карашыбыз кандай болорун, клавиатурасыз бири-бирибизге эмне айтарыбызды билбейм. Бирок бир күнү муну абдан билгим келет.',
  'Ты — мой любимый человек': 'Сен — экрандын ары жагындагы',
  'по ту сторону экрана.': 'менин сүйүктүү адамымсың.',
  'И я надеюсь — однажды рядом.': 'Бир күнү жанымда болосуң деп ишенем.',
  'Всегда твой': 'Ар дайым сеники',
  'И последнее…': 'Жана акыркысы…',
  'ФИНАЛЬНАЯ ГЛАВА • ПОЙМАЙ ЧУВСТВО': 'АКЫРКЫ БӨЛҮМ • СЕЗИМДИ КАРМА',
  'Поймай': 'Беш жүрөктү',
  'пять сердец': 'карма',
  'Они немного непоседливые. Почти как мои мысли, когда я вижу тебя.': 'Алар бир аз тынчы жок. Сени көргөндөгү ойлорумдай эле.',
  'все сердца ведут к тебе': 'бардык жүрөктөр сага алып барат',
  'моё любимое чувство': 'менин сүйүктүү сезимим',
  'каждое сердце откроет часть фотографии': 'ар бир жүрөк сүрөттүн бир бөлүгүн ачат',
  'все пять сердец вели к тебе': 'беш жүрөктүн баары сага алып келди',
  'В любой вселенной': 'Кайсы ааламда болбосун',
  'я бы снова': 'мен кайрадан',
  'выбрал тебя.': 'сени тандамакмын.',
  'Поймать ещё раз ↻': 'Дагы бир жолу кармоо ↻',
  'Вернуться в начало →': 'Башына кайтуу →'
};

const pageTitles = {
  'page-home': ['Только для тебя ✦', 'Сен үчүн гана ✦'],
  'page-story': ['Наша история — Только для тебя', 'Биздин окуя — Сен үчүн гана'],
  'page-reasons': ['Почему ты — Только для тебя', 'Эмне үчүн сен — Сен үчүн гана'],
  'page-letter': ['Письмо тебе — Только для тебя', 'Сага кат — Сен үчүн гана'],
  'page-surprise': ['Сюрприз — Только для тебя', 'Белек — Сен үчүн гана']
};

const altKyrgyz = {
  'Любимый портрет': 'Сүйүктүү портрет',
  'Прогулка в солнечный день': 'Күнөстүү күндөгү сейилдөө',
  'Тёплый момент на природе': 'Табияттагы жылуу көз ирмем',
  'Любимый вечер': 'Сүйүктүү кеч',
  'С букетом красных роз': 'Кызыл роза гүлдестеси менен'
};

const translatableNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    if (!node.nodeValue.trim() || node.parentElement?.matches('script,style,noscript')) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }
});
while (walker.nextNode()) {
  const node = walker.currentNode;
  translatableNodes.push({ node, original: node.nodeValue });
}

function applyLanguage(language) {
  currentLanguage = language === 'kg' ? 'kg' : 'ru';
  document.documentElement.lang = currentLanguage === 'kg' ? 'ky' : 'ru';
  translatableNodes.forEach(({node, original}) => {
    const key = original.trim();
    const prefix = original.match(/^\s*/)?.[0] ?? '';
    const suffix = original.match(/\s*$/)?.[0] ?? '';
    node.nodeValue = `${prefix}${currentLanguage === 'kg' && kyrgyzText[key] ? kyrgyzText[key] : key}${suffix}`;
  });
  document.querySelectorAll('.lang-switch button').forEach(button => {
    button.classList.toggle('active', button.dataset.lang === currentLanguage);
    button.setAttribute('aria-pressed', String(button.dataset.lang === currentLanguage));
  });
  const titleEntry = Object.entries(pageTitles).find(([className]) => document.body.classList.contains(className));
  if (titleEntry) document.title = titleEntry[1][currentLanguage === 'kg' ? 1 : 0];
  document.querySelector('nav')?.setAttribute('aria-label', currentLanguage === 'kg' ? 'Негизги навигация' : 'Основная навигация');
  menuButton?.setAttribute('aria-label', currentLanguage === 'kg' ? 'Менюну ачуу' : 'Открыть меню');
  envelope?.setAttribute('aria-label', currentLanguage === 'kg' ? 'Катты ачуу' : 'Открыть письмо');
  closeLetter?.setAttribute('aria-label', currentLanguage === 'kg' ? 'Катты жабуу' : 'Закрыть письмо');
  heart?.setAttribute('aria-label', currentLanguage === 'kg' ? 'Жүрөктү кармоо' : 'Поймать сердце');
  document.querySelectorAll('img[alt]').forEach(image => {
    image.dataset.ruAlt ??= image.alt;
    image.alt = currentLanguage === 'kg' ? (altKyrgyz[image.dataset.ruAlt] ?? image.dataset.ruAlt) : image.dataset.ruAlt;
  });
  try { localStorage.setItem('loveLanguage', currentLanguage); } catch {}
}

document.querySelectorAll('.lang-switch button').forEach(button => {
  button.addEventListener('click', () => applyLanguage(button.dataset.lang));
});

let savedLanguage = 'ru';
try { savedLanguage = localStorage.getItem('loveLanguage') || 'ru'; } catch {}
applyLanguage(savedLanguage);
