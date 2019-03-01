import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'termostat-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {
  private _tempData;

  constructor(
      @Inject(MAT_DIALOG_DATA) public data,
      private dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit(): void {
    this._tempData = this.data;
  }

  updateTemperature({ property, value }): void {
    this.data[property] = value;
  }

  onCloseModal(status: string): void {
    this.dialogRef.close({
      status,
      data: this.data
    });
  }
}
