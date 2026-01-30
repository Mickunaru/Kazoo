import { Component, OnInit, signal } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ACKNOWLEDGE_TEXT } from '@app/constants/error-message';
import { SNACK_BAR_DURATION_LONG } from '@app/constants/time-constants';
import { PageUrl } from '@app/enum/page-url';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';

@Component({
    selector: 'app-signup-modal',
    templateUrl: './signup-modal.component.html',
    styleUrls: ['./signup-modal.component.scss'],
})
export class SignupModalComponent implements OnInit {
    form: FormGroup;
    hidePassword = signal(true);
    hideConfirmPassword = signal(true);
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
        const usernameMinLength = 5;
        this.form = this.formBuilder.group(
            {
                avatar: ['', Validators.required],
                username: ['', [Validators.required, Validators.minLength(usernameMinLength), Validators.pattern(/^\w+$/)]],
                email: ['', [Validators.required, this.strictEmailValidator()]],
                password: ['', [Validators.required, this.passwordStrengthValidator(), this.noSpaceValidator]],
                confirmPassword: ['', Validators.required],
            },
            { validator: this.confirmedValidator('password', 'confirmPassword') } as AbstractControlOptions,
        );
    }

    strictEmailValidator(): ValidatorFn {
        const strictEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (!value || strictEmailRegex.test(value)) {
                return null;
            }
            return { strictEmail: true };
        };
    }

    toggleShowPassword(event: MouseEvent) {
        this.hidePassword.set(!this.hidePassword());
        event.stopPropagation();
    }

    toggleShowConfirmPassword(event: MouseEvent) {
        this.hideConfirmPassword.set(!this.hideConfirmPassword());
        event.stopPropagation();
    }

    pickAvatar(selectedAvatar: string) {
        this.form.get('avatar')?.setValue(selectedAvatar);
    }

    // TODO: create a dict linking firebase error codes with proper messages
    async signUp() {
        this.isLoading = true;
        try {
            const { email, password, username, avatar } = this.form.value;
            await this.userAuthService.signUp({ email, password, username, avatar });
            this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.HOME}`]);
        } catch (error) {
            if (error instanceof FirebaseError) {
                this.showFirebaseErrorMessage(error.code);
            } else {
                this.snackBar.open((error as Error).message, ACKNOWLEDGE_TEXT, {
                    duration: SNACK_BAR_DURATION_LONG,
                });
            }
        }
        this.isLoading = false;
    }

    showFirebaseErrorMessage(code: string) {
        let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';

        switch (code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Cet email est déjà utilisé.';
                break;
            default:
                break;
        }

        this.snackBar.open(errorMessage, ACKNOWLEDGE_TEXT, {
            duration: SNACK_BAR_DURATION_LONG,
        });
    }

    private passwordStrengthValidator(): ValidatorFn {
        return (control: AbstractControl) => {
            const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,}$/;
            const isValid = regex.test(control.value || '');
            return isValid ? null : { passwordStrength: true };
        };
    }

    private noSpaceValidator(control: AbstractControl) {
        return control.value?.includes(' ') ? { noSpaces: true } : null;
    }

    private confirmedValidator(controlName: string, matchingControlName: string) {
        return (formGroup: FormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];

            if (matchingControl.errors && !matchingControl.errors['confirmedValidator']) {
                return null;
            }

            if (control.value !== matchingControl.value) {
                const validatorObj = { confirmedValidator: true };
                matchingControl.setErrors(validatorObj);
                return validatorObj;
            }
            matchingControl.setErrors(null);
            return null;
        };
    }
}
