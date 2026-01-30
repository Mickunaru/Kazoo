import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameListComponent } from './components/game-list/game-list.component';
import { GameStarterComponent } from './components/game-starter/game-starter.component';
import { JoinGameComponent } from './components/join-game/join-game.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { StartNewGamePageComponent } from './pages/start-new-game-page/start-new-game-page.component';

@NgModule({
    declarations: [GameListComponent, JoinGameComponent, GameStarterComponent, HomePageComponent, StartNewGamePageComponent],
    imports: [AppMaterialModule, CommonModule, FormsModule, RouterModule],
    exports: [HomePageComponent, StartNewGamePageComponent],
})
export class HomeModule {}
