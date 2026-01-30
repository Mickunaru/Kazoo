import { Injectable } from '@angular/core';
import { Line } from 'konva/lib/shapes/Line';
import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';
@Injectable({
    providedIn: 'root',
})
export class KonvaService {
    stage?: Stage;
    brushSize = 3;

    resetBrushSize() {
        this.brushSize = 3;
    }

    setStageRef(s: Stage) {
        this.stage = s;
    }

    // eslint-disable-next-line max-params
    brush(pos: Vector2d, size: number, color: string) {
        this.brushSize = size;
        return new Line({
            stroke: color,
            strokeWidth: size,
            globalCompositeOperation: 'source-over',
            points: [pos.x, pos.y, pos.x, pos.y],
            lineCap: 'round',
            lineJoin: 'round',
            tension: 0,
        });
    }

    erase(pos: Vector2d) {
        return new Line({
            stroke: '#ffffff',
            strokeWidth: 30,
            globalCompositeOperation: 'destination-out',
            points: [pos.x, pos.y, pos.x, pos.y],
            lineCap: 'round',
            lineJoin: 'round',
        });
    }

    async getDrawingBlob(): Promise<Blob | null> {
        if (!this.stage) return null;
        return this.stage.toBlob() as Promise<Blob | null>;
    }
}
