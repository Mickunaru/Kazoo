import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountPageComponent } from '@app/account/pages/account-page/account-page.component';
import { AdminPageComponent } from '@app/admin/admin-page/admin-page.component';
import { ChatComponent } from '@app/chat/components/chat.component';
import { PageUrl } from '@app/enum/page-url';
import { GameMasterPageComponent } from '@app/game/pages/game-master-page/game-master-page.component';
import { GamePageComponent } from '@app/game/pages/game-page/game-page.component';
import { ResultsPageComponent } from '@app/game/pages/results-page/results-page.component';
import { WaitingRoomPageComponent } from '@app/game/pages/waiting-room-page/waiting-room-page.component';
import { enterRoomGuard } from '@app/guards/enter-room.guard';
import { leaveRoomGuard } from '@app/guards/leave-room.guard';
import { socketGuard } from '@app/guards/socket.guard';
import { HomePageComponent } from '@app/home/pages/home-page/home-page.component';
import { StartNewGamePageComponent } from '@app/home/pages/start-new-game-page/start-new-game-page.component';
import { AuthPageComponent } from '@app/pages/auth-page/auth-page.component';
import { MainAppComponent } from '@app/pages/main-app/main-app.component';
import { LoginPageComponent } from '@app/session/pages/login-page/login-page.component';
import { ShopPageComponent } from '@app/shop/pages/shop-page/shop-page.component';

const routes: Routes = [
    { path: '', redirectTo: `/${PageUrl.AUTH}`, pathMatch: 'full' },
    { path: PageUrl.CHAT, component: ChatComponent },
    { path: PageUrl.AUTH, component: AuthPageComponent },
    { path: PageUrl.LOGIN, component: LoginPageComponent },
    {
        path: PageUrl.APP_PREFIX,
        component: MainAppComponent,
        canActivate: [socketGuard],
        children: [
            { path: PageUrl.HOME, component: HomePageComponent },
            { path: PageUrl.NEW_GAME, component: StartNewGamePageComponent },
            { path: PageUrl.ADMIN, component: AdminPageComponent },
            {
                path: PageUrl.WAITING_ROOM,
                component: WaitingRoomPageComponent,
                canActivate: [enterRoomGuard],
                canDeactivate: [leaveRoomGuard],
            },
            {
                path: PageUrl.GAME,
                component: GamePageComponent,
                canActivate: [enterRoomGuard],
                canDeactivate: [leaveRoomGuard],
            },
            {
                path: PageUrl.GAME_MASTER,
                component: GameMasterPageComponent,
                canActivate: [enterRoomGuard],
                canDeactivate: [leaveRoomGuard],
            },
            {
                path: PageUrl.RESULTS,
                component: ResultsPageComponent,
                canActivate: [enterRoomGuard],
                canDeactivate: [leaveRoomGuard],
            },
            { path: PageUrl.SHOP, component: ShopPageComponent },
            { path: PageUrl.ACCOUNT, component: AccountPageComponent },
        ],
    },

    { path: '**', redirectTo: `/${PageUrl.AUTH}` },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
