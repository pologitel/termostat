import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'termostat-change-mode-panel',
  templateUrl: './change-mode-panel.component.html',
  styleUrls: ['./change-mode-panel.component.scss'],
  host: {
    'class': 'col-4'
  }
})
export class ChangeModePanelComponent implements OnInit {
  @Input() mode: string;

  constructor() { }

  ngOnInit(): void {}

  onChangeMode(modeName: string): void {

  }

}
