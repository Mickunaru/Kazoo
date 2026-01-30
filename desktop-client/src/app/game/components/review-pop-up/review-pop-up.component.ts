import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { RoomService } from '@app/home/services/room/room.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { GameMode } from '@common/enum/game-mode';
import { QuestionType } from '@common/enum/question-type';
import { ListWrapper } from '@common/interfaces/list-wrapper';
import { PlayerAnswerForReview } from '@common/interfaces/player-answer-for-review';
import { PlayerReview } from '@common/interfaces/player-review';
import { GameEvent } from '@common/socket-events/game-event';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-review-pop-up',
    templateUrl: './review-pop-up.component.html',
    styleUrls: ['./review-pop-up.component.scss'],
})
export class ReviewPopUpComponent {
    questionTypeEnum = QuestionType;
    gameModeEnum = GameMode;
    s3BucketUrl = environment.s3BucketUrl;
    answerIndex: number = 0;
    playerReviews: PlayerReview[] = [];
    answers: PlayerAnswerForReview[] = [];
    // eslint-disable-next-line max-params
    constructor(
        private readonly webSocketService: WebsocketService,
        private readonly dialogRef: MatDialog,
        readonly gameStateService: GameStateService,
        readonly roomService: RoomService,
    ) {}

    setPopUp(answers: PlayerAnswerForReview[]) {
        if (this.gameStateService.questionType === QuestionType.Drawing) {
            this.gameStateService.playersAwsKeys = answers.map((answer) => answer.answer);
        }
        this.answers = answers;
    }

    saveScore(percentageGiven: number) {
        this.playerReviews.push({ percentageGiven, name: this.answers[this.answerIndex].name });
        this.answerIndex++;
        if (this.answers.length === this.answerIndex) {
            this.sendScoreToPlayers();
        }
    }

    private sendScoreToPlayers() {
        this.webSocketService.send<ListWrapper<PlayerReview>>(GameEvent.SEND_REVIEWS, { list: this.playerReviews });
        this.dialogRef.closeAll();
        this.playerReviews = [];
        this.answerIndex = 0;
    }
}
