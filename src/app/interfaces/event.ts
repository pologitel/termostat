export interface IEvent {
    id: string|number;
    resourceId: string|number;
    start?: string;
    end?: string;
    classNames?: string[];
    coldTemperature?: number;
    hotTemperature?: number;
    type?: string;
    typeMode?: string;
    backgroundColor?: string;
}