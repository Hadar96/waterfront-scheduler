export class Activity {
  private _name: string;
  private _color: string;
  private _min?: number;
  private _max?: number;
  private _isMain: boolean;
  private _available: boolean;
  private _allowLT: boolean;

  constructor(
    name: string,
    color: string = '#ffffff',
    min?: number,
    max?: number,
    isMain: boolean = false,
    allowLT: boolean = true,
    available: boolean = true
  ) {
    this._name = name;
    this._color = color;
    this._min = min;
    this._max = max;
    this._isMain = isMain;
    this._available = available;
    this._allowLT = allowLT;
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

  get isMain(): boolean {
    return this._isMain;
  }

  set isMain(value: boolean) {
    this._isMain = value;
  }

  get allowLT(): boolean {
    return this._allowLT;
  }

  set allowLT(value: boolean) {
    this._allowLT = value;
  }
}

export const DEFAULT_ACTIVITY = new Activity('/', '#ffffff00');
