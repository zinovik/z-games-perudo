import { IBaseGamePlayer } from 'z-games-base-game';

export interface IPerudoPlayer extends IBaseGamePlayer {
  dices: number[];
  dicesCount: number;
}
