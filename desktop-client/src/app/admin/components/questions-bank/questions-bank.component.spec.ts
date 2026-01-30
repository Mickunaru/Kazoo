import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionBankSuccessMessage } from '@app/admin/admin.const';
import { QuestionForm } from '@app/admin/interfaces/question-form';
import { GameImageUploadService } from '@app/admin/services/game-image-upload/game-image-upload.service';
import { QuestionService } from '@app/admin/services/question/question.service';
import { QuestionBankErrorMessage } from '@app/constants/error-message';
import { SNACK_CLOSE_ICON_ACTION } from '@app/constants/snack-bar-constants';
import { BAD_QUESTION_MOCK, QUESTION_BANK_MOCK, QUESTION_BANK_MOCK_2 } from '@app/constants/test-utils';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuestionType } from '@common/enum/question-type';
import { MultiChoice } from '@common/interfaces/multi-choice';
import { Question } from '@common/interfaces/question';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { QuestionsBankComponent } from './questions-bank.component';

describe('QuestionsBankComponent', () => {
    let component: QuestionsBankComponent;
    let fixture: ComponentFixture<QuestionsBankComponent>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    let dummyBank: Question[];
    let otherDummyBank: Question[];
    const formBuilder = new FormBuilder();
    let questionForms: FormGroup[];
    let otherQuestionForms: FormGroup[];
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let gameImageUploadServiceSpy: jasmine.SpyObj<GameImageUploadService>;

    beforeEach(() => {
        gameImageUploadServiceSpy = jasmine.createSpyObj<GameImageUploadService>('GameImageUploadService', ['copyImage', 'resetState'], {
            images: new Map(),
            deletedGameImages: new Set(),
            deletedQuestionBankImages: new Set(),
            lastModification: new Date(),
        });
        gameImageUploadServiceSpy.copyImage.and.stub();
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        questionServiceSpy = jasmine.createSpyObj(
            'QuestionService',
            ['sortQuestions', 'deleteQuestion', 'getQuestions', 'updateQuestion', 'createQuestion'],
            {
                gameEditorQuestionsDropList: new BehaviorSubject<CdkDropList>({} as CdkDropList),
                questions: new BehaviorSubject<Question[]>([]),
                questionBankList: new BehaviorSubject<CdkDropList>({} as CdkDropList),
            },
        );
        questionServiceSpy.questions = new BehaviorSubject<Question[]>(structuredClone(dummyBank));
        TestBed.configureTestingModule({
            declarations: [QuestionsBankComponent],
            imports: [HttpClientTestingModule, AppMaterialModule, DragDropModule, BrowserAnimationsModule],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: GameImageUploadService, useValue: gameImageUploadServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(QuestionsBankComponent);
        component = fixture.componentInstance;
        dummyBank = structuredClone(QUESTION_BANK_MOCK);
        otherDummyBank = structuredClone(QUESTION_BANK_MOCK_2);

        const mockForm: (question: Question) => FormGroup = (question: Question) => {
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
        };

        questionForms = dummyBank.map((question: Question) => {
            return mockForm(question);
        });

        otherQuestionForms = otherDummyBank.map((question: Question) => {
            return mockForm(question);
        });

        component.questionForms = questionForms;
        questionServiceSpy.sortQuestions.and.stub();
        questionServiceSpy.questions.next(questionForms.map((form) => form.getRawValue()));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get questions', () => {
        questionServiceSpy.getQuestions.and.stub();
        component.ngOnInit();
        expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
    });

    it('should modify question', () => {
        questionServiceSpy.updateQuestion.and.returnValue(of(new HttpResponse<string>({ status: 200, body: 'OK' })));
        snackBarSpy.open.and.stub();
        component.saveQuestion(questionForms[0]);
        expect(questionServiceSpy.updateQuestion).toHaveBeenCalled();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it(' should display «Une erreur est survenue lors de la mise à jour de la question» if status is not 200', () => {
        questionServiceSpy.updateQuestion.and.returnValue(of(new HttpResponse<string>({ status: 500, body: 'OK' })));
        snackBarSpy.open.and.stub();
        component.saveQuestion(questionForms[0]);
        expect(snackBarSpy.open).toHaveBeenCalledWith(QuestionBankErrorMessage.UPDATE, SNACK_CLOSE_ICON_ACTION);
    });

    it('should display Une erreur est survenue lors de la création de la question if status is not 201', () => {
        questionServiceSpy.createQuestion.and.returnValue(of(new HttpResponse<string>({ status: 500, body: 'OK' })));
        snackBarSpy.open.and.stub();
        component.saveQuestion(questionForms[2]);
        expect(snackBarSpy.open).toHaveBeenCalledWith(QuestionBankErrorMessage.CREATION, SNACK_CLOSE_ICON_ACTION);
    });

    it('should create Question', () => {
        questionServiceSpy.createQuestion.and.returnValue(of(new HttpResponse<string>({ status: 201, body: 'OK' })));
        questionForms[2].controls.id.setValue(undefined);
        snackBarSpy.open.and.stub();
        component.saveQuestion(questionForms[2]);
        expect(questionServiceSpy.createQuestion).toHaveBeenCalled();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should display an error message when creating a question fails', () => {
        questionServiceSpy.createQuestion.and.returnValue(throwError(() => new HttpErrorResponse({ error: '' })));
        snackBarSpy.open.and.stub();
        component.saveQuestion(questionForms[2]);
        expect(snackBarSpy.open).toHaveBeenCalledWith(QuestionBankErrorMessage.CREATION, SNACK_CLOSE_ICON_ACTION);
        expect(questionServiceSpy.createQuestion).toHaveBeenCalled();
    });

    it('should display an error message when updating a question fails', () => {
        questionServiceSpy.updateQuestion.and.returnValue(throwError(() => new HttpErrorResponse({ error: '' })));
        snackBarSpy.open.and.stub();
        component.saveQuestion(questionForms[0]);
        expect(snackBarSpy.open).toHaveBeenCalledWith(QuestionBankErrorMessage.UPDATE, SNACK_CLOSE_ICON_ACTION);
        expect(questionServiceSpy.updateQuestion).toHaveBeenCalled();
    });

    it('should create form question', () => {
        const question: Question = dummyBank[0];
        const formQuestion = component.createFormQuestion(question);
        expect(formQuestion.controls.text.value).toEqual(question.text);
        expect(formQuestion.controls.points.value).toEqual(question.points);
    });
    it('should create a new date for a question without the attribute', () => {
        const question: Question = dummyBank[0];
        question.lastModification = undefined;
        const formQuestion = component.createFormQuestion(question);
        expect(formQuestion.controls.lastModification.value).toBeDefined();
    });

    it('should create new open-ended questionForm', () => {
        component.ngOnInit();
        const originalLength = component.questionForms.length;

        component.addNewQuestionForm(QuestionType.OpenEnded);
        expect(component.questionForms.length).toEqual(originalLength + 1);
    });

    it('should create new multiChoice questionForm', () => {
        component.ngOnInit();
        const originalLength = component.questionForms.length;

        component.addNewQuestionForm(QuestionType.MultiChoice);
        expect(component.questionForms.length).toEqual(originalLength + 1);
    });

    it('should delete question', () => {
        questionServiceSpy.questions.next(structuredClone(dummyBank));
        questionServiceSpy.deleteQuestion.and.returnValue(of(new HttpResponse<string>()));
        snackBarSpy.open.and.stub();
        component.removeQuestion(0);
        expect(snackBarSpy.open).toHaveBeenCalled();
        expect(questionServiceSpy.deleteQuestion).toHaveBeenCalled();
    });

    it('should not call deleteQuestion on question without id ', () => {
        questionServiceSpy.questions.next([BAD_QUESTION_MOCK]);
        questionServiceSpy.deleteQuestion.and.returnValue(of(new HttpResponse<string>({ status: 500, body: 'OK' })));
        snackBarSpy.open.and.stub();
        component.removeQuestion(0);
        expect(questionServiceSpy.deleteQuestion).not.toHaveBeenCalled();
        expect(snackBarSpy.open).toHaveBeenCalledWith(QuestionBankSuccessMessage.DELETION, SNACK_CLOSE_ICON_ACTION);
    });

    it('should display an error message when deleting a question fails', () => {
        questionServiceSpy.questions.next(structuredClone(dummyBank));
        questionServiceSpy.deleteQuestion.and.returnValue(throwError(() => new Error('error')));
        snackBarSpy.open.and.stub();
        component.removeQuestion(1);
        expect(snackBarSpy.open).toHaveBeenCalledWith(QuestionBankErrorMessage.DELETION, SNACK_CLOSE_ICON_ACTION);
    });

    it('should display an error message when deleting a question does not return 200 OK', () => {
        questionServiceSpy.questions.next(structuredClone(dummyBank));
        questionServiceSpy.deleteQuestion.and.returnValue(of(new HttpResponse<string>({ status: 500, body: 'OK' })));
        snackBarSpy.open.and.stub();
        component.removeQuestion(1);
        expect(snackBarSpy.open).toHaveBeenCalledWith(QuestionBankErrorMessage.DELETION, SNACK_CLOSE_ICON_ACTION);
    });

    it('should call copyArrayItem if event.previousContainer !== event.container in dropQuestion', () => {
        component.ngOnInit();
        const fb = new FormBuilder();
        const mockFormGroup1 = fb.group(questionForms);
        const mockFormGroup2 = fb.group(otherQuestionForms);

        questionServiceSpy.gameEditorQuestionsDropList.next({ data: questionForms } as unknown as CdkDropList<FormGroup<QuestionForm>[]>);
        component.questionsDropList = { data: questionForms } as unknown as CdkDropList<FormGroup<QuestionForm>[]>;
        component.questionBank.data = [mockFormGroup2];
        component.questionsDropList.data = [mockFormGroup1];
        const originalLength = component.questionBank.data.length;

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
        expect(component.questionBank.data.length).toEqual(originalLength + 1);
    });

    it('should do nothing if event.previousContainer is equal to event.container in dropQuestion', () => {
        const mockFormGroup1 = questionForms;
        const mockFormGroup2 = otherQuestionForms;
        questionServiceSpy.gameEditorQuestionsDropList.next({ data: mockFormGroup1 } as unknown as CdkDropList<FormGroup<QuestionForm>[]>);
        component.questionsDropList.data.push(mockFormGroup1);
        component.questionBank.data.push(mockFormGroup2);
        const originalLength = component.questionBank.data.length;

        const containerMock = {
            data: questionForms,
        } as unknown as CdkDropList<FormGroup<QuestionForm>[]>;
        component.questionsDropList = containerMock;
        const event: CdkDragDrop<FormGroup<QuestionForm>[]> = {
            previousContainer: containerMock,
            container: containerMock,
            previousIndex: 0,
            currentIndex: 1,
        } as CdkDragDrop<FormGroup<QuestionForm>[]>;
        component.dropQuestion(event);
        expect(component.questionBank.data.length).toEqual(originalLength);
    });

    it('should display an error message when moving a question fails', () => {
        const mockFormGroup1 = questionForms;
        questionServiceSpy.gameEditorQuestionsDropList.next({ data: mockFormGroup1 } as unknown as CdkDropList<FormGroup<QuestionForm>[]>);
        component.questionsDropList.data.push(...mockFormGroup1);
        component.questionBank.data.push(...mockFormGroup1);
        snackBarSpy.open.and.stub();

        const event: CdkDragDrop<FormGroup<QuestionForm>[]> = {
            previousContainer: {
                data: [mockFormGroup1],
            } as unknown as CdkDropList<FormGroup<QuestionForm>[]>,
            container: {
                data: [mockFormGroup1],
            } as unknown as CdkDropList<FormGroup<QuestionForm>[]>,
            previousIndex: 0,
            currentIndex: 1,
            item: {
                data: mockFormGroup1,
            } as unknown as CdkDrag<FormGroup<QuestionForm>>,
        } as CdkDragDrop<FormGroup<QuestionForm>[]>;

        component.dropQuestion(event);
        expect(snackBarSpy.open).toHaveBeenCalledWith(QuestionBankErrorMessage.DISPLACEMENT, SNACK_CLOSE_ICON_ACTION);
    });

    it('should return false when type is undefined', () => {
        expect(component.typeIsSelected(null)).toBeTrue();
    });
});
