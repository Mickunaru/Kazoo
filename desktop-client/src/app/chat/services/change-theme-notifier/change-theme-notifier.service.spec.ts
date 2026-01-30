import { TestBed } from '@angular/core/testing';

import { ChangeThemeNotifierService } from './change-theme-notifier.service';

describe('ChangeThemeNotifierService', () => {
    let service: ChangeThemeNotifierService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChangeThemeNotifierService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
