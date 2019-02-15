import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

// material module
import { MaterialModule } from './modules/material/material.module';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './common/main/main.component';
import { SettingsDialogComponent } from './dialogs/settings-dialog/settings-dialog.component';
import { environment } from '../environments/environment';
import { ApiBackService } from './services/index';
import { IndicatorComponent } from './dialogs/settings-dialog/components/indicator/indicator.component';
import { ChangeModePanelComponent } from './dialogs/settings-dialog/components/change-mode-panel/change-mode-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    SettingsDialogComponent,
    IndicatorComponent,
    ChangeModePanelComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [
    ApiBackService
  ],
  entryComponents: [MainComponent, SettingsDialogComponent],
  bootstrap: !environment.production ? [AppComponent] : []
})
export class AppModule {
  constructor(private injector: Injector) {}

  ngDoBootstrap(): void {
    if (environment.production) {
        const termostatPlugin = createCustomElement(MainComponent, { injector: this.injector });
        customElements.define('termostat-main', termostatPlugin);
    }
  }
}
