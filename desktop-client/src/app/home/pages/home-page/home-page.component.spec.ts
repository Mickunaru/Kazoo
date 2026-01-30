import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms'; // Import the FormsModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomePageComponent } from '@app/home/pages/home-page/home-page.component';
import { HomeLobbyService } from '@app/home/services/home-lobby/home-lobby.service';
import { AppMaterialModule } from '@app/modules/material.module';

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;
    let homeLobbyServiceSpy: jasmine.SpyObj<HomeLobbyService>;
    beforeEach(() => {
        homeLobbyServiceSpy = jasmine.createSpyObj('HomeLobbyService', ['joinHomeLobby', 'leaveHomeLobby']);
        TestBed.configureTestingModule({
            declarations: [HomePageComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule, FormsModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [{ provide: HomeLobbyService, useValue: homeLobbyServiceSpy }],
        });
        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
