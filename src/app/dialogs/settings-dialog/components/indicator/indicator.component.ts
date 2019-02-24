import {
    Component,
    OnInit,
    AfterViewInit,
    OnDestroy,
    Input,
    ViewChild,
    ViewChildren,
    ElementRef, QueryList
} from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

import { defaultIntervalBetweenRangers } from '../../../../shared/common';
import { IndicatorRangerComponent } from '../indicator-ranger/indicator-ranger.component';
import { IndicatorNumberPanelComponent } from '../indicator-number-panel/indicator-number-panel.component';

interface IBorders {
    deg: number[];
    num: number[];
}

@Component({
  selector: 'termostat-indicator',
  templateUrl: './indicator.component.html',
  styleUrls: ['./indicator.component.scss']
})
export class IndicatorComponent implements OnInit, AfterViewInit, OnDestroy {
  private _subscriptions: Subscription[] = [];
  public step: number;
  public minBorderInRotateDeg: number;
  public bordersForColdTemperature: IBorders = {deg: [], num: []};
  public bordersForHotTemperature: IBorders = {deg: [], num: []};
  public defaultBackground: string = 'cool';

  @ViewChildren(IndicatorRangerComponent) listRangers: QueryList<IndicatorRangerComponent>;
  @ViewChild(IndicatorNumberPanelComponent) indicatorInputs: IndicatorNumberPanelComponent;
  @ViewChild('indicator', { read: ElementRef }) indicator: ElementRef<HTMLElement>;

  @Input() coldTemperature: number;
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

    this.listRangers.forEach((ranger: IndicatorRangerComponent): void => {
      this._subscriptions.push(
        ranger.updateBorders.subscribe(({ currentGraduceInDeg, currentGraduceInNumber }) => {
          const prevRanger: IndicatorRangerComponent = this.listRangers.find((ranger: IndicatorRangerComponent) => {
            return ranger.transformNumberToDeg(ranger.currentGraduceInNumber) < currentGraduceInDeg;
          });
          const nextRanger: IndicatorRangerComponent = this.listRangers.find((ranger: IndicatorRangerComponent) => {
            return ranger.transformNumberToDeg(ranger.currentGraduceInNumber) > currentGraduceInDeg;
          });

          if (prevRanger) {
            prevRanger.borders[1] = currentGraduceInDeg - defaultIntervalBetweenRangers * this.step;
            this.indicatorInputs.bordersForColdTemperature[1] = currentGraduceInNumber - defaultIntervalBetweenRangers;
          }

          if (nextRanger) {
            nextRanger.borders[0] = currentGraduceInDeg + defaultIntervalBetweenRangers * this.step;
            this.indicatorInputs.bordersForHotTemperature[0] = currentGraduceInNumber + defaultIntervalBetweenRangers;
          }
        })
      );
    });
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
        currentEl.setAttribute('data-rotate-deg', currentRotate.toString());
        currentEl.setAttribute('data-number', item);
      }

      angle += stepAngle;
      currentRotate += stepRotate;
      ++item;
    }

    this._subscriptions.push(
      this._updateBordersForRanger(0, this.hotTemperature - defaultIntervalBetweenRangers)
          .subscribe(({ startRotateInDeg, borders }) => {
            this.minBorderInRotateDeg = startRotateInDeg;
            this.bordersForColdTemperature = borders;
          })
    );

    this._subscriptions.push(
      this._updateBordersForRanger(this.coldTemperature + defaultIntervalBetweenRangers, Math.round(totalElements * 3/4))
          .subscribe(({ startRotateInDeg, borders }) => {
            this.minBorderInRotateDeg = startRotateInDeg;
            this.bordersForHotTemperature = borders;
          })
    );
  }

  updateGraduce(model): void {
    this[model.name] = model.value;
  }
  
  updateGraduceInNumber({ indicatorProperty, rotateInDeg }): void {
    this[indicatorProperty] = Math.round((rotateInDeg - this.minBorderInRotateDeg) / this.step);
  }

  updateBackground(bg: string): void {
    if (bg === 'default') {
      this.defaultBackground = 'cool';
      return;
    }

    this.defaultBackground = bg;
  }

  private _updateBordersForRanger(bottom, top): Observable<any> {
    const startBorderEl: HTMLElement = document.querySelector(`.indicator-line-0`);

    const topBorderEl: HTMLElement = document.querySelector(`.indicator-line-${top}`);
    const bottomBorderEl: HTMLElement = document.querySelector(`.indicator-line-${bottom}`);

    const startBorderInDeg: number = Number(startBorderEl.dataset.rotateDeg);
    let topBoderInDeg: number = Number(topBorderEl.dataset.rotateDeg);
    let bottomBoderInDeg: number = Number(bottomBorderEl.dataset.rotateDeg);

    return of({
        borders: {
            deg: [bottomBoderInDeg, topBoderInDeg],
            num: [bottom, top]
        },
        startRotateInDeg: startBorderInDeg
    }).pipe(delay(10));
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription: Subscription): void => {
      subscription.unsubscribe();
    });
  }
}
