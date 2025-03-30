export class Activity {
  private _name: string;
  private _color: string;
  private _min?: number;
  private _max?: number;

  constructor(name: string, color: string, min?: number, max?: number) {
    this._name = name;
    this._color = color;
    this._min = min;
    this._max = max;
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
}
