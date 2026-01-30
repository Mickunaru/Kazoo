import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY_GAME_OBJECT } from '@app/admin/admin.const';
import { CreateGameDto } from '@app/admin/interfaces/create-game-dto';
import { HideGameDto } from '@app/admin/interfaces/hide-game-dto';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { GAME_LIBRARY_ENDPOINT, GAME_VISIBILITY_ENDPOINT, IMAGES_ENDPOINT, PUBLIC_GAMES_ENDPOINT } from '@common/constants/endpoint-constants';
import { Game } from '@common/interfaces/game';
import { GameVisibilityDto } from '@common/interfaces/game-visibility-dto';
import { BehaviorSubject, firstValueFrom, map, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameLibraryService {
    games: Game[] = [];
    selectedGame = new BehaviorSubject<Game>(EMPTY_GAME_OBJECT);
    isClicked: boolean = false;
    private readonly baseUrl = `${SERVER_URL_API}/${GAME_LIBRARY_ENDPOINT}`;

    constructor(private readonly http: HttpClient) {}

    titleExists(title: string): boolean {
        return this.games.some((game) => game.title === title);
    }

    async updateGamesList(): Promise<void> {
        return firstValueFrom(
            this.http.get<Game[]>(this.baseUrl).pipe(
                map((games) => {
                    this.games = games.map((game) => ({ ...game, lastModification: new Date(game.lastModification) }));
                }),
            ),
        );
    }

    updatePublicGames(): Observable<Game[]> {
        return this.http.get<Game[]>(`${this.baseUrl}/${PUBLIC_GAMES_ENDPOINT}`);
    }

    async getGameVisibility(id: string): Promise<GameVisibilityDto> {
        return firstValueFrom(this.http.get<GameVisibilityDto>(`${this.baseUrl}/${GAME_VISIBILITY_ENDPOINT}/${id}`));
    }

    async createGame(gameData: CreateGameDto): Promise<Game> {
        return firstValueFrom(this.http.post<Game>(this.baseUrl, gameData));
    }

    async updateGame(id: string, gameData: CreateGameDto): Promise<Game> {
        return firstValueFrom(this.http.put<Game>(`${this.baseUrl}/${id}`, gameData));
    }

    async deleteGame(id: string): Promise<Game> {
        return firstValueFrom(this.http.delete<Game>(`${this.baseUrl}/${id}`));
    }

    async hideGame(id: string, hideGameDto: HideGameDto): Promise<Game> {
        return firstValueFrom(this.http.patch<Game>(`${this.baseUrl}/${id}`, hideGameDto));
    }

    async uploadQuestionImage(uuid: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        await firstValueFrom(this.http.put(`${this.baseUrl}/${IMAGES_ENDPOINT}/${uuid}`, formData));
    }

    async deleteQuestionImage(uuid: string) {
        await firstValueFrom(this.http.delete(`${this.baseUrl}/${IMAGES_ENDPOINT}/${uuid}`));
    }

    resetState() {
        this.selectedGame.next(EMPTY_GAME_OBJECT);
        this.isClicked = false;
    }
}
