import fs from 'fs';
import path from 'path';

const sectionSplit = /\/\/(?:\-*)dance\-[a-z]+\s\-\s(?:\-*)/;
const metadataRegex = /\#([A-Z0-9]*)\:([^;]*)/;
const singleRegex = /dance\-([a-z]+)/;
const difficultyRegex = /(Beginner|Easy|Medium|Hard|Challenge)/;
const numberIdRegex = /(\d\.\d{3})/;
const measureRegex = /\s+\/\/\smeasure\s\d+/g;
const grooveRegex = /\d{1}\.\d{3}\:/;

interface BPMEntry { beat: number; bpm: number }
interface StopEntry { beat: number; duration: number }

interface GrooveRadar {
  stream: number; voltage: number; air: number; freeze: number; chaos: number;
}

interface ChartData {
  difficulty: string;
  level: number;
  grooveRadar: GrooveRadar;
  stepchart: string[][][];
}

interface Metadata {
  TITLE: string;
  ARTIST: string;
  BPMS: BPMEntry[];
  STOPS: StopEntry[];
  OFFSET: string;
  MUSIC: string;
  DISPLAYBPM: string;
  SAMPLESTART: number;
  SAMPLELENGTH: number;
  BANNER: string;
  BACKGROUND: string;
  [key: string]: unknown;
}

export interface ParsedSM {
  metadata: Metadata;
  charts: Record<string, ChartData>;
}

function getChartData(section: string): ChartData {
  const data: Partial<ChartData> = {};
  const lastgroove = grooveRegex.exec(section)![0];
  const splitSection = section.split(grooveRegex);
  const chartInfo = splitSection[0].concat(lastgroove);
  const stepchart = splitSection[1];
  const measures = stepchart.replace(measureRegex, '').split(',\r\n');

  const beats: string[][][] = measures.map((measure) =>
    measure
      .split('\r\n')
      .filter(Boolean)
      .map((line) => line.split(''))
  );
  data.stepchart = beats;

  const infoLines = chartInfo.trim().split('\r\n');
  for (const raw of infoLines) {
    const line = raw.trim().replace(':', '');
    const diff = difficultyRegex.exec(line);
    if (diff) {
      data.difficulty = diff[1];
    } else if (!isNaN(Number(line)) && line !== '') {
      data.level = Number(line);
    } else {
      const attrs = line.split(',');
      if (attrs.length === 5) {
        const nums = attrs.map((n) => Number(numberIdRegex.exec(n)?.[1] ?? 0));
        data.grooveRadar = {
          stream: nums[0], voltage: nums[1], air: nums[2],
          freeze: nums[3], chaos: nums[4],
        };
      }
    }
  }
  return data as ChartData;
}

export function readSM(title: string): ParsedSM {
  const filePath = path.join(process.cwd(), 'browser', 'sm', title);
  const raw = fs.readFileSync(filePath, 'utf8');

  const sections = raw.split(sectionSplit);

  let metaStr = sections[0]
    .split('\r\n')
    .filter((line) => /[#,;]/.test(line.trim().charAt(0)));
  const joined = metaStr.join('!@').replace(/\!\@([,;])/g, '$1').split('!@');

  const metadata: Record<string, unknown> = {};
  for (const line of joined) {
    const match = metadataRegex.exec(line);
    if (!match) continue;
    metadata[match[1]] = match[2].trim();
  }

  metadata.BPMS = metadata.BPMS
    ? (metadata.BPMS as string).split(',').map((bpm) => {
        const [beat, bpmVal] = bpm.split('=');
        return { beat: Number(beat), bpm: Number(bpmVal) };
      })
    : [{ beat: 0, bpm: metadata.DISPLAYBPM }];

  metadata.STOPS = metadata.STOPS
    ? (metadata.STOPS as string).split(',').map((stop) => {
        const [beat, duration] = stop.split('=');
        return { beat: Number(beat), duration: Number(duration) };
      })
    : [];

  const charts: Record<string, ChartData> = {};
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const match = singleRegex.exec(section);
    if (match && match[1] === 'single') {
      const chartData = getChartData(section);
      charts[chartData.difficulty] = chartData;
    }
  }

  return { metadata: metadata as unknown as Metadata, charts };
}
