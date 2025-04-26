import { Component, OnInit } from '@angular/core';
import { DbService } from './services/db.service';
import { appStore, AppState } from './services/store';
import { delay, finalize, map } from 'rxjs';
import { DayType } from './models/daytype';
import { Period } from './models/period';
import { Activity } from './models/activity';
import { Lifeguard } from './models/lifeguard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'waterfront-scheduler';
  isLoading = true; // Control loading state
  typeday$ = appStore.getCurrentDayType();

  constructor(private db: DbService) {}

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.db
      .getData()
      .pipe(
        delay(1000),
        map(data => this.convertToStoreState(data)),
        finalize(() => (this.isLoading = false))
      )
      .subscribe(
        (data) => {
          appStore.updateState(data);
        },
        (err) => {
          console.error('Failed to load data', err);
          // alert('Failed to load data');
        }
      );
  }

  private convertToStoreState(data: any): AppState {
    const daytypes: DayType[] = this.convertDayTypes(data.daytypes);
    return {
      daytypes,
      lifeguards: this.convertLifeguards(data.lifeguards),
      activities: this.convertActivities(data.activities),
      currentDayType: this.convertCurrentDayType(data.currentDayType, daytypes),
    };
  }

  private convertDayTypes(rawTypes: any): DayType[] {
    const daytypes: DayType[] = [];
    rawTypes.forEach((rawType: any) => {
      const periods: Period[] = this.convertPeriods(rawType.periods);
      const daytype: DayType = new DayType(
        rawType.name,
        periods
      );
      daytypes.push(daytype);
    });
    return daytypes;
  }

  private convertPeriods(raw: any): Period[] {
    const periods: Period[] = [];
    raw.forEach((p: any) => {
      const period: Period = new Period(
        p.name,
        p.start,
        p.end,
        p.workingPeriod,
        p.locked,
        p.excludedActions
      );
      periods.push(period);
    });
    return periods;
  }

  private convertLifeguards(raw: any): any {
    const guards: Lifeguard[] = [];
    raw.forEach((g: any) => {
      const guard: Lifeguard = new Lifeguard(
        g.name,
        g.schedule,
        g.isLT,
        g.preferPool,
        g.hoffCo,
        g.locked,
        g.daycampCount,
        g.partyCount
      );
      guards.push(guard);
    });
    return guards;
  }

  private convertActivities(raw: any): any {
    const actions: Activity[] = [];
    raw.forEach((a: any) => {
      const action: Activity = new Activity(a.name, a.color, a.min, a.max);
      actions.push(action);
    });
    return actions;
  }

  private convertCurrentDayType(rawType: any, types: DayType[]): DayType {
    for (const type of types) {
      if (type.name === rawType) {
        return type;
      }
    }
    return types[0]; // Default to the first type if not found
  }
}
