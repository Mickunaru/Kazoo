export const CHAT_WINDOW_TITLE = 'Clavardage';
export const IPC_MAX_TIMEOUT = 5000;
export const RELAY_RECEIVED_WS_EVENT = 'ipc-relay';
export const SEND_WS_EVENT = 'send-ws-event';
export const SEND_WS_ACK = 'ws-ack';
export const MIN_NAME_LENGTH = 3;
export const MAX_AUDIO_LENGTH_S = 60;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export const MAX_AUDIO_LENGTH_MS = MAX_AUDIO_LENGTH_S * 1000;

export interface SoundboardElement {
    name: string;
    url: string;
    icon: string;
}

export const SOUNDBOARD_ELEMENTS: SoundboardElement[] = [
    {
        name: 'Victoire!',
        url: 'https://kazooteam.s3.ca-central-1.amazonaws.com/soundboard/celebrate.mp3',
        icon: 'celebration',
    },
    {
        name: 'Bruh',
        url: 'https://kazooteam.s3.ca-central-1.amazonaws.com/soundboard/bruh.mp3',
        icon: 'sentiment_neutral',
    },
    {
        name: 'Cloche',
        url: 'https://kazooteam.s3.ca-central-1.amazonaws.com/soundboard/cloche.mp3',
        icon: 'notifications',
    },
];

export const CHAT_NOTIFICATION_SOUND = 'https://kazooteam.s3.ca-central-1.amazonaws.com/soundboard/chatNotificationSound.mp3';
