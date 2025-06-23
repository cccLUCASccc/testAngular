import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  isDarkMode = false;
  currentYear = new Date().getFullYear();
 
  constructor(private translate: TranslateService) {
    // Récupérer la langue sauvegardée ou celle du navigateur
    const savedLang = localStorage.getItem('lang');
    const browserLang = translate.getBrowserLang();

    translate.setDefaultLang('fr');
    translate.use(
      savedLang ?? (browserLang?.match(/en|fr/) ? browserLang : 'fr')
    );

    // Récupérer le choix dans localStorage pour persister le mode sombre
    const savedDark = localStorage.getItem('darkMode');
    this.isDarkMode = savedDark === 'true'; // Correction ici (true au lieu de false)
    this.updateDarkMode();
  }

  setLanguage(lang: string) {
    console.log(`Langue sélectionnée : ${lang}`);
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  private updateDarkMode() {
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.updateDarkMode();
  }
}
