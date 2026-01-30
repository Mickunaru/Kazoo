import { Component } from '@angular/core';
import { KonvaService } from '@app/game/services/konva/konva.service';

@Component({
    selector: 'app-brush-settings-overlay',
    templateUrl: './brush-settings-overlay.component.html',
    styleUrls: ['./brush-settings-overlay.component.scss'],
})
export class BrushSettingsOverlayComponent {
    constructor(public konvaService: KonvaService) {}
}
