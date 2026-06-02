import gsap from 'gsap';
import { Song, GameConfig } from '../types';

export type Direction = 'left' | 'down' | 'up' | 'right';

const INDEX_TO_DIR: Record<string, Direction> = {
  '0': 'left', '1': 'down', '2': 'up', '3': 'right',
};

const NOTE_COLORS: Record<number, string> = {};
function getNoteColor(note: number): string {
  if ((note * 4) % 1 === 0) return 'purple';
  if (((note - 1 / 8) * 4) % 1 === 0) return 'orange';
  if (((note - 1 / 16) * 8) % 1 === 0) return 'red';
  return 'green';
}

export interface ArrowEl {
  el: HTMLElement;
  direction: Direction;
  startTime: number;
}

export class ArrowEngine {
  private tl: gsap.core.Timeline;
  private arrowEls: Record<Direction, ArrowEl[]> = {
    left: [], down: [], up: [], right: [],
  };

  readonly SPEED_1X = 100;

  constructor(private player: 1 | 2) {
    this.tl = gsap.timeline({ paused: true });
    gsap.globalTimeline.timeScale(1);
  }

  private getContainer(dir: Direction): HTMLElement | null {
    return document.querySelector(`.player-${this.player} .${dir}-arrow-col`);
  }

  makeArrows(
    stepChart: string[][][],
    bpm: number,
    config: GameConfig,
    song: Song
  ): Record<Direction, ArrowEl[]> {
    const speed = this.SPEED_1X / config.SPEED_MOD;
    const animationLength = speed * 4 / bpm;
    const measureTime = 240 / bpm;

    const freezeState: Record<Direction, { firstBeat: number; arrow: ArrowEl | null }> = {
      left: { firstBeat: 0, arrow: null },
      down: { firstBeat: 0, arrow: null },
      up: { firstBeat: 0, arrow: null },
      right: { firstBeat: 0, arrow: null },
    };

    stepChart.forEach((measure, mIdx) => {
      const notes = measure.length;
      const timePerNote = measureTime / notes;

      measure.forEach((line, lIdx) => {
        line.forEach((maybeArrow, colIdx) => {
          const dir = INDEX_TO_DIR[String(colIdx)];
          if (!dir) return;

          const startTime = mIdx * measureTime + lIdx * timePerNote;
          const note = lIdx / notes;
          const thisBeat = mIdx * 4 + note * 4;

          if (maybeArrow === '1' || maybeArrow === '2') {
            const color = getNoteColor(note);
            const isFreeze = maybeArrow === '2';

            const container = this.getContainer(dir);
            if (!container) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'arrow activeArrow';

            const img = document.createElement('img');
            img.src = `/img/arrows/${dir}-${color}.png`;
            wrapper.appendChild(img);

            if (isFreeze) {
              const freezeDiv = document.createElement('div');
              freezeDiv.className = 'freeze';
              wrapper.appendChild(freezeDiv);
              freezeState[dir].firstBeat = thisBeat;
            }

            container.appendChild(wrapper);

            const arrowEl: ArrowEl = { el: wrapper, direction: dir, startTime };

            if (isFreeze) freezeState[dir].arrow = arrowEl;

            // animate from bottom to top (1000vh total travel so arrow reaches target at exactly arrowTime)
            const from = '100vh';
            const to = '-900vh';
            this.tl.fromTo(
              wrapper,
              { top: from },
              { top: to, duration: animationLength * 10, ease: 'none' },
              startTime
            );

            this.arrowEls[dir].push(arrowEl);

          } else if (maybeArrow === '3') {
            const frozenArrow = freezeState[dir].arrow;
            if (frozenArrow) {
              const length = config.BEAT_VH * (thisBeat - freezeState[dir].firstBeat);
              const freezeDiv = frozenArrow.el.querySelector('.freeze') as HTMLElement | null;
              if (freezeDiv) freezeDiv.style.height = `${length}vh`;
            }
          }
        });
      });
    });

    // BPM changes
    song.bpms.forEach((bpmEntry) => {
      if (bpmEntry.beat === 0) return;
      const ts = config.ARROW_TIME + config.BEAT_TIME * bpmEntry.beat;
      const scale = bpmEntry.bpm / song.bpms[0].bpm;
      this.tl.add(() => { this.tl.timeScale(scale); }, ts);
    });

    // Stops
    song.stops.forEach((stop) => {
      const ts = config.ARROW_TIME + config.BEAT_TIME * stop.beat;
      this.tl.addPause(ts, () => { setTimeout(() => this.tl.play(), stop.duration * 1000); });
    });

    return this.arrowEls;
  }

  resume(): void {
    this.tl.resume();
  }

  kill(): void {
    this.tl.pause(0, true);
    this.tl.kill();
  }

  removeArrow(dir: Direction, index: number): void {
    const arrow = this.arrowEls[dir][index];
    if (arrow) arrow.el.innerHTML = '';
  }

  hideArrowImage(dir: Direction, index: number): void {
    const arrow = this.arrowEls[dir][index];
    if (!arrow) return;
    const img = arrow.el.querySelector('img') as HTMLElement | null;
    if (img) img.hidden = true;
  }

  showFreezeEater(dir: Direction, index: number): void {
    const arrow = this.arrowEls[dir][index];
    if (!arrow) return;
    const freeze = arrow.el.querySelector('.freeze') as HTMLElement | null;
    if (freeze) freeze.style.transform = 'translateY(7.5vh)';
    // highlight fader
    document.querySelectorAll(`.player-${this.player} .${dir}-arrow-col .fader`)
      .forEach((el) => el.classList.add('freeze-eater'));
  }

  hideFreezeEater(dir: Direction): void {
    document.querySelectorAll(`.player-${this.player} .${dir}-arrow-col .fader`)
      .forEach((el) => el.classList.remove('freeze-eater'));
  }
}
