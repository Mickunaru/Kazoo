import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { FriendBoxComponent } from './components/friend-box/friend-box.component';
import { NotificationBoxComponent } from './components/notification-box/notification-box.component';
import { AccountPageComponent } from './pages/account-page/account-page.component';

@NgModule({
    declarations: [FriendBoxComponent, NotificationBoxComponent, AccountPageComponent],
    imports: [AppMaterialModule, SharedModule, RouterModule, CommonModule, FormsModule],
    exports: [AccountPageComponent],
})
export class AccountModule {}
