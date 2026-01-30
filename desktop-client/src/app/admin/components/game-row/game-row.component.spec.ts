import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EMPTY_GAME_OBJECT } from '@app/admin/admin.const';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { AppMaterialModule } from '@app/modules/material.module';
import { Game } from '@common/interfaces/game';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GameRowComponent } from './game-row.component';

describe('GameRowComponent', () => {
    let component: GameRowComponent;
    let fixture: ComponentFixture<GameRowComponent>;
    let gameLibraryServiceSpy: jasmine.SpyObj<GameLibraryService>;

    beforeEach(() => {
        gameLibraryServiceSpy = jasmine.createSpyObj('GameEditorService', [
            'selectedGame',
            'deleteGame',
            'updateGame',
            'hideGame',
            'updateGamesList',
        ]);
        gameLibraryServiceSpy.deleteGame.and.resolveTo();
        gameLibraryServiceSpy.updateGame.and.resolveTo();
        gameLibraryServiceSpy.hideGame.and.resolveTo();
        gameLibraryServiceSpy.selectedGame = new BehaviorSubject<Game>(EMPTY_GAME_OBJECT);

        TestBed.configureTestingModule({
            declarations: [GameRowComponent],
            providers: [{ provide: GameLibraryService, useValue: gameLibraryServiceSpy }],
            imports: [AppMaterialModule],
        });
        fixture = TestBed.createComponent(GameRowComponent);
        component = fixture.componentInstance;
        component.game = {
            id: '1234',
            isHidden: false,
            lastModification: new Date(),
            title: 'Game 1',
            description: 'Test Game 1',
            duration: 10,
            questions: [],
            private: false,
            creator: 'name',
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set downloadJsonHref property in ngOnInit', () => {
        component.ngOnInit();
        expect(component.downloadJsonHref).toBeDefined();
    });

    it('should set up a subscription in ngOnInit', () => {
        const subscribeSpy = spyOn(gameLibraryServiceSpy.selectedGame, 'subscribe').and.returnValue(new Subscription());
        component.ngOnInit();
        expect(subscribeSpy).toHaveBeenCalled();
        expect(component['gameEditorSubscription']).toBeDefined();
    });

    it('should initially set isSelected to be false after calling ngOnInit', () => {
        component.ngOnInit();
        expect(component.isSelected).toBe(false);
    });

    it('should update isSelected based on selectedGameIdChanged', () => {
        component.ngOnInit();
        gameLibraryServiceSpy.selectedGame.next(component.game);
        expect(component.isSelected).toBe(true);
    });

    it('should call unsubscribe in ngOnDestroy', () => {
        const unsubscribeSpy = spyOn(component['gameEditorSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should set selectedGame value to the selected game in onSelect', fakeAsync(() => {
        const nextSpy = spyOn(gameLibraryServiceSpy.selectedGame, 'next').and.callThrough();
        component.onSelect();
        expect(gameLibraryServiceSpy.selectedGame.value).not.toEqual(component.game);
        tick();
        expect(nextSpy).toHaveBeenCalledWith(component.game);
        expect(gameLibraryServiceSpy.selectedGame.value).toEqual(component.game);
    }));

    it('should call deleteGame of GameEditorService in deleteGame', fakeAsync(() => {
        component.deleteGame();
        tick();
        expect(gameLibraryServiceSpy.deleteGame).toHaveBeenCalledWith(component.game.id);
    }));

    it('should call updateGamesList of GameEditorService in deleteGame', fakeAsync(() => {
        gameLibraryServiceSpy.deleteGame.and.resolveTo(component.game);
        component.deleteGame();
        tick();
        expect(gameLibraryServiceSpy.deleteGame).toHaveBeenCalledBefore(gameLibraryServiceSpy.updateGamesList);
    }));

    it('should call hideGame in toggleVisibility', fakeAsync(() => {
        component.toggleVisibility();
        tick();
        expect(gameLibraryServiceSpy.hideGame).toHaveBeenCalledWith(component.game.id, { isHidden: !component.game.isHidden });
    }));

    it('should call updateGamesList in toggleVisibility', fakeAsync(() => {
        gameLibraryServiceSpy.hideGame.and.resolveTo(component.game);
        component.toggleVisibility();
        tick();
        expect(gameLibraryServiceSpy.hideGame).toHaveBeenCalledBefore(gameLibraryServiceSpy.updateGamesList);
    }));
});
