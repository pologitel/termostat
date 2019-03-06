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
  title = 'termostat';

  events: IEvent[] = [];
  mode: string = 'simple';
  eventClickCallback: Function;

  ngOnInit(): void {
    setTimeout(() => {
      // this.mode = 'advanced';

      this.events = [{
          id: 1,
          resourceId: 'monday',
          classNames: ['event-thermostat'],
          coldTemperature: 12,
          hotTemperature: 45,
          type: 'sleep',
          typeMode: 'cold'
      }, {
          id: 2,
          resourceId: 'wednesday',
          classNames: ['event-thermostat'],
          coldTemperature: 11,
          hotTemperature: 21,
          type: 'settings',
          typeMode: 'cold'
      }, {
          id: 3,
          resourceId: 'tuesday',
          classNames: ['event-thermostat'],
          coldTemperature: 23,
          hotTemperature: 67,
          type: 'away',
          typeMode: 'cold'
      }, {
          id: 4,
          resourceId: 'tuesday',
          classNames: ['event-thermostat'],
          coldTemperature: 1,
          hotTemperature: 78,
          type: 'home',
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
      }
    }, 5000);
  }
}
