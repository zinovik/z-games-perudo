"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const z_games_base_game_1 = require("z-games-base-game");
const PLAYERS_MIN = 2;
const PLAYERS_MAX = 6;
const PLAYER_DICES_COUNT = 5;
const DICE_MAX_FIGURE = 6;
const JOKER_FIGURE = 1;
let Perudo = class Perudo extends z_games_base_game_1.BaseGame {
    constructor() {
        super(...arguments);
        this.getNewGame = () => {
            const gameData = {
                currentRound: 0,
                lastRoundResults: [],
                lastRoundFigure: 0,
                isLastRoundMaputo: false,
                currentDiceFigure: 0,
                currentDiceNumber: 0,
                players: [],
                lastPlayerId: '',
                isMaputoRound: false,
            };
            return {
                playersMax: PLAYERS_MAX,
                playersMin: PLAYERS_MIN,
                gameData: JSON.stringify(gameData),
            };
        };
        this.startGame = (gameDataJSON) => {
            let gameData = JSON.parse(gameDataJSON);
            gameData.players = gameData.players.map(player => {
                return Object.assign({}, player, { dices: [], dicesCount: PLAYER_DICES_COUNT, place: 1 });
            });
            gameData = this.nextRound(gameData);
            const nextPlayersIds = [gameData.players[Math.floor(Math.random() * gameData.players.length)].id];
            return {
                gameData: JSON.stringify(Object.assign({}, gameData)), nextPlayersIds,
            };
        };
        this.parseGameDataForUser = ({ gameData: gameDataJSON, userId }) => {
            const gameData = JSON.parse(gameDataJSON);
            gameData.players.forEach((player, index) => {
                if (player.id !== userId) {
                    gameData.players[index] = Object.assign({}, gameData.players[index], { dices: [] });
                }
            });
            return JSON.stringify(gameData);
        };
        this.makeMove = ({ gameData: gameDataJSON, move: moveJSON, userId }) => {
            let gameData = JSON.parse(gameDataJSON);
            const move = JSON.parse(moveJSON);
            let nextPlayerId;
            if (move.notBelieve) {
                if (!gameData.currentDiceNumber || !gameData.currentDiceFigure) {
                    throw new z_games_base_game_1.MakingMoveError('First move should be bet move');
                }
                let countDiceNumber = 0;
                gameData.players.forEach(player => {
                    player.dices.forEach(dice => {
                        if (dice === gameData.currentDiceFigure || (!gameData.isMaputoRound && dice === JOKER_FIGURE)) {
                            countDiceNumber++;
                        }
                    });
                });
                const playerNumber = this.getPlayerNumber({ players: gameData.players, userId });
                const lastPlayerNumber = this.getPlayerNumber({ players: gameData.players, userId: gameData.lastPlayerId });
                if (countDiceNumber < gameData.currentDiceNumber) {
                    gameData.players[lastPlayerNumber].dicesCount--;
                    if (gameData.players[lastPlayerNumber].dicesCount) {
                        nextPlayerId = gameData.players[lastPlayerNumber].id;
                    }
                    else {
                        gameData.players[lastPlayerNumber].place = this.activePlayersCount(gameData.players) + 1;
                        nextPlayerId = gameData.players[playerNumber].id;
                    }
                }
                else {
                    gameData.players[playerNumber].dicesCount--;
                    if (gameData.players[playerNumber].dicesCount) {
                        nextPlayerId = gameData.players[playerNumber].id;
                    }
                    else {
                        gameData.players[playerNumber].place = this.activePlayersCount(gameData.players) + 1;
                        nextPlayerId = this.nextPlayer({ players: gameData.players, userId });
                    }
                }
                gameData.lastRoundResults = gameData.players.map(player => (Object.assign({}, player)));
                gameData.lastRoundFigure = gameData.currentDiceFigure;
                gameData.isLastRoundMaputo = gameData.isMaputoRound;
                gameData.isMaputoRound = false;
                if (this.activePlayersCount(gameData.players) > 1) {
                    gameData = this.nextRound(gameData);
                }
            }
            else {
                if (!this.checkBetCorrect({
                    number: move.number,
                    figure: move.number,
                    currentDiceNumber: gameData.currentDiceNumber,
                    currentDiceFigure: gameData.currentDiceFigure,
                })) {
                    throw new z_games_base_game_1.MakingMoveError('Impossible bet');
                }
                const playerNumber = this.getPlayerNumber({ players: gameData.players, userId });
                if (gameData.players[playerNumber].dicesCount === 1
                    && !gameData.currentDiceNumber
                    && !gameData.currentDiceFigure
                    && this.activePlayersCount(gameData.players) > 2
                    && this.countDices(gameData.players) > 3) {
                    gameData.isMaputoRound = move.isMaputo;
                }
                gameData.currentDiceNumber = move.number;
                gameData.currentDiceFigure = move.figure;
                gameData.lastPlayerId = userId;
                nextPlayerId = this.nextPlayer({ players: gameData.players, userId });
            }
            const nextPlayersIds = [];
            if (nextPlayerId && this.activePlayersCount(gameData.players) > 1) {
                nextPlayersIds.push(nextPlayerId);
            }
            return { gameData: JSON.stringify(gameData), nextPlayersIds };
        };
        this.getRules = () => {
            const rules = '';
            return rules;
        };
        this.nextRound = (gameData) => {
            gameData.currentRound++;
            gameData.currentDiceFigure = 0;
            gameData.currentDiceNumber = 0;
            gameData.players.forEach((player) => {
                player.dices = [];
                for (let j = 0; j < player.dicesCount; j++) {
                    player.dices.push(Math.floor(Math.random() * DICE_MAX_FIGURE) + 1);
                }
                player.dices.sort((a, b) => a - b);
            });
            return Object.assign({}, gameData);
        };
        this.nextPlayer = ({ userId, players }) => {
            if (this.activePlayersCount(players) <= 1) {
                return undefined;
            }
            let nextPlayerNumber = this.getPlayerNumber({ players, userId });
            if (nextPlayerNumber >= players.length - 1) {
                nextPlayerNumber = 0;
            }
            else {
                nextPlayerNumber++;
            }
            if (!players[nextPlayerNumber].dicesCount) {
                return this.nextPlayer({ userId: players[nextPlayerNumber].id, players });
            }
            return players[nextPlayerNumber].id;
        };
        this.activePlayersCount = (players) => {
            let activePlayersCount = 0;
            players.forEach((player) => {
                if (player.dicesCount) {
                    activePlayersCount++;
                }
            });
            return activePlayersCount;
        };
        this.getPlayerNumber = ({ userId, players }) => {
            let playerNumber;
            players.forEach((player, index) => {
                if (player.id === userId) {
                    playerNumber = index;
                }
            });
            return playerNumber;
        };
        this.countDices = (players) => {
            return players.reduce((diceCount, player) => {
                return diceCount + (player.dicesCount || 0);
            }, 0);
        };
        // TODO
        this.checkBetCorrect = ({ number, figure, currentDiceNumber, currentDiceFigure }) => {
            // if (!number ||
            //   !figure ||
            //   number < currentDiceNumber ||
            //   (number === currentDiceNumber && figure <= currentDiceFigure)) {
            //   return false;
            // }
            return true;
        };
    }
};
Perudo = __decorate([
    typedi_1.Service()
], Perudo);
exports.Perudo = Perudo;
