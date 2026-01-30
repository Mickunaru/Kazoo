import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { AvatarDialogComponent } from './components/avatar-dialog/avatar-dialog.component';
import { AvatarPickerComponent } from './components/avatar-picker/avatar-picker.component';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { MoneyDisplayComponent } from './components/money-display/money-display.component';

@NgModule({
    declarations: [AvatarDialogComponent, MoneyDisplayComponent, AvatarPickerComponent, ImageViewerComponent, MoneyDisplayComponent],
    imports: [CommonModule, AppMaterialModule, RouterModule, FormsModule],
    exports: [AvatarPickerComponent, ImageViewerComponent, MoneyDisplayComponent],
})
export class SharedModule {}
