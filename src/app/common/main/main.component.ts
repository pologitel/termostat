import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Calendar } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import * as moment from 'moment';

import { SettingsDialogComponent } from '../../dialogs/settings-dialog/settings-dialog.component';
import * as Shared from '../../shared/common';
import { EventsMock } from '../events-data';
import { Resources } from '../resources';
import { environment } from '../../../environments/environment';
import { isHTML } from '../../shared/common';

@Component({
  selector: 'thermostat-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnChanges {
  @Input() defaultIntervalBetweenRangers = Shared.defaultIntervalBetweenRangers;
  @Input() calendarResourses: any[] = [];
  @Input() calendarEvents: any[] = [];
  @Input() eventClickCallback: Function;
  @Input() eventDragStopCallback: Function;
  @Input() eventResizeStopCallback: Function;
  @Input() maxGraduce: number = 120;
  @Input() mode: Shared.TMode = 'advanced';

  private _calendar;

  constructor(
      private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    const calendar = this._calendar = new Calendar(document.getElementById('calendar'), {
        plugins: [ resourceTimelinePlugin, interactionPlugin ],
        defaultView: 'resourceTimeline',
        header: false,
        height: 'auto',
        contentHeight: 65,
        slotLabelInterval: '4:00',
        slotDuration: `00:${Shared.fullcalendarSettings.slotDuration}:00`,
        scrollTime: '00:00:00',
        slotLabelFormat: [{
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        }],
        resourceColumns: [
            {
                labelText: '',
                field: 'dayOfWeek'
            }
        ],
        resources: (this.calendarResourses.length > 0 && this.calendarResourses) || Resources,
        events: (this.calendarEvents.length > 0 && this.calendarEvents) || (!environment.production ? EventsMock.map((event: any) => {
            const currentDate = moment();
            let generateHour = Shared.generateRandomNumber(0, 24 - currentDate.hour());
            generateHour = currentDate.hour() + generateHour > 23 ? 24 - (generateHour % 24) : generateHour;
            const randomDate = currentDate.add(Math.round(Math.random()) === 1 ? generateHour : -generateHour, 'hour');
            const remander = 30 - (randomDate.minute() % 30);

            event.start = moment(randomDate.add(remander, 'minute')).format('YYYY-MM-DDTHH:mm:00');
            event.end = moment(event.start).add(3, 'hour').format('YYYY-MM-DDTHH:mm:00');
            event.backgroundColor = Shared.fullcalendarSettings.backgroundColorEvent;
            return event;
        }) : []),
        eventRender: (info) => {

            let start = info.event.start && moment(info.event.start);
            let end = info.event.end && moment(info.event.end);

            const diff = end.diff(start, 'minutes');
            const { coldTemperature, hotTemperature, type } = info.event.extendedProps;
            const isHtmlIcon = isHTML(type);

            $(info.el).find('.fc-content').prepend(`
                <div class="fc-timeline-event__icon d-flex justify-content-center align-items-center ${isHtmlIcon && this.mode === 'advanced' ? 'fc-timeline-event__icon-custom' : ''}">
                    <div class="fc-timeline-event__icon__content ${isHtmlIcon && this.mode === 'advanced' ? 'fc-timeline-event__icon__custom-content' : isHtmlIcon ? '' : type}">
                        ${isHtmlIcon && this.mode === 'advanced' ? type : ''}
                    </div>
                </div>`);

            $(info.el).find('.fc-content').append(`
                    <div class="fc-timeline-event__temperature d-flex">
                        <span class="fc-timeline-event__temperature__hot">${hotTemperature}</span>
                        <span class="fc-timeline-event__temperature__cold">${coldTemperature}</span>
                    </div>
            `);

            if (diff <= Shared.fullcalendarSettings.slotDuration * 2) {
                $(info.el).find('.fc-timeline-event__temperature').css({opacity: 0});
                if (diff === Shared.fullcalendarSettings.slotDuration) {
                    $(info.el).css({width: '43px'});
                }
            }
        },
        eventClick: (info) => {
            const { coldTemperature, hotTemperature, typeMode } = info.event.extendedProps;

            const widthModal = window.innerWidth < Shared.DefaultWidthModal ? '80%' : `${Shared.DefaultWidthModal}px`;

            const openDialogSettings = this.matDialog.open(SettingsDialogComponent, {
                panelClass: 'settings-thermostat',
                width: widthModal,
                height: '100vh',
                autoFocus: false,
                data: {
                    calendarMode: this.mode,
                    title: 'Thermostat - Settings',
                    coldTemperature,
                    hotTemperature,
                    typeMode,
                    maxGraduce: this.maxGraduce,
                    eventId: info.event.id,
                    defaultIntervalBetweenRangers: this.defaultIntervalBetweenRangers
                }
            });

            openDialogSettings.afterClosed().subscribe(({ status, data }) => {
                const event = calendar.getEventById(data.eventId);

                switch (status) {
                    case 'update':
                        event.setExtendedProp('coldTemperature', data.coldTemperature);
                        event.setExtendedProp('hotTemperature', data.hotTemperature);
                        event.setExtendedProp('typeMode', data.typeMode);
                        break;
                    case 'delete':
                        event.remove();
                        break;
                    case 'close':
                        return;
                }

                if (this.eventClickCallback) this.eventClickCallback({
                   calendar,
                   settingsInfo: {...data, status},
                   event
                });
            });
        },
        eventMouseEnter: (info) => {
            const $el = $(info.el);
            const $tempEl = $el.find('.fc-timeline-event__temperature');
            const start = info.event.start && moment(info.event.start);
            const end = info.event.end && moment(info.event.end);
            const diff = end.diff(start, 'minutes');

            if (diff <= Shared.fullcalendarSettings.slotDuration * 2) {
                const iconWidth = $el.find('.fc-timeline-event__icon').width();
                const temperatureWidth = $tempEl.width();

                $el.css({ width: `${iconWidth + temperatureWidth}px`});
                $tempEl.css({opacity: 1});
            }
        },
        eventMouseLeave: (info) => {
            const $el = $(info.el);
            const $tempEl = $el.find('.fc-timeline-event__temperature');
            const start = info.event.start && moment(info.event.start);
            const end = info.event.end && moment(info.event.end);
            const diff = end.diff(start, 'minutes');

            if (diff <= Shared.fullcalendarSettings.slotDuration * 2) {
                $tempEl.css({opacity: 0});
                if (diff === Shared.fullcalendarSettings.slotDuration) {
                    $el.css({width: '43px'});
                    return;
                }
                $el.css({width: ''});
            }
        },
        eventDrop: ({ event }) => {
            if (this.eventDragStopCallback) this.eventDragStopCallback({
                calendar: this._calendar,
                event
            });
        },
        eventResize: ({ event }) => {
            if (this.eventResizeStopCallback) this.eventResizeStopCallback({
                calendar: this._calendar,
                event
            });
        },
        editable: this.mode !== 'simple',
        resourceAreaWidth: Shared.fullcalendarSettings.resourceAreaWidth
    });

    calendar.render();

    this._buildCalendarTimeLine();
  }

  ngOnChanges(changes: SimpleChanges): void {
      const { calendarEvents, calendarResourses, mode } = changes;

      if (calendarEvents && calendarEvents.currentValue && calendarEvents.currentValue.length > 0) {
          const newListEvents: any[] = calendarEvents.currentValue;
          const currentListEvents: any[] = this._calendar.getEvents();

          if (currentListEvents && currentListEvents.constructor.name === 'Array') {
              currentListEvents.forEach((oldEvent) => {
                  const event = this._calendar.getEventById(oldEvent.id);

                  event.remove();
              });
          }

          newListEvents.forEach((newEvent) => {
            newEvent.backgroundColor = Shared.fullcalendarSettings.backgroundColorEvent;
            this._calendar.addEvent(newEvent);
          });

          this._calendar.refetchEvents();
      }

      if (calendarResourses && calendarResourses.currentValue) {
          this._calendar.rerenderResources();
      }

      if (mode && mode.currentValue && mode.currentValue !== 'simple') {
          this._calendar.setOption('editable', true);
      }
  }

  private _buildCalendarTimeLine(): void {
      $(this._calendar.el).find('.fc-head table')
          .find('.fc-widget-header')
          .css({ 'vertical-align': 'initial' })
          .each(function() {
              const el = this;

              if (el.dataset.date) {
                  $(el)
                      .find('.fc-cell-content')
                      .append(`<span class="fc-cell-midday">${moment(el.dataset.date).format('A')}</span>`);
              }
          });
  }
}
