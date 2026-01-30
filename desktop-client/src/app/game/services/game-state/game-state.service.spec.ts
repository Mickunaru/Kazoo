import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state.service';

describe('GameStateService', () => {
    let service: GameStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset Global values of game state', () => {
        service.resetGameState();
        expect(service.isSubmitted).toBeFalse();
    });
});
