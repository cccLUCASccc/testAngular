import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang');
    const browserLang = translate.getBrowserLang();
    translate.setDefaultLang('fr');
    translate.use(
      savedLang ?? (browserLang?.match(/en|fr/) ? browserLang : 'fr')
    );
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  get currentLang(): string {
    return this.translate.currentLang;
  }
}
