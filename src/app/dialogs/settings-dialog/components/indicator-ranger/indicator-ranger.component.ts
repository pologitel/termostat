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

type TIndicatorProperty = 'coolTemperature' | 'hotTemperature' | string;
type TIndicatorPropertyBorder = 'bordersForCoolTemperature' | 'bordersForHotTemperature' | string;

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
  private center: ICenter;
  private _globalHandlerDocMouseMove: Function;
  private _globalHandlerDocMouseUp: Function;
  private _currentRotateInDeg: number;
  private _isMoved: boolean = false;
  isActive: boolean = false;

  @Output() changeRander: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeBackground: EventEmitter<any> = new EventEmitter<string>();
  @Output() updateBorders: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('ranger', { read: ElementRef }) public ranger: ElementRef<HTMLElement>;
  @ViewChild('pickerCircle', { read: ElementRef }) public pickerCircle:ElementRef<HTMLElement>;

  @Input() indicatorPropertyBorders: TIndicatorPropertyBorder;
  @Input() indicatorProperty: TIndicatorProperty;
  @Input() currentStep: number;
  @Input() minBorderInDeg: number;
  @Input() maxBorderInDeg: number;
  @Input() currentGraduceInNumber: number;
  @Input() maxGraduce: number;
  @Input() circleElement: HTMLElement;
  @Input() borders: number[];

  constructor(
      private _renderer: Renderer2,
      private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const rect: ClientRect = this.circleElement.getBoundingClientRect();

    this.center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  ngAfterViewInit(): void {
    const self = this;
    setTimeout(() => {
      const rangerEl: HTMLElement = this.ranger.nativeElement;

      rangerEl.style.transform = `rotate(${this._transformGraduceInDeg(this.currentGraduceInNumber)}deg)`;
    }, 100);

    // this.circleElement.addEventListener('mousedown', function (event: MouseEvent) {
    //   if (event.target === this) self._onMouseDown(event);
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // update ranger when currentGraduce was changed
    if (changes.currentGraduceInNumber
        && (typeof changes.currentGraduceInNumber.currentValue === 'number')
        && !changes.currentGraduceInNumber.firstChange
        && !this._isMoved
    ) {
      const currentValueGraduceInNumber: number = changes.currentGraduceInNumber.currentValue;
      const rangrEl: HTMLElement = this.ranger.nativeElement;

      rangrEl.style.transform = `rotate(${this._transformGraduceInDeg(currentValueGraduceInNumber)}deg)`;
    }
  }

  private _transformGraduceInDeg(currentGraguceInNumber: number): number {
    if (currentGraguceInNumber <= 0) {
      return this.minBorderInDeg;
    } else if (currentGraguceInNumber >= this.maxGraduce) {
      return this.maxBorderInDeg;
    } else {
      let currentCornerRotate = this.minBorderInDeg + currentGraguceInNumber * this.currentStep;
      if (currentCornerRotate >= 360) {
        currentCornerRotate -= 360;
      }

      return Number(currentCornerRotate.toFixed(2));
    }
  }

  // detect current rotate in deg by math
  private _rotate(x: number, y: number): number {
    const deltaX = x - this.center.x;
    const deltaY = y - this.center.y;

    return Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  }

  private _onMouseMove(event: MouseEvent): void {
    let rotateDeg = this._rotate(event.pageX, event.pageY);
    this.isActive = true;
    this._isMoved = true;

    rotateDeg = rotateDeg < 0 ? 360 + rotateDeg : rotateDeg;

    // check min/max border during mouseMove ranger
    if (rotateDeg >= this.minBorderInDeg || rotateDeg <= this.maxBorderInDeg) {
      this.ranger.nativeElement.style.transform = `rotate(${rotateDeg}deg)`;
      this._currentRotateInDeg = rotateDeg;

      this.changeRander.emit({
        indicatorProperty: this.indicatorProperty,
        rotateInDeg: Number(this._currentRotateInDeg.toFixed(2))
      });
    }
  }

  public _onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    document.body.style.cursor = 'move';

    this._onMouseMove(event);

    // change background if ranger hot
    this.changeBackground.emit(this.indicatorProperty === 'hotTemperature' ? 'hot' : 'cool');

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
    this.changeBackground.emit('default');

    this.ranger.nativeElement.style.transform = `rotate(${this._transformGraduceInDeg(this.currentGraduceInNumber)}deg)`;

    // destroy listeners
    this._globalHandlerDocMouseUp();
    this._globalHandlerDocMouseMove();
  }

  ngOnDestroy(): void {
    // const self = this;
    // this.circleElement.removeEventListener('mousedown', function (event: MouseEvent) {
    //     if (event.target === this) self._onMouseDown(event);
    // });
  }

}
