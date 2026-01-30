import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ToolType } from '@app/game/enum/tool-type';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { KonvaService } from '@app/game/services/konva/konva.service';
import Konva from 'konva/lib/Core';
import { Layer } from 'konva/lib/Layer';
import { Line } from 'konva/lib/shapes/Line';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { Stage } from 'konva/lib/Stage';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-drawing-answer',
    templateUrl: './drawing-answer.component.html',
    styleUrls: ['./drawing-answer.component.scss'],
})
export class DrawingAnswerComponent implements OnInit, OnDestroy {
    @Input() canModify: boolean;
    toolType = ToolType;
    shapes: Line[] = [];
    stage!: Stage;
    layer!: Layer;
    inkColor: string = '#000000';
    selectedTool: ToolType | null = ToolType.BRUSH;
    transformers: Transformer[] = [];
    brushSettingsOpen = false;
    ignoreNextOutsideClick = false;
    private gameStateSubscription: Subscription | null;

    constructor(
        private konvaService: KonvaService,
        private readonly gameManagerService: GameManagerService,
    ) {}

    ngOnInit(): void {
        this.stage = new Konva.Stage({
            container: 'container',
            width: 840,
            height: 560,
        });
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        this.konvaService.setStageRef(this.stage);
        this.addLineListeners();
        this.setupLoadNextQuestion();
    }

    ngOnDestroy() {
        this.gameStateSubscription?.unsubscribe();
    }

    resetBoard() {
        this.konvaService.resetBrushSize();
        this.inkColor = '#000000';
        this.selectedTool = ToolType.BRUSH;
        this.clearBoard();
    }

    toggleBrushSettings() {
        if (this.brushSettingsOpen) {
            this.ignoreNextOutsideClick = true;
        }
        this.brushSettingsOpen = !this.brushSettingsOpen;
    }

    onOverlayOutsideClick() {
        if (this.ignoreNextOutsideClick) {
            this.ignoreNextOutsideClick = false;
            return;
        }
        this.brushSettingsOpen = false;
    }

    setSelection(type: ToolType) {
        this.selectedTool = this.selectedTool === type ? null : type;
    }

    undo(): void {
        const removedShape = this.shapes.pop();

        this.transformers.forEach((t) => {
            t.detach();
        });

        if (removedShape) {
            removedShape.remove();
        }

        this.layer.draw();
    }

    clearBoard(): void {
        this.layer.destroyChildren();
        this.layer.draw();
    }

    getCursorClass(): string {
        if (this.selectedTool) {
            return 'pointer_cursor';
        } else {
            return 'default';
        }
    }

    private addLineListeners(): void {
        let lastLine: Line;
        let isPaint = false;
        const control_container = document.getElementById('control_container');

        this.stage.on('mousedown touchstart', () => {
            if (!this.selectedTool || !this.canModify) {
                return;
            }
            isPaint = true;
            const pos = this.stage.getPointerPosition();
            if (!pos) return;
            lastLine =
                this.selectedTool === ToolType.ERASER
                    ? this.konvaService.erase(pos)
                    : this.konvaService.brush(pos, this.konvaService.brushSize, this.inkColor);
            this.shapes.push(lastLine);
            this.layer.add(lastLine);
            control_container?.classList.add('hide_palette');
        });

        this.stage.on('mouseup touchend', () => {
            if (!this.canModify) return;
            isPaint = false;
            control_container?.classList.remove('hide_palette');
        });

        this.stage.on('mousemove touchmove', (e) => {
            if (!isPaint || !this.canModify) {
                return;
            }
            e.evt.preventDefault();
            const pos = this.stage.getPointerPosition();
            if (!pos) return;
            const newPoints = lastLine.points().concat([pos.x, pos.y]);
            lastLine.points(newPoints);
            this.layer.batchDraw();
        });
    }

    private setupLoadNextQuestion() {
        this.gameStateSubscription = this.gameManagerService.loadNextQuestionObservable.subscribe(() => {
            this.resetBoard();
        });
    }
}
