export interface PlayerInfo {
    username: string;
    score: number;
    bonusCount: number;
    rank?: number;
    status?: PlayerStatus;
}

export enum PlayerStatus {
    Left = 'left',
    Pending = 'pending',
    Submitted = 'submitted',
    Eliminated = 'eliminated'
}
