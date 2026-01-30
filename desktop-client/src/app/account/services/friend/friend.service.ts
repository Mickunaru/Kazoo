import { Injectable, OnDestroy } from '@angular/core';
import { FriendRequestResponse } from '@app/account/interfaces/friend-request-response';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { NOT_FOUND_INDEX } from '@common/constants/verif-constants';
import { FriendLists } from '@common/interfaces/friend-lists';
import { FriendUpdate } from '@common/interfaces/friend-update';
import { Notification } from '@common/interfaces/notification';
import { FriendEvent } from '@common/socket-events/friend-event';
import { NotificationEvent } from '@common/socket-events/notification-event';

@Injectable({
    providedIn: 'root',
})
export class FriendService implements OnDestroy {
    friendList: string[] = [];
    notFriendList: string[] = [];
    pendingList: string[] = [];

    show: boolean = false;

    constructor(private readonly websocketService: WebsocketService) {
        this.websocketService.on(FriendEvent.UPDATE_SINGLE_FRIEND, (update?: FriendUpdate) => {
            if (update) this.updateFriend(update.username, update.isAdded);
        });
        this.websocketService.on(FriendEvent.REQUEST_IGNORED, (username?: string) => {
            if (username) this.requestIgnored(username);
        });
        this.websocketService.on(NotificationEvent.ADD_NOTIFICATION, (notification?: Notification) => {
            if (notification) this.addPendingStatus(notification.senderUsername);
        });
        this.websocketService.on(FriendEvent.ADD_NOT_FRIEND, (username?: string) => {
            if (username) this.notFriendList.push(username);
        });
        this.getFriendsEvent();
    }

    ngOnDestroy() {
        this.websocketService.removeAllListeners(FriendEvent.UPDATE_SINGLE_FRIEND);
        this.websocketService.removeAllListeners(FriendEvent.REQUEST_IGNORED);
    }

    toggleShow(isOff: boolean = false) {
        if (isOff) this.show = false;
        else this.show = !this.show;
    }

    async getFriendsEvent() {
        const lists = await this.websocketService.sendWithAck<undefined, FriendLists>(FriendEvent.GET_FRIENDS);
        if (lists) {
            this.friendList = lists.friends;
            this.notFriendList = lists.notFriends;
            this.pendingList = lists.pending;
        }
    }

    removeFriendEvent(username: string) {
        this.websocketService.send<string>(FriendEvent.REMOVE_FRIEND, username);
    }

    respondToFriendRequest(username: string, isAccepted: boolean, notificationId: string) {
        this.websocketService.send<FriendRequestResponse>(FriendEvent.FRIEND_REQUEST_RESPONSE, { senderName: username, isAccepted, notificationId });
        const index = this.pendingList.indexOf(username);
        if (index !== NOT_FOUND_INDEX) this.pendingList.splice(index, 1);
        if (!isAccepted) this.notFriendList.push(username);
    }

    addPendingStatus(username: string) {
        this.pendingList.push(username);
        const index = this.notFriendList.indexOf(username);
        if (index !== NOT_FOUND_INDEX) this.notFriendList.splice(index, 1);
    }

    private updateFriend(username: string, isAdded: boolean) {
        if (isAdded) {
            this.friendList.push(username);
            const index1 = this.pendingList.indexOf(username);
            if (index1 !== NOT_FOUND_INDEX) this.pendingList.splice(index1, 1);
        } else {
            this.notFriendList.push(username);
            const index2 = this.friendList.indexOf(username);
            if (index2 !== NOT_FOUND_INDEX) this.friendList.splice(index2, 1);
        }
    }

    private requestIgnored(username: string) {
        this.notFriendList.push(username);
        const index = this.pendingList.indexOf(username);
        if (index !== NOT_FOUND_INDEX) this.pendingList.splice(index, 1);
    }
}
