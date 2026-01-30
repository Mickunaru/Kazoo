import { CdkDropList } from '@angular/cdk/drag-drop';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QuestionDto } from '@app/admin/interfaces/question-dto';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { IMAGES_ENDPOINT, QUESTIONS_ENDPOINT } from '@common/constants/endpoint-constants';
import { Question } from '@common/interfaces/question';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    questions = new BehaviorSubject<Question[]>([]);
    questionBankList: BehaviorSubject<CdkDropList> = new BehaviorSubject<CdkDropList>({} as CdkDropList);
    gameEditorQuestionsDropList: BehaviorSubject<CdkDropList> = new BehaviorSubject<CdkDropList>({} as CdkDropList);
    private readonly baseUrl = `${SERVER_URL_API}/${QUESTIONS_ENDPOINT}`;
    constructor(private readonly http: HttpClient) {}

    sortByAscendingDate(questionA: Question, questionB: Question): number {
        if (!questionA.lastModification) questionA.lastModification = new Date();
        if (!questionB.lastModification) questionB.lastModification = new Date();
        const dateA = new Date(questionA.lastModification);
        const dateB = new Date(questionB.lastModification);
        return dateB.getTime() - dateA.getTime();
    }

    sortQuestions() {
        const tempQuestions: Question[] = this.questions.getValue().sort(this.sortByAscendingDate);
        if (tempQuestions === this.questions.getValue()) return;
        this.questions.next(tempQuestions);
    }

    getQuestions(): void {
        this.http.get<Question[]>(this.baseUrl).subscribe((value: Question[]) => {
            this.questions.next(value);
            this.sortQuestions();
        });
    }

    getQuestion(id: string): Observable<Question> {
        return this.http.get<Question>(`${this.baseUrl}/${id}`);
    }

    createQuestion(question: QuestionDto): Observable<HttpResponse<string>> {
        return this.http.post(this.baseUrl, question, { observe: 'response', responseType: 'text' });
    }

    updateQuestion(id: string | undefined, questionData: QuestionDto): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/${id}`, questionData, { observe: 'response', responseType: 'text' });
    }

    deleteQuestion(id: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/${id}`, { observe: 'response', responseType: 'text' });
    }

    async uploadQuestionImage(uuid: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        await firstValueFrom(this.http.put(`${this.baseUrl}/${IMAGES_ENDPOINT}/${uuid}`, formData));
    }

    async deleteQuestionImage(uuid: string) {
        await firstValueFrom(this.http.delete(`${this.baseUrl}/${IMAGES_ENDPOINT}/${uuid}`));
    }
}
