export class Activity {
  private _name: string;
  private _color: string;
  private _min?: number;
  private _max?: number;
  private _available: boolean;

  constructor(
    name: string,
    color: string = '#ffffff',
    min?: number,
    max?: number,
    available: boolean = true
  ) {
    this._name = name;
    this._color = color;
    this._min = min;
    this._max = max;
    this._available = available;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._color = value;
  }

  get min(): number | undefined {
    return this._min;
  }

  set min(value: number) {
    this._min = value;
  }

  get max(): number | undefined {
    return this._max;
  }

  set max(value: number) {
    this._max = value;
  }

  get available(): boolean {
    return this._available;
  }

  set available(value: boolean) {
    this._available = value;
  }
}

export const DEFAULT_ACTIVITY = new Activity('/', '#ffffff00');