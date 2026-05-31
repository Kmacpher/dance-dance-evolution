import * as Tone from 'tone';

export class AudioEngine {
  private player?: Tone.Player;
  private preview?: Tone.Player;
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
  }

  start(): void {
    this.player?.start(`+${this.syncOffset}`);
  }

  stop(): void {
    try { this.player?.stop(); } catch { /* already stopped */ }
    try { this.player?.dispose(); } catch { /* already disposed */ }
  }

  async startPreview(): Promise<void> {
    await Tone.start();
    const buffer = await this.bufferPromise;
    this.preview = new Tone.Player({
      url: buffer,
      loop: true,
      loopStart: this.previewStart,
      loopEnd: this.previewStart + this.previewLength,
    }).toDestination();
    this.preview.start();
  }

  stopPreview(): void {
    try { this.preview?.stop(); } catch { /* already stopped */ }
    try { this.preview?.dispose(); } catch { /* already disposed */ }
  }

  static playSfx(name: string): void {
    const audio = new Audio(`/audio/soundEffects/${name}.mp3`);
    audio.play().catch(() => {});
  }
}
