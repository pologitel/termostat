import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { createCustomElement } from '@angular/elements';

// material module
import { MaterialModule } from './modules/material/material.module';


// services
import { ApiBackService } from '@services/index';

import { AppComponent } from './app.component';
import { MainComponent } from './common/main/main.component';
import { SettingsDialogComponent } from './dialogs/settings-dialog/settings-dialog.component';
import { environment } from '../environments/environment';
import { IndicatorComponent } from './dialogs/settings-dialog/components/indicator/indicator.component';
import { ChangeModePanelComponent } from './dialogs/settings-dialog/components/change-mode-panel/change-mode-panel.component';
import { IndicatorNumberPanelComponent } from './dialogs/settings-dialog/components/indicator-number-panel/indicator-number-panel.component';
import { IndicatorRangerComponent } from './dialogs/settings-dialog/components/indicator-ranger/indicator-ranger.component';
import { IndicatorArcComponent } from './dialogs/settings-dialog/components/indicator-arc/indicator-arc.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    SettingsDialogComponent,
    IndicatorComponent,
    ChangeModePanelComponent,
    IndicatorNumberPanelComponent,
    IndicatorRangerComponent,
    IndicatorArcComponent
  ],
  imports: [
    FormsModule,
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule
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
        customElements.define('thermostat-main', termostatPlugin);
    }
  }
}
