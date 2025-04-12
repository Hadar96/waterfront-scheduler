import { Injectable } from '@angular/core';
import { Lifeguard } from '../models/lifeguard';
import { Activity } from '../models/activity';
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
          if (periodAssign?.locked || staff.locked) periodicalActivityCount[periodAssign.activity]++;
        }
      });
      this.staffList.forEach((staff) => {
        if (staff.locked || staff.schedule[period.name]?.locked) return;

        const allowHoff =
          !hasHoff[staff.name] && periodicalActivityCount['HOFF'] < rulesCount['HOFF'].max;
        const activity = this.randomizeActivity(allowHoff);
        staff.schedule[period.name] = staff.schedule[period.name]
          ? { ...staff.schedule[period.name], activity: activity.name }
          : { activity: activity.name, locked: false };
        periodicalActivityCount[activity.name]++;

        if (activity.name === 'HOFF') {
          hasHoff[staff.name] = true;
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

    const randomIndex = Math.floor(Math.random() * allowedActivities.length);
    return allowedActivities[randomIndex];
  }

  private resetActivityCount(): { [key: string]: number } {
    return this.activities.reduce((acc, activity) => {
      acc[activity.name] = 0;
      return acc;
    }, {} as { [key: string]: number });
  }
}
