/* ==========================================================================
   WEB AUDIO API GUITAR SYNTHESIZER & REALISTIC FRETBOARD ENGINE
   Full 6-String 22-Fret Sound Synthesis, Effects Graph, Chord Detection,
   and Radiohead "Creep" Background Music Sequencer.
   ========================================================================== */

class GuitarSynth {
  constructor() {
    this.ctx = null;
    this.currentTone = 'acoustic'; // 'acoustic', 'electric', 'ambient'
    this.isMuted = false;

    // Guitar Technique Modes
    this.isPalmMute = false;
    this.isHarmonics = false;
    this.isSustainMode = false;

    // Background Music State ("Creep" by Radiohead)
    this.isPlayingCreepBgm = false;
    this.bgmTimer = null;
    this.creepStep = 0;

    // Pitch Class Names
    this.pitchClasses = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Standard Tuning Base Frequencies (Hz) for 6 Strings (String 1 = High E, String 6 = Low E)
    // String Index 0: E4 (329.63), 1: B3 (246.94), 2: G3 (196.00), 3: D3 (146.83), 4: A2 (110.00), 5: E2 (82.41)
    this.stringTuning = [
      { name: 'E4', baseFreq: 329.63, baseMidi: 64, stringNum: 1, label: 'E (High)' },
      { name: 'B3', baseFreq: 246.94, baseMidi: 59, stringNum: 2, label: 'B' },
      { name: 'G3', baseFreq: 196.00, baseMidi: 55, stringNum: 3, label: 'G' },
      { name: 'D3', baseFreq: 146.83, baseMidi: 50, stringNum: 4, label: 'D' },
      { name: 'A2', baseFreq: 110.00, baseMidi: 45, stringNum: 5, label: 'A' },
      { name: 'E2', baseFreq: 82.41,  baseMidi: 40, stringNum: 6, label: 'E (Low)' }
    ];

    // For legacy pluckString compatibility
    this.stringFrequencies = {
      'E1': 329.63,
      'B2': 246.94,
      'G3': 196.00,
      'D4': 146.83,
      'A5': 110.00,
      'E6': 82.41
    };

    // Strum Chord Presets (String index -> Fret number; -1 means muted)
    this.chordFretPresets = {
      'G':  [3, 0, 0, 0, 2, 3], // G Major (High E to Low E)
      'B':  [2, 4, 4, 4, 2, -1], // B Major
      'C':  [0, 1, 0, 2, 3, -1], // C Major
      'Cm': [3, 4, 5, 5, 3, -1], // C Minor
      'Am': [0, 1, 2, 2, 0, -1], // A Minor
      'Em': [0, 0, 0, 2, 2, 0]  // E Minor
    };

    // Frequencies for legacy strumChord
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

    // Radiohead "Creep" Chorus Chord Progression & Synchronized Lyrics
    this.creepChords = [
      {
        name: 'G Major',
        lyric: '🎤 "But I\'m a creep... I\'m a weirdo..."',
        notes: [196.00, 246.94, 293.66, 392.00]
      },
      {
        name: 'B Major',
        lyric: '🎸 "What the hell am I doing here?..."',
        notes: [246.94, 311.13, 369.99, 493.88]
      },
      {
        name: 'C Major',
        lyric: '✨ "I don\'t belong here..."',
        notes: [261.63, 329.63, 392.00, 523.25]
      },
      {
        name: 'C Minor',
        lyric: '💫 "I don\'t belong here... no, I don\'t belong here."',
        notes: [261.63, 311.13, 392.00, 523.25]
      }
    ];

    // Voice tracking per string (active sound nodes)
    this.activeStringVoices = [null, null, null, null, null, null];

    // Master Audio Effects Bus Nodes
    this.masterGain = null;
    this.compressor = null;
    this.reverbConvolver = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.cabinetShaper = null;

    this.initUserInteractionListener();
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupMasterEffectsGraph();
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
      document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
  }

  /* --- MASTER AUDIO EFFECTS BUS --- */
  setupMasterEffectsGraph() {
    const now = this.ctx.currentTime;

    // Master Compressor
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, now);
    this.compressor.knee.setValueAtTime(12, now);
    this.compressor.ratio.setValueAtTime(4, now);
    this.compressor.attack.setValueAtTime(0.005, now);
    this.compressor.release.setValueAtTime(0.2, now);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, now);

    // Delay Node (for Ambient Shimmer)
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.32, now);
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.25, now);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    // Reverb Impulse Response (synthetic hall impulse)
    this.reverbConvolver = this.ctx.createConvolver();
    this.reverbConvolver.buffer = this.createImpulseResponse(2.2, 2.0);

    // Cabinet Waveshaper (for Electric Clean)
    this.cabinetShaper = this.ctx.createWaveShaper();
    this.cabinetShaper.curve = this.createCabinetCurve();

    // Wiring Effects
    this.delayNode.connect(this.masterGain);
    this.reverbConvolver.connect(this.masterGain);
    this.cabinetShaper.connect(this.masterGain);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  createImpulseResponse(duration, decay) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = length - i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
    }
    return impulse;
  }

  createCabinetCurve() {
    const k = 15;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
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

  /* Calculate pitch frequency for string (0..5) and fret (0..22) */
  getNoteFrequency(stringIdx, fretNum) {
    const baseFreq = this.stringTuning[stringIdx].baseFreq;
    return baseFreq * Math.pow(2, fretNum / 12);
  }

  /* Calculate pitch details (Note Name, Octave, Freq) */
  getNoteDetails(stringIdx, fretNum) {
    const baseMidi = this.stringTuning[stringIdx].baseMidi;
    const midiNote = baseMidi + fretNum;
    const pitchName = this.pitchClasses[midiNote % 12];
    const octave = Math.floor(midiNote / 12) - 1;
    const freq = this.getNoteFrequency(stringIdx, fretNum);

    return { pitchName, octave, fullName: `${pitchName}${octave}`, freq, midiNote };
  }

  /* --- PLAY A FRETBOARD NOTE WITH REALISTIC SYNTHESIS --- */
  playFretNote(stringIdx, fretNum, velocity = 0.8, isHammerOnSlide = false, pitchBendCents = 0) {
    if (this.isMuted) return null;
    this.initContext();

    let noteInfo = this.getNoteDetails(stringIdx, fretNum);
    let targetFreq = noteInfo.freq;

    // Natural Harmonics check (frets 12, 7, 5)
    if (this.isHarmonics && [5, 7, 12].includes(fretNum)) {
      if (fretNum === 12) targetFreq *= 2;
      else if (fretNum === 7) targetFreq *= 3;
      else if (fretNum === 5) targetFreq *= 4;
    }

    // Apply pitch bend detune
    if (pitchBendCents !== 0) {
      targetFreq *= Math.pow(2, pitchBendCents / 1200);
    }

    const now = this.ctx.currentTime;

    // Check if string has existing active voice for Hammer-on / Pull-off / Slide
    if (isHammerOnSlide && this.activeStringVoices[stringIdx]) {
      const existing = this.activeStringVoices[stringIdx];
      try {
        existing.osc.frequency.linearRampToValueAtTime(targetFreq, now + 0.04);
        if (existing.subOsc) existing.subOsc.frequency.linearRampToValueAtTime(targetFreq * 2, now + 0.04);
        existing.noteInfo = noteInfo;
        return existing;
      } catch (e) {
        // Fallback to new pluck if ramp fails
      }
    }

    // Stop previous voice on this string if any
    this.stopStringVoice(stringIdx);

    // Dynamic Tone Synthesis Options
    let duration = this.isPalmMute ? 0.35 : (this.isSustainMode ? 5.0 : 2.8);
    let volume = velocity * 0.4;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Sound Presets Architecture
    if (this.currentTone === 'acoustic') {
      osc.type = 'triangle';
      subOsc.type = 'sine';
      filter.type = 'lowpass';
      const cutoff = this.isPalmMute ? 550 : 2400;
      filter.frequency.setValueAtTime(cutoff, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + duration);
    } else if (this.currentTone === 'electric') {
      osc.type = 'sawtooth';
      subOsc.type = 'square';
      filter.type = 'lowpass';
      const cutoff = this.isPalmMute ? 700 : 3600;
      filter.frequency.setValueAtTime(cutoff, now);
      filter.Q.value = 1.5;
    } else { // Ambient Shimmer
      osc.type = 'sine';
      subOsc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
      duration += 1.5;
    }

    osc.frequency.setValueAtTime(targetFreq, now);
    subOsc.frequency.setValueAtTime(targetFreq * 2, now);

    // Natural Pluck Envelope
    const attack = this.currentTone === 'ambient' ? 0.035 : 0.008;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    const decayEnd = this.isPalmMute ? now + 0.3 : now + duration;
    gainNode.gain.exponentialRampToValueAtTime(0.0001, decayEnd);

    // Routing
    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gainNode);

    if (this.currentTone === 'electric' && this.cabinetShaper) {
      gainNode.connect(this.cabinetShaper);
    } else if (this.currentTone === 'ambient' && this.delayNode) {
      gainNode.connect(this.delayNode);
      gainNode.connect(this.reverbConvolver);
    } else {
      gainNode.connect(this.compressor);
      gainNode.connect(this.reverbConvolver);
    }

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration + 0.1);
    subOsc.stop(now + duration + 0.1);

    const voiceObj = {
      osc,
      subOsc,
      gainNode,
      stringIdx,
      fretNum,
      noteInfo,
      startTime: now
    };

    this.activeStringVoices[stringIdx] = voiceObj;
    return voiceObj;
  }

  stopStringVoice(stringIdx) {
    const v = this.activeStringVoices[stringIdx];
    if (v) {
      try {
        const now = this.ctx ? this.ctx.currentTime : 0;
        if (this.ctx && v.gainNode) {
          v.gainNode.gain.cancelScheduledValues(now);
          v.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.05);
        }
        setTimeout(() => {
          try { v.osc.stop(); v.subOsc.stop(); } catch (e) {}
        }, 60);
      } catch (err) {}
      this.activeStringVoices[stringIdx] = null;
    }
  }

  stopAllVoices() {
    for (let i = 0; i < 6; i++) {
      this.stopStringVoice(i);
    }
  }

  /* --- REALISTIC STRUMMING --- */
  strumFretboardChord(fretArray, direction = 'down', velocity = 0.8) {
    if (this.isMuted) return;
    this.initContext();

    // Downstroke: String 6 to 1 (Low E to High E). Upstroke: String 1 to 6
    const stringsOrder = direction === 'down' ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
    const interStringDelay = 0.016; // 16ms delay between strings

    stringsOrder.forEach((stringIdx, step) => {
      const fretNum = fretArray[stringIdx];
      if (fretNum >= 0) {
        setTimeout(() => {
          this.playFretNote(stringIdx, fretNum, velocity + (Math.random() * 0.08 - 0.04));
        }, step * interStringDelay * 1000);
      }
    });
  }

  /* --- DYNAMIC CHORD DETECTION ENGINE --- */
  detectActiveChord(activeNotesList) {
    if (!activeNotesList || activeNotesList.length === 0) return { chordName: '', notes: [] };

    // Get unique pitch classes
    const pitches = [...new Set(activeNotesList.map(n => n.pitchName))];
    if (pitches.length === 0) return { chordName: '', notes: [] };

    if (pitches.length < 2) {
      return { chordName: pitches.join(', '), isSingle: true, notes: pitches };
    }

    // Convert pitch names to semitone indices relative to root
    for (let i = 0; i < pitches.length; i++) {
      const root = pitches[i];
      const rootIdx = this.pitchClasses.indexOf(root);
      const semitones = pitches.map(p => (this.pitchClasses.indexOf(p) - rootIdx + 12) % 12).sort((a, b) => a - b);

      const has = (val) => semitones.includes(val);

      // Match chord formulas
      let quality = '';
      if (has(4) && has(7) && has(10)) quality = '7';
      else if (has(4) && has(7) && has(11)) quality = 'Maj7';
      else if (has(3) && has(7) && has(10)) quality = 'm7';
      else if (has(4) && has(7)) quality = ' Major';
      else if (has(3) && has(7)) quality = ' Minor';
      else if (has(5) && has(7)) quality = 'sus4';
      else if (has(2) && has(7)) quality = 'sus2';
      else if (has(4) && has(7) && has(2)) quality = 'add9';
      else if (has(3) && has(6)) quality = 'dim';
      else if (has(4) && has(8)) quality = 'aug';
      else if (has(7) && pitches.length === 2) quality = '5 (Power Chord)';

      if (quality) {
        return { chordName: `${root}${quality}`, notes: pitches };
      }
    }

    return { chordName: pitches.join(' • '), isNotes: true, notes: pitches };
  }

  /* --- LEGACY COMPATIBILITY METHODS --- */
  pluckNote(freq, duration = 2.5, volume = 0.35) {
    if (this.isMuted) return;
    this.initContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = this.currentTone === 'acoustic' ? 'triangle' : 'sawtooth';
    subOsc.type = 'sine';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);

    osc.frequency.setValueAtTime(freq, now);
    subOsc.frequency.setValueAtTime(freq * 2, now);

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
    const preset = this.chordFretPresets[chordName];
    if (preset) {
      this.strumFretboardChord(preset, 'down', 0.85);
    } else {
      const freqs = this.chords[chordName];
      if (!freqs || this.isMuted) return;
      freqs.forEach((freq, idx) => {
        setTimeout(() => this.pluckNote(freq, 3.0, 0.3), idx * 30);
      });
    }
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
    const bgmLyric = document.getElementById('bgm-lyrics-display');
    if (bgmLyric) {
      bgmLyric.textContent = '🎵 Click "Play Creep BGM" to sing along!';
      bgmLyric.classList.remove('lyric-glow');
    }
  }

  scheduleCreepArpeggio() {
    if (!this.isPlayingCreepBgm || this.isMuted) return;

    const chordIndex = Math.floor(this.creepStep / 8) % 4;
    const noteIndex = this.creepStep % 8;
    const currentChord = this.creepChords[chordIndex];

    const pattern = [0, 1, 2, 3, 2, 1, 0, 2];
    const targetNoteFreq = currentChord.notes[pattern[noteIndex]];

    this.pluckNote(targetNoteFreq, 1.8, 0.22);

    const bgmLabel = document.getElementById('bgm-chord-name');
    if (bgmLabel) {
      bgmLabel.textContent = `Radiohead - Creep (${currentChord.name})`;
    }

    const bgmLyric = document.getElementById('bgm-lyrics-display');
    if (bgmLyric && currentChord.lyric) {
      bgmLyric.textContent = currentChord.lyric;
      bgmLyric.classList.add('lyric-glow');
    }

    this.creepStep++;

    this.bgmTimer = setTimeout(() => {
      this.scheduleCreepArpeggio();
    }, 320);
  }
}

// Global synth instance
window.guitarSynth = new GuitarSynth();
