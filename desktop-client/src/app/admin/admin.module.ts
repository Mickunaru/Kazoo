import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthInterceptor } from '@app/interceptor/auth.interceptor';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { GameBankComponent } from './components/game-bank/game-bank.component';
import { GameEditorComponent } from './components/game-editor/game-editor.component';
import { GameRowComponent } from './components/game-row/game-row.component';
import { MultiChoiceComponent } from './components/multi-choice/multi-choice.component';
import { QuestionFormComponent } from './components/question-form/question-form.component';
import { QuestionsBankComponent } from './components/questions-bank/questions-bank.component';
import { UploadImageButtonComponent } from './components/upload-image-button/upload-image-button.component';

@NgModule({
    declarations: [
        GameBankComponent,
        GameEditorComponent,
        GameRowComponent,
        QuestionFormComponent,
        QuestionsBankComponent,
        UploadImageButtonComponent,
        MultiChoiceComponent,
        AdminPageComponent,
    ],
    imports: [AppMaterialModule, ReactiveFormsModule, HttpClientModule, CommonModule, FormsModule, RouterModule],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
    ],
    exports: [AdminPageComponent],
})
export class AdminModule {}
