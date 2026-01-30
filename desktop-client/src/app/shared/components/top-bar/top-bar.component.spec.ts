import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendService } from '@app/account/services/friend/friend.service';
import { NotificationService } from '@app/account/services/notification/notification.service';
import { AppMaterialModule } from '@app/modules/material.module';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { TopBarComponent } from './top-bar.component';

describe('TopBarComponent', () => {
    let component: TopBarComponent;
    let fixture: ComponentFixture<TopBarComponent>;
    let friendServiceSpy: jasmine.SpyObj<FriendService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
    let userAuthServiceSpy: jasmine.SpyObj<UserAuthService>;

    beforeEach(() => {
        friendServiceSpy = jasmine.createSpyObj('FriendService', ['removeFriendEvent', 'toggleShow']);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['sendFriendRequest']);
        userAuthServiceSpy = jasmine.createSpyObj('UserAuthService', ['signOut']);

        TestBed.configureTestingModule({
            declarations: [TopBarComponent],
            imports: [AppMaterialModule, HttpClientTestingModule],
            providers: [
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: FriendService, useValue: friendServiceSpy },
                { provide: UserAuthService, useValue: userAuthServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TopBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
