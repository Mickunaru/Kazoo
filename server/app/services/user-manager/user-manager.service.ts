import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { ShopItem } from '@app/model/database/shop-item';
import { User, UserDocument } from '@app/model/database/user';
import { UserDto } from '@app/model/dto/user/user.dto';
import { CUSTOM_AVATAR_ENDPOINT } from '@common/constants/endpoint-constants';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserManagerService {
    private readonly logger = new Logger(UserManagerService.name);

    constructor(
        @InjectModel(ShopItem.name) private readonly shopItemModel: Model<ShopItem>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async createUser(userDto: UserDto): Promise<User> {
        return this.userModel.create(userDto);
    }

    async updateUser(uid: string, userDto: UserDto): Promise<void> {
        await this.userModel.updateOne({ uid }, userDto, { upsert: true });
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return this.userModel.findOne({ username });
    }

    async getUserById(uid: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ uid });
    }

    async updateWithCustomAvatar(uid: string): Promise<string> {
        try {
            const user: UserDocument | null = await this.getUserById(uid);
            if (!user) throw Error('User Does Not exists');

            const customAvatarLink = `https://kazooteam.s3.ca-central-1.amazonaws.com/${CUSTOM_AVATAR_ENDPOINT}/${user.username}.png`;
            user.avatar = customAvatarLink;
            await user.save();
            return customAvatarLink;
        } catch (e) {
            throw new DocumentNotFoundError("Failed to update user's avatar");
        }
    }

    async updateAvatar(uid: string, avatarId: string): Promise<string> {
        try {
            const avatar = await this.shopItemModel.findOne({ _id: avatarId });
            if (!avatar) throw Error('User Does Not exists');

            await this.userModel.findOneAndUpdate({ uid }, { $set: { avatar: avatar?.imageUrl } });
            this.logger.log(`User ${uid} updated Avatar with ${avatar}`);
            return avatar.imageUrl;
        } catch (e) {
            throw new DocumentNotFoundError("Failed to update user's avatar");
        }
    }

    async updateFcmToken(uid: string, fcmToken: string): Promise<void> {
        try {
            if (!fcmToken) {
                await this.userModel.updateOne({ uid }, { $set: { fcmToken: '' } });
                return;
            }

            const existingUser = await this.userModel.findOne({ fcmToken });

            if (existingUser && existingUser.uid !== uid) {
                await this.userModel.updateOne({ uid: existingUser.uid }, { $set: { fcmToken: '' } });
            }

            await this.userModel.updateOne({ uid }, { $set: { fcmToken } });
            this.logger.log(`User ${uid} updated fcmToken with ${fcmToken}`);
        } catch (e) {
            throw new DocumentNotFoundError("Failed to update user's fcm token");
        }
    }
}
