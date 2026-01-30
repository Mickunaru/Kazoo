import { FormGroup } from '@angular/forms';
import { QuestionForm } from './question-form';

export interface QuestionFormInfo {
    form: FormGroup<QuestionForm>;
    index: number;
}
