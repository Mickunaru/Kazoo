import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FriendService } from '@app/account/services/friend/friend.service';
import { NotificationService } from '@app/account/services/notification/notification.service';
import { FriendBoxComponent } from './friend-box.component';

describe('FriendBoxComponent', () => {
    let component: FriendBoxComponent;
    let fixture: ComponentFixture<FriendBoxComponent>;
    let friendServiceSpy: jasmine.SpyObj<FriendService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
    beforeEach(() => {
        friendServiceSpy = jasmine.createSpyObj('FriendService', ['removeFriendEvent', 'toggleShow'], {
            friendList: [],
            notFriendList: [],
            pendingList: [],
        });
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['sendFriendRequest']);

        TestBed.configureTestingModule({
            declarations: [FriendBoxComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, MatAutocompleteModule, ReactiveFormsModule],
            providers: [
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: FriendService, useValue: friendServiceSpy },
                MatSnackBar,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(FriendBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
