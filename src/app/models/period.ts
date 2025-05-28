export class Period {
  private static _autoId = 0;

  private _id: number;
  private _start: string;
  private _end: string;
  private _name: string;
  private _workingPeriod: boolean;
  private _locked: boolean;
  private _excludedActions: string[];

  constructor(
    name: string,
    start: string,
    end: string,
    workingPeriod: boolean = true,
    locked: boolean = false,
    excludedActions: string[] = []
  ) {
    this._id = ++Period._autoId; // Increment and return the next ID
    this._name = name;
    this._start = start;
    this._end = end;
    this._workingPeriod = workingPeriod;
    this._locked = !workingPeriod ? true : locked; // Lock if not a working period
    this._excludedActions = excludedActions;
  }

  get id(): number {
    return this._id;
  }

  get start(): string {
    let str = this._start;
    if (str.length === 4) {
      str = str.substring(0, 2) + ':' + str.substring(2, 4);
    }
    return str;
  }

  set start(value: string) {
    this._start = value;
  }

  get end(): string {
    let str = this._end;
    if (str.length === 4) {
      str = str.substring(0, 2) + ':' + str.substring(2, 4);
    }
    return str;
  }

  set end(value: string) {
    this._end = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get locked(): boolean {
    return this._locked;
  }

  set locked(value: boolean) {
    this._locked = value;
  }

  get workingPeriod(): boolean {
    return this._workingPeriod;
  }

  set workingPeriod(value: boolean) {
    this._workingPeriod = value;
  }

  get excludedActions(): string[] {
    return this._excludedActions;
  }

  set excludedActions(value: string[]) {
    this._excludedActions = value;
  }
}

export const DAYCAMP_NAME = 'Day Camp';