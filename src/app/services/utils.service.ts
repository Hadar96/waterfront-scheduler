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
  settings = appStore.getSnapshot().switchesState;

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
    appStore.getSwitchesState().subscribe((switchesState) => {
      this.settings = switchesState;
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
    if (this.settings?.lt) this.assignManagers();

    this.staffList = this.staffList.map((staff) => new Lifeguard(staff));
    appStore.updateState({ lifeguards: this.staffList });
  }

  /** Resets the relevant periods (of the current daytype) for all staff. Skips locked slots/staff. */
  resetSchedules(updateStore: boolean = false) {
    this.staffList
      .filter((s) => !s.locked)
      .forEach((s) => {
        this.periods
          .filter((p) => p.workingPeriod)
          .filter((p) => !p.locked)
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

    if (updateStore) {
      this.staffList = this.staffList.map((staff) => new Lifeguard(staff));
      appStore.updateState({ lifeguards: this.staffList });
    }
  }

  /** Assign 1 HOFF for each staff member. Balances the HOFFs during the day */
  private assignHoffs() {
    if (!this.activities.find((a) => a.name == 'HOFF')?.available) return;

    const periods = this.periods.filter(
      (p) => !p.locked && !p.excludedActions.includes('HOFF')
    );
    let preAssignedHoffs: any = {};
    let staffLeft = this.staffList // staff members left that doesn't have HOFF yet
      .filter((s) => !s.locked)
      .filter((s) => {
        if (!s.schedule) return true;
        for (const p in s.schedule) {
          // check for a pre-assigned HOFF in the member's schedule
          if (s.schedule[p].activity == 'HOFF' && s.schedule[p].locked) {
            preAssignedHoffs[s.name] = p;
            return false;
          }
        }
        return true;
      });
    let hoffPerPeriodCount = this.getHoffCounterPerPeriod(periods);

    // assign HOFFs first to staff with HOFF buddies (if switch is on)
    if (this.settings?.hoff) {
      hoffPerPeriodCount = this.assignHoffsToBuddies(
        staffLeft.filter((s) => s.hoffCo),
        hoffPerPeriodCount,
        preAssignedHoffs
      );
      staffLeft = staffLeft.filter((s) => !s.hoffCo);
    }

    // assign HOFFs member by member
    staffLeft.forEach((lg) => {
      let randPeriod = this.randByPriority(hoffPerPeriodCount);
      while (lg.schedule[randPeriod].locked) {
        // if the period in the lg's schedule is locked (i.e unavailable), draw another one
        randPeriod = this.randByPriority(hoffPerPeriodCount);
      }
      lg.schedule[randPeriod].activity = 'HOFF';
      hoffPerPeriodCount[randPeriod]++;
    });
  }

  /** Assigns HOFFs to staff members that have a buddy (i.e. A chose B, then B should also have A) 
   @param staff - staff members with HOFF buddies
   @param counter - HOFFs counter in every period
   @param preAssignedHoffs - the list of the HOFFs that are already assigned (and probably locked) */
  private assignHoffsToBuddies(
    staff: Lifeguard[],
    counter: any,
    preAssignedHoffs: any
  ): any {
    staff.forEach((lg) => {
      // skip if already assigned by a buddy
      if (preAssignedHoffs[lg.name]) return;

      let buddy = this.staffList.find((s) => s.name == lg.hoffCo);
      let p;
      if (buddy) {
        const buddyHoff = preAssignedHoffs[buddy.name];

        // if the buddy has a HOFF assigned, assign the same period to the current lifeguard
        if (buddyHoff && !lg.schedule[buddyHoff].locked) p = buddyHoff;
        else {
          p = this.randByPriority(counter);
          while (lg.schedule[p].locked) {
            p = this.randByPriority(counter);
          }
          // if the buddy doesn't have a HOFF assigned and he isn't locked, assign a random period to both
          // if the buddy is locked it means that he's out of schedule (DOFF/sick/absent) - don't assign him a HOFF
          if (!buddyHoff && !buddy.locked) {
            buddy.schedule[p].activity = 'HOFF';
            counter[p]++;
            preAssignedHoffs[buddy.name] = p;
          }
        }
        lg.schedule[p].activity = 'HOFF';
        counter[p]++;
        preAssignedHoffs[lg.name] = p;
      }
    });

    return counter;
  }

  /** Assign the rest of available activities period by period */
  private assignActivities() {
    const randStaff = this.createUniqueRandomPicker(
      this.staffList
        .filter((s) => !s.locked)
        .filter((s) => (this.settings?.lt ? !s.isLT : true))
    );

    const periods = this.periods.filter((p) => !p.locked);
    periods.forEach((p) => {
      // what are the available activities to draw for the current period?
      let activities = this.activities
        .concat([DEFAULT_ACTIVITY])
        .filter((a) => a.available)
        .filter((a) => a.name !== 'HOFF')
        .filter((a) => !p.excludedActions.includes(a.name)); // included in period's options
      const actCounter = this.resetActCounter(activities);
      const nextCounter = this.resetActCounter(activities);

      // Draw a random staff member
      let currStaff = randStaff(true);
      while (currStaff) {
        let actName = DEFAULT_ACTIVITY.name;
        if (this.isStaffAvailable(currStaff, p)) {
          const optionalActs = this.getPossibleActsInPeriod(
            activities.map((a) => a.name),
            actCounter
          );
          actName =
            this.getActByPreferation(currStaff, optionalActs) ||
            this.randomizeFromArr(optionalActs);
          // Assign the lifeguard to activity in current period
          currStaff.schedule[p.name].activity = actName;

          if (this.settings?.smart) {
            const nextPeriod = this.getNextPeriod(
              p,
              currStaff,
              activities.find((a) => a.name == actName)!.name,
              nextCounter
            );
            if (nextPeriod) {
              currStaff.schedule[nextPeriod.name].activity = actName;
              nextCounter[actName] != undefined && nextCounter[actName].curr++;
            }
          }
        }
        // if the staff member isn't available maybe it is because this period is already assigned
        else actName = currStaff.schedule[p.name].activity; // might be DEFAULT_ACTIVITY

        // Update the activity counter if the counter has the activity as key
        actCounter[actName] != undefined && actCounter[actName].curr++;

        currStaff = randStaff();
      }
    });
  }

  /** Assign only LTs - at least 1 LT (as manager) for each activity allowed for LTs */
  private assignManagers() {
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
        if (this.isStaffAvailable(currLT, p)) {
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

  /** Returns the next period only if it is possible to assign the `activity` in it, otherwise return undefined.
   
   * Next period is unavailable if: 
   * - there is no next period (i.e. the current period is the last one) or
   * - the next period is locked or 
   * - the `activity` is excluded in it or 
   * - the `staff` is locked in it or 
   * - the period is already assigned to another activity
   * - the `activity` is not possible in the next period according to the periodical activities counter
   * @param currPeriod - the current period
   * @param staff - the staff member
   * @param actName - the activity to be assigned in the next period
   */
  private getNextPeriod(
    currPeriod: Period,
    staff: Lifeguard,
    actName: string,
    nxtCounter: any
  ): Period | undefined {
    const acts = this.activities
      .filter((a) => a.available)
      .filter((a) => a.name !== 'HOFF')
      .map((a) => a.name);
    const currIndex = this.periods.findIndex((p) => p.name == currPeriod.name);
    const nextPeriod = this.periods[currIndex + 1];

    if (
      !nextPeriod || // if there is no next period
      nextPeriod.locked || // if the next period is locked
      nextPeriod.excludedActions.includes(actName) || // if the activity is excluded in the next period
      (actName !== 'Pool' && actName !== 'Lake') || // smart assign only apply for Pool/Lake
      staff.schedule[nextPeriod.name].locked || // if the next period is locked for the staff member
      staff.schedule[nextPeriod.name].activity != DEFAULT_ACTIVITY.name || // if the next period is already assigned to another activity
      !this.getPossibleActsInPeriod(acts, nxtCounter).includes(actName) // if the activity is not possible in the next period
    )
      return undefined;
    return nextPeriod;
  }

  /** Filter the possible activities according to the periodical activities counter */
  private getPossibleActsInPeriod(actNames: string[], counter: any): string[] {
    const notReachedMin = actNames.filter(
      (a) =>
        counter[a] &&
        counter[a].min != undefined &&
        counter[a].curr < counter[a].min
    );
    if (notReachedMin.length) return notReachedMin;

    const notReachedMax = actNames.filter(
      (a) =>
        counter[a] &&
        counter[a].max != undefined &&
        counter[a].curr < counter[a].max
    );
    if (notReachedMax.length) return notReachedMax;

    const rest = actNames.filter(
      (a) => counter[a] && counter[a].max == undefined
    );
    if (rest.length) return rest;

    return [DEFAULT_ACTIVITY.name];
  }

  /** checks if the lifeguard isn't locked AND isn't locked at this period AND isn't assigend already */
  private isStaffAvailable(lg: Lifeguard, p: Period): boolean {
    return (
      !lg.locked &&
      !lg.schedule[p.name].locked &&
      lg.schedule[p.name].activity == DEFAULT_ACTIVITY.name
    );
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
          periods.find((p1) => p1.name == p) &&
          s.schedule[p].activity == 'HOFF' &&
          (s.schedule[p].locked || s.locked)
        )
          counter[p] = (counter[p] || 0) + 1;
      }
    });

    return counter;
  }

  private getActByPreferation(
    lg: Lifeguard,
    acts: string[]
  ): string | undefined {
    if (!this.settings?.actPref) return undefined;
    return lg.actPref;
  }

  /** Gets a counter object and returns a random minimal attribute */
  private randByPriority(counter: { [key: string]: number }): string {
    const minVal = Object.values(counter).sort((a, b) => a - b)[0];
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
