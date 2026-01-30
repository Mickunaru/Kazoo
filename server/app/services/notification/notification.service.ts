import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { Notification, NotificationDocument } from '@app/model/database/notification';
import { NotificationDto } from '@app/model/dto/notification/notification.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { app, messaging } from 'firebase-admin';
import { Model } from 'mongoose';

@Injectable()
export class NotificationService {
    private messaging: messaging.Messaging;

    constructor(
        private logger: Logger,
        @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
        @Inject('FIREBASE_APP') firebaseApp: app.App,
    ) {
        this.messaging = firebaseApp.messaging();
    }

    async sendPushNotification(fcmToken: string, text: string) {
        const message = {
            token: fcmToken,
            notification: { title: 'Kazoo', body: text },
        };

        try {
            const response = await this.messaging.send(message);
            this.logger.debug('Notification sent:', response);
            return response;
        } catch (error) {
            this.logger.debug('Error sending notification:', error);
            throw error;
        }
    }

    async createNotification(notificationDto: NotificationDto): Promise<NotificationDocument> {
        return this.notificationModel.create(notificationDto);
    }

    async getUserNotifications(currentUser: string): Promise<Notification[]> {
        return this.notificationModel.find({ recipientUsername: currentUser });
    }

    async getPendingUsers(currentUser: string): Promise<string[]> {
        const sent = await this.notificationModel.find({ recipientUsername: currentUser });
        const sentTo = await this.notificationModel.find({ senderUsername: currentUser });
        return sent.map((user) => user.senderUsername).concat(sentTo.map((user) => user.recipientUsername));
    }

    async deleteNotification(id: string): Promise<Notification> {
        const notification = await this.notificationModel.findByIdAndDelete(id);
        if (!notification) {
            throw new DocumentNotFoundError('ID for notification not found');
        }
        return notification;
    }
}
