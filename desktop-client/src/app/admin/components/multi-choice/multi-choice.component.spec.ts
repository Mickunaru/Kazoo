import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MultiChoiceForm } from '@app/admin/interfaces/multi-choice-form';
import { AppMaterialModule } from '@app/modules/material.module';
import { MultiChoiceComponent } from './multi-choice.component';

describe('MultiChoiceComponent', () => {
    let component: MultiChoiceComponent;
    let fixture: ComponentFixture<MultiChoiceComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MultiChoiceComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule],
        });
        fixture = TestBed.createComponent(MultiChoiceComponent);
        component = fixture.componentInstance;
        const formBuilder: FormBuilder = new FormBuilder();
        component.form = formBuilder.group({
            text: formBuilder.control<string | null>('', Validators.required),
            isCorrect: formBuilder.control<boolean | null>(false),
        }) as FormGroup<MultiChoiceForm>;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit a remove event', () => {
        const removeSpy = spyOn(component.remove, 'emit');
        component.removeMultiChoice();
        expect(removeSpy).toHaveBeenCalled();
    });
});
