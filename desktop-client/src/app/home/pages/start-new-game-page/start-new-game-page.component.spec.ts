import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { GAME_CODE_MOCK, SERVER_GAME_BANK_MOCK } from '@app/constants/test-utils';
import { StartNewGamePageComponent } from '@app/home/pages/start-new-game-page/start-new-game-page.component';
import { RandomGameService } from '@app/home/services/random-game/random-game.service';
import { AppMaterialModule } from '@app/modules/material.module';
import { Game } from '@common/interfaces/game';

describe('StartNewGamePageComponent', () => {
    let component: StartNewGamePageComponent;
    let fixture: ComponentFixture<StartNewGamePageComponent>;
    let randomGameServiceSpy: jasmine.SpyObj<RandomGameService>;
    let gameLibraryServiceSpy: jasmine.SpyObj<GameLibraryService>;

    beforeEach(async () => {
        gameLibraryServiceSpy = jasmine.createSpyObj('GameLibraryService', ['publicGames', 'updatePublicGames', 'getGame']);
        randomGameServiceSpy = jasmine.createSpyObj('RandomGameService', ['startRandomGame', 'hasEnoughQuestionForRandomGame']);

        await TestBed.configureTestingModule({
            imports: [AppMaterialModule, HttpClientTestingModule],
            declarations: [StartNewGamePageComponent],
            providers: [
                { provide: GameLibraryService, useValue: gameLibraryServiceSpy },
                { provide: RandomGameService, useValue: randomGameServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StartNewGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should select game details', () => {
        const testGame: Game = SERVER_GAME_BANK_MOCK[0];

        component.showGameDetails(testGame);

        expect(component.selectedGame).toEqual(testGame);
    });

    it('should select other game details if clicked on another game', () => {
        const testGame1: Game = SERVER_GAME_BANK_MOCK[0];
        const testGame2: Game = SERVER_GAME_BANK_MOCK[1];

        component.showGameDetails(testGame1);
        component.showGameDetails(testGame2);

        expect(component.selectedGame).toEqual(testGame2);
    });

    it('should unselect game if clicked a second time', () => {
        const testGame: Game = SERVER_GAME_BANK_MOCK[0];

        component.showGameDetails(testGame);
        component.showGameDetails(testGame);

        expect(component.selectedGame).toBeNull();
    });

    it('should unselect game and refresh game list', () => {
        component.unselectGame();
        expect(gameLibraryServiceSpy.updatePublicGames).toHaveBeenCalled();
    });

    it('should return game id', () => {
        const id = component.trackGameListkByGameId(0, { id: GAME_CODE_MOCK } as Game);
        expect(id).toEqual(GAME_CODE_MOCK);
    });
});
