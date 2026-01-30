import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { SignupModalComponent } from './components/signup-modal/signup-modal.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

@NgModule({
    declarations: [LoginModalComponent, SignupModalComponent, LoginPageComponent],
    imports: [AppMaterialModule, RouterModule, SharedModule, CommonModule, FormsModule],
    exports: [LoginPageComponent],
})
export class SessionModule {}
