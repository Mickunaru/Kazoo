import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { GAME_AVAILABILITY_ENDPOINT, RANDOM_GAME_ENDPOINT } from '@common/constants/endpoint-constants';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RandomGameService {
    private readonly baseUrl = `${SERVER_URL_API}/${RANDOM_GAME_ENDPOINT}`;

    constructor(private readonly http: HttpClient) {}

    hasEnoughQuestionForRandomGame(questionCountNeeded: number): Observable<boolean> {
        const options = { params: new HttpParams().set('count', questionCountNeeded) };
        return this.http.get<boolean>(`${this.baseUrl}/${GAME_AVAILABILITY_ENDPOINT}`, options);
    }
}
