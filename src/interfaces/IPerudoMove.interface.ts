import { IBaseGameMove } from 'z-games-base-game';

export interface IPerudoMove extends IBaseGameMove {
  number: number;
  figure: number;
  notBelieve: boolean;
  isMaputo: boolean;
}
