import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserConfigService } from '@app/account/services/user-config/user-config.service';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { ShopService } from '@app/shop/services/shop/shop.service';
import { AccountPageComponent } from './account-page.component';

describe('AccountPageComponent', () => {
    let component: AccountPageComponent;
    let fixture: ComponentFixture<AccountPageComponent>;
    let authServiceSpy: jasmine.SpyObj<UserAuthService>;
    let shopServiceSpy: jasmine.SpyObj<ShopService>;
    let userConfigServiceSpy: jasmine.SpyObj<UserConfigService>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('UserAuthService', [], { curUser: { username: 'John Doe' } });
        shopServiceSpy = jasmine.createSpyObj('ShopService', [], { ownedAvatars: [] });
        userConfigServiceSpy = jasmine.createSpyObj('UserConfigService', ['changeAvatar'], {});

        TestBed.configureTestingModule({
            declarations: [AccountPageComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: UserAuthService, useValue: authServiceSpy },
                { provide: ShopService, useValue: shopServiceSpy },
                { provide: UserConfigService, useValue: userConfigServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(AccountPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
