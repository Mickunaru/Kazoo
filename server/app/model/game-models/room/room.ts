import { PlayerMap } from '@app/class/player-map/player-map';
import { MINIMUM_ID, RANDOM_ID_RANGE } from '@app/constants/room-constants';
import { NEXT_QUESTION_COUNTDOWN } from '@app/constants/time-constants';
import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { GameMaster } from '@app/model/game-models/game-master/game-master';
import { Timer } from '@app/model/game-models/timer/timer';
import { generateRandomTeamShapeIcons } from '@app/utils/generate-random-team';
import { OPEN_ENDED_DURATION } from '@common/constants/waiting-constants';
import { GameMode } from '@common/enum/game-mode';
import { QuestionType } from '@common/enum/question-type';
import { RoomState } from '@common/enum/room-state';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { PlayerAnswer } from '@common/interfaces/player-answer';
import { PlayerInfo, PlayerStatus } from '@common/interfaces/player-info';
import { PlayerDto } from '@common/interfaces/playerDto';
import { PowerUp } from '@common/interfaces/power-up';
import { Team } from '@common/interfaces/team';
import { firstValueFrom } from 'rxjs';

export class Room {
    roomState: RoomState = RoomState.OPEN;
    playerToBeEliminated: string = '';
    slowestResponses: number = 0;
    readonly isRandomGame: boolean;
    readonly game: Game;
    readonly gameMaster: GameMaster;
    readonly players: PlayerMap = new PlayerMap();
    readonly timer = new Timer();
    readonly gameConfig: GameConfigDto;
    readonly teams = new Map<string, Team>();
    readonly nextQuestionPowerUps = new Map<string, PowerUp>();
    randomTeamConfigs: string[][] = [];
    moneyPool: number = 0;
    payers: number = 0;
    everyPlayerSubmitted = false;

    private locked: boolean = false;
    private bannedUserNames: Set<string> = new Set();
    private currentQuestionIndex: number = 0;
    private playerToReceiveBonus: string = '';
    private fastestResponses: number = 0;
    private playerSubmitCount: number = 0;

    // eslint-disable-next-line max-params
    constructor(game: Game, gameMasterName: string, gameMasterSocketId: string, gameConfig: GameConfigDto) {
        this.game = game;
        this.gameMaster = new GameMaster(gameMasterName, gameMasterSocketId);
        this.isRandomGame = gameConfig.gameMode === GameMode.ELIMINATION;
        this.gameConfig = gameConfig;
        if (gameConfig.gameMode === GameMode.TEAM) this.randomTeamConfigs = generateRandomTeamShapeIcons();
    }

    get currentQuestion(): Question {
        return this.game.questions[this.currentQuestionIndex];
    }

    get currentQuestionType(): QuestionType {
        // TODO: remove cast
        return this.game.questions[this.currentQuestionIndex].type as QuestionType;
    }

    get isLocked(): boolean {
        return this.locked;
    }

    static generateCode(): string {
        return (Math.floor(Math.random() * RANDOM_ID_RANGE) + MINIMUM_ID).toString();
    }

    getCurrentQuestionRightAnswers(questionType: QuestionType) {
        switch (questionType) {
            case QuestionType.MultiChoice:
                return this.currentQuestion.choices.filter((choice) => choice.isCorrect).map((choice) => choice.text);
            case QuestionType.Estimation:
                // TODO: implement for Estimation Question
                return [`${this.currentQuestion.answer}`];
            default:
                return [];
        }
    }

    isLastQuestion(): boolean {
        return this.game.questions.length - 1 === this.currentQuestionIndex;
    }

    isNextQuestionMultiChoice(): boolean {
        return this.game.questions[this.currentQuestionIndex + 1]?.type === QuestionType.MultiChoice;
    }

    getNextQuestionIncorrectAnswers(): string[] | null {
        return this.isNextQuestionMultiChoice()
            ? this.game.questions[this.currentQuestionIndex + 1].choices.filter((c) => !c.isCorrect).map((c) => c.text)
            : null;
    }

    getPlayersStats(): PlayerInfo[] {
        return this.players.getStats(this.gameConfig.gameMode);
    }

    getPlayerList(): PlayerDto[] {
        return this.players.getPlayerList();
    }

    isPlayerNameValid(name: string): boolean {
        return !(this.players.isPlayerActive(name) || this.isPlayerBanned(name));
    }

    isPlayerBanned(name: string): boolean {
        return this.bannedUserNames.has(name.toLocaleLowerCase().trim());
    }

    banPlayer(name: string) {
        this.bannedUserNames.add(name.toLowerCase());
    }

    clientLeft(socketId: string) {
        if (this.gameMaster.socketId === socketId) {
            this.gameMaster.hasLeft = true;
        }

        const player = this.players.getPlayerFromSocket(socketId);
        if (player) {
            player.status = PlayerStatus.Left;
        }
    }

    switchLockState() {
        this.locked = !this.locked;
        this.roomState = this.locked ? RoomState.LOCKED : RoomState.OPEN;
    }

    setStartGameState() {
        this.roomState = RoomState.IN_GAME;
    }

    setEndGameState() {
        this.roomState = RoomState.FINISHED;
    }

    submitAnswer(socketId: string, playerAnswer: PlayerAnswer) {
        switch (playerAnswer.questionType) {
            case QuestionType.MultiChoice:
                this.validatePlayerAnswer(socketId, playerAnswer.data);
                break;
            case QuestionType.OpenEnded:
            case QuestionType.Drawing:
                this.savePlayerAnswer(socketId, playerAnswer.data);
                break;
            case QuestionType.Estimation:
                this.validateEstimatedAnswer(socketId, playerAnswer.data);
        }
    }

    markPlayerAsSubmitted(playerId: string) {
        this.playerSubmitCount++;
        const player = this.players.getPlayerFromSocket(playerId);
        if (!player) return;
        player.status = PlayerStatus.Submitted;
        return player;
    }

    validatePlayerAnswer(playerId: string, playerAnswers: boolean[]) {
        const player = this.markPlayerAsSubmitted(playerId);
        if (!player) return;
        const answers = this.currentQuestion.choices.map((choice) => choice.isCorrect);
        if (answers.every((answer, index) => answer === playerAnswers[index])) {
            this.updatePlayerToReceiveBonus(player.name, this.timer.time);
            player.receivePoints(this.currentQuestion.points);
        }
    }

    validateEstimatedAnswer(playerId: string, playerAnswer: number) {
        const player = this.markPlayerAsSubmitted(playerId);
        if (!player) return;
        const { precision, answer } = this.currentQuestion;
        const isInBounds = playerAnswer - precision <= answer && answer <= playerAnswer + precision;

        if (isInBounds) {
            this.playerToBeEliminated = player.name;
            player.receivePoints(this.currentQuestion.points);
            if (answer === playerAnswer) player.receiveBonusPoints();
        }
    }

    savePlayerAnswer(playerId: string, answer: string) {
        const player = this.markPlayerAsSubmitted(playerId);
        if (!player) return;
        player.answerValue = answer;
    }

    updatePlayerToReceiveBonus(playerName: string, timeAnswered: number) {
        if (timeAnswered > this.fastestResponses) {
            this.fastestResponses = timeAnswered;
            this.playerToReceiveBonus = playerName;
        } else if (this.fastestResponses === timeAnswered) {
            this.playerToReceiveBonus = '';
        }
        this.playerToBeEliminated = playerName;
    }

    giveBonusToFastestPlayer() {
        if (this.players.hasName(this.playerToReceiveBonus)) {
            const player = this.players.getPlayerFromName(this.playerToReceiveBonus);
            if (!player) return;
            player.receiveBonusPoints();
        }
    }

    loadNextQuestion(): Question | undefined {
        if (!this.isLastQuestion()) {
            this.everyPlayerSubmitted = false;
        }
        this.players.resetPlayersStateForNextQuestion();
        this.playerSubmitCount = 0;
        this.fastestResponses = 0;
        this.currentQuestionIndex++;
        this.playerToReceiveBonus = '';
        this.playerToBeEliminated = '';
        this.slowestResponses = this.game.duration + 1;
        return this.currentQuestion;
    }

    async onQuestionTransitionEnd() {
        this.timer.startCountdown(NEXT_QUESTION_COUNTDOWN);
        await firstValueFrom(this.timer.end);
        this.startNextQuestionTimer();
    }

    startNextQuestionTimer() {
        if (this.currentQuestion) {
            const time = this.currentQuestion.type === QuestionType.OpenEnded ? OPEN_ENDED_DURATION : this.game.duration;
            this.timer.startCountdown(time);
        }
    }

    haveAllPlayerAnswered(): boolean {
        return this.players.activePlayers.every(([, player]) => player.status === PlayerStatus.Submitted);
    }

    destroy() {
        this.timer.destroy();
    }
}
