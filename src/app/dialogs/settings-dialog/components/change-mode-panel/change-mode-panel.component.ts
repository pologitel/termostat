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
  @Input() mode: string = 'cool';

  constructor() { }

  ngOnInit(): void {}

  onChangeMode(modeName: string): void {
    this.changeMode.emit(modeName);
  }

}
