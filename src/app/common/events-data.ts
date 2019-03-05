import { IEvent } from '../interfaces/event';

export const EventsMock: IEvent[] = [{
    id: 1,
    resourceId: 'monday',
    classNames: ['event-thermostat'],
    coldTemperature: 23,
    hotTemperature: 45,
    type: 'sleep'
}, {
    id: 2,
    resourceId: 'wednesday',
    classNames: ['event-thermostat'],
    coldTemperature: 1,
    hotTemperature: 19,
    type: 'settings'
}, {
    id: 3,
    resourceId: 'tuesday',
    classNames: ['event-thermostat'],
    coldTemperature: 30,
    hotTemperature: 67,
    type: 'away'
}, {
    id: 4,
    resourceId: 'tuesday',
    classNames: ['event-thermostat'],
    coldTemperature: 0,
    hotTemperature: 36,
    type: 'home'
}];