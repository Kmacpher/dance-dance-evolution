import * as Tone from 'tone';

export class AudioEngine {
  private player?: Tone.Player;
  private preview?: Tone.Player;
  // startPreview() is async (awaits Tone.start + buffer decode). If stopPreview()
  // is called while that's in flight, this flag makes the stop authoritative so the
  // player never starts — otherwise rapidly switching songs leaks overlapping loops.
  private previewCancelled = false;
  private syncOffset: number;
  private bufferPromise: Promise<Tone.ToneAudioBuffer>;

  constructor(
    path: string,
    private bpm: number,
    offset: string | number,
    arrowTime: number,
    private previewStart = 0,
    private previewLength = 12
  ) {
    this.syncOffset = arrowTime + Number(offset);
    Tone.getTransport().bpm.value = bpm;
    // Tone's built-in URL loader double-encodes paths containing spaces: it sets
    // anchor.href then reads anchor.pathname (which yields %20) and runs
    // encodeURIComponent over it → %2520. So fetch and decode the audio ourselves
    // with a single encodeURI, then hand Tone the decoded buffer.
    this.bufferPromise = this.loadBuffer(path);
  }

  private async loadBuffer(path: string): Promise<Tone.ToneAudioBuffer> {
    const response = await fetch(encodeURI(path));
    if (!response.ok) throw new Error(`could not load audio: ${path}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await Tone.getContext().decodeAudioData(arrayBuffer);
    return new Tone.ToneAudioBuffer(audioBuffer);
  }

  async waitForLoad(): Promise<void> {
    // Resume AudioContext — must be called after a user gesture (click/keypress)
    await Tone.start();
    const buffer = await this.bufferPromise;
    this.player = new Tone.Player(buffer).toDestination();
    // Let the output device latency populate before the game schedules audio:
    // a freshly-resumed AudioContext reports outputLatency=0 for the first
    // ~200ms, which would defeat the latency compensation in start(). This runs
    // behind the "GET READY" screen so it adds no perceptible startup delay.
    await new Promise<void>((r) => setTimeout(r, 250));
  }

  start(): void {
    // We do NOT compensate for AudioContext.outputLatency. It sounds principled
    // (shift the audio earlier so the *sound* lands with the arrows) but the
    // reported value is unreliable — on Firefox/Linux it reads 35-50ms and wobbles
    // run-to-run while the true hardware latency is ~0, so subtracting it injected
    // a measured ~35ms "press early" bias and dropped in-window hits. Any genuine
    // perceptual offset (real output latency, display lag, personal anticipation)
    // is handled end-to-end by the per-user calibration offset instead — see
    // calibration.ts and the Calibrate screen.
    //
    // We DO still subtract lookAhead: Tone schedules the '+x' string relative to
    // context.now() (= currentTime + lookAhead, default 0.1s), but the arrows run
    // on GSAP/rAF (wall clock, no lookAhead), so without this the audio would land
    // ~lookAhead late vs the arrows. Safe: syncOffset is hundreds of ms, so this
    // never schedules in the past. (outputLatency is still computed for the
    // [audio] debug log, just not applied.)
    const outputLatency = this.outputLatency();
    const lookAhead = Tone.getContext().lookAhead;
    const startIn = Math.max(0, this.syncOffset - lookAhead);
    this.lastTiming = { outputLatency, lookAhead, syncOffset: this.syncOffset, startIn };
    this.player?.start(`+${startIn}`);
  }

  // Snapshot of the latency compensation used by the last start(), for debug.
  // Compare (outputLatency + lookAhead) against the measured HIT-OFFSET: if they
  // track, the early bias is the audio compensation; if not, it's elsewhere.
  private lastTiming = { outputLatency: 0, lookAhead: 0, syncOffset: 0, startIn: 0 };
  timingDebug(): typeof this.lastTiming {
    return this.lastTiming;
  }

  /** Best runtime estimate of output latency in seconds (schedule → speaker). */
  private outputLatency(): number {
    // Tone 14 wraps its context with standardized-audio-context, which does not
    // expose outputLatency / getOutputTimestamp. Reach the real native
    // AudioContext underneath, where the device latency is reported (it only
    // populates once the context has been running briefly — see waitForLoad's
    // warm-up).
    const raw = Tone.getContext().rawContext as unknown as Record<string, unknown>;
    const ctx = (raw._nativeAudioContext || raw._nativeContext || raw) as {
      currentTime: number;
      outputLatency?: number;
      baseLatency?: number;
      getOutputTimestamp?: () => { contextTime: number };
    };
    try {
      const ts = ctx.getOutputTimestamp?.();
      if (ts && ctx.currentTime > ts.contextTime) return ctx.currentTime - ts.contextTime;
    } catch { /* not supported — fall through */ }
    return ctx.outputLatency || ctx.baseLatency || 0;
  }

  stop(): void {
    try { this.player?.stop(); } catch { /* already stopped */ }
    try { this.player?.dispose(); } catch { /* already disposed */ }
  }

  async startPreview(): Promise<void> {
    await Tone.start();
    const buffer = await this.bufferPromise;
    if (this.previewCancelled) return;
    this.preview = new Tone.Player({
      url: buffer,
      loop: true,
      loopStart: this.previewStart,
      loopEnd: this.previewStart + this.previewLength,
    }).toDestination();
    this.preview.start();
  }

  stopPreview(): void {
    this.previewCancelled = true;
    try { this.preview?.stop(); } catch { /* already stopped */ }
    try { this.preview?.dispose(); } catch { /* already disposed */ }
    this.preview = undefined;
  }

  static playSfx(name: string): void {
    const audio = new Audio(`/audio/soundEffects/${name}.mp3`);
    audio.play().catch(() => {});
  }
}
