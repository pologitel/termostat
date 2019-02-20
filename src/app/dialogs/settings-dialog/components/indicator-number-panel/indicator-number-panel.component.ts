import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'termostat-indicator-number-panel',
  templateUrl: './indicator-number-panel.component.html',
  styleUrls: ['./indicator-number-panel.component.scss']
})
export class IndicatorNumberPanelComponent implements OnInit {
  @Output() changeTemperature: EventEmitter<any> = new EventEmitter<any>();

  @Input() hotTemperature: number;
  @Input() coolTemperature: number;
  @Input() maxGraduce: number;

  constructor() { }

  ngOnInit(): void {}

  onChanged(model: NgModel) {
    if (model.value > this.maxGraduce) model.reset(this.maxGraduce);
    this.changeTemperature.emit({
      name: model.name,
      value: model.value
    });
  }

  onBlur(model: NgModel): void {
      if (!model.value) model.reset(0);
  }

  onlyPositiveNumber(event, model: NgModel): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
