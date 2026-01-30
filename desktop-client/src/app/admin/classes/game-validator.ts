import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MultiChoiceForm } from '@app/admin/interfaces/multi-choice-form';
import { QuestionForm } from '@app/admin/interfaces/question-form';
import { QuestionType } from '@common/enum/question-type';

@Injectable({
    providedIn: 'root',
})
export class GameValidator {
    static QuestionValidator(): ValidatorFn {
        return (control: AbstractControl<QuestionForm>): ValidationErrors | null => {
            const questionControl = control as unknown as FormGroup<QuestionForm>;
            switch (questionControl.controls.type.value) {
                case QuestionType.Estimation: {
                    const precisionError = GameValidator.precisionQuarterOfInterval(questionControl);
                    const boundError = GameValidator.lowerBoundHigherThanUpper(questionControl);
                    const positiveError = GameValidator.positiveNumber(questionControl);
                    const answerOutofBounds = GameValidator.answerInBounds(questionControl);
                    return { ...precisionError, ...boundError, ...positiveError, ...answerOutofBounds };
                }
                case QuestionType.MultiChoice: {
                    const arrayLengthValidation = GameValidator.arrayLengthValidation(2)(questionControl.controls.choices);
                    const choicesValidityValidation = GameValidator.choicesValidityValidator(questionControl.controls.choices);
                    return { ...arrayLengthValidation, ...choicesValidityValidation };
                }
                default:
                    return {};
            }
        };
    }

    static arrayLengthValidation(min: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return (control as FormArray).length < min ? { arrayLength: true } : null;
        };
    }

    static choicesValidityValidator(control: AbstractControl): ValidationErrors | null {
        const multiControl = control as FormArray<FormGroup<MultiChoiceForm>>;
        const allAnswerValid = multiControl.controls.every((v) => v.controls.isCorrect.value);
        const allAnswerNotValid = multiControl.controls.every((v) => !v.controls.isCorrect.value);
        return allAnswerValid || allAnswerNotValid ? { choicesValidity: true } : null;
    }

    static precisionQuarterOfInterval(parent: FormGroup<QuestionForm>): ValidationErrors | null {
        const { precision, upperBound, lowerBound } = parent.controls;
        const QUARTER = 0.25;
        return precision.value > (upperBound.value - lowerBound.value) * QUARTER ? { precisionTooBig: true } : null;
    }

    static lowerBoundHigherThanUpper(parent: FormGroup<QuestionForm>): ValidationErrors | null {
        const { upperBound, lowerBound } = parent.controls;
        return upperBound.value < lowerBound.value ? { lowerBoundHigherThanUpper: true } : null;
    }

    static positiveNumber(parent: FormGroup<QuestionForm>): ValidationErrors | null {
        const { upperBound, lowerBound } = parent.controls;
        return upperBound.value < 0 || lowerBound.value < 0 ? { positiveBounds: true } : null;
    }

    static answerInBounds(parent: FormGroup<QuestionForm>): ValidationErrors | null {
        const { upperBound, lowerBound, answer } = parent.controls;
        return answer.value < lowerBound.value || upperBound.value < answer.value ? { answerOutOfBounds: true } : null;
    }
}
