import { Injectable } from '@angular/core';
import { Lifeguard, Schedule } from '../models/lifeguard';
import { Activity, DEFAULT_ACTIVITY } from '../models/activity';
import { appStore } from './store';
import { Period } from '../models/period';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  staffList: Lifeguard[] = appStore.getSnapshot().lifeguards;
  activities: Activity[] = appStore
    .getSnapshot()
    .activities.filter((a) => a.available);
  periods: Period[] = appStore.getSnapshot().currentDayType.periods;

  constructor() {
    appStore.getCurrentDayType().subscribe((dayType) => {
      this.periods = dayType.periods;
    });
    appStore.getLifeguards().subscribe((lifeguards) => {
      this.staffList = lifeguards;
    });
    appStore.getActivities().subscribe((activities) => {
      this.activities = activities.filter((activity) => activity.available);
    });
  }

  generateSchedule() {
    // Reset all schedules of staff - except the locked
    this.resetSchedules();
    // Assign HOFFs - 1 for every staff members
    this.assignHoffs();
    // Assign period by period according to rules
    this.assignActivities();
    // Assign a manager for every LT-allowed activity
    this.assignManagers();

    this.staffList = this.staffList.map((staff) => new Lifeguard(staff));
    appStore.updateState({ lifeguards: this.staffList });
  }

  /** Resets the relevant periods (of the current daytype) for all staff. Skips locked slots/staff. */
  private resetSchedules() {
    this.staffList
      .filter((s) => !s.locked)
      .forEach((s) => {
        this.periods
          .filter((p) => p.workingPeriod)
          .forEach((p) => {
            const temp = s.schedule[p.name];
            if (!temp)
              s.schedule[p.name] = {
                activity: DEFAULT_ACTIVITY.name,
                locked: false,
              };
            else if (!temp.locked)
              s.schedule[p.name] = {
                ...temp,
                activity: DEFAULT_ACTIVITY.name,
                pm: false,
              };
          });
        // reset all the irrelevant periods in the schedule (i.e "Bonim" is irrelevant if Saturday)
        const irrelevant = Object.keys(s.schedule).filter(
          (k) => !this.periods.map((p) => p.name).includes(k)
        );
        irrelevant.forEach((p) => {
          const temp = s.schedule[p];
          if (!temp)
            s.schedule[p] = {
              activity: DEFAULT_ACTIVITY.name,
              locked: false,
            };
          else s.schedule[p] = { ...temp, activity: DEFAULT_ACTIVITY.name };
        });
      });
  }

  /** Assign 1 HOFF for each staff member. Balances the HOFFs during the day */
  private assignHoffs() {
    if (!this.activities.find((a) => a.name == 'HOFF')?.available) return;

    const periods = this.periods.filter(
      (p) => !p.locked && !p.excludedActions.includes('HOFF')
    );
    let staffLeft = this.staffList // staff members left that doesn't have HOFF yet
      .filter((s) => !s.locked)
      .filter((s) => {
        if (!s.schedule) return true;
        for (const p in s.schedule) {
          // check for a pre-assigned HOFF in the member's schedule
          if (s.schedule[p].activity == 'HOFF' && s.schedule[p].locked)
            return false;
        }
        return true;
      });
    const hoffPerPeriodCount = this.getHoffCounterPerPeriod(periods);

    // assign HOFFs member by member
    staffLeft.forEach((lg) => {
      const randPeriod = this.randByPriority(hoffPerPeriodCount);
      lg.schedule[randPeriod].activity = 'HOFF';
      hoffPerPeriodCount[randPeriod]++;
    });
  }

  /** Assign the rest of available activities period by period */
  private assignActivities() {
    const isStaffAvailable = (lg: Lifeguard, p: Period): boolean =>
      !lg.locked && lg.schedule[p.name].activity == DEFAULT_ACTIVITY.name;
    const randStaff = this.createUniqueRandomPicker(
      this.staffList.filter((s) => !s.locked && !s.isLT)
    );

    const periods = this.periods.filter((p) => !p.locked);

    periods.forEach((p) => {
      // what are the available activities to draw for the current period?
      let activities = this.activities
        .filter((a) => a.available)
        .filter((a) => a.name !== 'HOFF')
        .filter((a) => !p.excludedActions.includes(a.name)); // included in period's options
      const actCounter = this.resetActCounter(activities);

      // Draw a random staff member
      let currStaff = randStaff(true);
      while (currStaff) {
        if (isStaffAvailable(currStaff, p)) {
          const optionalActs = this.getPossibleActsInPeriod(
            activities.map((a) => a.name),
            actCounter
          );
          const actName =
            this.getByPreferation(currStaff, optionalActs) ||
            this.randomizeFromArr(optionalActs);
          // Assign the lifeguard to activity in current period
          currStaff.schedule[p.name].activity = actName;
          actCounter[actName] != undefined && actCounter[actName].curr++;
        }
        currStaff = randStaff();
      }
    });
  }

  /** Assign only LTs - at least 1 LT (as manager) for each activity allowed for LTs */
  private assignManagers() {
    const isStaffAvailable = (lg: Lifeguard, p: Period): boolean =>
      !lg.locked && lg.schedule[p.name].activity == DEFAULT_ACTIVITY.name;
    const randStaff = this.createUniqueRandomPicker(
      this.staffList.filter((s) => !s.locked && s.isLT)
    );

    const periods = this.periods.filter((p) => !p.locked);

    periods.forEach((p) => {
      // what are the available activities to draw for the current period?
      let activities = this.activities
        .filter((a) => a.available)
        .filter((a) => a.name !== 'HOFF')
        .filter((a) => !p.excludedActions.includes(a.name))
        .filter((a) => a.allowLT);
      const actCounter = this.resetActCounter(activities, true);

      // Draw a random LT
      let currLT = randStaff(true);
      while (currLT) {
        if (isStaffAvailable(currLT, p)) {
          const optionalActs = this.getPossibleActsInPeriod(
            activities.map((a) => a.name),
            actCounter
          );
          const actName = this.randomizeFromArr(optionalActs);
          currLT.schedule[p.name].activity = actName;
          actCounter[actName] != undefined && actCounter[actName].curr++;

          if (currLT.isBoss) {
            currLT.schedule[p.name].pm = true;
            actCounter[actName].hasPM = true;
          } else if (!actCounter[actName].hasPM) {
            currLT.schedule[p.name].pm = true;
            actCounter[actName].hasPM = true;
          }
        }
        currLT = randStaff();
      }
    });
  }

  //#region Helper Methods

  /** filter the possible activities according to the periodical activities counter */
  private getPossibleActsInPeriod(actNames: string[], counter: any): string[] {
    const notReachedMin = actNames.filter(
      (a) => counter[a].min != undefined && counter[a].curr < counter[a].min
    );
    if (notReachedMin.length) return notReachedMin;

    const notReachedMax = actNames.filter(
      (a) => counter[a].max != undefined && counter[a].curr < counter[a].max
    );
    if (notReachedMax.length) return notReachedMax;

    const rest = actNames.filter((a) => counter[a].max == undefined);
    if (rest.length) return rest;

    return [DEFAULT_ACTIVITY.name];
  }

  /** Returns a function that randomize a unique item from `items`.
   * The boss will always be the first to be drawn */
  createUniqueRandomPicker<T>(items: T[]) {
    let picked = new Set<T>();

    return function getRandom(reset = false): T | undefined {
      if (reset) {
        picked.clear();
      }

      const remaining = items.filter((item) => !picked.has(item));
      if (remaining.length === 0) return undefined;

      const boss = remaining.find((i: any) => i.isBoss);
      if (boss) {
        picked.add(boss);
        return boss;
      }

      const randomItem =
        remaining[Math.floor(Math.random() * remaining.length)];
      picked.add(randomItem);
      return randomItem;
    };
  }

  private resetActCounter(activities: Activity[], modeLT = false) {
    return activities.reduce((acc, activity) => {
      acc[activity.name] = modeLT
        ? { curr: 0, min: 1, max: undefined, hasPM: false }
        : { curr: 0, min: activity.min, max: activity.max };
      return acc;
    }, {} as { [key: string]: { curr: number; min: number | undefined; max: number | undefined; hasPM?: boolean } });
  }

  /** Returns the amount of HOFFs assigned to lifeguards in each period */
  private getHoffCounterPerPeriod(periods: Period[]): {
    [key: string]: number;
  } {
    const counter = periods.reduce((acc, p) => {
      acc[p.name] = 0;
      return acc;
    }, {} as { [key: string]: number });

    this.staffList.forEach((s) => {
      if (!s.schedule) return;
      for (const p in s.schedule) {
        if (
          s.schedule[p].activity == 'HOFF' &&
          (s.schedule[p].locked || s.locked)
        )
          counter[p] = (counter[p] || 0) + 1;
      }
    });

    return counter;
  }

  private getByPreferation(lg: Lifeguard, acts: string[]): string | undefined {
    if (lg.preferPool == undefined) return undefined;
    if (lg.preferPool && acts.includes('Pool')) return 'Pool';
    if (!lg.preferPool && acts.includes('Lake')) return 'Lake';
    return undefined;
  }

  /** Gets a counter object and returns a random minimal attribute */
  private randByPriority(counter: any): string {
    const minVal = Object.values(counter).sort()[0];
    const minKeys: string[] = Object.keys(counter).filter(
      (k) => counter[k] == minVal
    );
    return this.randomizeFromArr(minKeys);
  }

  private randomizeFromArr(arr: any[]): any {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  private isInDoff(lg: Lifeguard): boolean {
    return lg.locked && Object.values(lg.schedule)[0].activity == 'DOFF';
  }

  //#endregion
}
