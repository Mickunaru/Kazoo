import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UNSORTED_PLAYERS_STATS_MOCK } from '@app/constants/test-utils';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { RoomService } from '@app/home/services/room/room.service';
import { LeaderboardComponent } from './leaderboard.component';

describe('LeaderboardComponent', () => {
    let component: LeaderboardComponent;
    let fixture: ComponentFixture<LeaderboardComponent>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;

    beforeEach(() => {
        gameStateServiceSpy = jasmine.createSpyObj('StatsService', ['initGame'], {
            playersStats: UNSORTED_PLAYERS_STATS_MOCK,
        });
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['']);
        TestBed.configureTestingModule({
            declarations: [LeaderboardComponent],
            providers: [
                { provide: GameStateService, useValue: gameStateServiceSpy },
                { provide: RoomService, useValue: roomServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(LeaderboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
