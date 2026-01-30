import { Injectable, OnDestroy } from '@angular/core';
import { FriendRequestResponse } from '@app/account/interfaces/friend-request-response';
import { SoundService } from '@app/shared/services/sound/sound.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { FRIEND_NOTIFICATION_SOUND } from '@common/constants/account-sound';
import { NOT_FOUND_INDEX } from '@common/constants/verif-constants';
import { Notification } from '@common/interfaces/notification';
import { FriendEvent } from '@common/socket-events/friend-event';
import { NotificationEvent } from '@common/socket-events/notification-event';

@Injectable({
    providedIn: 'root',
})
export class NotificationService implements OnDestroy {
    notificationList: Notification[] = [];
    show: boolean = false;

    constructor(
        private readonly websocketService: WebsocketService,
        private readonly soundService: SoundService,
    ) {
        this.websocketService.on(NotificationEvent.ADD_NOTIFICATION, (notification?: Notification) => {
            if (notification) {
                this.addNotification(notification);
                this.soundService.playSound(FRIEND_NOTIFICATION_SOUND);
            }
        });
        this.getNotificationsEvent();
    }

    toggleShow(isOff: boolean = false) {
        if (isOff) this.show = false;
        else this.show = !this.show;
    }

    ngOnDestroy() {
        this.websocketService.removeAllListeners(NotificationEvent.ADD_NOTIFICATION);
    }

    async getNotificationsEvent() {
        const notifications = await this.websocketService.sendWithAck<undefined, Notification[]>(NotificationEvent.GET_NOTIFICATIONS);
        if (notifications) this.notificationList = notifications;
    }

    sendFriendRequest(username: string) {
        this.websocketService.send<string>(NotificationEvent.SEND_FRIEND_REQUEST, username);
    }

    respondToFriendRequest(username: string, isAccepted: boolean, notificationId: string) {
        const payload: FriendRequestResponse = { senderName: username, isAccepted, notificationId };
        this.websocketService.send<FriendRequestResponse>(FriendEvent.FRIEND_REQUEST_RESPONSE, payload);
        this.removeNotification(notificationId);
    }

    private removeNotification(notificationId: string) {
        const index = this.notificationList.findIndex((notification) => notification.id === notificationId);
        if (index > NOT_FOUND_INDEX) {
            this.notificationList.splice(index, 1);
        }
    }

    private addNotification(notification: Notification) {
        this.notificationList.push(notification);
    }
}
