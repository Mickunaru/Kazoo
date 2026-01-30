import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { UserAuthService } from './user-auth.service';

describe('UserAuthService', () => {
    let service: UserAuthService;
    let httpTestingController: HttpTestingController;
    let routerSpy: jasmine.SpyObj<Router>;
    let authSpy: jasmine.SpyObj<AngularFireAuth>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        authSpy = jasmine.createSpyObj('AngularFireAuth', [
            'signInWithEmailAndPassword',
            'createUserWithEmailAndPassword',
            'signInWithPopup',
            'signOut',
            'currentUser',
        ]);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: AngularFireAuth, useValue: authSpy },
            ],
        });
        service = TestBed.inject(UserAuthService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
