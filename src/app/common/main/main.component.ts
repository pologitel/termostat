import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import { SettingsDialogComponent } from '../../dialogs/settings-dialog/settings-dialog.component';
import { DefaultWidthModal } from '../../shared/common';
import { SvgIcons } from '../../shared/mat-icons';

type TMode = 'advanced' | 'simple';

@Component({
  selector: 'termostat-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class MainComponent implements OnInit {

  constructor(
      private matDialog: MatDialog,
      private sanitizer: DomSanitizer,
      private iconReg: MatIconRegistry,
  ) { }

  ngOnInit(): void {
    this.registerMatIcons();
  }

  openDialogSettings(): void {
    const widthModal = window.innerWidth < DefaultWidthModal ? '80%' : `${DefaultWidthModal}px`;

    const openDialogSettings = this.matDialog.open(SettingsDialogComponent, {
      panelClass: 'settings-termostat',
      width: widthModal,
      height: '100vh',
      autoFocus: false,
      data: {
        mode: 'simple',
        title: 'Thermostat - Settings',
        coldTemperature: 12,
        hotTemperature: 34,
      }
    });

    openDialogSettings.afterClosed().subscribe((resultAfterClose) => {
      console.log(resultAfterClose);
    });
  }

  private registerMatIcons(): void {
    SvgIcons.forEach((icon: {name: string, path: string}) => {
      this.iconReg.addSvgIcon(icon.name, this.sanitizer.bypassSecurityTrustResourceUrl(icon.path));
    });
  }
}
