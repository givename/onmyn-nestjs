import { Body, Controller, Post, Put } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('/game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('/enter')
  async enterGame(@Body() props: any) {
    /// TODO: add dto for validate
    return this.gameService.enterGame({
      playerId: props.playerId,
    });
  }

  @Put('/click')
  async clickCell(@Body() props: any) {
    /// TODO: add dto for validate

    return this.gameService.clickGame({
      gameId: props.gameId,
      playerId: props.playerId,
      x: props.x,
      y: props.y,
    });
  }
}
