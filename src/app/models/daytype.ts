import { Period } from './period';

export class DayType {
  private static _autoId = 0;

  private _name: string;
  private _id: number;
  private _periods: Period[];
  private _actRules: any[] = [];

  constructor(name: string, periods: Period[] = [], actRules = []) {
    this._id = ++DayType._autoId;
    this._name = name;
    this._periods = periods;
    this._actRules = actRules;
  }

  // Getter and Setter for Name
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  // Getter and Setter for ID
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  // Getter and Setter for Periods
  get periods(): Period[] {
    return this._periods;
  }

  set periods(value: Period[]) {
    this._periods = value;
  }

  // Getter and Setter for Periods
  get actRules(): any[] {
    return this._actRules;
  }

  set actRules(value: any[]) {
    this._actRules = value;
  }
}
