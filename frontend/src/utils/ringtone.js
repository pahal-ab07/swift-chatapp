// Ringtone utility using Web Audio API
class Ringtone {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.oscillator = null;
    this.gainNode = null;
    this.volume = 0.5; // Default volume
  }

  // Initialize audio context
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Generate a pleasant ringtone
  play() {
    if (this.isPlaying) return;

    this.init();
    this.isPlaying = true;

    // Create oscillator for the main tone
    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    // Connect nodes
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Set up the ringtone pattern
    this.setupRingtone();

    // Start the oscillator
    this.oscillator.start();
  }

  // Setup ringtone pattern (similar to classic phone ring)
  setupRingtone() {
    const now = this.audioContext.currentTime;
    const duration = 0.5; // Duration of each tone
    const pause = 0.2; // Pause between tones
    const totalCycle = duration + pause;

    // First tone (higher frequency)
    this.oscillator.frequency.setValueAtTime(800, now);
    this.gainNode.gain.setValueAtTime(0.3 * this.volume, now);
    this.gainNode.gain.setValueAtTime(0, now + duration);

    // Second tone (lower frequency)
    this.oscillator.frequency.setValueAtTime(600, now + totalCycle);
    this.gainNode.gain.setValueAtTime(0.3 * this.volume, now + totalCycle);
    this.gainNode.gain.setValueAtTime(0, now + totalCycle + duration);

    // Repeat the pattern
    this.scheduleNextCycle(now + totalCycle * 2);
  }

  // Schedule the next cycle of the ringtone
  scheduleNextCycle(startTime) {
    if (!this.isPlaying) return;

    const duration = 0.5;
    const pause = 0.2;
    const totalCycle = duration + pause;

    // First tone
    this.oscillator.frequency.setValueAtTime(800, startTime);
    this.gainNode.gain.setValueAtTime(0.3 * this.volume, startTime);
    this.gainNode.gain.setValueAtTime(0, startTime + duration);

    // Second tone
    this.oscillator.frequency.setValueAtTime(600, startTime + totalCycle);
    this.gainNode.gain.setValueAtTime(0.3 * this.volume, startTime + totalCycle);
    this.gainNode.gain.setValueAtTime(0, startTime + totalCycle + duration);

    // Schedule next cycle
    setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleNextCycle(this.audioContext.currentTime);
      }
    }, totalCycle * 1000);
  }

  // Set volume
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Stop the ringtone
  stop() {
    this.isPlaying = false;
    
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
    }
    
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
    
    this.gainNode = null;
  }

  // Alternative: Use a simple beep pattern
  playSimpleBeep() {
    if (this.isPlaying) return;

    this.init();
    this.isPlaying = true;

    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Simple beep pattern
    this.oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    this.gainNode.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime);

    this.oscillator.start();
    this.oscillator.stop(this.audioContext.currentTime + 0.1);

    // Repeat beep
    setTimeout(() => {
      if (this.isPlaying) {
        this.playSimpleBeep();
      }
    }, 200);
  }
}

// Create a singleton instance
const ringtone = new Ringtone();

export default ringtone; 