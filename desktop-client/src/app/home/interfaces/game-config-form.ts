import { FormControl } from '@angular/forms';
import { GameMode } from '@common/enum/game-mode';

export interface GameConfigForm {
    isFriendsOnly: FormControl<boolean>;
    arePowerUpsEnabled: FormControl<boolean>;
    entryPrice: FormControl<number>;
    gameMode: FormControl<GameMode>;
    questionCount: FormControl<number>;
    hasSoundboard: FormControl<boolean>;
}
