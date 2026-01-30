import { CdkDropList } from '@angular/cdk/drag-drop';
import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ID_MOCK, QUESTION_BANK_MOCK_2 } from '@app/constants/test-utils';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(QuestionService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('behavioral Subject questions should be empty at first', () => {
        expect(service.questions.value).toEqual([]);
    });

    it('behavioral Subject questionBankList should be empty at first', () => {
        expect(service.questionBankList.value).toEqual({} as CdkDropList);
    });

    it('behavioral Subject questionsDropList should have Empty game object', () => {
        expect(service.gameEditorQuestionsDropList.value).toEqual({} as CdkDropList);
    });

    it('should get questions', () => {
        spyOn(service, 'sortQuestions').and.callFake(() => {
            return;
        });
        service.getQuestions();
        const req = httpTestingController.expectOne(service['baseUrl']);
        expect(req.request.method).toEqual('GET');
        req.flush(structuredClone(QUESTION_BANK_MOCK_2));
        expect(service.questions.value).toEqual(QUESTION_BANK_MOCK_2);
    });

    it('should return empty question object if no questions are found', () => {
        service.getQuestions();
        const req = httpTestingController.expectOne(service['baseUrl']);
        expect(req.request.method).toEqual('GET');
        req.flush([]);
        expect(service.questions.value).toEqual([]);
    });

    it('should get question', () => {
        service.getQuestion(ID_MOCK).subscribe((question) => {
            expect(question).toEqual(QUESTION_BANK_MOCK_2[0]);
        });
        const req = httpTestingController.expectOne(`${service['baseUrl']}/${ID_MOCK}`);
        expect(req.request.method).toEqual('GET');
        req.flush(QUESTION_BANK_MOCK_2[0]);
    });

    it('should create question', () => {
        service.createQuestion(QUESTION_BANK_MOCK_2[0]).subscribe((response) => {
            expect(response.status).toBe(HttpStatusCode.Ok);
        });
        const req = httpTestingController.expectOne(service['baseUrl']);
        expect(req.request.method).toEqual('POST');
        req.flush(QUESTION_BANK_MOCK_2[0]);
    });

    it('should update question', () => {
        service.updateQuestion(ID_MOCK, QUESTION_BANK_MOCK_2[0]).subscribe((response) => {
            expect(response.status).toBe(HttpStatusCode.Ok);
        });
        const req = httpTestingController.expectOne(`${service['baseUrl']}/${ID_MOCK}`);
        expect(req.request.method).toEqual('PUT');
        req.flush(QUESTION_BANK_MOCK_2[0]);
    });

    it('should delete question', () => {
        service.deleteQuestion(ID_MOCK).subscribe((response) => {
            expect(response.status).toBe(HttpStatusCode.Ok);
        });
        const req = httpTestingController.expectOne(`${service['baseUrl']}/${ID_MOCK}`);
        expect(req.request.method).toEqual('DELETE');
        req.flush(QUESTION_BANK_MOCK_2[0]);
    });

    it('should sort questions', () => {
        service.questions.next([QUESTION_BANK_MOCK_2[1], QUESTION_BANK_MOCK_2[0]]);
        service.sortQuestions();
        expect(service.questions.value).toEqual(QUESTION_BANK_MOCK_2);
    });
    it('should have same array before and after sort', () => {
        service.questions.next(QUESTION_BANK_MOCK_2);
        spyOn(service, 'sortByAscendingDate').and.callFake(() => {
            service.questions.next([QUESTION_BANK_MOCK_2[1], QUESTION_BANK_MOCK_2[0]]);
            return 0;
        });
        service.sortQuestions();
        service.questions.subscribe((questions) => {
            expect(questions).toEqual(QUESTION_BANK_MOCK_2);
        });
    });

    it('should sort by ascending date', () => {
        const result = service.sortByAscendingDate(QUESTION_BANK_MOCK_2[0], QUESTION_BANK_MOCK_2[1]);
        expect(result).toBeLessThan(0);
    });
    it('should create date if lastModification is undefined', () => {
        const questions = structuredClone(QUESTION_BANK_MOCK_2);
        questions[0].lastModification = undefined;
        questions[1].lastModification = undefined;
        service.sortByAscendingDate(questions[0], questions[1]);
        expect(questions[0].lastModification).toBeDefined();
        expect(questions[1].lastModification).toBeDefined();
    });
});
