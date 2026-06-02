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
    // Compensate for audio output latency — the delay between when Web Audio
    // *schedules* a buffer and when that sound actually reaches the speakers.
    // The arrows are driven by GSAP/rAF (latency-free), so without this the
    // arrows reach the receptor ~tens of ms before the sound is heard and feel
    // early. The latency is read from the live AudioContext so it self-adjusts
    // to the user's hardware/OS (a few ms on good setups, 100ms+ on some Linux
    // audio stacks / Bluetooth) — it is a constant time shift, not BPM-related.
    // Tone schedules the '+x' string relative to context.now(), which includes
    // the context lookAhead (default 0.1s). The arrows run on GSAP/rAF (wall
    // clock, no lookAhead), so unlike a pure-Tone app the lookAhead does NOT
    // cancel — it would push the audio ~lookAhead late vs the arrows. Subtract
    // it so audio and arrows share the same zero. Safe: syncOffset (ARROW_TIME +
    // offset) is hundreds of ms, so this never schedules in the past.
    const startIn = Math.max(0, this.syncOffset - this.outputLatency() - Tone.getContext().lookAhead);
    this.player?.start(`+${startIn}`);
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
