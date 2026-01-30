import { PowerUpType } from '@common/enum/power-up-type';

export interface PowerUp {
    name: PowerUpType;
    content?: string[];
}
