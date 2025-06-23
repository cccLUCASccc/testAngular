import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ThemeService } from 'src/theme/theme.service';
import { LanguageService } from 'src/app/services/language.service';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TranslateModule, // pipe |translate disponible dans le header
  ],
})
export class HeaderComponent {
  /** État courant du mode sombre, reflété dans le template */
  isDarkMode = false;

  /** Langue courante (utile si tu veux l'afficher ou pré-sélectionner un bouton) */
  currentLang = this.languageService.currentLang;

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService
  ) {
    /* On s'abonne pour que le toggle reflète toujours l'état actuel */
    this.themeService.isDarkMode.subscribe((value) => {
      this.isDarkMode = value;
    });
  }

  /** Inverser le thème clair/sombre */
  toggleDarkMode(): void {
    this.themeService.setDarkMode(!this.isDarkMode);
  }

  /** Changer la langue de l’application */
  setLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
    this.currentLang = lang;
  }
}
