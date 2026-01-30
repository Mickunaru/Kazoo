import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MultiChoiceForm } from '@app/admin/interfaces/multi-choice-form';

@Component({
    selector: 'app-multi-choice',
    templateUrl: './multi-choice.component.html',
    styleUrls: ['./multi-choice.component.scss'],
})
export class MultiChoiceComponent {
    @Input() form: FormGroup<MultiChoiceForm>;
    @Input() index: number;
    @Output() remove = new EventEmitter<number>();

    removeMultiChoice() {
        this.remove.emit(this.index);
    }
}
