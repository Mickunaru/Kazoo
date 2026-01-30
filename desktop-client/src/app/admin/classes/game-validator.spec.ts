import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MOCK_GAME } from '@app/constants/test-utils';
import { QuestionType } from '@common/enum/question-type';
import { MultiChoice } from '@common/interfaces/multi-choice';
import { GameValidator } from './game-validator';

describe('GameValidator', () => {
    const formBuilder = new FormBuilder();
    let questionForm: FormGroup;
    beforeEach(() => {
        questionForm = formBuilder.group({
            text: formBuilder.nonNullable.control(MOCK_GAME.questions[0].text, Validators.required),
            points: formBuilder.nonNullable.control(MOCK_GAME.questions[0].points, Validators.required),
            type: formBuilder.nonNullable.control(MOCK_GAME.questions[0].type, Validators.required),
            lastModification: formBuilder.nonNullable.control(MOCK_GAME.questions[0].lastModification),
            id: formBuilder.control(MOCK_GAME.questions[0].id),
            choices: formBuilder.nonNullable.array([
                ...MOCK_GAME.questions[0].choices.map((choice: MultiChoice) =>
                    formBuilder.group({
                        text: formBuilder.nonNullable.control(choice.text, Validators.required),
                        isCorrect: formBuilder.nonNullable.control(choice.isCorrect),
                    }),
                ),
            ]),
        });
    });

    it('should create an instance', () => {
        expect(new GameValidator()).toBeTruthy();
    });

    it('should not find problems with multi choice answers', () => {
        questionForm.get('type')?.setValue(QuestionType.MultiChoice);
        const choices = formBuilder.nonNullable.array([
            formBuilder.nonNullable.group({ text: 'question1', isCorrect: true }),
            formBuilder.nonNullable.group({ text: 'question2', isCorrect: false }),
        ]);
        const validationResult = GameValidator.choicesValidityValidator(choices);
        expect(validationResult).toEqual(null);
    });

    it('should find problems with multi choice answers if all answers are true', () => {
        questionForm.get('type')?.setValue(QuestionType.MultiChoice);
        const choices = formBuilder.nonNullable.array([
            formBuilder.nonNullable.group({ text: 'question1', isCorrect: true }),
            formBuilder.nonNullable.group({ text: 'question2', isCorrect: true }),
        ]);
        const validationResult = GameValidator.choicesValidityValidator(choices);
        expect(validationResult).toEqual({ choicesValidity: true });
    });

    it('should find problems with multi choice answers if all answers are false', () => {
        questionForm.get('type')?.setValue(QuestionType.MultiChoice);
        const choices = formBuilder.nonNullable.array([
            formBuilder.nonNullable.group({ text: 'question1', isCorrect: false }),
            formBuilder.nonNullable.group({ text: 'question2', isCorrect: false }),
        ]);
        const validationResult = GameValidator.choicesValidityValidator(choices);
        expect(validationResult).toEqual({ choicesValidity: true });
    });
});
