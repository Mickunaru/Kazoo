import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-audio-player',
    templateUrl: './audio-player.component.html',
    styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent {
    @ViewChild('audioRef', { static: false }) audioElement!: ElementRef<HTMLAudioElement>;
    @Input() audioUrl: string | null = null;
    @Input() preload: 'auto' | 'metadata' | 'none' = 'metadata';
    @Input() duration: number | undefined;

    protected isPlaying = false;
    protected progress = 0;

    togglePlayPause() {
        const audio = this.audioElement.nativeElement;
        if (!this.audioUrl) return;
        if (this.isPlaying) {
            audio.pause();
            audio.currentTime = 0;
            this.progress = 0;
        } else {
            audio.play();
        }
        this.isPlaying = !this.isPlaying;
    }

    handleProgressChange() {
        const audio = this.audioElement.nativeElement;
        if (this.duration) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.progress = (Number(audio.currentTime) * 100) / this.duration;
        }
    }

    handleEnd() {
        this.isPlaying = false;
        this.progress = 0;
    }
}
