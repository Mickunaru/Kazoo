import { Component } from '@angular/core';
import { NotificationService } from '@app/account/services/notification/notification.service';
import { Notification } from '@common/interfaces/notification';

@Component({
    selector: 'app-notification-box',
    templateUrl: './notification-box.component.html',
    styleUrls: ['./notification-box.component.scss'],
})
export class NotificationBoxComponent {
    constructor(protected readonly notificationService: NotificationService) {}

    trackById(index: number, notification: Notification): string {
        return notification.id;
    }
}
