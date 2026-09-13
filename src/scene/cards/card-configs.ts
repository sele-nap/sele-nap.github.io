import { cardAccents } from '@/tokens/theme';
import type { SectionId } from '@/types';

export interface CardBaseDef {
  id: SectionId;
  symbol: string;
  roman: string;
  subtitle: string;
  label: string;
  accentColor: string;
}

export interface CardDef extends CardBaseDef {
  position: [number, number, number];
}

export type SlotDef = { position: [number, number, number] };

export const LANDSCAPE_SLOTS: SlotDef[] = [
  { position: [-5.0, 0, 0] },
  { position: [-2.5, 0, 0] },
  { position: [0, 0, 0] },
  { position: [2.5, 0, 0] },
  { position: [5.0, 0, 0] },
];

export const PORTRAIT_SLOTS: SlotDef[] = [
  { position: [-1.15, 3.6, 0] },
  { position: [1.15, 3.6, 0] },
  { position: [-1.15, 0.0, 0] },
  { position: [1.15, 0.0, 0] },
  { position: [0, -3.6, 0] },
];

export const CARD_CONFIGS = [
  {
    id: 'about',
    symbol: '☽',
    accentColor: cardAccents.about,
    roman: 'I',
    subtitle: '☽  the self  ☽',
  },
  {
    id: 'formations',
    symbol: '✦',
    accentColor: cardAccents.formations,
    roman: 'II',
    subtitle: '✦  the path  ✦',
  },
  {
    id: 'experiences',
    symbol: '✵',
    accentColor: cardAccents.experiences,
    roman: 'III',
    subtitle: '✵  the journey  ✵',
  },
  {
    id: 'contact',
    symbol: '✉',
    accentColor: cardAccents.contact,
    roman: 'IV',
    subtitle: '✉  the thread  ✉',
  },
  {
    id: 'projects',
    symbol: '⬡',
    accentColor: cardAccents.projects,
    roman: 'V',
    subtitle: '⬡  the craft  ⬡',
  },
] as const;

export const CARD_CANVAS_W = 512;
export const CARD_CANVAS_H = 896;
