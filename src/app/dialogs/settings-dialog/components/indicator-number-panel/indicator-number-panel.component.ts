import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'termostat-indicator-number-panel',
  templateUrl: './indicator-number-panel.component.html',
  styleUrls: ['./indicator-number-panel.component.scss']
})
export class IndicatorNumberPanelComponent implements OnInit {
  @Input() topBorder: number;
  @Input() bottomBorder: number;

  constructor() { }

  ngOnInit(): void {}

}
