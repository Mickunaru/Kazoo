import { Component } from '@angular/core';
import { PrizeService } from '@app/game/services/prize/prize.service';
import { TeamService } from '@app/game/services/team/team.service';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent {
    constructor(
        readonly prizeService: PrizeService,
        readonly teamService: TeamService,
    ) {}
}
