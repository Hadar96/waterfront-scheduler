import { Injectable } from '@angular/core';
import { Lifeguard, Schedule } from '../models/lifeguard';
import { Activity, DEFAULT_ACTIVITY } from '../models/activity';
import { appStore } from './store';
import { ActRule } from '../settings/activity-rules/activity-rules.component';
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
  rules: ActRule[] = appStore.getSnapshot().currentDayType.actRules;

  constructor() {
    appStore.getCurrentDayType().subscribe((dayType) => {
      this.rules = dayType.actRules;
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
    /*
    1. Reset all schedules of staff - except the locked
        Set for every period/slot DEFAULT_ACTIVITY
    2. Assign HOFFs - 1 for every staff members.
        In every period assign (staff num / num of periods allowed for hoff) members to that activity
    3. Fill the rest of schedule period by period
        a) Loop the periods list - except locked
            I) For every period create a counter for activities
            II) If maxed out activity - filter it ; if all maxed out - assign "Bunk time"
        b) Select staff member to assign to
            Loop the staff list or randomize member
        c) Filter available activities - availability, excluded, max/hasn't reached min
        d) Randomize activity
    */

    this.resetSchedules();
    this.assignHoffs();
    this.assignActivities();

    this.staffList = this.staffList.map((staff) => new Lifeguard(staff));
    appStore.updateState({ lifeguards: this.staffList });
  }

  /** Resets the relevant periods (of the current daytype) for all staff. Skips locked slots/staff. */
  private resetSchedules() {
    this.staffList
      .filter((s) => !s.locked)
      .forEach((s) => {
        this.periods.forEach((p) => {
          const temp = s.schedule[p.name];
          if (!temp)
            s.schedule[p.name] = {
              activity: DEFAULT_ACTIVITY.name,
              locked: false,
            };
          else if (!temp.locked)
            s.schedule[p.name] = { ...temp, activity: DEFAULT_ACTIVITY.name };
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

    const periods = this.periods.filter((p) => !p.locked);
    const randStaff = this.createUniqueRandomPicker(
      this.staffList.filter((s) => !s.locked)
    );

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
          const actName = this.randomizeFromArr(
            this.getPossibleActsInPeriod(
              activities.map((a) => a.name),
              actCounter
            )
          );
          // Assign the lifeguard to activity in current period
          currStaff.schedule[p.name].activity = actName;
          actCounter[actName] != undefined && actCounter[actName].curr++;
        }
        currStaff = randStaff();
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

  /** Returns a function that randomize a unique item from `items` */
  createUniqueRandomPicker<T>(items: T[]) {
    let picked = new Set<T>();

    return function getRandom(reset = false): T | undefined {
      if (reset) {
        picked.clear();
      }

      const remaining = items.filter((item) => !picked.has(item));
      if (remaining.length === 0) return undefined;

      const randomItem =
        remaining[Math.floor(Math.random() * remaining.length)];
      picked.add(randomItem);
      return randomItem;
    };
  }

  private resetActCounter(activities: Activity[]) {
    return activities.reduce((acc, activity) => {
      const rule = this.rules.find((r) => r.name == activity.name) || {
        name: activity.name,
        min: undefined,
        max: undefined,
      };
      acc[activity.name] = { curr: 0, min: rule.min, max: rule.max };
      return acc;
    }, {} as { [key: string]: { curr: number; min: number | undefined; max: number | undefined } });
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

  //#region PREVIOUS METHODS

  generateScheduleOLD() {
    const rulesCount = this.rules.reduce(
      (acc: { [key: string]: { max: number; min: number } }, rule) => {
        acc[rule.name] = { max: rule.max ?? 0, min: rule.min ?? 0 };
        return acc;
      },
      {}
    );
    const hasHoff = this.staffList.reduce(
      (acc: { [key: string]: boolean }, staff) => {
        let flag = false;
        if (staff.schedule) {
          for (const period in staff.schedule) {
            if (
              staff.schedule[period].activity === 'HOFF' &&
              staff.schedule[period].locked
            ) {
              flag = true;
              break;
            }
          }
        }
        acc[staff.name] = flag;
        return acc;
      },
      {}
    );

    this.periods.forEach((period) => {
      if (period.locked) return;

      let periodicalActivityCount = this.resetActivityCount();
      this.staffList.forEach((staff) => {
        if (staff.schedule) {
          const periodAssign = staff.schedule[period.name];
          if (periodAssign && (periodAssign.locked || staff.locked))
            periodicalActivityCount[periodAssign.activity]++;
        }
      });

      this.staffList.forEach((staff) => {
        if (staff.locked || staff.schedule[period.name]?.locked) return;

        const allowHoff =
          !hasHoff[staff.name] &&
          periodicalActivityCount['HOFF'] < rulesCount['HOFF'].max;

        const activity = this.randomizeActivity(allowHoff);
        staff.schedule[period.name] = staff.schedule[period.name]
          ? { ...staff.schedule[period.name], activity: activity.name }
          : { activity: activity.name, locked: false };
        periodicalActivityCount[activity.name]++;

        if (activity.name === 'HOFF') {
          hasHoff[staff.name] = true;
          staff.schedule[period.name].pm = false;
        }
      });
    });

    this.staffList = this.staffList.map((staff) => new Lifeguard(staff));
    appStore.updateState({ lifeguards: this.staffList });
  }

  private randomizeActivity(allowHoff: boolean = true): Activity {
    const allowedActivities = allowHoff
      ? this.activities
      : this.activities.filter((act) => act.name !== 'HOFF');

    return this.randomizeFromArr(allowedActivities);
  }

  private resetActivityCount(): { [key: string]: number } {
    return this.activities.reduce((acc, activity) => {
      acc[activity.name] = 0;
      return acc;
    }, {} as { [key: string]: number });
  }

  //#endregion
}
