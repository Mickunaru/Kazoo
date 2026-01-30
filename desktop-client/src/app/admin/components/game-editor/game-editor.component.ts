import { CdkDragDrop, CdkDropList, copyArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEFAULT_POINT_VALUE, EMPTY_GAME_OBJECT } from '@app/admin/admin.const';
import { GameValidator } from '@app/admin/classes/game-validator';
import { CreateGameDto } from '@app/admin/interfaces/create-game-dto';
import { GameForm } from '@app/admin/interfaces/game-form';
import { MultiChoiceForm } from '@app/admin/interfaces/multi-choice-form';
import { QuestionForm } from '@app/admin/interfaces/question-form';
import { GameImageUploadService } from '@app/admin/services/game-image-upload/game-image-upload.service';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { QuestionService } from '@app/admin/services/question/question.service';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { QuestionType } from '@common/enum/question-type';
import { Game } from '@common/interfaces/game';
import { Question } from '@common/interfaces/question';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-game-editor',
    templateUrl: './game-editor.component.html',
    styleUrls: ['./game-editor.component.scss'],
})
export class GameEditorComponent implements OnInit, OnDestroy {
    @ViewChild('gameFormQuestionsList') gameFormQuestionsList: CdkDropList;
    questionType = QuestionType;
    questionBankList: CdkDropList;
    multipleChoiceForm: FormGroup<GameForm> = this.formBuilder.group<GameForm>({
        title: this.formBuilder.control('', Validators.required),
        description: this.formBuilder.control('', Validators.required),
        duration: this.formBuilder.control(0, Validators.required),
        questions: this.formBuilder.array<FormGroup<QuestionForm>>([], GameValidator.arrayLengthValidation(1)),
        private: this.formBuilder.control(false),
    });
    selectedGameId: string;
    private creatorName: string;
    private subscriptions: Subscription[];

    // Justification :
    // NonNullableFormBuilder is needed to create the question editing forms.
    // GameEditorService manages this component's logic.
    // GameLibraryService is needed to get the latest games from the server.
    // QuestionService is needed to create questions and to get the latest questions from the server.
    // eslint-disable-next-line max-params
    constructor(
        private readonly formBuilder: NonNullableFormBuilder,
        readonly gameLibraryService: GameLibraryService,
        private readonly questionService: QuestionService,
        readonly userAuthService: UserAuthService,
        readonly snackBar: MatSnackBar,
        private readonly gameImageUploadService: GameImageUploadService,
    ) {}

    ngOnInit() {
        const gameEditorSubscription = this.gameLibraryService.selectedGame.subscribe((game: Game) => {
            this.selectedGameId = game.id;
            this.creatorName = game.creator;
            this.buildForm(game);
        });
        const selectGameSubscription = this.gameLibraryService.selectedGame.subscribe(() => {
            this.questionService.gameEditorQuestionsDropList.next(this.gameFormQuestionsList);
        });
        const questionBankListSubscription = this.questionService.questionBankList.subscribe((questionBankList) => {
            this.questionBankList = questionBankList;
        });
        this.subscriptions = [gameEditorSubscription, selectGameSubscription, questionBankListSubscription];
    }

    ngOnDestroy() {
        this.subscriptions?.forEach((subscription) => {
            subscription.unsubscribe();
        });
        this.gameLibraryService.resetState();
        this.gameImageUploadService.resetState();
    }

    createQuestionTemplate(questionType: QuestionType) {
        const questionForm = this.formBuilder.group<QuestionForm>({
            type: this.formBuilder.control(questionType, Validators.required),
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
        });
        questionForm.addValidators(GameValidator.QuestionValidator());
        return questionForm;
    }

    addQuestion(questionType: QuestionType) {
        this.multipleChoiceForm.controls.questions.push(this.createQuestionTemplate(questionType));
    }

    removeQuestion(index: number) {
        this.gameImageUploadService.deletedGameImages.add(this.multipleChoiceForm.controls.questions.controls[index].controls.uuid.value);
        this.multipleChoiceForm.controls.questions.removeAt(index);
    }

    async dropQuestion(event: CdkDragDrop<FormGroup<QuestionForm>[]>) {
        const questionBankListData = this.questionBankList.data as FormGroup<QuestionForm>[];
        const gameFormQuestionListData = this.gameFormQuestionsList.data as FormGroup<QuestionForm>[];
        if (event.previousContainer === event.container) {
            moveItemInArray(this.multipleChoiceForm.controls.questions.controls, event.previousIndex, event.currentIndex);
        } else {
            copyArrayItem(questionBankListData, gameFormQuestionListData, event.previousIndex, event.currentIndex);
            const questionTemplate = this.createQuestionTemplate(
                this.multipleChoiceForm.controls.questions.controls[event.currentIndex].controls.type.value,
            );

            const questionRaw = questionBankListData[event.previousIndex].getRawValue();
            questionTemplate.controls.choices.setValue(questionRaw.choices ?? []);
            questionTemplate.patchValue(questionRaw);
            const uuid = crypto.randomUUID().toString();
            questionTemplate.controls.uuid.setValue(uuid);

            const imageValue = questionTemplate.controls.imageUrl.value;
            this.gameImageUploadService.copyImage(imageValue, uuid);

            this.multipleChoiceForm.controls.questions.controls[event.currentIndex] = questionTemplate;
            this.multipleChoiceForm.controls.questions.updateValueAndValidity();
        }
    }

    async validateGame() {
        const form = this.multipleChoiceForm.getRawValue();

        if (this.selectedGameId) {
            await this.gameLibraryService.updateGame(this.selectedGameId, form);
            this.snackBar.open('Jeu questionnaire mis à jour');
        } else {
            const newGame = await this.gameLibraryService.createGame(form);
            this.selectedGameId = newGame.id;
            this.snackBar.open('Jeu questionnaire créé');
        }
        await this.handleImages(form);
        await this.refreshCurrentGame();
    }

    async handleImages(form: CreateGameDto) {
        for (const question of form.questions) {
            if (!question.uuid) continue;
            const image = this.gameImageUploadService.images.get(question.uuid);
            if (!image) continue;
            await this.gameLibraryService.uploadQuestionImage(question.uuid, image);
            this.gameImageUploadService.images.delete(question.uuid);
        }

        for (const question of this.gameImageUploadService.deletedGameImages) {
            await this.gameLibraryService.deleteQuestionImage(question);
        }
        this.gameImageUploadService.deletedGameImages.clear();
    }

    async refreshCurrentGame() {
        await this.gameLibraryService.updateGamesList();
        const upToDateGame = this.gameLibraryService.games.find((game) => game.id === this.selectedGameId);
        if (!upToDateGame) return;

        this.multipleChoiceForm.patchValue(upToDateGame);
        this.multipleChoiceForm.updateValueAndValidity();
    }

    buildForm(game: Game) {
        this.multipleChoiceForm.patchValue(game);
        this.gameImageUploadService.lastModification = game.lastModification;
        const questionForms = this.formBuilder.array<FormGroup<QuestionForm>>(
            [
                ...game.questions.map((question) => {
                    const questionForm = this.formBuilder.group<QuestionForm>({
                        type: this.formBuilder.control(question.type, Validators.required),
                        text: this.formBuilder.control(question.text, Validators.required),
                        points: this.formBuilder.control(question.points, Validators.required),
                        choices: this.buildMultiChoiceArray(question),
                        lastModification: this.formBuilder.control(question.lastModification || new Date()),

                        lowerBound: this.formBuilder.control(question.lowerBound ?? 0, [Validators.required]),
                        upperBound: this.formBuilder.control(question.upperBound ?? 0, [Validators.required]),
                        answer: this.formBuilder.control(question.answer ?? 0, [Validators.required]),
                        precision: this.formBuilder.control(question.precision ?? 0, [Validators.required]),
                        imageUrl: this.formBuilder.control(question.imageUrl ?? ''),
                        uuid: this.formBuilder.control(question?.uuid ?? crypto.randomUUID().toString()),
                        creator: this.formBuilder.control(question.creator ?? ''),
                    });
                    questionForm.addValidators(GameValidator.QuestionValidator());
                    return questionForm;
                }),
            ],
            GameValidator.arrayLengthValidation(1),
        );
        this.multipleChoiceForm.setControl('questions', questionForms);
    }

    buildMultiChoiceArray(question: Question): FormArray<FormGroup<MultiChoiceForm>> {
        return this.formBuilder.array<FormGroup<MultiChoiceForm>>([
            ...question.choices.map((multiChoice) =>
                this.formBuilder.group<MultiChoiceForm>({
                    text: this.formBuilder.control(multiChoice.text, Validators.required),
                    isCorrect: this.formBuilder.control(multiChoice.isCorrect),
                }),
            ),
        ]);
    }

    getQuestionsArray() {
        return Array.from(this.multipleChoiceForm.controls.questions.controls);
    }

    closeForm() {
        this.gameLibraryService.isClicked = false;
        this.gameLibraryService.selectedGame.next(EMPTY_GAME_OBJECT);
    }

    canToggleGameAccessibility() {
        return this.userAuthService.curUser?.username === this.creatorName || !this.selectedGameId;
    }
}
