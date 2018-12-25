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
            const rules = [];
            rules.push('This ancient Peruvian dice game is played with 2 to 6 players. It is a skillful game of guesswork, bluff and luck.');
            rules.push('Simultaneously, all players shake their 5 dice in their cups and turn them over on the table, using the cup to conceal their dice from the other players. Having looked at his or her own dice the first player makes a call based on an estimate of how many dice of a particular number there are under all the cups on the table. Two factors should be considered when making a call:');
            rules.push('1. The total number of dice on the table: If there are six players, for example, then there will be a total of thirty dice in play. The probability therefore is that there will be five dice of any given value: five twos, five threes, etc.');
            rules.push('2. All ones - known as “aces” - are wild and are counted as the value of whichever bid is made. Thus a call of “seven fours” is based on a prediction that there will be a total of seven dice with a value of either four or ace.');
            rules.push('The player to the opener’s left then makes a call and the bidding proceeds around the table. Each bid must be higher than the last. So a call of “seven fours” can be followed by, say, “seven fives” or by “eight twos”, but not by “six sixes” or by “seven twos”. Jump bids (“nine threes” for example) can also be made, with the intention of raising the stakes for the next player.');
            rules.push('If a player feels unable to raise the bidding any further, the call of “dudo” (meaning “I doubt” in Spanish) is made. This halts the bidding process and the last call made is accepted.');
            rules.push('All players then uncover their dice (the player who called dudo first, the player who made the final bid last). Dice of the relevant value are counted and added to the number of aces revealed. If the call was, say, “seven twos” and there are fewer than seven dice showing either two or ace, then the player who made the bid loses one die. If there are seven (or more) twos and aces showing, then the player who called dudo loses one die. All dice that are removed from the game should be placed in the pouch so that the total number of dice in play is hidden.');
            rules.push('The player who loses a die starts the bidding process in the next round.');
            rules.push('Aces');
            rules.push('Once the bidding has started, another option is available: the call of “aces”. This is a prediction of how many aces there will be. To do this, the number of dice predicted is halved from that of the previous bid. So a bid of “eight sixes” can be followed by a call of “four aces” (or “five aces” etc). Fractions are always rounded up,');
            rules.push('Following a call of “aces”, the next player can either raise the quantity of aces or can revert to numbers by doubling the quantity of aces called and adding one. So following a call of “four aces”, the next bid must be at least “five aces” or at least nine of a number. A call of dudo can also of course be made.');
            rules.push('Each quantity of “aces” can only be bid once in a round.');
            rules.push('A call of “aces” cannot be made on the first bid of a round.');
            rules.push('Maputo');
            rules.push('Any player who loses his or her fourth die is declared Maputo. During the bidding in that round, other players are only allowed to raise the quantity of dice, not the value (i.e. an opening call by a Maputo player of “two threes” can only be followed by “three threes”, “four threes” etc.)');
            rules.push('During a Maputo round, aces are not wild.');
            rules.push('Only a Maputo player can make an opening call of “aces”.');
            rules.push('A player can only be Maputo once in the course of a game: the round immediately following the loss of the fourth die.');
            rules.push('A player with only one die left who has already been Maputo is allowed during a subsequent Maputo round to raise the value during the bidding (i.e. by calling say “two fours” after a call of “two threes”). Subsequent players then follow the new value that has been called.');
            rules.push('The end of the game');
            rules.push('A player who loses his or her final die is out of the game. The player to the immediate left starts the bidding in the next round.');
            rules.push('When there are only two players left the Maputo rules do not apply Even if both players have only one die left numbers can be changed in the bidding and aces are still wild.');
            rules.push('The winner is the last player with any dice left.');
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
                return '';
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
            let playerNumber = 0;
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
// For front-end
exports.countDices = (playersInGame) => {
    return playersInGame.reduce((diceCount, playerInGame) => {
        return diceCount + (playerInGame.dicesCount || 0);
    }, 0);
};
exports.calculateStartBet = ({ currentDiceNumber, currentDiceFigure, allDicesCount, isMaputoRound }) => {
    if (!currentDiceNumber || !currentDiceFigure) {
        return { diceNumber: 1, diceFigure: 2 };
    }
    if (currentDiceNumber < allDicesCount) {
        return { diceNumber: currentDiceNumber + 1, diceFigure: currentDiceFigure };
    }
    if (currentDiceFigure === JOKER_FIGURE || isMaputoRound) {
        return { diceNumber: currentDiceNumber, diceFigure: currentDiceFigure, isBetImpossible: true };
    }
    if (currentDiceFigure < DICE_MAX_FIGURE) {
        return { diceNumber: currentDiceNumber, diceFigure: currentDiceFigure + 1 };
    }
    return { diceNumber: Math.ceil(currentDiceNumber / 2), diceFigure: JOKER_FIGURE };
};
exports.countMinNumber = ({ currentDiceNumber, currentDiceFigure, isMaputoRound }) => {
    if (!currentDiceNumber || !currentDiceFigure) {
        return 1;
    }
    if (currentDiceFigure === JOKER_FIGURE || isMaputoRound) {
        return currentDiceNumber + 1;
    }
    return Math.ceil(currentDiceNumber / 2);
};
exports.countMaxNumber = ({ allDicesCount }) => {
    return allDicesCount;
};
exports.countMinFigure = ({ currentDiceNumber, currentDiceFigure, allDicesCount }) => {
    if (!currentDiceNumber || !currentDiceFigure) {
        return JOKER_FIGURE + 1;
    }
    if (currentDiceFigure !== JOKER_FIGURE) {
        return JOKER_FIGURE;
    }
    if (currentDiceNumber === allDicesCount) {
        return currentDiceFigure;
    }
    return JOKER_FIGURE;
};
exports.countMaxFigure = ({ currentDiceNumber, currentDiceFigure, allDicesCount }) => {
    if ((currentDiceFigure === JOKER_FIGURE || currentDiceFigure === DICE_MAX_FIGURE) && currentDiceNumber * 2 + 1 >= allDicesCount) {
        return JOKER_FIGURE;
    }
    return DICE_MAX_FIGURE;
};
exports.numberInc = (diceNumber) => {
    return { diceNumber: diceNumber + 1 };
};
exports.numberDec = ({ diceNumber, diceFigure, currentDiceNumber, currentDiceFigure }) => {
    if (diceFigure === JOKER_FIGURE ||
        diceNumber - 1 > currentDiceNumber ||
        (diceNumber - 1 === currentDiceNumber && diceFigure > currentDiceFigure)) {
        return { diceNumber: diceNumber - 1, diceFigure };
    }
    if (diceNumber - 1 === currentDiceNumber &&
        diceFigure <= currentDiceFigure &&
        currentDiceFigure !== DICE_MAX_FIGURE) {
        return { diceNumber: diceNumber - 1, diceFigure: currentDiceFigure + 1 };
    }
    return { diceNumber: diceNumber - 1, diceFigure: JOKER_FIGURE };
};
exports.figureInc = ({ diceNumber, diceFigure, currentDiceNumber, currentDiceFigure, allDicesCount }) => {
    if (diceFigure !== JOKER_FIGURE) {
        return { diceNumber, diceFigure: diceFigure + 1 };
    }
    if (currentDiceFigure === JOKER_FIGURE && diceNumber < currentDiceNumber * 2 + 1) {
        return { diceNumber: currentDiceNumber * 2 + 1, diceFigure: diceFigure + 1 };
    }
    if (currentDiceFigure !== JOKER_FIGURE && diceNumber <= currentDiceNumber) {
        if (currentDiceNumber + 1 <= allDicesCount) {
            return { diceNumber: currentDiceNumber + 1, diceFigure: diceFigure + 1 };
        }
        return { diceNumber: currentDiceNumber, diceFigure: currentDiceFigure + 1 };
    }
    return { diceNumber, diceFigure: diceFigure + 1 };
};
exports.figureDec = ({ diceNumber, diceFigure, currentDiceNumber, currentDiceFigure, allDicesCount }) => {
    if (diceFigure - 1 === JOKER_FIGURE || diceFigure - 1 > currentDiceFigure || diceNumber > currentDiceNumber) {
        return { diceNumber, diceFigure: diceFigure - 1 };
    }
    if (diceNumber === allDicesCount && diceFigure - 1 <= currentDiceFigure) {
        return { diceNumber, diceFigure: JOKER_FIGURE };
    }
    return { diceNumber: diceNumber + 1, diceFigure: diceFigure - 1 };
};
