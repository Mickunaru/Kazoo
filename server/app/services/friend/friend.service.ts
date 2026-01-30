import { User } from '@app/model/database/user';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FriendService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

    async addFriend(username1: string, username2: string): Promise<void> {
        const first = await this.addToFriendList(username1, username2);
        const second = await this.addToFriendList(username2, username1);
        if (!first || !second) {
            if (second) {
                this.removeFromFriendList(username2, username1);
            } else if (first) {
                this.removeFromFriendList(username1, username2);
            }
            throw new NotFoundException('User not found, could not update friends');
        }
    }

    async removeFriend(username1: string, username2: string): Promise<void> {
        const first = await this.removeFromFriendList(username1, username2);
        const second = await this.removeFromFriendList(username2, username1);
        if (!first || !second) {
            throw new NotFoundException('User not found, could not update friends');
        }
    }

    async getAllFriendUsernames(username: string): Promise<string[]> {
        const user = await this.userModel.findOne({ username }).select('friendNames');
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user.friendNames;
    }

    async getAllNotFriendsUsernames(selfUsername: string): Promise<string[]> {
        const user = await this.userModel.findOne({ username: selfUsername });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const notFriendList = await this.userModel.find({ username: { $nin: [...user.friendNames, selfUsername] } }).select('username');

        return notFriendList.map((user1) => user1.username);
    }

    private async addToFriendList(username: string, friendUsername: string): Promise<User | null> {
        return this.userModel.findOneAndUpdate({ username }, { $push: { friendNames: friendUsername } }, { new: true, returnNewDocument: true });
    }
    private async removeFromFriendList(username: string, friendUsername: string): Promise<User | null> {
        return this.userModel.findOneAndUpdate({ username }, { $pull: { friendNames: friendUsername } }, { new: true, returnNewDocument: true });
    }
}
