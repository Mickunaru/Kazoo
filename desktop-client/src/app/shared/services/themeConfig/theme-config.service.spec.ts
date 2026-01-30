import { TestBed } from '@angular/core/testing';

import { ThemeConfigService } from './theme-config.service';

describe('ThemeConfigService', () => {
    let service: ThemeConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
