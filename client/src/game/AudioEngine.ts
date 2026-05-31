import * as Tone from 'tone';

export class AudioEngine {
  private player: Tone.Player;
  private preview: Tone.Player;
  private syncOffset: number;

  constructor(
    path: string,
    private bpm: number,
    offset: string | number,
    arrowTime: number,
    previewStart = 0,
    previewLength = 12
  ) {
    this.syncOffset = arrowTime + Number(offset);

    this.player = new Tone.Player(path).toDestination();
    Tone.getTransport().bpm.value = bpm;

    this.preview = new Tone.Player({
      url: path,
      loop: true,
      loopStart: previewStart,
      loopEnd: previewStart + previewLength,
    }).toDestination();
  }

  async waitForLoad(): Promise<void> {
    // Resume AudioContext — must be called after a user gesture (click/keypress)
    await Tone.start();
    await Tone.loaded();
  }

  start(): void {
    this.player.start(`+${this.syncOffset}`);
  }

  stop(): void {
    try { this.player.stop(); } catch { /* already stopped */ }
    try { this.player.dispose(); } catch { /* already disposed */ }
  }

  async startPreview(): Promise<void> {
    await Tone.loaded();
    this.preview.start();
  }

  stopPreview(): void {
    try { this.preview.stop(); } catch { /* already stopped */ }
    try { this.preview.dispose(); } catch { /* already disposed */ }
  }

  static playSfx(name: string): void {
    const audio = new Audio(`/audio/soundEffects/${name}.mp3`);
    audio.play().catch(() => {});
  }
}
