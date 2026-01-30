import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@app/account/services/notification/notification.service';
import { NotificationBoxComponent } from './notification-box.component';

describe('NotificationBoxComponent', () => {
    let component: NotificationBoxComponent;
    let fixture: ComponentFixture<NotificationBoxComponent>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
    beforeEach(() => {
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['respondToFriendRequest', 'notificationList', 'toggleShow']);

        TestBed.configureTestingModule({
            declarations: [NotificationBoxComponent],
            providers: [{ provide: NotificationService, useValue: notificationServiceSpy }],
            imports: [HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(NotificationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
