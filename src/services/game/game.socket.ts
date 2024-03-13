import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { gameSessionsMemory } from './game.memory';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameWebsocketGateway {
  @WebSocketServer() server: Server;

  emitGameSession(gameId: string) {
    /// TODO: filtration data for stop-cheat
    /// TODO: filtration messages by session players
    const gameSessionMemory = gameSessionsMemory.get(gameId)!;
    this.server.emit('game', { gameSessionMemory });
  }

  @SubscribeMessage('enter')
  private handleGame(@MessageBody() data: { gameId: string }): void {
    /// TODO: validate exists game by gameId
    this.emitGameSession(data.gameId);
  }
}
