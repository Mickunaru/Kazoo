import { Component, OnDestroy, OnInit } from '@angular/core';
import { HomeLobbyService } from '@app/home/services/home-lobby/home-lobby.service';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit, OnDestroy {
    constructor(private readonly homeLobbyService: HomeLobbyService) {}

    ngOnInit(): void {
        this.homeLobbyService.joinHomeLobby();
    }

    ngOnDestroy(): void {
        this.homeLobbyService.leaveHomeLobby();
    }
}
