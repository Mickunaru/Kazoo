import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MultiChoiceForm } from '@app/admin/interfaces/multi-choice-form';
import { QuestionType } from '@common/enum/question-type';

export interface QuestionForm {
    type: FormControl<QuestionType>;
    text: FormControl<string>;
    points: FormControl<number>;
    choices: FormArray<FormGroup<MultiChoiceForm>>;
    lastModification: FormControl<Date>;
    id?: FormControl<string>;

    lowerBound: FormControl<number>;
    upperBound: FormControl<number>;
    answer: FormControl<number>;
    precision: FormControl<number>;
    imageUrl: FormControl<string>;
    uuid: FormControl<string>;
    creator: FormControl<string>;
}
