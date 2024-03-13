export type GameSession = {
  id: string;
  map: {
    width: number;
    height: number;
    cells: Record<
      string,
      {
        status: 'hidden' | 'first' | 'second';
        entity: number | 'diamond';
      }
    >;
  };
  players: {
    first: string;
    second: string;
  };
  statistics: {
    steps: number;
    scoreFirst: number;
    scoreSecond: number;
  };
  status: 'wait' | 'loop' | 'end';
  playerStep: 'first' | 'second';
};
