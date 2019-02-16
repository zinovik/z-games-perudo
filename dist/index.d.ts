import { BaseGame, BaseGameData, BaseGameMove, BaseGamePlayer } from 'z-games-base-game';
export interface PerudoData extends BaseGameData {
    currentRound: number;
    isMaputoRound: boolean;
    lastRoundResults: PerudoPlayer[];
    lastRoundFigure: number;
    isLastRoundMaputo: boolean;
    currentDiceFigure: number;
    currentDiceNumber: number;
    players: PerudoPlayer[];
    lastPlayerId: string;
}
export interface PerudoPlayer extends BaseGamePlayer {
    dices: number[];
    dicesCount: number;
}
export interface PerudoMove extends BaseGameMove {
    number: number;
    figure: number;
    notBelieve: boolean;
    isMaputo: boolean;
}
export declare class Perudo extends BaseGame {
    private static instance;
    static readonly Instance: Perudo;
    getNewGame: () => {
        playersMax: number;
        playersMin: number;
        gameData: string;
    };
    startGame: (gameDataJSON: string) => {
        gameData: string;
        nextPlayersIds: string[];
    };
    parseGameDataForUser: ({ gameData: gameDataJSON, userId }: {
        gameData: string;
        userId: string;
    }) => string;
    makeMove: ({ gameData: gameDataJSON, move: moveJSON, userId }: {
        gameData: string;
        move: string;
        userId: string;
    }) => {
        gameData: string;
        nextPlayersIds: string[];
    };
    getRules: () => string[];
    private nextRound;
    private nextPlayer;
    private activePlayersCount;
    private getPlayerNumber;
    private countDices;
    private checkBetCorrect;
}
export declare const countDices: (playersInGame: PerudoPlayer[]) => number;
export declare const calculateStartBet: ({ currentDiceNumber, currentDiceFigure, allDicesCount, isMaputoRound }: {
    currentDiceNumber: number;
    currentDiceFigure: number;
    allDicesCount: number;
    isMaputoRound: boolean;
}) => {
    diceNumber: number;
    diceFigure: number;
    isBetImpossible?: boolean | undefined;
};
export declare const countMinNumber: ({ currentDiceNumber, currentDiceFigure, isMaputoRound }: {
    currentDiceNumber: number;
    currentDiceFigure: number;
    isMaputoRound: boolean;
}) => number;
export declare const countMaxNumber: ({ allDicesCount }: {
    allDicesCount: number;
}) => number;
export declare const countMinFigure: ({ currentDiceNumber, currentDiceFigure, allDicesCount }: {
    currentDiceNumber: number;
    currentDiceFigure: number;
    allDicesCount: number;
}) => number;
export declare const countMaxFigure: ({ currentDiceNumber, currentDiceFigure, allDicesCount }: {
    currentDiceNumber: number;
    currentDiceFigure: number;
    allDicesCount: number;
}) => number;
export declare const numberInc: (diceNumber: number) => {
    diceNumber: number;
};
export declare const numberDec: ({ diceNumber, diceFigure, currentDiceNumber, currentDiceFigure }: {
    diceNumber: number;
    diceFigure: number;
    currentDiceNumber: number;
    currentDiceFigure: number;
}) => {
    diceNumber: number;
    diceFigure: number;
};
export declare const figureInc: ({ diceNumber, diceFigure, currentDiceNumber, currentDiceFigure, allDicesCount }: {
    diceNumber: number;
    diceFigure: number;
    currentDiceNumber: number;
    currentDiceFigure: number;
    allDicesCount: number;
}) => {
    diceNumber: number;
    diceFigure: number;
};
export declare const figureDec: ({ diceNumber, diceFigure, currentDiceNumber, currentDiceFigure, allDicesCount }: {
    diceNumber: number;
    diceFigure: number;
    currentDiceNumber: number;
    currentDiceFigure: number;
    allDicesCount: number;
}) => {
    diceNumber: number;
    diceFigure: number;
};
