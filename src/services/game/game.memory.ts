import { GameSession } from 'src/types/game';

/// TODO: add timeout on clear old memory (or replace redis)
export const gameSessionsMemory: Map<string, GameSession> = new Map();
