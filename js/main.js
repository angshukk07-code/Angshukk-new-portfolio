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

/* --- 6. 22-FRET INTERACTIVE VIRTUAL GUITAR CONTROLLER --- */
function initGuitarInteractions() {
  const fretboardContainer = document.getElementById('guitar-fretboard');
  const toneBtns = document.querySelectorAll('.tone-btn');
  const techPalmMuteBtn = document.getElementById('tech-palm-mute');
  const techHarmonicsBtn = document.getElementById('tech-harmonics');
  const techSustainBtn = document.getElementById('tech-sustain');
  const muteAllBtn = document.getElementById('guitar-mute-all-btn');
  const chordHudText = document.getElementById('detected-chord-text');
  const chordBtns = document.querySelectorAll('.chord-btn');

  if (!fretboardContainer) return;

  // Active Fretboard State (String index 0..5 -> Fret number 0..22; null if unplayed)
  const activeFretState = [null, null, null, null, null, null];
  let isPointerDown = false;
  let lastDraggedString = null;
  let lastDraggedFret = null;
  let lastDragTime = 0;
  let lastPointerX = 0;

  /* 1. Generate 22 Frets for each of the 6 string rows */
  const stringRows = document.querySelectorAll('.fretboard-string-row');
  stringRows.forEach(row => {
    const stringIdx = parseInt(row.dataset.stringIdx, 10);

    // Explicitly set stringIdx on open fret cell (NUT / Fret 0)
    const openCell = row.querySelector('.open-fret');
    if (openCell) {
      openCell.dataset.stringIdx = stringIdx;
    }

    const container = row.querySelector('.fret-cells-container');
    if (!container) return;

    // Clear existing cells if any
    container.innerHTML = '';

    for (let fret = 1; fret <= 22; fret++) {
      const fretCell = document.createElement('div');
      fretCell.className = 'fret-cell';
      fretCell.dataset.stringIdx = stringIdx;
      fretCell.dataset.fret = fret;
      fretCell.title = `String ${stringIdx + 1}, Fret ${fret}`;

      const wire = document.createElement('div');
      wire.className = `string-wire string-gauge-${stringIdx + 1}`;
      fretCell.appendChild(wire);

      container.appendChild(fretCell);
    }
  });

  /* Helper: Get String Index and Fret Number safely from element */
  function getCellData(cell) {
    if (!cell) return null;
    const stringRow = cell.closest('.fretboard-string-row');
    const stringIdx = parseInt(cell.dataset.stringIdx !== undefined ? cell.dataset.stringIdx : (stringRow ? stringRow.dataset.stringIdx : 0), 10);
    const fretNum = parseInt(cell.dataset.fret, 10);
    if (isNaN(stringIdx) || isNaN(fretNum)) return null;
    return { stringIdx, fretNum };
  }

  /* Helper: Highlight Fret Cell visually */
  function highlightFret(stringIdx, fretNum, duration = 1200) {
    const cell = document.querySelector(`.fret-cell[data-string-idx="${stringIdx}"][data-fret="${fretNum}"]`);
    if (!cell) return;

    cell.classList.add('active-fret');
    const wire = cell.querySelector('.string-wire');
    if (wire) {
      wire.classList.add('vibrating');
      setTimeout(() => wire.classList.remove('vibrating'), 350);
    }

    if (!window.guitarSynth || !window.guitarSynth.isSustainMode) {
      setTimeout(() => {
        cell.classList.remove('active-fret');
      }, duration);
    }
  }

  /* Helper: Clear all active fret highlights */
  function clearAllFretHighlights() {
    document.querySelectorAll('.fret-cell.active-fret').forEach(cell => {
      cell.classList.remove('active-fret');
    });
    for (let i = 0; i < 6; i++) activeFretState[i] = null;
    updateChordHud();
  }

  /* Helper: Update Dynamic Chord HUD */
  function updateChordHud() {
    if (!chordHudText || !window.guitarSynth) return;

    const activeNotes = [];
    activeFretState.forEach((fretNum, stringIdx) => {
      if (fretNum !== null && fretNum >= 0) {
        const details = window.guitarSynth.getNoteDetails(stringIdx, fretNum);
        activeNotes.push(details);
      }
    });

    const result = window.guitarSynth.detectActiveChord(activeNotes);
    if (result.chordName) {
      chordHudText.textContent = result.chordName;
      chordHudText.style.color = '#00f2fe';
    } else {
      chordHudText.textContent = 'Ready to Play';
      chordHudText.style.color = '#fff';
    }
  }

  /* 2. Play Fret Note Handler */
  function triggerFretPlay(stringIdx, fretNum, e = null, isSlide = false) {
    if (!window.guitarSynth) return;

    // Calculate dynamic velocity based on drag speed / mouse movement
    const now = performance.now();
    const timeDelta = Math.max(1, now - lastDragTime);
    let velocity = 0.8;

    if (e && e.movementY) {
      const speed = Math.abs(e.movementY) / timeDelta;
      velocity = Math.min(1.0, Math.max(0.4, speed * 2.5));
    }
    lastDragTime = now;

    // Trigger Synthesis
    window.guitarSynth.playFretNote(stringIdx, fretNum, velocity, isSlide);

    // Update state & UI
    activeFretState[stringIdx] = fretNum;
    highlightFret(stringIdx, fretNum);
    updateChordHud();

    lastDraggedString = stringIdx;
    lastDraggedFret = fretNum;
  }

  /* 3. Mouse & Pointer Delegation on Fretboard */
  fretboardContainer.addEventListener('pointerdown', (e) => {
    const cell = e.target.closest('.fret-cell');
    if (!cell) return;

    const data = getCellData(cell);
    if (!data) return;

    isPointerDown = true;
    lastPointerX = e.clientX;

    triggerFretPlay(data.stringIdx, data.fretNum, e, false);
  });

  fretboardContainer.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;

    const cell = e.target.closest('.fret-cell');
    if (!cell) return;

    const data = getCellData(cell);
    if (!data) return;

    const { stringIdx, fretNum } = data;

    // Slide on same string vs Strum across strings
    if (stringIdx !== lastDraggedString || fretNum !== lastDraggedFret) {
      const isSlide = (stringIdx === lastDraggedString && fretNum !== lastDraggedFret);
      triggerFretPlay(stringIdx, fretNum, e, isSlide);
    } else if (e.clientX && lastPointerX) {
      // Pitch Bend on horizontal drag shift
      const bendDelta = (e.clientX - lastPointerX) * 4; // cents
      if (Math.abs(bendDelta) > 5) {
        window.guitarSynth.playFretNote(stringIdx, fretNum, 0.75, true, bendDelta);
      }
    }
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
    lastDraggedString = null;
    lastDraggedFret = null;
  });

  /* 4. Tone Selector Presets */
  toneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toneBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tone = btn.dataset.tone;
      if (window.guitarSynth) window.guitarSynth.setTone(tone);
    });
  });

  /* 5. Technique Buttons Toggles */
  if (techPalmMuteBtn) {
    techPalmMuteBtn.addEventListener('click', () => {
      if (!window.guitarSynth) return;
      window.guitarSynth.isPalmMute = !window.guitarSynth.isPalmMute;
      techPalmMuteBtn.classList.toggle('active', window.guitarSynth.isPalmMute);
    });
  }

  if (techHarmonicsBtn) {
    techHarmonicsBtn.addEventListener('click', () => {
      if (!window.guitarSynth) return;
      window.guitarSynth.isHarmonics = !window.guitarSynth.isHarmonics;
      techHarmonicsBtn.classList.toggle('active', window.guitarSynth.isHarmonics);
    });
  }

  if (techSustainBtn) {
    techSustainBtn.addEventListener('click', () => {
      if (!window.guitarSynth) return;
      window.guitarSynth.isSustainMode = !window.guitarSynth.isSustainMode;
      techSustainBtn.classList.toggle('active', window.guitarSynth.isSustainMode);
      if (!window.guitarSynth.isSustainMode) clearAllFretHighlights();
    });
  }

  if (muteAllBtn) {
    muteAllBtn.addEventListener('click', () => {
      if (window.guitarSynth) window.guitarSynth.stopAllVoices();
      clearAllFretHighlights();
    });
  }

  /* 6. Instant Strum Chord Preset Buttons */
  chordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const chordName = btn.dataset.chord;
      if (!window.guitarSynth) return;

      const presetFrets = window.guitarSynth.chordFretPresets[chordName];
      if (presetFrets) {
        clearAllFretHighlights();
        presetFrets.forEach((fretNum, stringIdx) => {
          if (fretNum >= 0) {
            activeFretState[stringIdx] = fretNum;
            highlightFret(stringIdx, fretNum, 2000);
          }
        });

        window.guitarSynth.strumFretboardChord(presetFrets, 'down', 0.85);
        updateChordHud();
      }

      btn.classList.add('playing');
      setTimeout(() => btn.classList.remove('playing'), 600);
    });
  });

  /* 7. Keyboard Shortcuts Support */
  let currentStringSelection = 0; // Default String 1 (High E)
  const stringKeys = { 'KeyQ': 0, 'KeyW': 1, 'KeyE': 2, 'KeyR': 3, 'KeyT': 4, 'KeyY': 5 };

  document.addEventListener('keydown', (e) => {
    // Ignore keyboard shortcuts if user is typing in an input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    // String Selection via Q, W, E, R, T, Y
    if (stringKeys[e.code] !== undefined) {
      currentStringSelection = stringKeys[e.code];
      const targetCell = document.querySelector(`.fret-cell[data-string-idx="${currentStringSelection}"][data-fret="0"]`);
      if (targetCell) triggerFretPlay(currentStringSelection, 0);
      return;
    }

    // Fret selection via numbers 1..9 & 0
    if (e.key >= '0' && e.key <= '9') {
      const fretNum = e.key === '0' ? 10 : parseInt(e.key, 10);
      triggerFretPlay(currentStringSelection, fretNum);
      return;
    }

    // Space: Mute All
    if (e.code === 'Space') {
      e.preventDefault();
      if (window.guitarSynth) window.guitarSynth.stopAllVoices();
      clearAllFretHighlights();
    }

    // Shift: Toggle Sustain
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      if (techSustainBtn) techSustainBtn.click();
    }
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
