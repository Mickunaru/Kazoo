import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EMPTY_GAME_OBJECT } from '@app/admin/admin.const';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { MOCK_GAME } from '@app/constants/test-utils';
import { Game } from '@common/interfaces/game';
import { BehaviorSubject } from 'rxjs';
import { GameBankComponent } from './game-bank.component';

describe('GameBankComponent', () => {
    let component: GameBankComponent;
    let fixture: ComponentFixture<GameBankComponent>;
    let gameLibraryServiceSpy: jasmine.SpyObj<GameLibraryService>;

    beforeEach(() => {
        gameLibraryServiceSpy = jasmine.createSpyObj('GameEditorService', ['selectedGame', 'createGame', 'games', 'updateGamesList']);
        gameLibraryServiceSpy.createGame.and.resolveTo();
        gameLibraryServiceSpy.selectedGame = new BehaviorSubject<Game>(EMPTY_GAME_OBJECT);
        gameLibraryServiceSpy.games = [];

        TestBed.configureTestingModule({
            declarations: [GameBankComponent],
            imports: [],
            providers: [{ provide: GameLibraryService, useValue: gameLibraryServiceSpy }],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(GameBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update games property in ngOnInit', () => {
        component.ngOnInit();
        expect(gameLibraryServiceSpy.updateGamesList).toHaveBeenCalled();
    });

    it('should set selectedGame of GameEditorService to EMPTY_GAME_OBJECT when calling createNewGame', fakeAsync(() => {
        gameLibraryServiceSpy.selectedGame.next(MOCK_GAME);
        component.createNewGame();
        expect(gameLibraryServiceSpy.selectedGame.value).toBe(MOCK_GAME);
        tick();
        expect(gameLibraryServiceSpy.selectedGame.value).toBe(EMPTY_GAME_OBJECT);
    }));
});
