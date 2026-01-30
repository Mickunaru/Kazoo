import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { MainAppComponent } from './main-app.component';

describe('MainAppComponent', () => {
    let component: MainAppComponent;
    let fixture: ComponentFixture<MainAppComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppRoutingModule],
            declarations: [MainAppComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(MainAppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
