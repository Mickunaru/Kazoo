import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ID_MOCK, MOCK_GAME } from '@app/constants/test-utils';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { GAME_VISIBILITY_ENDPOINT } from '@common/constants/endpoint-constants';
import { GameVisibility } from '@common/enum/game-visibility';
import { GameLibraryService } from './game-library.service';

describe('GameLibraryService', () => {
    let service: GameLibraryService;
    let httpTestingController: HttpTestingController;
    let userAuthService: jasmine.SpyObj<UserAuthService>;

    beforeEach(() => {
        userAuthService = jasmine.createSpyObj('UserAuthService', ['requestOptions']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: UserAuthService, useValue: userAuthService }],
        });
        service = TestBed.inject(GameLibraryService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Games should be empty at first', () => {
        expect(service.games).toEqual([]);
    });

    it('should return true if title exists', () => {
        service.games = [MOCK_GAME];
        expect(service.titleExists(MOCK_GAME.title)).toBeTrue();
    });

    it('should return false if title exists', () => {
        service.games = [MOCK_GAME];
        const newTitle = 'new title';
        expect(service.titleExists(newTitle)).toBeFalse();
    });

    it('should get games', fakeAsync(() => {
        const MOCK_GAME_WITH_DATE = { ...MOCK_GAME, lastModification: new Date() };
        service.updateGamesList();
        const req = httpTestingController.expectOne(service['baseUrl']);
        expect(req.request.method).toEqual('GET');
        req.flush([MOCK_GAME_WITH_DATE]);
        tick();
        expect(service.games).toEqual([MOCK_GAME_WITH_DATE]);
    }));

    it('should return empty list if no games were found', fakeAsync(() => {
        service.updateGamesList();
        const req = httpTestingController.expectOne(service['baseUrl']);
        expect(req.request.method).toEqual('GET');
        req.flush([]);
        tick();
        expect(service.games).toEqual([]);
    }));

    it('should return game visibility', fakeAsync(() => {
        service.getGameVisibility(ID_MOCK).then((gameVisibility) => {
            expect(gameVisibility).toEqual({ visibility: GameVisibility.PUBLIC });
        });
        const req = httpTestingController.expectOne(`${service['baseUrl']}/${GAME_VISIBILITY_ENDPOINT}/${ID_MOCK}`);
        expect(req.request.method).toEqual('GET');
        req.flush({ visibility: GameVisibility.PUBLIC });
        tick();
    }));
});
