import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { ColorPickerComponent, ColorPickerDirective } from 'ngx-color-picker';
import { DrawingAnswerComponent } from './components/answer-types/drawing-answer/drawing-answer.component';
import { EstimationAnswerComponent } from './components/answer-types/estimation-answer/estimation-answer.component';
import { MultipleChoiceAnswerComponent } from './components/answer-types/multiple-choice-answer/multiple-choice-answer.component';
import { OpenEndedAnswerComponent } from './components/answer-types/open-ended-answer/open-ended-answer.component';
import { BrushSettingsOverlayComponent } from './components/brush-settings-overlay/brush-settings-overlay.component';
import { GamePannelComponent } from './components/game-pannel/game-pannel.component';
import { InteractivePlayerListComponent } from './components/interactive-player-list/interactive-player-list.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { PlayerControlsComponent } from './components/player-controls/player-controls.component';
import { PlayersDrawingsPopUpComponent } from './components/players-drawings-pop-up/players-drawings-pop-up.component';
import { ReviewPopUpComponent } from './components/review-pop-up/review-pop-up.component';
import { StandardGameTimerComponent } from './components/standard-game-timer/standard-game-timer.component';
import { SurgeDialogComponent } from './components/surge-dialog/surge-dialog.component';
import { ValidityPopUpComponent } from './components/validity-pop-up/validity-pop-up.component';
import { LockButtonComponent } from './components/waiting-room/lock-button/lock-button.component';
import { PlayerListComponent } from './components/waiting-room/player-list/player-list.component';
import { StartGameButtonComponent } from './components/waiting-room/start-game-button/start-game-button.component';
import { TeamListComponent } from './components/waiting-room/team-list/team-list.component';
import { GameMasterPageComponent } from './pages/game-master-page/game-master-page.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { ResultsPageComponent } from './pages/results-page/results-page.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';
import { LeaveGameDialogComponent } from './components/leave-game-dialog/leave-game-dialog.component';

@NgModule({
    declarations: [
        LockButtonComponent,
        PlayerListComponent,
        TeamListComponent,
        ValidityPopUpComponent,
        SurgeDialogComponent,
        StandardGameTimerComponent,
        ReviewPopUpComponent,
        PlayersDrawingsPopUpComponent,
        PlayerControlsComponent,
        LeaderboardComponent,
        InteractivePlayerListComponent,
        GamePannelComponent,
        DrawingAnswerComponent,
        EstimationAnswerComponent,
        StartGameButtonComponent,
        MultipleChoiceAnswerComponent,
        OpenEndedAnswerComponent,
        BrushSettingsOverlayComponent,
        WaitingRoomPageComponent,
        GamePageComponent,
        GameMasterPageComponent,
        ResultsPageComponent,
        LeaveGameDialogComponent,
    ],
    imports: [AppMaterialModule, ColorPickerComponent, ColorPickerDirective, RouterModule, CommonModule, FormsModule, SharedModule],
    exports: [WaitingRoomPageComponent, GamePageComponent, GameMasterPageComponent, ResultsPageComponent],
})
export class GameModule {}
