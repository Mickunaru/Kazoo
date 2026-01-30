import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { S3Service } from './s3.service';

describe('S3Service', () => {
    let service: S3Service;
    let userAuthServiceSpy: jasmine.SpyObj<UserAuthService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        userAuthServiceSpy = jasmine.createSpyObj('UserAuthService', ['login']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: UserAuthService, useValue: userAuthServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        });
        service = TestBed.inject(S3Service);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
