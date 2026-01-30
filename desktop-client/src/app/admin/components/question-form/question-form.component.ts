import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { DEFAULT_POINT_VALUE } from '@app/admin/admin.const';
import { GameValidator } from '@app/admin/classes/game-validator';
import { UploadImageButtonComponent } from '@app/admin/components/upload-image-button/upload-image-button.component';
import { MultiChoiceForm } from '@app/admin/interfaces/multi-choice-form';
import { QuestionForm } from '@app/admin/interfaces/question-form';
import { QuestionFormInfo } from '@app/admin/interfaces/question-form-info';
import { GameImageUploadService } from '@app/admin/services/game-image-upload/game-image-upload.service';
import { QuestionType } from '@common/enum/question-type';
import { MultiChoice } from '@common/interfaces/multi-choice';
@Component({
    selector: 'app-question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.scss'],
    viewProviders: [MatExpansionPanel],
})
export class QuestionFormComponent implements OnInit {
    // To make the question reusable, the form is passed as an input but it is also possible to create a new form if no form is passed
    @Input() questionFormInfo: QuestionFormInfo = {
        form: this.formBuilder.group<QuestionForm>({
            type: this.formBuilder.control('' as QuestionType, [Validators.required]),
            text: this.formBuilder.control('', Validators.required),
            points: this.formBuilder.control(DEFAULT_POINT_VALUE),
            choices: this.formBuilder.array<FormGroup<MultiChoiceForm>>([]),
            lastModification: this.formBuilder.control(new Date()),
            lowerBound: this.formBuilder.control(0, [Validators.required]),
            upperBound: this.formBuilder.control(1, [Validators.required]),
            answer: this.formBuilder.control(0, [Validators.required]),
            precision: this.formBuilder.control(0, [Validators.required]),
            imageUrl: this.formBuilder.control(''),
            uuid: this.formBuilder.control(crypto.randomUUID().toString()),
            creator: this.formBuilder.control(''),
        }),
        index: 0,
    };
    @Input() isQuestionBank: boolean = false;

    @Output() removeQuestionEmitter = new EventEmitter<number>();
    @Output() saveQuestionEmitter = new EventEmitter<FormGroup<QuestionForm>>();

    opened: boolean = false;
    questionType = QuestionType;
    minQRE: number = 0;
    maxQRE: number = 1;

    constructor(
        private readonly formBuilder: NonNullableFormBuilder,
        private readonly dialog: MatDialog,
        readonly gameImageUploadService: GameImageUploadService,
    ) {}

    ngOnInit(): void {
        this.questionFormInfo.form.addValidators(GameValidator.QuestionValidator());
        this.setMinMax();
    }

    addMultiChoice() {
        this.questionFormInfo.form.controls.choices.push(
            this.formBuilder.group<MultiChoiceForm>({
                text: this.formBuilder.control('', Validators.required),
                isCorrect: this.formBuilder.control(false),
            }),
        );
    }

    dropMultiChoice(event: CdkDragDrop<MultiChoice[]>) {
        moveItemInArray(this.questionFormInfo.form.controls.choices.controls, event.previousIndex, event.currentIndex);
        moveItemInArray(this.questionFormInfo.form.controls.choices.value, event.previousIndex, event.currentIndex);
    }

    removeQuestion() {
        this.removeQuestionEmitter.emit(this.questionFormInfo.index);
    }

    saveQuestion() {
        const { lowerBound, upperBound, answer } = this.questionFormInfo.form.controls;
        const clampedValue = Math.min(Math.max(answer.value, lowerBound.value), upperBound.value);
        answer.setValue(clampedValue);
        this.questionFormInfo.form.updateValueAndValidity();
        if (this.questionFormInfo.form.valid) {
            this.saveQuestionEmitter.emit(this.questionFormInfo.form);
        }
    }

    formatDate(date: Date): string {
        return formatDate(date, 'yyyy/MM/dd HH:mm', 'en-US');
    }

    setMinMax(answerClamped?: number) {
        const delayBetweenSetValues = 50;
        const answer = answerClamped !== undefined ? answerClamped : this.questionFormInfo.form.controls.answer.value;
        const tempMin = answer - this.questionFormInfo.form.controls.precision.value;
        const tempMax = answer + this.questionFormInfo.form.controls.precision.value;
        if (tempMin > this.maxQRE) {
            this.maxQRE = tempMax;
            setTimeout(() => {
                this.minQRE = tempMin;
            }, delayBetweenSetValues);
        } else {
            this.minQRE = tempMin;
            this.maxQRE = tempMax;
        }
    }

    clamp() {
        const { lowerBound, upperBound, answer } = this.questionFormInfo.form.controls;
        const clampedValue = Math.min(Math.max(answer.value, lowerBound.value), upperBound.value);
        answer.setValue(clampedValue);
        this.setMinMax(clampedValue);
    }

    async openImageDialog() {
        const dialogRef = this.dialog.open(UploadImageButtonComponent);
        const { uuid, imageUrl } = this.questionFormInfo.form.controls;
        await dialogRef.componentInstance.setValues(uuid.value, imageUrl, this.isQuestionBank);
    }

    hasImage() {
        return (
            this.questionFormInfo.form.controls.imageUrl.value ||
            this.gameImageUploadService.images.has(this.questionFormInfo.form.controls.uuid.value)
        );
    }
}
