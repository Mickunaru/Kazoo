import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    playSound(url: string): void {
        const audio = new Audio();
        audio.src = url;
        audio.load();
        audio.play().catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Error playing sound:', error);
        });
        audio.onended = () => {
            audio.remove();
        };
    }
}
