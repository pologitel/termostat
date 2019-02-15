import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SettingsDialogComponent } from '../../dialogs/settings-dialog/settings-dialog.component';
import { DefaultWidthModal } from '../../shared/common';

type TMode = 'advanced' | 'simple';

@Component({
  selector: 'termostat-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class MainComponent implements OnInit {

  constructor(
      private matDialog: MatDialog
  ) { }

  ngOnInit(): void {}

  openDialogSettings(): void {
    const widthModal = window.innerWidth < DefaultWidthModal ? '80%' : `${DefaultWidthModal}px`;

    const openDialogSettings = this.matDialog.open(SettingsDialogComponent, {
      panelClass: 'settings-termostat',
      width: widthModal,
      data: {
        mode: 'simple'
      }
    });

    openDialogSettings.afterClosed().subscribe((resultAfterClose) => {
      console.log(resultAfterClose);
    });
  }
}
