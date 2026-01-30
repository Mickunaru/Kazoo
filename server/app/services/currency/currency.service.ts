import { User, UserDocument } from '@app/model/database/user';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class CurrencyService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    async addCurrencyUsername(username: string, amount: number): Promise<number> {
        const user = await this.userModel.findOneAndUpdate({ username }, { $inc: { currency: amount } }, { new: true });
        return user?.currency ?? 0;
    }

    async subtractCurrencyByUsername(username: string, amount: number): Promise<number> {
        const user = await this.userModel.findOneAndUpdate({ username }, { $inc: { currency: -amount } }, { new: true });
        return user?.currency ?? 0;
    }

    async getCurrency(uid: string): Promise<number> {
        return (await this.userModel.findOne({ uid }, { currency: true }))?.currency ?? 0;
    }
}
