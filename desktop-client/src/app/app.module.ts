/* eslint-disable max-len */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { ColorPickerComponent, ColorPickerDirective } from 'ngx-color-picker';
import { environment } from 'src/environments/environment';
import { AccountModule } from './account/account.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { SNACK_BAR_DURATION } from './constants/time-constants';
import { GameModule } from './game/game.module';
import { GameManagerService } from './game/services/game-manager/game-manager.service';
import { HomeModule } from './home/home.module';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { MainAppComponent } from './pages/main-app/main-app.component';
import { SessionModule } from './session/session.module';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { TopBarComponent } from './shared/components/top-bar/top-bar.component';
import { SharedModule } from './shared/shared.module';
import { ShopModule } from './shop/shop.module';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [AppComponent, TopBarComponent, AuthPageComponent, MainAppComponent, ConfirmDialogComponent],
    providers: [GameManagerService, { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: SNACK_BAR_DURATION } }],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        ChatModule,
        AdminModule,
        ColorPickerComponent,
        GameModule,
        ShopModule,
        AccountModule,
        SessionModule,
        SharedModule,
        HomeModule,
        ColorPickerDirective,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
