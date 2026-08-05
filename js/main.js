/* ==========================================================================
   MAIN APPLICATION CONTROLLER - ANGSHUKK PORTFOLIO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initMobileMenu();
  initThemeToggle();
  initAudioControls();
  initCreepBgmControls();
  initSkillsSection();
  initGuitarInteractions();
  initGoalsRoadmap();
  initScrollAnimations();
  initRonaldoQuoteSpeech();
});

/* --- 0. MOBILE NAVIGATION MENU --- */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
  if (!menuBtn || !overlay) return;

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
    menuBtn.classList.toggle('active', isOpen);
    overlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    menuBtn.classList.remove('active');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', toggleMenu);

  // Close menu when a nav link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu when clicking the overlay backdrop
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === overlay.querySelector('::before')) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });

  // Close menu on window resize past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) {
      closeMenu();
    }
  });
}


/* --- 1. DYNAMIC BACKGROUND PARTICLES CANVAS --- */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  const particles = [];
  const particleCount = 45;
  const symbols = ['🎵', '🎶', '🎸', '⚽', '✨', '⭐', '💫'];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 16 + 10;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = (Math.random() - 0.5) * 0.6;
      this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
      this.alpha = Math.random() * 0.4 + 0.1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.font = `${this.size}px sans-serif`;
      ctx.fillText(this.symbol, this.x, this.y);
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* --- 2. THEME TOGGLER (MIDNIGHT / CYBER / EMERALD) --- */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;

  const themes = ['midnight', 'cyber', 'emerald'];
  let currentThemeIdx = 0;

  themeBtn.addEventListener('click', () => {
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    const selectedTheme = themes[currentThemeIdx];

    if (selectedTheme === 'midnight') {
      document.documentElement.removeAttribute('data-theme');
      themeBtn.innerHTML = '🌙';
    } else if (selectedTheme === 'cyber') {
      document.documentElement.setAttribute('data-theme', 'cyber');
      themeBtn.innerHTML = '🔮';
    } else {
      document.documentElement.setAttribute('data-theme', 'emerald');
      themeBtn.innerHTML = '⚽';
    }
  });
}

/* --- 3. AUDIO CONTROLS & MUTE TOGGLE --- */
function initAudioControls() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (!soundBtn) return;

  soundBtn.addEventListener('click', () => {
    if (window.guitarSynth) {
      const isMuted = window.guitarSynth.toggleMute();
      soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
      soundBtn.title = isMuted ? 'Unmute Audio' : 'Mute Audio';
    }
  });
}

/* --- 4. RADIOHEAD "CREEP" BGM CONTROLS --- */
function initCreepBgmControls() {
  const bgmBtn = document.getElementById('creep-bgm-btn');
  const heroBgmBtn = document.getElementById('hero-play-creep-btn');
  const bgmIcon = document.getElementById('creep-bgm-icon');
  const bgmText = document.getElementById('creep-bgm-text');

  function toggleCreep() {
    if (!window.guitarSynth) return;
    const isPlaying = window.guitarSynth.toggleCreepBgm();

    if (isPlaying) {
      if (bgmIcon) bgmIcon.textContent = '⏸';
      if (bgmText) bgmText.textContent = 'Pause "Creep"';
      if (heroBgmBtn) heroBgmBtn.querySelector('span').textContent = '⏸ Pause "Creep" BGM';
    } else {
      if (bgmIcon) bgmIcon.textContent = '🎵';
      if (bgmText) bgmText.textContent = 'Play "Creep"';
      if (heroBgmBtn) heroBgmBtn.querySelector('span').textContent = '🎸 Play "Creep" BGM';
    }
  }

  if (bgmBtn) bgmBtn.addEventListener('click', toggleCreep);
  if (heroBgmBtn) heroBgmBtn.addEventListener('click', toggleCreep);
}

/* --- 5. SKILLS SECTION & PROGRESS ANIMATION --- */
function initSkillsSection() {
  const skillCards = document.querySelectorAll('.skill-card');
  const tabBtns = document.querySelectorAll('.skills-tabs .tab-btn');

  // Trigger bar animations on scroll into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fillBar = entry.target.querySelector('.skill-bar-fill');
        const targetWidth = entry.target.dataset.level || '85%';
        if (fillBar) fillBar.style.width = targetWidth;
      }
    });
  }, { threshold: 0.2 });

  skillCards.forEach(card => observer.observe(card));

  // Category Filtering
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      skillCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --- 6. GUITAR INTERACTION LISTENERS --- */
function initGuitarInteractions() {
  const stringRows = document.querySelectorAll('.string-row');
  const chordBtns = document.querySelectorAll('.chord-btn');
  const toneBtns = document.querySelectorAll('.tone-btn');

  // String Pluck on hover & click
  stringRows.forEach(row => {
    const stringName = row.dataset.string;

    const pluck = () => {
      if (window.guitarSynth) {
        window.guitarSynth.pluckString(stringName);
      }
      const wire = row.querySelector('.string-wire');
      if (wire) {
        wire.classList.add('vibrating');
        setTimeout(() => wire.classList.remove('vibrating'), 400);
      }
    };

    row.addEventListener('click', pluck);
    row.addEventListener('mouseenter', (e) => {
      if (e.buttons === 1) pluck();
    });
  });

  // Chord Strum Buttons
  chordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const chord = btn.dataset.chord;
      if (window.guitarSynth) {
        window.guitarSynth.strumChord(chord);
      }
      btn.classList.add('playing');
      setTimeout(() => btn.classList.remove('playing'), 600);
    });
  });

  // Tone Switcher (Acoustic / Electric / Ambient)
  toneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toneBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tone = btn.dataset.tone;
      if (window.guitarSynth) {
        window.guitarSynth.setTone(tone);
      }
    });
  });
}

/* --- 7. GOALS ROADMAP TIMELINE TOGGLE --- */
function initGoalsRoadmap() {
  const goalTabs = document.querySelectorAll('.goals-toggle .tab-btn');
  const roadmapContainer = document.getElementById('roadmap-container');

  const goalsData = {
    short: [
      { title: 'Improve at Football & Guitar Solos', icon: '⚽🎸', desc: 'Dedicated to elevating match performance on the pitch and mastering electric guitar solos with precision and emotion.' },
      { title: 'Elevate Football Performance', icon: '⚽', desc: 'Refine agility, dribbling, precision passing, and match stamina in team training.' },
      { title: 'Master Advanced Guitar Techniques', icon: '🎸', desc: 'Expand chord repertoire, fingerpicking patterns, and solo performance capabilities.' },
      { title: 'Skill Competitions & Learning', icon: '🏆', desc: 'Participate in inter-school events, coding workshops, and leadership seminars.' }
    ],
    long: [
      { title: 'Stay Determined', icon: '🔥', desc: 'Maintain unwavering dedication, grit, and continuous self-improvement across all academic, athletic, and musical pursuits.' }
    ]
  };

  function renderGoals(type) {
    if (!roadmapContainer) return;
    const items = goalsData[type] || goalsData.short;

    roadmapContainer.innerHTML = items.map((g, idx) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="glass-card timeline-card">
          <h3><span>${g.icon}</span> ${g.title}</h3>
          <p>${g.desc}</p>
        </div>
      </div>
    `).join('');
  }

  renderGoals('short');

  goalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      goalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderGoals(tab.dataset.target);
    });
  });
}

/* --- 8. SMOOTH SCROLL OBSERVER --- */
function initScrollAnimations() {
  const navLinks = document.querySelectorAll('.nav-links a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --- 9. RONALDO QUOTE - CLICK TO PLAY AUDIO CLIP --- */
function initRonaldoQuoteSpeech() {
  const quoteCard = document.getElementById('ronaldo-quote-card');
  const speakerHint = document.getElementById('quote-speaker-hint');
  const audioBars = document.getElementById('quote-audio-bars');
  const speakerIcon = document.getElementById('quote-speaker-icon');
  if (!quoteCard) return;

  // Preload the Ronaldo audio clip
  const ronaldoAudio = new Audio('assets/audio/ronaldo-quote.mp3');
  ronaldoAudio.preload = 'auto';
  let isPlaying = false;

  quoteCard.addEventListener('click', () => {
    if (isPlaying) {
      // If already playing, stop and reset
      ronaldoAudio.pause();
      ronaldoAudio.currentTime = 0;
      isPlaying = false;
      quoteCard.classList.remove('speaking');
      if (speakerHint) speakerHint.style.display = 'flex';
      if (audioBars) audioBars.style.display = 'none';
      if (speakerIcon) speakerIcon.textContent = '🔊';
      return;
    }

    // Reset to start and play
    ronaldoAudio.currentTime = 0;

    ronaldoAudio.play().then(() => {
      isPlaying = true;
      quoteCard.classList.add('speaking');
      if (speakerHint) speakerHint.style.display = 'none';
      if (audioBars) audioBars.style.display = 'flex';
      if (speakerIcon) speakerIcon.textContent = '🗣️';
    }).catch(err => {
      console.warn('Audio playback failed:', err);
    });
  });

  ronaldoAudio.addEventListener('ended', () => {
    isPlaying = false;
    quoteCard.classList.remove('speaking');
    if (speakerHint) speakerHint.style.display = 'flex';
    if (audioBars) audioBars.style.display = 'none';
    if (speakerIcon) speakerIcon.textContent = '🔊';
  });

  ronaldoAudio.addEventListener('error', () => {
    isPlaying = false;
    quoteCard.classList.remove('speaking');
    if (speakerHint) speakerHint.style.display = 'flex';
    if (audioBars) audioBars.style.display = 'none';
    if (speakerIcon) speakerIcon.textContent = '🔊';
    console.warn('Failed to load Ronaldo audio clip.');
  });
}
