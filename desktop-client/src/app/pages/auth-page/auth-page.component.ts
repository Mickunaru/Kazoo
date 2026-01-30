import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { PageUrl } from '@app/enum/page-url';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-auth-page',
    templateUrl: './auth-page.component.html',
    styleUrls: ['./auth-page.component.scss'],
})
export class AuthPageComponent implements OnInit, OnDestroy {
    isAuthenticated = false;
    private authSubscription!: Subscription;

    constructor(
        private readonly auth: AngularFireAuth,
        private readonly router: Router,
    ) {}

    ngOnInit() {
        this.authSubscription = this.auth.authState.subscribe((user) => {
            if (user) {
                this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.HOME}`]);
            } else {
                this.router.navigate([`/${PageUrl.LOGIN}`]);
            }
        });
    }

    ngOnDestroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }
}
