import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { GameSession } from 'src/types/game';

import { gameSessionsMemory } from './game.memory';
import { GameWebsocketGateway } from './game.socket';

@Injectable()
export class GameService {
  constructor(private socket: GameWebsocketGateway) {}

  public clickGame(props: {
    gameId: string;
    playerId: string;
    x: number;
    y: number;
  }) {
    const gameSessionMemory = gameSessionsMemory.get(props.gameId);

    if (gameSessionMemory.status !== 'loop') {
      return;
    }

    /// TODO: validate arguments

    const currentPlayerId =
      gameSessionMemory.players[gameSessionMemory.playerStep];

    const cell = gameSessionMemory.map.cells[`${props.x}.${props.y}`];

    if (currentPlayerId !== props.playerId) {
      return;
    }
    if (cell?.status !== 'hidden') {
      return;
    }

    gameSessionMemory.statistics.steps += 1;

    let isNeedSwitchPlayerStep = false;

    if (cell) {
      cell.status = gameSessionMemory.playerStep;

      if (cell.entity === 'diamond') {
        if (gameSessionMemory.playerStep === 'first') {
          gameSessionMemory.statistics.scoreFirst += 1;
        } else {
          gameSessionMemory.statistics.scoreSecond += 1;
        }
      } else {
        isNeedSwitchPlayerStep = true;
      }
    }

    if (isNeedSwitchPlayerStep) {
      if (gameSessionMemory.playerStep === 'first') {
        gameSessionMemory.playerStep = 'second';
      } else {
        gameSessionMemory.playerStep = 'first';
      }
    }

    /// TODO: add check winner
    /// TODO: refactoring

    this.socket.emitGameSession(props.gameId);
  }

  public enterGame(props: { playerId: string }) {
    const game = [...gameSessionsMemory.values()].find(
      ({ status }) => status == 'wait',
    );

    if (!game) {
      let countDiamond = 5 + Math.random() * 10;
      if (countDiamond % 2 == 0) {
        --countDiamond;
      }

      return this.createNewGameSession({
        playerId: props.playerId,
        width: 10,
        height: 10,
        countDiamond,
      });
    }

    const gameId = game.id;
    game.players.second = props.playerId;

    this.switchGameSessionOnLoop({ gameId });

    return { gameId };
  }

  private createNewGameSession(props: {
    playerId: string;
    width: number;
    height: number;
    countDiamond: number;
  }) {
    const { playerId, width, height, countDiamond } = props;

    const cells: GameSession['map']['cells'] = {};

    {
      /// TODO: validate correct countDiamond (for width * height)

      const positionDiamondKeys: Set<string> = new Set();

      while (positionDiamondKeys.size < countDiamond) {
        const xrandom = Math.floor(Math.random() * width);
        const yrandom = Math.floor(Math.random() * height);

        const positionDiamondKey = `${xrandom}.${yrandom}`;
        positionDiamondKeys.add(positionDiamondKey);
      }

      for (const positionDiamondKey of positionDiamondKeys) {
        cells[positionDiamondKey] = {
          status: 'hidden',
          entity: 'diamond',
        };
      }

      for (const positionDiamondKey of positionDiamondKeys) {
        const [x, y] = positionDiamondKey.split('.').map(Number);

        for (let i = -1; i <= 1; ++i) {
          for (let j = -1; j <= 1; ++j) {
            const xx = x + i;
            const yy = y + j;
            const positionKey = `${xx}.${yy}`;

            if (positionDiamondKey === positionKey) {
              continue;
            }
            if (positionDiamondKeys.has(positionKey)) {
              continue;
            }
            if (xx < 0 || yy < 0 || xx >= width || yy >= height) {
              continue;
            }

            const cell = cells[positionKey] ?? {
              status: 'hidden',
              entity: 0,
            };

            cells[positionKey] = cell;

            (cell.entity as number) += 1;
          }
        }
      }
    }

    const gameId = uuidv4();
    const gameSessionMemory: GameSession = {
      id: gameId,
      map: {
        cells,
        width,
        height,
      },
      players: {
        first: playerId,
        second: '',
      },
      statistics: {
        steps: 0,
        scoreFirst: 0,
        scoreSecond: 0,
      },
      status: 'wait',
      playerStep: 'first',
    };

    gameSessionsMemory.set(gameSessionMemory.id, gameSessionMemory);

    return { gameId };
  }

  private switchGameSessionOnLoop(props: { gameId: string }) {
    const gameSessionMemory = gameSessionsMemory.get(props.gameId);
    gameSessionMemory.status = 'loop';

    this.socket.emitGameSession(props.gameId);
  }
}
