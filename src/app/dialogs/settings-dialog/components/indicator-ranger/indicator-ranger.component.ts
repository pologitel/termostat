import {
    Component,
    OnInit,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    Input,
    AfterViewInit,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ViewChild,
    ElementRef,
    Renderer2,
    ChangeDetectorRef
} from '@angular/core';

import * as Shared from '../../../../shared/common';

type TIndicatorProperty = 'coolTemperature' | 'hotTemperature' | string;

interface ICenter {
  x: number;
  y: number;
}

@Component({
  selector: 'termostat-indicator-ranger',
  templateUrl: './indicator-ranger.component.html',
  styleUrls: ['./indicator-ranger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndicatorRangerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private _center: ICenter;
  private _globalHandlerDocMouseMove: Function;
  private _globalHandlerDocMouseUp: Function;
  private _isMoved: boolean = false;
  public isActive: boolean = false;

  @Output() changeRanger: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeBackground: EventEmitter<any> = new EventEmitter<string>();
  @Output() updateBorders: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('ranger', { read: ElementRef }) public ranger: ElementRef<HTMLElement>;

  @Input() readonly calendarMode: Shared.TMode;
  @Input() indicatorProperty: TIndicatorProperty;
  @Input() currentStep: number;
  @Input() startRotateInDeg: number;
  @Input() currentGraduceInNumber: number;
  @Input() readonly circleElement: HTMLElement;
  @Input() borders: number[];
  @Input() colorRanger: string;

  constructor(
      private _renderer: Renderer2,
      private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const rect: ClientRect = this.circleElement.getBoundingClientRect();

    this._center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const ranger: HTMLElement = this.ranger.nativeElement;
      const currentGraduceInDeg = this.transformNumberToDeg(this.currentGraduceInNumber);

      ranger.style.transform = `rotate(${currentGraduceInDeg}deg)`;
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // update ranger when currentGraduceInNumber was changed
    if (changes.currentGraduceInNumber
        && (typeof changes.currentGraduceInNumber.currentValue === 'number')
        && !changes.currentGraduceInNumber.firstChange
        && !this._isMoved
    ) {
      const ranger: HTMLElement = this.ranger.nativeElement;
      const currentValueGraduceInNumber: number = changes.currentGraduceInNumber.currentValue;
      const currentGraduceInDeg = this.transformNumberToDeg(currentValueGraduceInNumber);

      ranger.style.transform = `rotate(${currentGraduceInDeg}deg)`;
    }
  }

  transformNumberToDeg(currentGraguceInNumber: number): number {
    let currentCornerRotate = this.startRotateInDeg + currentGraguceInNumber * this.currentStep;
    return Number(currentCornerRotate.toFixed(2));
  }

  // detect current rotate in deg by math
  private _rotate(x: number, y: number): number {
    const deltaX = x - this._center.x;
    const deltaY = y - this._center.y;

    return Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  }

  private _onMouseMove(event: MouseEvent): void {
    let [minBorder, maxBorder] = this.borders;

    let rotateDeg = this._rotate(event.pageX, event.pageY);
    this.isActive = true;
    this._isMoved = true;

    rotateDeg = (rotateDeg < 0 || rotateDeg < this.startRotateInDeg) ? 360 + rotateDeg : rotateDeg;

    if (rotateDeg >= minBorder && rotateDeg <= maxBorder) {
      this.ranger.nativeElement.style.transform = `rotate(${rotateDeg}deg)`;

      this.changeRanger.emit({
        indicatorProperty: this.indicatorProperty,
        rotateInDeg: Number(rotateDeg.toFixed(2))
      });
    }
  }

  public onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    document.body.style.cursor = 'move';

    this._onMouseMove(event);

    // change background if ranger hot
    this.changeBackground.emit(this.colorRanger);

    // saved listeners
    this._globalHandlerDocMouseMove = this._renderer.listen('document', 'mousemove', this._onMouseMove.bind(this));
    this._globalHandlerDocMouseUp = this._renderer.listen('document', 'mouseup', this._onMouseUp.bind(this));
  }

  private _onMouseUp(): void {
    document.body.style.cursor = null;
    this.isActive = false;
    this._isMoved = false;
    this._changeDetectorRef.detectChanges();

    // update background by default
    this.changeBackground.emit(Shared.defaultBackgroundIndicator);

    // update borders for other rangers
    this.updateBorders.emit({
        currentGraduceInDeg: this.transformNumberToDeg(this.currentGraduceInNumber),
        currentGraduceInNumber: this.currentGraduceInNumber
    });

    this.ranger.nativeElement.style.transform = `rotate(${this.transformNumberToDeg(this.currentGraduceInNumber)}deg)`;

    // destroy listeners
    this._globalHandlerDocMouseUp();
    this._globalHandlerDocMouseMove();
  }

  ngOnDestroy(): void {}

}
