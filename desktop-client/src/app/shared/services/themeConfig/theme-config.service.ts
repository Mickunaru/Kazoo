import { Injectable } from '@angular/core';
import { ChangeThemeNotifierService } from '@app/chat/services/change-theme-notifier/change-theme-notifier.service';
import { JokerTheme, LightTheme, shamrockTheme, Theme } from './themes';

export const DEFAULT_THEME_NAME = 'Thème Kazoo!';
export const DARK_THEME_NAME = 'Thème joker';
export const SHAMROCK_THEME_NAME = 'Thème irlandais';

export const MATERIAL_DEFAULT_THEME = 'light-theme';
export const MATERIAL_JOKER_THEME = 'joker-theme';
export const MATERIAL_SHAMROCK_THEME = 'shamrock-theme';

@Injectable({
    providedIn: 'root',
})
export class ThemeConfigService {
    constructor(private readonly changeThemeNotifier: ChangeThemeNotifierService) {}
    testConfigChange(): void {
        const isDarkTheme = document.body.classList.contains(MATERIAL_JOKER_THEME);
        const isshamrockTheme = document.body.classList.contains(SHAMROCK_THEME_NAME);

        if (isDarkTheme) {
            this.changeAppTheme('');
        } else if (isshamrockTheme) {
            this.changeAppTheme(DARK_THEME_NAME);
        } else {
            this.changeAppTheme(SHAMROCK_THEME_NAME);
        }
    }

    changeAppTheme(themeName: string): void {
        switch (themeName) {
            case DARK_THEME_NAME:
                this.applyNonMaterialTheme(JokerTheme);
                this.applyMaterialTheme(MATERIAL_JOKER_THEME);
                break;
            case SHAMROCK_THEME_NAME:
                this.applyNonMaterialTheme(shamrockTheme);
                this.applyMaterialTheme(MATERIAL_SHAMROCK_THEME);
                break;
            default:
                this.applyNonMaterialTheme(LightTheme);
                this.applyMaterialTheme(MATERIAL_DEFAULT_THEME);
        }
        this.changeThemeNotifier.themeChangeObservable.next(themeName);
    }

    private applyMaterialTheme(theme: string): void {
        document.body.classList.remove(MATERIAL_DEFAULT_THEME, MATERIAL_JOKER_THEME, MATERIAL_SHAMROCK_THEME);

        document.body.classList.add(theme);
    }

    private applyNonMaterialTheme(theme: Theme): void {
        const root = document.documentElement;
        // Remove all existing theme classes
        // Update global theme variables
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--primary-contrast-color', theme.primaryContrast);
        root.style.setProperty('--primary-light-color', theme.primaryLight);
        root.style.setProperty('--almost-primary-color', theme.almostPrimary);

        root.style.setProperty('--accent-color', theme.accent);
        root.style.setProperty('--accent-contrast-color', theme.accentContrast);
        root.style.setProperty('--accent-light-color', theme.accentLight);
        root.style.setProperty('--almost-accent-color', theme.almostAccent);

        root.style.setProperty('--warn-color', theme.warn);
    }
}
