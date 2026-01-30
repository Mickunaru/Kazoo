import { CdkDragDrop, CdkDropList, copyArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionBankSuccessMessage } from '@app/admin/admin.const';
import { GameValidator } from '@app/admin/classes/game-validator';
import { MultiChoiceForm } from '@app/admin/interfaces/multi-choice-form';
import { QuestionDto } from '@app/admin/interfaces/question-dto';
import { QuestionForm } from '@app/admin/interfaces/question-form';
import { GameImageUploadService } from '@app/admin/services/game-image-upload/game-image-upload.service';
import { QuestionService } from '@app/admin/services/question/question.service';
import { QuestionBankErrorMessage } from '@app/constants/error-message';
import { SNACK_CLOSE_ICON_ACTION } from '@app/constants/snack-bar-constants';
import { QuestionType } from '@common/enum/question-type';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-questions-bank',
    templateUrl: './questions-bank.component.html',
    styleUrls: ['./questions-bank.component.scss'],
})
export class QuestionsBankComponent implements OnInit {
    @ViewChild('questionBank') questionBank: CdkDropList;
    questionForms: FormGroup<QuestionForm>[] = [];
    questionsDropList: CdkDropList;
    questionType = QuestionType;
    selectedFilter: QuestionType | null = null;

    // eslint-disable-next-line max-params
    constructor(
        private readonly questionService: QuestionService,
        private readonly formBuilder: NonNullableFormBuilder,
        private readonly snackBar: MatSnackBar,
        private readonly gameImageUploadService: GameImageUploadService,
    ) {}

    ngOnInit() {
        this.questionService.questions.subscribe(() => {
            this.questionService.sortQuestions();
            const questions = this.questionService.questions.getValue();
            this.questionForms = questions.map((question) => this.createFormQuestion(question));
            this.questionService.questionBankList.next(this.questionBank);
        });
        this.questionService.gameEditorQuestionsDropList.subscribe((questionsDropList) => {
            this.questionsDropList = questionsDropList;
        });
        this.questionService.getQuestions();
    }

    async saveQuestion(modifiedQuestion: FormGroup<QuestionForm>) {
        const question = modifiedQuestion.getRawValue();
        if (question.id) {
            this.updateQuestion(question);
        } else {
            this.createQuestion(question);
        }

        const image = this.gameImageUploadService.images.get(question.uuid);
        if (image) {
            await this.questionService.uploadQuestionImage(question.uuid, image);
            this.gameImageUploadService.images.delete(question.uuid);
        }

        const deleteImage = this.gameImageUploadService.deletedQuestionBankImages.has(question.uuid);
        if (deleteImage) {
            await this.questionService.deleteQuestionImage(question.uuid);
            this.gameImageUploadService.deletedQuestionBankImages.delete(question.uuid);
        }
    }

    updateQuestion(questionDto: QuestionDto) {
        this.questionService.updateQuestion(questionDto.id, questionDto).subscribe({
            next: (res) => {
                this.openUpdateSnackBar(res.status);
                const questions: Question[] = this.questionForms.map((form) => form.getRawValue());
                this.restoreDateForQuestion(questions, questionDto.id);
                this.questionService.questions.next(questions);
            },
            error: () => {
                this.snackBar.open(QuestionBankErrorMessage.UPDATE, SNACK_CLOSE_ICON_ACTION);
            },
        });
    }

    createQuestion(question: QuestionDto) {
        question.id = undefined;
        this.questionService.createQuestion(question).subscribe({
            next: (res) => {
                this.openCreationSnackBar(res.status);
                const questionFormsRaw: Question[] = this.questionForms.map((form) => form.getRawValue());
                this.questionService.questions.next(questionFormsRaw);
                this.questionService.getQuestions();
            },
            error: (error: HttpErrorResponse) => {
                if (error?.error?.includes('Question Title')) {
                    this.snackBar.open(QuestionBankErrorMessage.DUPLICATED_TITLE, SNACK_CLOSE_ICON_ACTION);
                } else {
                    this.snackBar.open(QuestionBankErrorMessage.CREATION, SNACK_CLOSE_ICON_ACTION);
                }
            },
        });
    }

    restoreDateForQuestion(questions: Question[], id: string | undefined) {
        questions.map((question) => {
            if (question.id === id) question.lastModification = new Date();
            return question;
        });
    }

    openCreationSnackBar(status: HttpStatusCode) {
        if (status === HttpStatusCode.Created) {
            this.snackBar.open(QuestionBankSuccessMessage.CREATION, SNACK_CLOSE_ICON_ACTION);
        } else {
            this.snackBar.open(QuestionBankErrorMessage.CREATION, SNACK_CLOSE_ICON_ACTION);
        }
    }

    openUpdateSnackBar(status: HttpStatusCode) {
        if (status === HttpStatusCode.Ok) {
            this.snackBar.open(QuestionBankSuccessMessage.UPDATE, SNACK_CLOSE_ICON_ACTION);
        } else {
            this.snackBar.open(QuestionBankErrorMessage.UPDATE, SNACK_CLOSE_ICON_ACTION);
        }
    }

    openDeleteSnackBar(status: HttpStatusCode) {
        if (status === HttpStatusCode.Ok) {
            this.snackBar.open(QuestionBankSuccessMessage.DELETION, SNACK_CLOSE_ICON_ACTION);
        } else {
            this.snackBar.open(QuestionBankErrorMessage.DELETION, SNACK_CLOSE_ICON_ACTION);
        }
    }

    createFormQuestion(question: Question): FormGroup<QuestionForm> {
        const multiChoiceForms: FormGroup<MultiChoiceForm>[] = question.choices.map((choice) => {
            return this.formBuilder.group<MultiChoiceForm>({
                text: this.formBuilder.control(choice.text, Validators.required),
                isCorrect: this.formBuilder.control(choice.isCorrect),
            });
        });
        const questionForm = this.formBuilder.group<QuestionForm>({
            type: this.formBuilder.control(question.type, Validators.required),
            text: this.formBuilder.control(question.text, Validators.required),
            points: this.formBuilder.control(question.points),
            choices: this.formBuilder.array<FormGroup<MultiChoiceForm>>(multiChoiceForms),
            lastModification: this.formBuilder.control(question.lastModification || new Date()),
            id: this.formBuilder.control(question.id || ''),

            lowerBound: this.formBuilder.control(question.lowerBound ?? 0, [Validators.required]),
            upperBound: this.formBuilder.control(question.upperBound ?? 0, [Validators.required]),
            answer: this.formBuilder.control(question.answer ?? 0, [Validators.required]),
            precision: this.formBuilder.control(question.precision ?? 0, [Validators.required]),
            imageUrl: this.formBuilder.control(question.imageUrl ?? ''),
            uuid: this.formBuilder.control(question.uuid ?? crypto.randomUUID().toString()),
            creator: this.formBuilder.control(question.creator ?? ''),
        });
        questionForm.addValidators(GameValidator.QuestionValidator());
        return questionForm;
    }

    addNewQuestionForm(type: QuestionType) {
        const newQuestion: Question = {
            type,
            text: '',
            points: 10,
            choices: [],
            lastModification: new Date(),
            uuid: crypto.randomUUID().toString(),
        };
        const questionFormsRaw = this.questionForms.map((form) => form.getRawValue());
        this.questionService.questions.next([newQuestion].concat(questionFormsRaw));
    }

    async removeQuestion(index: number) {
        const { id, uuid } = this.questionService.questions.getValue()[index];
        if (uuid) await this.questionService.deleteQuestionImage(uuid);
        if (id) {
            this.deleteQuestion(id);
        } else {
            this.snackBar.open(QuestionBankSuccessMessage.DELETION, SNACK_CLOSE_ICON_ACTION);
        }
        const questionFormsRaw: Question[] = this.questionForms.map((form) => form.getRawValue());
        questionFormsRaw.splice(index, 1);
        this.questionService.questions.next(questionFormsRaw);
    }

    deleteQuestion(id: string) {
        this.questionService.deleteQuestion(id).subscribe({
            next: (res) => {
                this.openDeleteSnackBar(res.status);
            },
            error: () => {
                this.snackBar.open(QuestionBankErrorMessage.DELETION, SNACK_CLOSE_ICON_ACTION);
            },
        });
    }

    async dropQuestion(event: CdkDragDrop<FormGroup<QuestionForm>[]>) {
        const previousIndex = event.previousIndex;
        const dropList = this.questionService.gameEditorQuestionsDropList.getValue();
        const movedQuestionText = dropList.data[previousIndex].value.text;
        const hasSameTitle = (question: FormGroup<QuestionForm>) => question.value?.text === movedQuestionText;

        if (event.previousContainer === event.container) return;
        if (this.questionBank.data.find(hasSameTitle)) {
            this.snackBar.open(QuestionBankErrorMessage.DISPLACEMENT, SNACK_CLOSE_ICON_ACTION);
            return;
        }

        copyArrayItem(this.questionsDropList.data, this.questionBank.data, event.previousIndex, event.currentIndex);
        const uuid = crypto.randomUUID().toString();
        const questionFormsRaw: Question[] = this.questionForms.map((form) => form.getRawValue());
        const imageUrl = questionFormsRaw[event.currentIndex].imageUrl;

        questionFormsRaw[event.currentIndex].uuid = uuid;
        if (imageUrl) await this.gameImageUploadService.copyImage(imageUrl, uuid);
        this.questionService.questions.next(questionFormsRaw);
    }

    displayQuestions(questionType: QuestionType | null) {
        this.selectedFilter = questionType;
    }

    typeIsSelected(type: QuestionType | null): boolean {
        if (this.selectedFilter === null) return true;
        return type === this.selectedFilter;
    }
}
