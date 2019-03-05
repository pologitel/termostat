import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'termostat-indicator-number-panel',
  templateUrl: './indicator-number-panel.component.html',
  styleUrls: ['./indicator-number-panel.component.scss']
})
export class IndicatorNumberPanelComponent implements OnInit {
  @Output() changeTemperature: EventEmitter<any> = new EventEmitter<any>();

  @Input() readonly calendarMode: string;
  @Input() hotTemperature: number;
  @Input() coldTemperature: number;
  @Input() bordersForColdTemperature: number[];
  @Input() bordersForHotTemperature: number[];

  constructor() { }

  ngOnInit(): void {}

  onChanged(model: NgModel, borderValue: string, borderName: string) {
    if (model.value < this[model.name][0]) {
        model.reset(this[model.name][0]);
        return;
    }

    if (model.value > this[model.name][1]) {
        model.reset(this[model.name][1]);
        return;
    }

    this.changeTemperature.emit({
      borderName,
      borderValue,
      model
    });
  }

  onBlur(model: NgModel): void {
    if (!model.value) model.reset(0);
  }

  onlyPositiveNumber(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
