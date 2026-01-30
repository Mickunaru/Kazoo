import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CHOICE_ARRAY_ANSWERS_MOCK, TEXT_MOCK } from '@app/constants/test-utils';
import { KonvaService } from '@app/game/services/konva/konva.service';
import { S3Service } from '@app/shared/services/s3/s3.service';
import { QuestionType } from '@common/enum/question-type';
import { SubmitManagerService } from './submit-manager.service';

describe('SubmitManagerService', () => {
    let service: SubmitManagerService;
    let konvaServiceSpy: jasmine.SpyObj<KonvaService>;
    let s3ServiceSpy: jasmine.SpyObj<S3Service>;
    beforeEach(() => {
        konvaServiceSpy = jasmine.createSpyObj('KonvaService', ['getDrawingBlob']);
        s3ServiceSpy = jasmine.createSpyObj('S3Service', ['uploadBlobImage']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [
                { provide: KonvaService, useValue: konvaServiceSpy },
                { provide: S3Service, useValue: s3ServiceSpy },
            ],
        });
        service = TestBed.inject(SubmitManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set number of Buttons', () => {
        service.buttonsAreActive = CHOICE_ARRAY_ANSWERS_MOCK;
        service.setNumberOfButtons(3);
        expect(service.buttonsAreActive).toEqual([false, false, false]);
    });

    it('should activate button on click', () => {
        service.buttonsAreActive = CHOICE_ARRAY_ANSWERS_MOCK;
        const flippedChoiceArray = [...CHOICE_ARRAY_ANSWERS_MOCK];
        flippedChoiceArray[2] = false;
        service.buttonWasClicked(2);
        expect(service.buttonsAreActive).toEqual(flippedChoiceArray);
    });

    it('should update openEndedAnswer', () => {
        service.changeTextAnswer(TEXT_MOCK);
        expect(service.textAnswer).toBe(TEXT_MOCK);
    });

    it('should return true if all elements in buttonAreActive are false', () => {
        service.buttonsAreActive = [false, false, false, false];
        expect(service.answerIsChosen(QuestionType.MultiChoice)).toBeFalse();
    });

    it('should return true if all elements in buttonAreActive are false', () => {
        service.buttonsAreActive = [false, true, false, false];
        expect(service.answerIsChosen(QuestionType.MultiChoice)).toBeTrue();
    });
});
