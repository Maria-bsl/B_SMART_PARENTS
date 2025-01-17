import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';
import { MatDialog } from '@angular/material/dialog';
import { MessageBoxDialogComponent } from 'src/app/components/dialogs/message-box-dialog/message-box-dialog.component';
import { Location } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmMessageBoxComponent } from 'src/app/components/dialogs/confirm-message-box/confirm-message-box.component';
import { TranslateService } from '@ngx-translate/core';
import {
  endWith,
  firstValueFrom,
  from,
  map,
  of,
  switchMap,
  tap,
  zip,
} from 'rxjs';
import { UnsubscriberService } from '../unsubscriber/unsubscriber.service';
import { AppLauncher } from '@capacitor/app-launcher';
import { isPlatform } from '@ionic/angular/standalone';
import { LoadingService } from '../loading-service/loading.service';
import { Platform } from '@ionic/angular/standalone';

export interface SessionTokens {
  token: string | null | undefined;
  expire_time: string | null | undefined;
  expire_timestamp: string | null | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  loading!: HTMLIonLoadingElement | null;
  constructor(
    private location: Location,
    private dialog: MatDialog,
    private iconRegistry: MatIconRegistry,
    private tr: TranslateService,
    private unsubscribe: UnsubscriberService,
    private sanitizer: DomSanitizer,
    private platform: Platform
  ) {}
  private openMessageBoxDialog(title: string, message: string) {
    return this.dialog.open(MessageBoxDialogComponent, {
      data: {
        title: title,
        message: message,
      },
    });
  }
  getCurrentPath() {
    return this.location.path();
  }
  backButtonEventHandler(callback: () => {}) {
    this.platform.backButton.subscribeWithPriority(0, () => {
      callback();
    });
  }
  openAlertMessageBox(title: string, message: string) {
    let titleObs = this.tr.get(title);
    let messageObs = this.tr.get(message);
    let merged = zip(titleObs, messageObs);
    merged.pipe(this.unsubscribe.takeUntilDestroy).subscribe({
      next: (results) => {
        let [trTitle, trMessage] = results;
        this.openMessageBoxDialog(trTitle, trMessage);
      },
    });
  }
  openConfirmMessageBox(title: string, message: string) {
    const confirm = (msg1: string, msg2: string) => {
      return this.dialog.open(ConfirmMessageBoxComponent, {
        data: {
          title: msg1,
          message: msg2,
        },
      });
    };
    let titleObs = this.tr.get(title);
    let messageObs = this.tr.get(message);
    let merged = zip(titleObs, messageObs);
    return merged.pipe(
      this.unsubscribe.takeUntilDestroy,
      switchMap((data) => {
        let [msg1, msg2] = data;
        return of(confirm(msg1, msg2));
      })
    );
  }
  navigateBack() {
    this.location.back();
  }
  displayErrorOccurredText() {
    let failedMessageObs = 'defaults.failed';
    let errorOccuredMessageObs =
      'loginPage.loginForm.messageBox.errors.errorOccuredText';
    this.openAlertMessageBox(failedMessageObs, errorOccuredMessageObs);
  }
  addIcons(icons: string[], path: string) {
    icons.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${path}/${icon}.svg`)
      );
    });
  }
  getSessionTokens(): SessionTokens {
    return {
      token: localStorage.getItem('token'),
      expire_time: localStorage.getItem('expire_time'),
      expire_timestamp: localStorage.getItem('expire_timestamp'),
    };
  }
  setSessionTokens(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('expire_time', res.expire_time);
    localStorage.setItem('expire_timestamp', new Date().toISOString());
  }
  getCssVariable(variableName: string): string {
    // Access the root element
    const root = document.documentElement;
    // Get the computed style
    const style = getComputedStyle(root);
    // Return the value of the variable
    return style.getPropertyValue(variableName).trim();
  }
  // async startLoading() {
  //   if (this.loading) this.loading = null;
  //   let attributes = new Map();
  //   attributes.set('aria-hidden', false);
  //   this.loading = await this.loadingController.create({
  //     spinner: 'circles',
  //     htmlAttributes: attributes,
  //   });
  //   await this.loading.present();
  //   return this.loading;
  // }
  openExternalLink(link: string) {
    window.open(link, '_blank', 'noopener,noreferrer');
  }
  async launchApp(packageName: string) {
    const { value } = await AppLauncher.canOpenUrl({
      url: packageName,
    });
    if (value) {
      await AppLauncher.openUrl({ url: packageName });
    } else {
      throw Error(`Failed to launch application ${packageName}.`);
    }
  }
  initTranslations() {
    this.tr.use('en');
  }
}
