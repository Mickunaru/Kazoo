import { NotificationType } from '../enum/notification-type';

export interface Notification {
    id: string;
    type: NotificationType;
    senderUsername: string;
    data?: string;
}
