import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MultiChoiceForm } from '@app/admin/interfaces/multi-choice-form';
import { GameImageUploadService } from '@app/admin/services/game-image-upload/game-image-upload.service';
import { CHOICE_ARRAY_MOCK } from '@app/constants/test-utils';
import { AppMaterialModule } from '@app/modules/material.module';
import { MultiChoice } from '@common/interfaces/multi-choice';
import { QuestionFormComponent } from './question-form.component';

describe('QuestionFormComponent', () => {
    let component: QuestionFormComponent;
    let fixture: ComponentFixture<QuestionFormComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let gameImageUploadServiceSpy: jasmine.SpyObj<GameImageUploadService>;

    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        gameImageUploadServiceSpy = jasmine.createSpyObj<GameImageUploadService>('GameImageUploadService', ['copyImage', 'resetState'], {
            images: new Map(),
        });
        gameImageUploadServiceSpy.copyImage.and.stub();
        TestBed.configureTestingModule({
            declarations: [QuestionFormComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: GameImageUploadService, useValue: gameImageUploadServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(QuestionFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add a multi choice', () => {
        const initialLength = component.questionFormInfo.form.controls.choices.length;
        component.addMultiChoice();
        const newLength = component.questionFormInfo.form.controls.choices.length;
        expect(newLength).toBe(initialLength + 1);
    });

    it('should emit a remove event', () => {
        const removeSpy = spyOn(component.removeQuestionEmitter, 'emit');
        component.removeQuestion();
        expect(removeSpy).toHaveBeenCalled();
    });

    it('should not emit a save event with a bad form', () => {
        Object.defineProperty(component.questionFormInfo.form, 'valid', { value: false });
        const saveSpy = spyOn(component.saveQuestionEmitter, 'emit');
        component.saveQuestion();
        expect(saveSpy).not.toHaveBeenCalled();
    });
    it('should emit a save event with a valid form', () => {
        Object.defineProperty(component.questionFormInfo.form, 'valid', { value: true });
        const saveSpy = spyOn(component.saveQuestionEmitter, 'emit');
        component.saveQuestion();
        expect(saveSpy).toHaveBeenCalled();
    });

    it('should change indexes of questions when drag and dropped', () => {
        const originalArray = structuredClone(CHOICE_ARRAY_MOCK);
        const originalArrayCopy = structuredClone(originalArray); // To not modify the same instance of the array
        component.questionFormInfo.form.controls.choices.controls = originalArray as unknown as FormGroup<MultiChoiceForm>[];
        Object.defineProperty(component.questionFormInfo.form.controls.choices, 'value', { value: originalArrayCopy });
        const eventMock: Partial<CdkDragDrop<MultiChoice[]>> = {
            previousIndex: 0,
            currentIndex: 1,
        };
        component.dropMultiChoice(eventMock as CdkDragDrop<MultiChoice[]>);
        const expectedArray = [CHOICE_ARRAY_MOCK[1], CHOICE_ARRAY_MOCK[0], CHOICE_ARRAY_MOCK[2]];
        const expectedValueMock = expectedArray as ArrayLike<Partial<{ text: string; isCorrect: boolean }>>;
        expect(component.questionFormInfo.form.controls.choices.controls).toEqual(expectedArray as unknown as FormGroup[]);
        expect(component.questionFormInfo.form.controls.choices.value).toEqual(expectedValueMock);
    });

    it('should not have issues with multiple drag and drop', () => {
        const originalArray = structuredClone(CHOICE_ARRAY_MOCK);
        const originalArrayCopy = structuredClone(originalArray); // To not modify the same instance of the array
        component.questionFormInfo.form.controls.choices.controls = originalArray as unknown as FormGroup<MultiChoiceForm>[];
        Object.defineProperty(component.questionFormInfo.form.controls.choices, 'value', { value: originalArrayCopy });
        let eventMock: Partial<CdkDragDrop<MultiChoice[]>> = {
            previousIndex: 0,
            currentIndex: 1,
        };
        component.dropMultiChoice(eventMock as CdkDragDrop<MultiChoice[]>);

        eventMock = {
            previousIndex: 0,
            currentIndex: 2,
        };
        component.dropMultiChoice(eventMock as CdkDragDrop<MultiChoice[]>);
        const expectedArray = [CHOICE_ARRAY_MOCK[0], CHOICE_ARRAY_MOCK[2], CHOICE_ARRAY_MOCK[1]];
        const expectedValueMock = expectedArray as ArrayLike<Partial<{ text: string; isCorrect: boolean }>>;
        expect(component.questionFormInfo.form.controls.choices.controls).toEqual(expectedArray as unknown as FormGroup[]);
        expect(component.questionFormInfo.form.controls.choices.value).toEqual(expectedValueMock);
    });

    it('should format the date', () => {
        const day = 1;
        const month = 1;
        const year = 2021;
        const hour = 12;
        const minute = 0;
        const second = 0;
        const date = new Date(year, month, day, hour, minute, second);
        const formattedDate = component.formatDate(date);
        expect(formattedDate).toBe('2021/02/01 12:00');
    });
});
