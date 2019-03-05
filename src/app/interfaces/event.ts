export interface IEvent {
    id: string|number;
    resourceId: string|number;
    statr?: string;
    end?: string;
    classNames?: string[];
    coldTemperature?: number;
    hotTemperature?: number;
    type?: string;
    backgroundColor?: string;
}