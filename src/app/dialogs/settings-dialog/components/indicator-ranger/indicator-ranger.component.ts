import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    AfterViewInit,
    ChangeDetectionStrategy,
    Output,
    ViewChild,
    ElementRef,
    Renderer2,
    ChangeDetectorRef
} from '@angular/core';

type TMode = 'cool' | 'hot';

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
export class IndicatorRangerComponent implements OnInit, AfterViewInit, OnDestroy {
  private center: ICenter;
  private _globalHandlerDocMouseMove: Function;
  private _globalHandlerDocMouseUp: Function;
  isActive: boolean = false;

  @ViewChild('ranger', { read: ElementRef }) public ranger: ElementRef<HTMLElement>;
  @ViewChild('pickerCircle', { read: ElementRef }) public pickerCircle:ElementRef<HTMLElement>;

  @Input() mode: TMode = 'cool';
  @Input() currentStep: number;
  @Input() minBorderInDeg: number;
  @Input() maxBorderInDeg: number;
  @Input() currentGraduceInNumber: number;
  @Input() maxGraduce: number;
  @Input() circleElement: HTMLElement;

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

      rangerEl.style.transform = `rotate(${this._findStartPosition()}deg)`;
    }, 100);

    this.circleElement.addEventListener('mousedown', function (event: MouseEvent) {
      if (event.target === this) self._onMouseDown(event);
    });
  }

  private _findStartPosition(): number {
    if (this.currentGraduceInNumber <= 0) {
      return this.minBorderInDeg;
    } else if (this.currentGraduceInNumber >= this.maxGraduce) {
      return this.maxBorderInDeg;
    } else {
      let currentCornerRotate = this.minBorderInDeg + this.currentGraduceInNumber * this.currentStep;
      if (currentCornerRotate >= 360) {
        currentCornerRotate -= 360;
      }

      return currentCornerRotate;
    }
  }

  private _rotate(x: number, y: number): number {
    const deltaX = x - this.center.x;
    const deltaY = y - this.center.y;

    return Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  }

  private _onMouseMove(event: MouseEvent): void {
    let rotateDeg = this._rotate(event.pageX, event.pageY);
    this.isActive = true;

    rotateDeg = rotateDeg < 0 ? 360 + rotateDeg : rotateDeg;

    if (rotateDeg >= this.minBorderInDeg || rotateDeg <= this.maxBorderInDeg) {
      this.ranger.nativeElement.style.transform = `rotate(${rotateDeg}deg)`;
    }
  }

  public _onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    document.body.style.cursor = 'move';

    this._onMouseMove(event);

    this._globalHandlerDocMouseMove = this._renderer.listen('document', 'mousemove', this._onMouseMove.bind(this));
    this._globalHandlerDocMouseUp = this._renderer.listen('document', 'mouseup', this._onMouseUp.bind(this));
  }

  private _onMouseUp(): void {
    document.body.style.cursor = null;
    this.isActive = false;
    this._changeDetectorRef.detectChanges();

    this._globalHandlerDocMouseUp();
    this._globalHandlerDocMouseMove();
  }

  ngOnDestroy(): void {
    const self = this;
    this.circleElement.removeEventListener('mousedown', function (event: MouseEvent) {
        if (event.target === this) self._onMouseDown(event);
    });
  }

}
