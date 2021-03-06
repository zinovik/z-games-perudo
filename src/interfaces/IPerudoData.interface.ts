import { IBaseGameData } from 'z-games-base-game';

import { IPerudoPlayer } from './';

export interface IPerudoData extends IBaseGameData {
  currentRound: number;
  isMaputoRound: boolean;
  lastRoundResults: IPerudoPlayer[];
  lastRoundDiceFigure: number;
  lastRoundDiceNumber: number;
  isLastRoundMaputo: boolean;
  currentDiceFigure: number;
  currentDiceNumber: number;
  players: IPerudoPlayer[];
  lastPlayerId: string;
}
