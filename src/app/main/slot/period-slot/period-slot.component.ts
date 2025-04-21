import { Component, Input, OnInit } from '@angular/core';
import { Activity, DEFAULT_ACTIVITY } from 'src/app/models/activity';
import { Lifeguard } from 'src/app/models/lifeguard';
import { Period } from 'src/app/models/period';
import { appStore } from 'src/app/services/store';

@Component({
  selector: 'period-slot',
  templateUrl: './period-slot.component.html',
  styleUrls: ['./period-slot.component.scss'],
})
export class PeriodSlotComponent implements OnInit {
  @Input() period: Period = {} as Period;
  activities: Activity[] = appStore.getSnapshot().activities;
  openActMenu: boolean = false;
  isLocked: boolean = false;
  isDisabled: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.isLocked = this.period.locked;
    this.isDisabled = !this.period.workingPeriod;
  }

  excludeActivity(activity: Activity, event: MouseEvent) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent

    const actIdx = this.period.excludedActions?.findIndex(
      (a) => a === activity.name
    );
    if (actIdx === undefined || actIdx === -1) {
      this.period.excludedActions.push(activity.name);
    } else {
      this.period.excludedActions.splice(actIdx, 1);
    }
    this.updateState();
  }

  lockSlot(event: any) {
    this.isLocked = event.checked;
    this.period.locked = event.checked;
    this.updateState();
    this.openActMenu = false;
  }

  clearActivities() {
    appStore.updateState({
      lifeguards: appStore.getSnapshot().lifeguards.map((l) => {
        if (l.schedule[this.period.name])
          l.schedule[this.period.name].activity = DEFAULT_ACTIVITY.name;
        return new Lifeguard(l);
      }),
    });
  }

  isActAvailable(activity: Activity): boolean {
    return !!this.period.excludedActions.find((a) => a === activity.name);
  }

  //#region Private Methods
  private updateState() {
    const currentDayType = appStore.getSnapshot().currentDayType;
    const periods = currentDayType.periods.map((p) => {
      if (p.name === this.period.name) {
        return this.period;
      }
      return p;
    });
    currentDayType.periods = periods;
    appStore.updateState({ currentDayType });
  }
  //#endregion
}
