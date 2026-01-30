import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY_GAME_OBJECT } from '@app/admin/admin.const';
import { MultiChoiceForm } from '@app/admin/interfaces/multi-choice-form';
import { QuestionForm } from '@app/admin/interfaces/question-form';
import { GameImageUploadService } from '@app/admin/services/game-image-upload/game-image-upload.service';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { QuestionService } from '@app/admin/services/question/question.service';
import { MOCK_GAME_2 } from '@app/constants/test-utils';
import { AppMaterialModule } from '@app/modules/material.module';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { QuestionType } from '@common/enum/question-type';
import { Game } from '@common/interfaces/game';
import { MultiChoice } from '@common/interfaces/multi-choice';
import { Question } from '@common/interfaces/question';
import { BehaviorSubject } from 'rxjs';
import { GameEditorComponent } from './game-editor.component';

describe('GameEditorComponent', () => {
    let component: GameEditorComponent;
    let fixture: ComponentFixture<GameEditorComponent>;
    let gameLibraryServiceSpy: jasmine.SpyObj<GameLibraryService>;
    const formBuilder = new FormBuilder();
    let questionForms: FormGroup[];
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    let userAuthServiceSpy: jasmine.SpyObj<UserAuthService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let gameImageUploadServiceSpy: jasmine.SpyObj<GameImageUploadService>;

    const validateQuestions = (questions: FormGroup<QuestionForm>[]) => {
        for (let i = 0; i < questions.length; i++) {
            expect(questions[i].controls.text.value).toEqual(MOCK_GAME_2.questions[i].text);
            expect(questions[i].controls.points.value).toEqual(MOCK_GAME_2.questions[i].points);
            const choices = Array.from<FormGroup<MultiChoiceForm>>(questions[i].controls.choices.controls);
            if (questions[i].controls.type.value === QuestionType.OpenEnded) continue;
            for (let j = 0; j < questions.length; j++) {
                expect(choices[j].controls.isCorrect.value).toEqual(MOCK_GAME_2.questions[i].choices[j].isCorrect);
                expect(choices[j].controls.text.value).toEqual(MOCK_GAME_2.questions[i].choices[j].text);
            }
        }
    };

    beforeEach(() => {
        snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
        gameImageUploadServiceSpy = jasmine.createSpyObj<GameImageUploadService>('GameImageUploadService', ['copyImage', 'resetState'], {
            images: new Map(),
            deletedGameImages: new Set(),
            deletedQuestionBankImages: new Set(),
            lastModification: new Date(),
        });
        gameLibraryServiceSpy = jasmine.createSpyObj<GameLibraryService>('GameLibraryService', [
            'games',
            'updateGamesList',
            'selectedGame',
            'createGame',
            'updateGame',
            'resetState',
        ]);

        gameLibraryServiceSpy.selectedGame = new BehaviorSubject<Game>(MOCK_GAME_2);
        gameLibraryServiceSpy.resetState.and.stub();
        gameImageUploadServiceSpy.resetState.and.stub();
        questionServiceSpy = jasmine.createSpyObj<QuestionService>('QuestionService', ['questionBankList']);
        userAuthServiceSpy = jasmine.createSpyObj<UserAuthService>('UserAuthService', { curUser: { username: 'name' } });
        questionServiceSpy.questionBankList = new BehaviorSubject<CdkDropList<FormGroup<QuestionForm>[]>>(
            {} as unknown as CdkDropList<FormGroup<QuestionForm>[]>,
        );
        TestBed.configureTestingModule({
            declarations: [GameEditorComponent],
            imports: [AppMaterialModule, HttpClientTestingModule, BrowserAnimationsModule],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: GameLibraryService, useValue: gameLibraryServiceSpy },
                { provide: UserAuthService, useValue: userAuthServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: GameImageUploadService, useValue: gameImageUploadServiceSpy },
                FormBuilder,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(GameEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        questionForms = MOCK_GAME_2.questions.map((question: Question) => {
            return formBuilder.group({
                text: formBuilder.nonNullable.control(question.text, Validators.required),
                points: formBuilder.nonNullable.control(question.points, Validators.required),
                type: formBuilder.nonNullable.control(question.type, Validators.required),
                lastModification: formBuilder.nonNullable.control(question.lastModification),
                id: formBuilder.control(question.id),
                choices: formBuilder.nonNullable.array([
                    ...question.choices.map((choice: MultiChoice) =>
                        formBuilder.group({
                            text: formBuilder.nonNullable.control(choice.text, Validators.required),
                            isCorrect: formBuilder.nonNullable.control(choice.isCorrect),
                        }),
                    ),
                ]),
            });
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add a question', () => {
        const initialLength = component.multipleChoiceForm.controls.questions.length;
        component.addQuestion(QuestionType.MultiChoice);
        const newLength = component.multipleChoiceForm.controls.questions.length;
        expect(newLength).toEqual(initialLength + 1);
    });

    it('should remove a question', () => {
        const removeSpy = spyOn(component.multipleChoiceForm.controls.questions, 'removeAt');
        component.addQuestion(QuestionType.MultiChoice);
        component.removeQuestion(0);
        expect(removeSpy).toHaveBeenCalledWith(0);
    });
    it('should call copyArrayItem if event.previousContainer !== event.container in dropquestion', () => {
        /* as there is no way to spy on copyArrayItem without wrapping it in the component,
         we will only call this test for coverage purposes and not for the actual functionality of the method as wrapping it would
        not serve any purpose for us and would make the code heavier for no reason 
    */
        const mockFormGroup1 = new FormGroup(questionForms);
        const mockFormGroup2 = new FormGroup(questionForms);

        component.gameFormQuestionsList = {
            data: [mockFormGroup1],
        } as unknown as CdkDropList<FormGroup<QuestionForm>[]>;

        questionServiceSpy.questionBankList.next({
            data: [mockFormGroup2],
        } as unknown as CdkDropList<FormGroup<QuestionForm>[]>);

        const event: CdkDragDrop<FormGroup<QuestionForm>[]> = {
            previousContainer: {
                data: [mockFormGroup1],
            } as unknown as CdkDropList<FormGroup<QuestionForm>[]>,
            container: {
                data: [mockFormGroup2],
            } as unknown as CdkDropList<FormGroup<QuestionForm>[]>,
            previousIndex: 0,
            currentIndex: 1,
            item: {
                data: mockFormGroup1,
            } as unknown as CdkDrag<FormGroup<QuestionForm>>,
        } as CdkDragDrop<FormGroup<QuestionForm>[]>;

        component.dropQuestion(event);
        expect(component.gameFormQuestionsList.data.length).toEqual(2);
    });

    it('should call moveItemInArray if event.previousContainer === event.container in dropquestion', () => {
        const mockFormGroup1 = new FormGroup(questionForms);

        component.gameFormQuestionsList = {
            data: [mockFormGroup1],
            id: 'previousContainer',
        } as unknown as CdkDropList<FormGroup<QuestionForm>[]>;

        questionServiceSpy.questionBankList.next({
            data: [mockFormGroup1],
            id: 'previousContainer',
        } as unknown as CdkDropList<FormGroup<QuestionForm>[]>);

        const event: CdkDragDrop<FormGroup<QuestionForm>[]> = {
            previousContainer: {},
            container: {
                data: [mockFormGroup1],
                id: 'previousContainer',
            } as unknown as CdkDropList<FormGroup<QuestionForm>[]>,
            previousIndex: 0,
            currentIndex: 1,
            isPointerOverContainer: true,
            item: {
                data: mockFormGroup1,
            } as unknown as CdkDrag<FormGroup<QuestionForm>>,
        } as CdkDragDrop<FormGroup<QuestionForm>[]>;

        event.previousContainer = event.container;
        component.dropQuestion(event);
        expect(component.gameFormQuestionsList.data.length).toEqual(1);
    });

    it('should create build multipleChoiceForm', () => {
        component.buildForm(MOCK_GAME_2);
        expect(component.multipleChoiceForm.controls.title.value).toEqual(MOCK_GAME_2.title);
        expect(component.multipleChoiceForm.controls.description.value).toEqual(MOCK_GAME_2.description);
        expect(component.multipleChoiceForm.controls.duration.value).toEqual(MOCK_GAME_2.duration);
        const questions = Array.from<FormGroup<QuestionForm>>(component.multipleChoiceForm.controls.questions.controls);
        validateQuestions(questions);
    });

    it('should create build multipleChoiceForm', () => {
        component.buildForm(MOCK_GAME_2);
        const arrayOfQuestions = component.getQuestionsArray();
        expect(arrayOfQuestions.length).toEqual(MOCK_GAME_2.questions.length);
        validateQuestions(arrayOfQuestions);
    });

    it('should modify game', fakeAsync(() => {
        gameLibraryServiceSpy.updateGame.and.resolveTo(MOCK_GAME_2);
        spyOn(component, 'refreshCurrentGame').and.stub();
        spyOn(component, 'handleImages').and.stub();
        component.selectedGameId = 'id';
        component.validateGame();
        tick();
        expect(gameLibraryServiceSpy.updateGame).toHaveBeenCalled();
    }));

    it('should create game', fakeAsync(() => {
        gameLibraryServiceSpy.createGame.and.resolveTo(MOCK_GAME_2);
        spyOn(component, 'refreshCurrentGame').and.stub();
        spyOn(component, 'handleImages').and.stub();
        component.selectedGameId = '';
        component.validateGame();
        tick();
        expect(gameLibraryServiceSpy.createGame).toHaveBeenCalled();
    }));

    it('should close form', () => {
        gameLibraryServiceSpy.isClicked = true;
        const selectedGameSpy = spyOn(gameLibraryServiceSpy.selectedGame, 'next');
        component.closeForm();
        expect(gameLibraryServiceSpy.isClicked).toBeFalse();
        expect(selectedGameSpy).toHaveBeenCalledWith(EMPTY_GAME_OBJECT);
    });
});
