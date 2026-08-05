/* ==========================================================================
   WEB AUDIO API GUITAR SYNTHESIZER & BGM SEQUENCER
   Featuring Radiohead - "Creep" Background Music Synth
   ========================================================================== */

class GuitarSynth {
  constructor() {
    this.ctx = null;
    this.currentTone = 'acoustic'; // 'acoustic', 'electric', 'ambient'
    this.isMuted = false;
    
    // Background Music State ("Creep" by Radiohead)
    this.isPlayingCreepBgm = false;
    this.bgmTimer = null;
    this.creepStep = 0;
    
    // Standard Guitar Tuning Frequencies (Hz)
    this.stringFrequencies = {
      'E6': 82.41,  // Low E
      'A5': 110.00, // A
      'D4': 146.83, // D
      'G3': 196.00, // G
      'B2': 246.94, // B
      'E1': 329.63  // High E
    };

    // Chord Definitions (frequencies for strumming)
    this.chords = {
      'C': [130.81, 164.81, 196.00, 261.63, 329.63],
      'G': [98.00, 123.47, 146.83, 196.00, 293.66, 392.00],
      'Am': [110.00, 164.81, 220.00, 261.63, 329.63],
      'F': [87.31, 130.81, 174.61, 220.00, 261.63, 349.23],
      'Em': [82.41, 123.47, 164.81, 196.00, 246.94, 329.63],
      'D': [146.83, 220.00, 293.66, 369.99],
      'B': [123.47, 155.56, 185.00, 246.94, 311.13],
      'Cm': [130.81, 155.56, 196.00, 261.63, 311.13]
    };

    // "Creep" by Radiohead Chord Progression Frequencies (G -> B -> C -> Cm)
    this.creepChords = [
      { name: 'G Major', notes: [196.00, 246.94, 293.66, 392.00] }, // G3, B3, D4, G4
      { name: 'B Major', notes: [246.94, 311.13, 369.99, 493.88] }, // B3, D#4, F#4, B4
      { name: 'C Major', notes: [261.63, 329.63, 392.00, 523.25] }, // C4, E4, G4, C5
      { name: 'C Minor', notes: [261.63, 311.13, 392.00, 523.25] }  // C4, Eb4, G4, C5
    ];

    this.initUserInteractionListener();
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initUserInteractionListener() {
    const unlockAudio = () => {
      this.initContext();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }

  setTone(tone) {
    this.currentTone = tone;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isPlayingCreepBgm) {
      this.stopCreepBgm();
    }
    return this.isMuted;
  }

  /* Play a single string note with realistic guitar pluck synthesis */
  pluckNote(freq, duration = 2.5, volume = 0.35) {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;

    // Fundamental Oscillator & Harmonics
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (this.currentTone === 'acoustic') {
      osc.type = 'triangle';
      subOsc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + duration);
    } else if (this.currentTone === 'electric') {
      osc.type = 'sawtooth';
      subOsc.type = 'square';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.value = 2.5;
    } else { // Ambient
      osc.type = 'sine';
      subOsc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, now);
    }

    osc.frequency.setValueAtTime(freq, now);
    subOsc.frequency.setValueAtTime(freq * 2, now); // 2nd harmonic

    // Pluck Envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration);
    subOsc.stop(now + duration);
  }

  pluckString(stringName) {
    const freq = this.stringFrequencies[stringName];
    if (freq) this.pluckNote(freq);
  }

  strumChord(chordName) {
    const freqs = this.chords[chordName];
    if (!freqs || this.isMuted) return;
    this.initContext();

    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.pluckNote(freq, 3.0, 0.3);
      }, idx * 45);
    });
  }

  /* --- RADIOHEAD "CREEP" BGM SEQUENCER --- */
  toggleCreepBgm() {
    if (this.isPlayingCreepBgm) {
      this.stopCreepBgm();
      return false;
    } else {
      this.startCreepBgm();
      return true;
    }
  }

  startCreepBgm() {
    this.initContext();
    this.isPlayingCreepBgm = true;
    this.creepStep = 0;
    this.scheduleCreepArpeggio();
  }

  stopCreepBgm() {
    this.isPlayingCreepBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  scheduleCreepArpeggio() {
    if (!this.isPlayingCreepBgm || this.isMuted) return;

    const chordIndex = Math.floor(this.creepStep / 8) % 4; // 8 notes per chord (G -> B -> C -> Cm)
    const noteIndex = this.creepStep % 8;
    const currentChord = this.creepChords[chordIndex];

    // Arpeggio index mapping (0, 1, 2, 3, 2, 1, 0, 2)
    const pattern = [0, 1, 2, 3, 2, 1, 0, 2];
    const targetNoteFreq = currentChord.notes[pattern[noteIndex]];

    // Pluck arpeggio note with warm guitar tone
    this.pluckNote(targetNoteFreq, 1.8, 0.22);

    // Dynamic chord display event notification
    const bgmLabel = document.getElementById('bgm-chord-name');
    if (bgmLabel) {
      bgmLabel.textContent = `Creep: ${currentChord.name}`;
    }

    this.creepStep++;

    // Speed of arpeggio (320ms per note)
    this.bgmTimer = setTimeout(() => {
      this.scheduleCreepArpeggio();
    }, 320);
  }
}

// Global synth instance
window.guitarSynth = new GuitarSynth();
