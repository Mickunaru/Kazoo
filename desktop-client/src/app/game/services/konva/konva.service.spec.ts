import { TestBed } from '@angular/core/testing';

import { KonvaService } from './konva.service';

describe('KonvaService', () => {
    let service: KonvaService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(KonvaService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
