import { Component, OnInit } from '@angular/core';
import { IEvent } from './interfaces/event';
import * as moment from 'moment';

import * as Shared from './shared/index';

@Component({
  selector: 'termostat-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  events: IEvent[] = [];
  mode: string = 'simple';
  eventClickCallback: Function;
  eventDragEndCallback: Function;
  eventResizeEndCallback: Function;

  ngOnInit(): void {
    setTimeout(() => {
      this.mode = 'advanced';

      this.events = [{
          id: 1,
          resourceId: 'monday',
          coldTemperature: 12,
          hotTemperature: 45,
          type: 'sleep',
          typeMode: 'cold'
      }, {
          id: 2,
          resourceId: 'wednesday',
          coldTemperature: 11,
          hotTemperature: 21,
          type: 'settings',
          typeMode: 'cold'
      }, {
          id: 3,
          resourceId: 'tuesday',
          coldTemperature: 23,
          hotTemperature: 67,
          type: 'settings',
          typeMode: 'cold'
      }, {
          id: 4,
          resourceId: 'tuesday',
          coldTemperature: 1,
          hotTemperature: 78,
          type: '<span>1</span>',
          typeMode: 'cold'
      }].map((event: IEvent) => {
          const currentDate = moment();
          let generateHour = Shared.generateRandomNumber(0, 24 - currentDate.hour());
          generateHour = currentDate.hour() + generateHour > 23 ? 24 - (generateHour % 24) : generateHour;
          const randomDate = currentDate.add(Math.round(Math.random()) === 1 ? generateHour : -generateHour, 'hour');
          const remander = 30 - (randomDate.minute() % 30);

          event.start = moment(randomDate.add(remander, 'minute')).format('YYYY-MM-DDTHH:mm:00');
          event.end = moment(event.start).add(3, 'hour').format('YYYY-MM-DDTHH:mm:00');
          event.backgroundColor = Shared.fullcalendarSettings.backgroundColorEvent;
          return event;
      });

      this.eventClickCallback = (info) => {
        console.log(info);
      };

      this.eventDragEndCallback = (info) => {
        console.log(info);
      };

      this.eventResizeEndCallback = (info) => {
        console.log(info);
      };
    }, 5000);
  }
}
