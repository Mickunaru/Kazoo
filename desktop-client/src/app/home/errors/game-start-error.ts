export enum GameStartErrorTypes {
    HIDDEN,
    DELETED,
    IMPOSSIBLE,
    NOT_ENOUGH_QUESTIONS,
    NOT_ENOUGH_MONEY,
}
export class GameStartError extends Error {
    constructor(
        message: string,
        readonly type: GameStartErrorTypes,
    ) {
        super(message);
        this.name = 'GameStartError';
    }
}
