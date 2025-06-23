import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Charger la préférence sauvegardée
    const saved = localStorage.getItem('darkMode');
    const isDark =
      saved === 'true' ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.setDarkMode(isDark);
  }

  get isDarkMode() {
    return this.darkMode$.asObservable();
  }

  setDarkMode(isDark: boolean) {
    this.darkMode$.next(isDark);
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark.toString());
  }
}
