import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss'],
})
export class ImageViewerComponent implements OnInit, OnChanges {
    @Input() imageUrl!: string;
    isDialogOpen = false;
    refreshedImageUrl: string = '';

    ngOnInit(): void {
        this.refreshedImageUrl = `${this.imageUrl}?${Date.now()}`;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.refreshedImageUrl = `${changes.imageUrl.currentValue}?${Date.now()}`;
    }

    openDialog() {
        this.isDialogOpen = true;
    }

    closeDialog(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.classList.contains('dialog-backdrop')) {
            this.isDialogOpen = false;
        }
    }
}
