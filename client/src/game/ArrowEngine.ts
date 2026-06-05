import gsap from 'gsap';
import { Song, GameConfig } from '../types';
import { getStopTime, getBPMTime, Bpm, Stop } from './tempo';

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

  // Tempo map for driving the timeline playhead from the shared song clock (so
  // the visuals can't drift from the worker's judgment across BPM changes/stops).
  private bpms: Bpm[] = [];
  private stops: Stop[] = [];
  private bpm0 = 120;
  private arrowTime = 0;     // seconds of lead-in before an arrow reaches the receptor
  private leadBeats = 0;     // arrowTime expressed in beats at bpm0
  private maxBeat = 0;       // upper bound for the beat search
  private startWall = 0;     // Date.now() at playback start
  private rafId = 0;

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
            if (!container) {
              // The worker still counts this note, so skipping the DOM push here
              // makes arrowEls[dir] shorter than the worker's list — every later
              // hit index then points at the wrong arrow.
              console.warn(
                `[arrows] makeArrows: no DOM container for "${dir}" (measure ${mIdx}) — ` +
                `arrow indices will drift and hits will hide the wrong arrow`
              );
              return;
            }

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

    // Tempo map for the playhead driver. We do NOT use tl.timeScale()/addPause()
    // here (the legacy approach): a free-running GSAP timeline accumulates its own
    // time and drifts from the worker's judgment — especially where a BPM change
    // and a stop land on the same beat. Instead start() scrubs tl.time() from the
    // shared song clock through this same map (see [[tempo.ts]]).
    this.bpms = song.bpms;
    this.stops = song.stops;
    this.bpm0 = bpm;
    this.arrowTime = config.ARROW_TIME;
    this.leadBeats = (config.ARROW_TIME * bpm) / 60;
    this.maxBeat = stepChart.length * 4 + 16;

    return this.arrowEls;
  }

  /** Real elapsed seconds → the receptor-arrival time for that beat. Strictly
   *  increasing in beat (rate = 60/bpm) with an upward jump of `duration` at each
   *  stop; matches the worker's arrow.time (minus songOffset) exactly. */
  private receptorTime(beat: number): number {
    return beat * (60 / this.bpm0) + this.arrowTime
      + getBPMTime(beat, this.bpms) + getStopTime(beat, this.stops);
  }

  /** Current song beat at elapsed `e` — inverse of receptorTime, found by
   *  bisection. During a stop the result holds at the stop's beat (the plateau),
   *  which makes the arrows freeze, exactly like a real stop. */
  private beatAtElapsed(e: number): number {
    let lo = -this.leadBeats;            // receptorTime(lo) === 0
    let hi = this.maxBeat;
    if (e <= 0) return lo;
    if (this.receptorTime(hi) <= e) return hi;
    for (let i = 0; i < 48; i++) {
      const mid = (lo + hi) / 2;
      if (this.receptorTime(mid) <= e) lo = mid; else hi = mid;
    }
    return lo;
  }

  /** Timeline-local position whose arrows sit on the receptor at elapsed `e`. */
  private timelinePos(e: number): number {
    return this.beatAtElapsed(e) * (60 / this.bpm0) + this.arrowTime;
  }

  /** Begin driving the timeline from the song clock. `startWall` (Date.now()) must
   *  match the worker's start reference so visuals and judgment share one clock. */
  start(startWall: number): void {
    this.startWall = startWall;
    const tick = () => {
      const e = (Date.now() - this.startWall) / 1000;
      this.tl.time(Math.max(0, this.timelinePos(e)));
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  kill(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.tl.pause(0, true);
    this.tl.kill();
  }

  /** Per-direction arrow counts — compared against the worker's chart to catch
   *  index-space divergence (the cause of "arrows stop disappearing mid-song"). */
  counts(): Record<Direction, number> {
    return {
      left: this.arrowEls.left.length,
      down: this.arrowEls.down.length,
      up: this.arrowEls.up.length,
      right: this.arrowEls.right.length,
    };
  }

  removeArrow(dir: Direction, index: number): void {
    const arrow = this.arrowEls[dir][index];
    if (!arrow) {
      console.warn(`[arrows] removeArrow MISS: no arrow at ${dir}[${index}] (lane has ${this.arrowEls[dir].length})`);
      return;
    }
    arrow.el.innerHTML = '';
  }

  /** Hide a hit arrow's image. Returns false if it could not (the symptom the
   *  user reported: arrow stays visible after being hit). */
  hideArrowImage(dir: Direction, index: number): boolean {
    const arrow = this.arrowEls[dir][index];
    if (!arrow) {
      console.warn(`[arrows] hide FAILED: no arrow at ${dir}[${index}] (lane has ${this.arrowEls[dir].length}) — index drift?`);
      return false;
    }
    const img = arrow.el.querySelector('img') as HTMLImageElement | null;
    if (!img) {
      console.warn(`[arrows] hide FAILED: no <img> at ${dir}[${index}] (already removed/freeze-released?)`);
      return false;
    }
    if (img.hidden) {
      console.warn(`[arrows] hide SUSPECT: ${dir}[${index}] <img> was already hidden — double-hit or wrong index (drift)`);
    }

    // The worker registered a hit (score went up) and we found the arrow at this
    // index — but is it the arrow the player actually sees on the receptor? A
    // correctly-timed hit hides an arrow sitting ON the receptor. If the hidden
    // arrow is far from it, the GSAP visual timeline has drifted from the worker's
    // judgment clock (e.g. after a BPM change/stop): the worker counts the hit and
    // hides arrow[index], but that's NOT the arrow under the receptor, so the one
    // the player sees never disappears. That's the "score logs but arrow stays".
    const target = this.getContainer(dir)?.querySelector(`.arrowP${this.player}`);
    if (target) {
      const dyVh = ((arrow.el.getBoundingClientRect().top - target.getBoundingClientRect().top)
        / window.innerHeight) * 100;
      if (Math.abs(dyVh) > 12) {
        console.warn(
          `[arrows] DESYNC: hiding ${dir}[${index}] but it is ${dyVh.toFixed(0)}vh from the receptor ` +
          `— visual timeline has drifted from judgment (BPM change / stop?); the on-screen arrow won't vanish`
        );
      }
    }

    img.hidden = true;
    return true;
  }

  showFreezeEater(dir: Direction, index: number): void {
    const arrow = this.arrowEls[dir][index];
    if (!arrow) {
      console.warn(`[arrows] showFreezeEater MISS: no arrow at ${dir}[${index}] (lane has ${this.arrowEls[dir].length})`);
      return;
    }
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
