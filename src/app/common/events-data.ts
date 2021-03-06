import { IEvent } from '../interfaces/event';

export const EventsMock: IEvent[] = [{
    id: 1,
    resourceId: 'monday',
    coldTemperature: 23,
    hotTemperature: 45,
    type: 'sleep',
    typeMode: 'heat'
}, {
    id: 2,
    resourceId: 'wednesday',
    coldTemperature: 1,
    hotTemperature: 19,
    type: 'settings',
    typeMode: 'cold'
}, {
    id: 3,
    resourceId: 'tuesday',
    coldTemperature: 30,
    hotTemperature: 67,
    type: 'away',
    typeMode: 'off'
}, {
    id: 4,
    resourceId: 'tuesday',
    coldTemperature: 0,
    hotTemperature: 36,
    type: 'home',
    typeMode: 'off'
}];