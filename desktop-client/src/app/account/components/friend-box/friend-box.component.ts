import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FriendService } from '@app/account/services/friend/friend.service';
import { NotificationService } from '@app/account/services/notification/notification.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-friend-box',
    templateUrl: './friend-box.component.html',
    styleUrls: ['./friend-box.component.scss'],
})
export class FriendBoxComponent implements OnInit {
    filteredNotFriendList: Observable<string[]>;
    form: FormGroup;

    // eslint-disable-next-line max-params
    constructor(
        protected readonly notificationService: NotificationService,
        protected readonly friendService: FriendService,
        private readonly snackBar: MatSnackBar,
        private readonly formBuilder: FormBuilder,
    ) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required, this.isElementOfListValidator()]],
        });

        this.filteredNotFriendList = this.form.controls['username'].valueChanges.pipe(
            startWith(''),
            map((value) => this.filter(value)),
        );
    }

    sendFriendRequest() {
        if (this.form.invalid) return;
        const username = this.form.controls['username'].value;
        this.notificationService.sendFriendRequest(username);
        this.friendService.addPendingStatus(username);
        this.snackBar.open(`Une demande d'ami a été envoyée à ${username}`);
        this.form.reset();
    }

    selectedUser(event: MatAutocompleteSelectedEvent) {
        this.form.controls['username'].setValue(event.option.value);
    }

    trackByUsername(index: number, username: string): string {
        return username;
    }

    private filter(value: string): string[] {
        if (!value) return this.friendService.notFriendList;
        const filterValue = value.toLowerCase();
        return this.friendService.notFriendList.filter((user) => user.toLowerCase().includes(filterValue));
    }

    private isElementOfListValidator() {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return { isEmpty: true };
            const value = control.value.toString().trim();
            if (value == null || value === '') return { isEmpty: true };
            if (this.friendService.friendList.includes(value)) return { isFriend: true };
            if (this.friendService.notFriendList.includes(value)) return null;
            if (this.friendService.pendingList.includes(value)) {
                const notificationExists = this.notificationService.notificationList.some(
                    (notif) => notif.senderUsername.trim().toLowerCase() === value,
                );
                if (notificationExists) return { seeNotification: true };
                else return { waitingForAnswer: true };
            }
            return { invalidUsername: true };
        };
    }
}
