import { HttpClient } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { MAX_AUDIO_LENGTH_MS, MAX_AUDIO_LENGTH_S } from '@app/chat/chat.const';
import { ChatService } from '@app/chat/services/chat.service';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { MessageType } from '@common/interfaces/message';

@Component({
    selector: 'app-audio-recorder',
    templateUrl: './audio-recorder.component.html',
    styleUrls: ['./audio-recorder.component.scss'],
})
export class AudioRecorderComponent {
    mediaRecorder!: MediaRecorder;
    audioChunks: Blob[] = [];
    duration: number = 0;
    progress: number = 0;
    isRecording = false;
    localUrl: string | null = null;

    private interval: ReturnType<typeof setInterval> | null = null;

    private timeout: ReturnType<typeof setTimeout> | null = null;

    constructor(
        private readonly http: HttpClient,
        private readonly chatService: ChatService,
        private readonly ngZone: NgZone,
    ) {}

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    async startRecording() {
        this.duration = 0;
        this.progress = 0;
        if (this.localUrl) {
            URL.revokeObjectURL(this.localUrl);
            this.localUrl = null;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = () => {
            this.ngZone.run(() => {
                const blob = new Blob(this.audioChunks, { type: 'audio/mp3' });
                this.localUrl = URL.createObjectURL(blob);
                this.audioChunks = []; // Reset chunks

                this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
            });
        };

        this.mediaRecorder.start();
        this.isRecording = true;

        this.timeout = setTimeout(() => {
            if (this.isRecording) {
                this.stopRecording();
            }
        }, MAX_AUDIO_LENGTH_MS);

        // Update duration every 100ms
        this.interval = setInterval(() => {
            this.duration += 0.1;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.progress = (this.duration / MAX_AUDIO_LENGTH_S) * 100;
            if (this.duration >= MAX_AUDIO_LENGTH_MS) {
                this.stopRecording();
            }
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 100);
    }

    stopRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
    }

    sendAudio() {
        if (!this.localUrl) return;
        fetch(this.localUrl)
            .then(async (response) => response.blob())
            .then((blob) => {
                const file = new File([blob], 'audio.mp3', { type: 'audio/mp3' });
                this.uploadAudioFile(file);
                this.delete();
            });
    }

    delete() {
        this.progress = 0;
        if (this.localUrl) {
            URL.revokeObjectURL(this.localUrl);
            this.localUrl = null;
        }
    }

    private uploadAudioFile(file: File) {
        const formData = new FormData();
        formData.append('audio', file); // Append the file

        this.http.post<{ fileUrl: string }>(`${SERVER_URL_API}/chat`, formData).subscribe((response) => {
            if (response.fileUrl) {
                this.chatService.sendMessage(response.fileUrl, MessageType.SOUND, this.duration);
            }
        });
    }
}
