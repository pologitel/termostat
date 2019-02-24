import { Component, Input, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { defaultBackgroundIndicator } from '../../../../shared/common';

@Component({
  selector: 'termostat-indicator-arc',
  template: `
    <canvas
            #arc
            class="position-absolute indicator-arc" 
            [width]="diametr"
            [height]="diametr">
    </canvas>
  `,
  styleUrls: ['./indicator-arc.component.scss']
})
export class IndicatorArcComponent implements AfterViewInit, OnChanges {
  @ViewChild('arc', { read: ElementRef }) arcElement: ElementRef;

  @Input() totalElements: number;
  @Input() lineColor: string = defaultBackgroundIndicator;
  @Input() diametr: number;

  constructor() {}

  ngAfterViewInit(): void {
    this._drawArc();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.lineColor && !changes.lineColor.firstChange) {
      this._drawArc();
    }
  }

  private _drawArc(): void {
    const arcEl: HTMLCanvasElement = this.arcElement.nativeElement;
    const radius = arcEl.getBoundingClientRect().width/2;
    const cntxArcEl = arcEl.getContext('2d');
    const step = (2 * Math.PI)/ this.totalElements;
    const startAngle = Number(((this.totalElements / 8 + this.totalElements / 4) * step).toFixed(2));
    const endEngle = Number(((this.totalElements / 8) * step).toFixed(2));

    cntxArcEl.clearRect(0, 0, this.diametr, this.diametr);
    cntxArcEl.beginPath();
    cntxArcEl.arc(radius, radius, radius, startAngle, endEngle, false);
    cntxArcEl.strokeStyle = this.lineColor;
    cntxArcEl.lineWidth = 1;
    cntxArcEl.stroke();
    cntxArcEl.closePath();
  }

}
