import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [IonicModule, HeaderComponent, FooterComponent],
  template: `
    <div
      class="rounded-lg shadow-md 
      bg-white dark:bg-[#121212] 
      max-w-[1110px] mx-auto w-full
       text-gray-800 dark:text-white"
    >
      <app-header></app-header>
      <div>
        <ng-content></ng-content>
      </div>
      <app-footer></app-footer>
    </div>
  `,
})
export class LayoutComponent {}
