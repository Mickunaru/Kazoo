import { Component, OnInit, signal } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ACKNOWLEDGE_TEXT } from '@app/constants/error-message';
import { SNACK_BAR_DURATION_LONG } from '@app/constants/time-constants';
import { PageUrl } from '@app/enum/page-url';
import { DEV_USER } from '@app/session/constants/dev-user';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login-modal',
    templateUrl: './login-modal.component.html',
    styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {
    form: FormGroup;
    hidePassword = signal(true);
    isLoading = false;

    // Justification :
    // UserAuthService is used allow user to login.
    // FormBuilder is used to check and validate values of form controls.
    // Router is used to navigate upon connection.
    // MatSnackBar is used to give feedback when an error occurs and connection fails.
    // eslint-disable-next-line max-params
    constructor(
        private readonly userAuthService: UserAuthService,
        private readonly formBuilder: FormBuilder,
        private readonly router: Router,
        private readonly snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            username: [environment.production ? '' : DEV_USER.username, Validators.required],
            password: [environment.production ? '' : DEV_USER.password, Validators.required],
        });
    }

    toggleShow(event: MouseEvent) {
        event.stopPropagation();
        this.hidePassword.set(!this.hidePassword());
    }

    // TODO: create a dict linking firebase error codes with proper messages
    async login() {
        if (!this.form.valid) {
            return;
        }
        this.isLoading = true;
        try {
            await this.userAuthService.login({
                username: this.form.value.username,
                password: this.form.value.password,
            });
            this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.HOME}`]);
        } catch (error) {
            if (error instanceof FirebaseError) {
                this.showFirebaseErrorMessage(error);
            } else {
                this.snackBar.open((error as Error).message, ACKNOWLEDGE_TEXT, {
                    duration: SNACK_BAR_DURATION_LONG,
                });
            }
        }
        this.isLoading = false;
    }

    showFirebaseErrorMessage(error: FirebaseError) {
        let errorMessage = '';
        switch (error.code) {
            case 'auth/invalid-credential':
                errorMessage = 'Mot de passe incorrect.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Ce compte a été désactivé.';
                break;
            default:
                break;
        }
        this.snackBar.open(errorMessage || error.message, ACKNOWLEDGE_TEXT, {
            duration: SNACK_BAR_DURATION_LONG,
        });
    }
}
