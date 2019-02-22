import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';

import { defaultIntervalBetweenRangers } from '../../../../shared/common';

@Component({
  selector: 'termostat-indicator',
  templateUrl: './indicator.component.html',
  styleUrls: ['./indicator.component.scss']
})
export class IndicatorComponent implements OnInit, AfterViewInit {
  public step: number;
  public maxBorderInRotateDeg: number;
  public minBorderInRotateDeg: number;
  public maxGraduceInNumber: number;
  public bordersForCoolTemperature: number[];
  public bordersForHotTemperature: number[];
  public defaultBackground: string = 'cool';

  @ViewChild('indicator', { read: ElementRef }) indicator: ElementRef<HTMLElement>;

  @Input() coolTemperature: number;
  @Input() hotTemperature: number;
  @Input() mode: string;
  @Input() totalElements: number;
  get totalElementsArr(): any[] {
    return new Array(this.totalElements);
  }

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.step = 360 / this.totalElements;
    }, 0);
  }

  ngAfterViewInit(): void {
    this.positionLines();
  }

  positionLines(): void {
    const indicatorW = this.indicator.nativeElement.clientWidth / 2;
    const indicatorH = this.indicator.nativeElement.clientHeight / 2;

    const totalElements = this.totalElements;

    const radius = indicatorW / 1.2;
    const stepAngle = (2 * Math.PI) / totalElements;
    const stepRotate: number = 360 / totalElements;

    let item: number = 0;

    let angle: number = Math.round(totalElements / 8 + totalElements / 4) * stepAngle;
    let currentRotate: number = Math.round( totalElements / 8 + totalElements / 4) * stepRotate;

    const lineW = 28;
    const lineH = 1;

    while (item < totalElements) {
      const currentEl: any = document.getElementsByClassName(`indicator-line-${item}`)[0];
      const leftPos = Math.round(indicatorW + radius * Math.cos(angle) - lineW/2);
      const topPos = Math.round(indicatorH + radius * Math.sin(angle) - lineH/2);

      if (currentRotate >= 360) currentRotate -= 360;
      currentRotate = +currentRotate.toFixed(2);

      if (item > Math.round(totalElements * 3/4)) {
        currentEl.parentNode.removeChild(currentEl);
      } else {
        currentEl.style.opacity = 1;
        currentEl.style.width = `${lineW}px`;
        currentEl.style.height = `${lineH}px`;
        currentEl.style.left = `${leftPos}px`;
        currentEl.style.top = `${topPos}px`;
        currentEl.style.transform = `rotate(${currentRotate}deg)`;
        currentEl.setAttribute('data-rotate-deg', currentRotate);
        currentEl.setAttribute('data-number', item);
      }

      angle += stepAngle;
      currentRotate += stepRotate;
      ++item;
    }

    this._updateInfoForRanger(Math.round(totalElements * 3/4), 0);
  }

  updateGraduce(model): void {
    this[model.name] = model.value;
  }
  
  updateGraduceInNumber({ indicatorProperty, rotateInDeg }): void {
    let rotate = Number(rotateInDeg);

    if (rotate < this.minBorderInRotateDeg) rotate += 360;

    this[indicatorProperty] = Math.round((rotate - this.minBorderInRotateDeg) / this.step);
  }

  updateBorders({ bordersProperty, currentBorders }): void {
    this[bordersProperty] = currentBorders;
  }

  updateBackground(bg: string): void {
    if (bg === 'default') {
      this.defaultBackground = 'cool';
      return;
    }

    this.defaultBackground = bg;
  }

  private _updateInfoForRanger(topNumberPosition: number, bottomNumberPosition: number): void {
    const topElement: HTMLElement = document.querySelector(`.indicator-line-${topNumberPosition}`);
    const bottomElement: HTMLElement = document.querySelector(`.indicator-line-${bottomNumberPosition}`);

    setTimeout(() => {
      this.maxBorderInRotateDeg = Number(topElement.dataset.rotateDeg);
      this.minBorderInRotateDeg = Number(bottomElement.dataset.rotateDeg);
      this.maxGraduceInNumber = Number(topNumberPosition);

      this.bordersForCoolTemperature = [
          this.hotTemperature - defaultIntervalBetweenRangers,
          this.hotTemperature + defaultIntervalBetweenRangers
      ];
      this.bordersForHotTemperature = [
          this.coolTemperature - defaultIntervalBetweenRangers,
          this.coolTemperature + defaultIntervalBetweenRangers
      ];
    }, 0);
  }

}
