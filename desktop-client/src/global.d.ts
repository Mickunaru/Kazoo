interface Window {
    electron?: {
        send: (signal: string, data?: any) => void;
        on: (signal: string, callback: (data: any) => any) => void;
        once: (signal: string, callback: (event: any, data?: any) => void) => void;
    };
}
