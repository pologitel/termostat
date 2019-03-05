import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'termostat-change-mode-panel',
  templateUrl: './change-mode-panel.component.html',
  styleUrls: ['./change-mode-panel.component.scss'],
  host: {
    'class': 'col-4'
  }
})
export class ChangeModePanelComponent implements OnInit {
  @Output() changeMode: EventEmitter<string> = new EventEmitter<string>();

  @Input() type: string;
  @Input() readonly calendarMode: string;

  constructor() { }

  ngOnInit(): void {}

  onChangeMode(modeName: string): void {
    if (this.calendarMode === 'simple') return;
    this.changeMode.emit(modeName);
  }

}
