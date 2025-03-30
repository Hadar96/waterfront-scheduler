import { Activity } from './activity';
import { Period } from './period';

export class Lifeguard {
  private name: string;
  private schedule: { [key: string]: string };
  private daycampCount: number;
  private partyCount: number;
  private hoffCo: string | undefined;
  private preferPool: boolean | undefined;
  private locked: boolean;

  constructor(name: string, preferPool?: boolean, hoffCo?: string) {
    this.name = name;
    this.schedule = {};
    this.daycampCount = 0;
    this.partyCount = 0;
    this.preferPool = preferPool;
    this.locked = false;
    this.hoffCo = hoffCo;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getSchedule(): { [key: string]: string } {
    return this.schedule;
  }

  setSchedule(schedule: { [key: string]: string }): void {
    this.schedule = schedule;
  }

  getDaycampCount(): number {
    return this.daycampCount;
  }

  setDaycampCount(daycampCount: number): void {
    this.daycampCount = daycampCount;
  }

  getPartyCount(): number {
    return this.partyCount;
  }

  setPartyCount(partyCount: number): void {
    this.partyCount = partyCount;
  }

  getPreferPool(): boolean | undefined {
    return this.preferPool;
  }

  setPreferPool(preferPool: boolean): void {
    this.preferPool = preferPool;
  }

  getLocked(): boolean {
    return this.locked;
  }

  setLocked(locked: boolean): void {
    this.locked = locked;
  }

  getHoffCo(): string | undefined {
    return this.hoffCo;
  }

  setHoffCo(hoffCo: string): void {
    this.hoffCo = hoffCo;
  }
}
