import { Component, OnInit, Input } from '@angular/core';
import { MatDialog, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Calendar } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import * as moment from 'moment';

import { SettingsDialogComponent } from '../../dialogs/settings-dialog/settings-dialog.component';
import { defaultIntervalBetweenRangers, DefaultWidthModal, fullcalendarSettings } from '../../shared/common';
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
  @Input() defaultIntervalBetweenRangers: number = defaultIntervalBetweenRangers;

  constructor(
      private matDialog: MatDialog,
      private sanitizer: DomSanitizer,
      private iconReg: MatIconRegistry,
  ) { }

  ngOnInit(): void {
    this.registerMatIcons();

    const calendar = new Calendar(document.getElementById('calendar'), {
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
        resources: Resources,
        events: Events,
        eventRender: (info) => {
            let start = info.event.start && moment(info.event.start);
            let end = info.event.end && moment(info.event.end);

            const diff = (start && end) && end.diff(start, 'minutes');
            const { coldTemperature, hotTemperature } = info.event.extendedProps;

            $(info.el).find('.fc-content').prepend(`<div class="event-thermostat__icon ${info.event.extendedProps.type}"></div>`);

            if (!diff || diff != fullcalendarSettings.slotDuration) {
                $(info.el).find('.fc-content').append(`
                    <div class="event-thermostat__temperature d-flex">
                        <span class="event-thermostat__temperature__hot">${hotTemperature}</span>
                        <span class="event-thermostat__temperature__cold">${coldTemperature}</span>
                    </div>`);
            }
        },
        eventClick: (info) => {
            console.log(info);
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
                    defaultIntervalBetweenRangers: this.defaultIntervalBetweenRangers
                }
            });

            openDialogSettings.afterClosed().subscribe((resultAfterClose) => {
                console.log(resultAfterClose);
            });
        },
        editable: true,
        resourceAreaWidth: 96
    });

    // calendar.el.style.width = window.innerWidth > window.innerWidth * 0.8 ? defaultWidthCalendar : '100%';
    calendar.render();
  }

  openDialogSettings(): void {
    const widthModal = window.innerWidth < DefaultWidthModal ? '80%' : `${DefaultWidthModal}px`;

    const openDialogSettings = this.matDialog.open(SettingsDialogComponent, {
      panelClass: 'settings-termostat',
      width: widthModal,
      height: '100vh',
      autoFocus: false,
      data: {
        mode: 'simple',
        title: 'Thermostat - Settings',
        coldTemperature: 12,
        hotTemperature: 34,
        defaultIntervalBetweenRangers: this.defaultIntervalBetweenRangers
      }
    });

    openDialogSettings.afterClosed().subscribe((resultAfterClose) => {
      console.log(resultAfterClose);
    });
  }

  private registerMatIcons(): void {
    SvgIcons.forEach((icon: {name: string, path: string}) => {
      this.iconReg.addSvgIcon(icon.name, this.sanitizer.bypassSecurityTrustResourceUrl(icon.path));
    });
  }
}
