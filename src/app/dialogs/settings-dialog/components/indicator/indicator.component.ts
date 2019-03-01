import {
    Component,
    OnInit,
    AfterViewInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ViewChildren,
    ElementRef, QueryList
} from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

import { defaultBackgroundIndicator, defaultIntervalBetweenRangers } from '../../../../shared/common';
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
  @Output() changeTemperature: EventEmitter<any> = new EventEmitter<any>();

  private _subscriptions: Subscription[] = [];

  public step: number;
  public minBorderInRotateDeg: number;
  public bordersForColdTemperature: IBorders = {deg: [], num: []};
  public bordersForHotTemperature: IBorders = {deg: [], num: []};
  public colorIndicator: string = defaultBackgroundIndicator;
  public arcDiametr: number;

  @ViewChildren(IndicatorRangerComponent) listRangers: QueryList<IndicatorRangerComponent>;
  @ViewChild(IndicatorNumberPanelComponent) indicatorInputs: IndicatorNumberPanelComponent;
  @ViewChild('indicator', { read: ElementRef }) indicator: ElementRef<HTMLElement>;

  @Input() coldTemperature: number;
  @Input() hotTemperature: number;
  @Input() mode: string;
  @Input() totalElements: number;
  @Input() defaultIntervalBetweenRangers: number = defaultIntervalBetweenRangers;
  get totalElementsArr(): any[] {
    return new Array(this.totalElements);
  }

  constructor() { }

  ngOnInit(): void {
    this.arcDiametr = this.indicator.nativeElement.getBoundingClientRect().width + 10;

    this._subscriptions.push(
      of(360 / this.totalElements).pipe(delay(10)).subscribe((result: number) => {
        this.step = result;
      })
    );
  }

  ngAfterViewInit(): void {
    this.positionLines();

    this.listRangers.forEach((ranger: IndicatorRangerComponent): void => {
      this._subscriptions.push(
        // subscribe on change borders`s indicator
        ranger.updateBorders.subscribe(({ currentGraduceInDeg, currentGraduceInNumber }) => {
          const prevRanger: IndicatorRangerComponent = this.listRangers.find((ranger: IndicatorRangerComponent) => {
            return ranger.transformNumberToDeg(ranger.currentGraduceInNumber) < currentGraduceInDeg;
          });
          const nextRanger: IndicatorRangerComponent = this.listRangers.find((ranger: IndicatorRangerComponent) => {
            return ranger.transformNumberToDeg(ranger.currentGraduceInNumber) > currentGraduceInDeg;
          });

          if (prevRanger) {
            prevRanger.borders[1] = currentGraduceInDeg - this.defaultIntervalBetweenRangers * this.step;
            this.indicatorInputs.bordersForColdTemperature[1] = currentGraduceInNumber - this.defaultIntervalBetweenRangers;
          }

          if (nextRanger) {
            nextRanger.borders[0] = currentGraduceInDeg + this.defaultIntervalBetweenRangers * this.step;
            this.indicatorInputs.bordersForHotTemperature[0] = currentGraduceInNumber + this.defaultIntervalBetweenRangers;
          }
        })
      );
    });
  }

  positionLines(): void {
    const indicatorW = this.indicator.nativeElement.getBoundingClientRect().width / 2;
    const indicatorH = this.indicator.nativeElement.getBoundingClientRect().height / 2;

    const totalElements = this.totalElements;

    const radius = indicatorW / 1.2;
    const stepAngle = (2 * Math.PI) / totalElements;
    const stepRotate: number = 360 / totalElements;

    let item: number = 0;

    let startAngle: number = Math.round(totalElements / 8 + totalElements / 4) * stepAngle;
    let startRotate: number = Math.round( totalElements / 8 + totalElements / 4) * stepRotate;

    const lineW = 28;
    const lineH = 1;

    while (item < totalElements) {
      const currentEl: any = document.getElementsByClassName(`indicator-line-${item}`)[0];
      const leftPos = Math.round(indicatorW + radius * Math.cos(startAngle) - lineW/2);
      const topPos = Math.round(indicatorH + radius * Math.sin(startAngle) - lineH/2);

      startRotate = +startRotate.toFixed(2);

      if (item > Math.round(totalElements * 3/4)) {
        currentEl.parentNode.removeChild(currentEl);
      } else {
        currentEl.style.opacity = 1;
        currentEl.style.width = `${lineW}px`;
        currentEl.style.height = `${lineH}px`;
        currentEl.style.left = `${leftPos}px`;
        currentEl.style.top = `${topPos}px`;
        currentEl.style.transform = `rotate(${startRotate}deg)`;
        currentEl.setAttribute('data-rotate-deg', startRotate.toString());
        currentEl.setAttribute('data-number', item);
      }

      startAngle += stepAngle;
      startRotate += stepRotate;
      ++item;
    }

    this._subscriptions.push(
      this._updateBordersForRanger(0, this.hotTemperature - this.defaultIntervalBetweenRangers)
          .subscribe(({ startRotateInDeg, borders }) => {
            this.minBorderInRotateDeg = startRotateInDeg;
            this.bordersForColdTemperature = borders;
          })
    );

    this._subscriptions.push(
      this._updateBordersForRanger(this.coldTemperature + this.defaultIntervalBetweenRangers, Math.round(totalElements * 3/4))
          .subscribe(({ startRotateInDeg, borders }) => {
            this.minBorderInRotateDeg = startRotateInDeg;
            this.bordersForHotTemperature = borders;
          })
    );
  }

  updateGraduceFromNumberPanel({ borderName, borderValue, model }): void {
    if (borderName === 'top') {
        this[borderValue].num[1] = model.value - this.defaultIntervalBetweenRangers;
        this[borderValue].deg[1] = this.minBorderInRotateDeg + (model.value - this.defaultIntervalBetweenRangers) * this.step;
    }

    if (borderName === 'bottom') {
        this[borderValue].num[0] = model.value + this.defaultIntervalBetweenRangers;
        this[borderValue].deg[0] = this.minBorderInRotateDeg + (model.value + this.defaultIntervalBetweenRangers) * this.step;
    }

    this[model.name] = model.value;

    this.changeTemperature.emit({
       property: model.name,
       value: model.value
    });
  }
  
  updateGraduceInNumber({ indicatorProperty, rotateInDeg }): void {
    this[indicatorProperty] = Math.round((rotateInDeg - this.minBorderInRotateDeg) / this.step);

    this.changeTemperature.emit({
       property: indicatorProperty,
       value: this[indicatorProperty]
    });
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
