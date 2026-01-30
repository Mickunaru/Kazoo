import { Injectable } from '@angular/core';
import { DEFAULT_THEME_NAME } from '@app/shared/services/themeConfig/theme-config.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChangeThemeNotifierService {
    // this Service exists solely to bypass a circular dependency with chat
    themeChangeObservable: BehaviorSubject<string> = new BehaviorSubject<string>(DEFAULT_THEME_NAME);
}
