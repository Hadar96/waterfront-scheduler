export class Lifeguard {
  private _name: string;
  private _schedule: { [key: string]: string };
  private _daycampCount: number;
  private _partyCount: number;
  private _hoffCo: string | undefined;
  private _preferPool: boolean | undefined;
  private _locked: boolean;

  constructor(
    name: string,
    schedule: { [key: string]: string } = {},
    preferPool?: boolean,
    hoffCo?: string,
    locked: boolean = false,
    daycampCount: number = 0,
    partyCount: number = 0
  ) {
    this._name = name;
    this._schedule = schedule;
    this._daycampCount = daycampCount;
    this._partyCount = partyCount;
    this._preferPool = preferPool;
    this._locked = locked;
    this._hoffCo = hoffCo;
  }

  get name(): string {
    return this._name;
  }

  set name(name: string) {
    this._name = name;
  }

  get schedule(): { [key: string]: string } {
    return this._schedule;
  }

  set schedule(schedule: { [key: string]: string }) {
    this._schedule = schedule;
  }

  get daycampCount(): number {
    return this._daycampCount;
  }

  set daycampCount(daycampCount: number) {
    this._daycampCount = daycampCount;
  }

  get partyCount(): number {
    return this._partyCount;
  }

  set partyCount(partyCount: number) {
    this._partyCount = partyCount;
  }

  get preferPool(): boolean | undefined {
    return this._preferPool;
  }

  set preferPool(preferPool: boolean | undefined) {
    this._preferPool = preferPool;
  }

  get locked(): boolean {
    return this._locked;
  }

  set locked(locked: boolean) {
    this._locked = locked;
  }

  get hoffCo(): string | undefined {
    return this._hoffCo;
  }

  set hoffCo(hoffCo: string | undefined) {
    this._hoffCo = hoffCo;
  }
}
