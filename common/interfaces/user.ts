import { PowerUpsCount } from '@common/interfaces/power-ups-count';
export interface User {
    uid: string;
    username: string;
    email: string;
    avatar: string;
    friendsIds: string[];
    createdAt: Date;
    lastConnection: Date;
    currency: number;
    vanityItems: string[];
    powerUpsCount: PowerUpsCount;
    // TODO: add more as we go on
}

export type UserCurrency = Pick<User, 'currency'>