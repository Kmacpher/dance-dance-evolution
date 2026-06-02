// Audio engine for the home-screen visualizer. Deliberately separate from the
// Tone.js-based game AudioEngine so it can't perturb the game's latency-compensated
// timing — this is just "loop Sandstorm and expose a frequency analyser".
//
// Signal graph:  <audio> --> analyser --> gain --> destination
// The analyser sits UPSTREAM of the gain, so a fade-out (gain -> 0) silences the
// speakers smoothly while the analyser still sees the signal until the element
// is actually paused.

const SRC = '/audio/Sandstorm.mp3';
const FADE_OUT = 0.12; // seconds — fast fade so stopping isn't an abrupt cutoff

class HomeAudio {
  private ctx?: AudioContext;
  private el?: HTMLAudioElement;
  private analyser?: AnalyserNode;
  private gain?: GainNode;
  private freq?: Uint8Array<ArrayBuffer>;
  private pauseTimer?: number;
  private playing = false;

  private build() {
    if (this.ctx) return;
    const ctx = new AudioContext();
    const el = new Audio(SRC);
    el.loop = true;
    el.crossOrigin = 'anonymous';

    const source = ctx.createMediaElementSource(el);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;            // -> 256 frequency bins
    analyser.smoothingTimeConstant = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = 1;

    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);

    this.ctx = ctx;
    this.el = el;
    this.analyser = analyser;
    this.gain = gain;
    this.freq = new Uint8Array(analyser.frequencyBinCount);
  }

  /** Toggle playback. Returns the new playing state (synchronously). */
  toggle(): boolean {
    this.playing = !this.playing;
    if (this.playing) this.play().catch(() => { this.playing = false; });
    else this.fadeOutAndPause();
    return this.playing;
  }

  get isPlaying() {
    return this.playing;
  }

  private async play(): Promise<void> {
    this.build();
    if (this.pauseTimer !== undefined) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = undefined;
    }
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();
    // Restore the level a previous fade-out may have left at 0 (quick, click-free).
    const g = this.gain!.gain;
    g.cancelScheduledValues(this.ctx!.currentTime);
    g.setTargetAtTime(1, this.ctx!.currentTime, 0.01);
    await this.el!.play();
  }

  private fadeOutAndPause() {
    if (!this.ctx || !this.el || !this.gain) return;
    const now = this.ctx.currentTime;
    const g = this.gain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + FADE_OUT);
    // Pause the element only once the fade has finished.
    this.pauseTimer = window.setTimeout(() => {
      try { this.el?.pause(); } catch { /* ignore */ }
      this.pauseTimer = undefined;
    }, FADE_OUT * 1000 + 30);
  }

  /** Fill and return the current frequency spectrum (0-255 per bin). */
  getFrequencies(): Uint8Array {
    if (this.analyser && this.freq) this.analyser.getByteFrequencyData(this.freq);
    return this.freq ?? new Uint8Array(0);
  }

  /** Pause and free the context (called when leaving the home screen). */
  stop() {
    if (this.pauseTimer !== undefined) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = undefined;
    }
    try { this.el?.pause(); } catch { /* ignore */ }
    try { this.ctx?.suspend(); } catch { /* ignore */ }
    this.playing = false;
  }
}

export const homeAudio = new HomeAudio();
