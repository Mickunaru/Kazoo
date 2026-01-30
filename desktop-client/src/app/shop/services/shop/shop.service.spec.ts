import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { ShopService } from './shop.service';

describe('ShopService', () => {
    let service: ShopService;

    beforeEach(() => {
        const mockAngularFireAuth = {
            authState: of(null),
        };
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBarModule],
            providers: [{ provide: AngularFireAuth, useValue: mockAngularFireAuth }],
        });
        service = TestBed.inject(ShopService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
