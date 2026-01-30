import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { QuestionForm } from './question-form';

export interface GameForm {
    title: FormControl<string>;
    description: FormControl<string>;
    duration: FormControl<number>;
    questions: FormArray<FormGroup<QuestionForm>>;
    private: FormControl<boolean>;
}
