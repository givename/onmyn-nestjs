import { Module } from '@nestjs/common';

import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameWebsocketGateway } from './game.socket';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [GameService, GameWebsocketGateway],
})
export class GameModule {}
