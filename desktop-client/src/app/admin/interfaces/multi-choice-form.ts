import { FormControl } from '@angular/forms';

export interface MultiChoiceForm {
    text: FormControl<string>;
    isCorrect: FormControl<boolean>;
}
