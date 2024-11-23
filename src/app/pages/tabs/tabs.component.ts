import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonContent,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { home, people, scan, busOutline, cubeOutline } from 'ionicons/icons';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true,
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    RouterLink,
    RouterLinkActive,
    IonRouterOutlet,
    IonContent,
    TranslateModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class TabsComponent implements OnInit {
  constructor(private appConfig: AppConfigService) {
    addIcons({ home, scan, people, busOutline, cubeOutline });
    this.registerIcons();
  }
  private registerIcons() {
    this.appConfig.addIcons(
      ['house-door-fill', 'box-fill', 'bus-front'],
      `/assets/bootstrap-icons`
    );
  }
  ngOnInit() {}
}
