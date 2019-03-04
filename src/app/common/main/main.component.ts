import { Component, OnInit, Input } from '@angular/core';
import { MatDialog, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Calendar } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import * as moment from 'moment';

import { SettingsDialogComponent } from '../../dialogs/settings-dialog/settings-dialog.component';
import {
    defaultIntervalBetweenRangers, DefaultWidthModal, fullcalendarSettings,
    generateRandomNumber
} from '../../shared/common';
import { SvgIcons } from '../../shared/mat-icons';
import { Events } from '../events-data';
import { Resources } from '../resources';

type TMode = 'advanced' | 'simple';

@Component({
  selector: 'thermostat-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @Input() defaultIntervalBetweenRangers = defaultIntervalBetweenRangers;
  @Input() calendarResourses: any[];
  @Input() events: any[];
  @Input() eventClickCallback: Function;

  private _calendar;

  get calendar() {
      return this._calendar;
  }

  constructor(
      private matDialog: MatDialog,
      private sanitizer: DomSanitizer,
      private iconReg: MatIconRegistry,
  ) { }

  ngOnInit(): void {
     this.registerMatIcons();

    const calendar = this._calendar = new Calendar(document.getElementById('calendar'), {
        plugins: [ resourceTimelinePlugin, interactionPlugin ],
        defaultView: 'resourceTimeline',
        header: false,
        height: 'auto',
        contentHeight: 65,
        slotLabelInterval: '4:00',
        slotDuration: `00:${fullcalendarSettings.slotDuration}:00`,
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
        resources: this.calendarResourses || Resources,
        events: this.events || Events.map((event: any) => {
            const currentDate = moment();
            let generateHour = generateRandomNumber(0, 24 - currentDate.hour());
            generateHour = currentDate.hour() + generateHour > 23 ? 24 - (generateHour % 24) : generateHour;
            const randomDate = currentDate.add(Math.round(Math.random()) === 1 ? generateHour : -generateHour, 'hour');
            const remander = 30 - (randomDate.minute() % 30);

            event.start = moment(randomDate.add(remander, 'minute')).format('YYYY-MM-DDTHH:mm:00');
            event.end = moment(event.start).add(3, 'hour').format('YYYY-MM-DDTHH:mm:00');
            event.backgroundColor = '#F8F8FC';
            return event;
        }),
        eventRender: (info) => {
            let start = info.event.start && moment(info.event.start);
            let end = info.event.end && moment(info.event.end);

            const diff = end.diff(start, 'minutes');
            const { coldTemperature, hotTemperature } = info.event.extendedProps;

            $(info.el).find('.fc-content').prepend(`<div class="event-thermostat__icon ${info.event.extendedProps.type}"></div>`);
            $(info.el).find('.fc-content').append(`
                    <div class="event-thermostat__temperature d-flex">
                        <span class="event-thermostat__temperature__hot">${hotTemperature}</span>
                        <span class="event-thermostat__temperature__cold">${coldTemperature}</span>
                    </div>
            `);

            if (diff <= fullcalendarSettings.slotDuration * 2) {
                $(info.el).find('.event-thermostat__temperature').css({opacity: 0});
                if (diff === fullcalendarSettings.slotDuration) {
                    $(info.el).css({width: '43px'});
                }
            }
        },
        eventClick: (info) => {
            const { coldTemperature, hotTemperature } = info.event.extendedProps;

            const widthModal = window.innerWidth < DefaultWidthModal ? '80%' : `${DefaultWidthModal}px`;

            const openDialogSettings = this.matDialog.open(SettingsDialogComponent, {
                panelClass: 'settings-termostat',
                width: widthModal,
                height: '100vh',
                autoFocus: false,
                data: {
                    mode: 'simple',
                    title: 'Thermostat - Settings',
                    coldTemperature,
                    hotTemperature,
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
                        break;
                    case 'delete':
                        event.remove();
                        break;
                    case 'close':
                        return;
                }

                if (this.eventClickCallback) this.eventClickCallback({
                   calendar,
                   eventInfo: {...data, status: status}
                });
            });
        },
        eventMouseEnter: (info) => {
            const $el = $(info.el);
            const $tempEl = $el.find('.event-thermostat__temperature');
            let start = info.event.start && moment(info.event.start);
            let end = info.event.end && moment(info.event.end);

            const diff = end.diff(start, 'minutes');

            if (diff <= fullcalendarSettings.slotDuration * 2) {
                const iconWidth = $el.find('.event-thermostat__icon').width();
                const temperatureWidth = $tempEl.width();

                $el.css({ width: `${iconWidth + temperatureWidth}px`});
                $tempEl.css({opacity: 1});
            }
        },
        eventMouseLeave: (info) => {
            const $el = $(info.el);
            const $tempEl = $el.find('.event-thermostat__temperature');
            let start = info.event.start && moment(info.event.start);
            let end = info.event.end && moment(info.event.end);

            const diff = end.diff(start, 'minutes');

            if (diff <= fullcalendarSettings.slotDuration * 2) {
                $tempEl.css({opacity: 0});
                if (diff === fullcalendarSettings.slotDuration) {
                    $el.css({width: '43px'});
                    return;
                }
                $el.css({width: ''});
            }
        },
        editable: true,
        resourceAreaWidth: 96
    });

    calendar.render();
  }

  private registerMatIcons(): void {
    SvgIcons.forEach((icon: {name: string, path: string}) => {
      this.iconReg.addSvgIcon(icon.name, this.sanitizer.bypassSecurityTrustResourceUrl(icon.path));
    });
  }
}
