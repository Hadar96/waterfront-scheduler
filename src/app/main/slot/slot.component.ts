import { Component, Input, OnInit } from '@angular/core';
import { Activity, DEFAULT_ACTIVITY } from 'src/app/models/activity';
import { Lifeguard } from 'src/app/models/lifeguard';
import { Period } from 'src/app/models/period';
import { appStore } from 'src/app/services/store';

export enum SlotType {
  STAFF,
  PERIOD,
  ACTIVITY,
}
@Component({
  selector: 'slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.scss'],
})
export class SlotComponent implements OnInit {
  @Input() lifeguard: Lifeguard = {} as Lifeguard;
  @Input() period: Period = {} as Period;
  @Input() type: SlotType = SlotType.ACTIVITY;
  activity: Activity = DEFAULT_ACTIVITY;
  activities: Activity[] = appStore
    .getSnapshot()
    .activities.concat([DEFAULT_ACTIVITY]);
  staffList: Lifeguard[] = appStore.getSnapshot().lifeguards;
  openActMenu: boolean = false;
  isLocked: boolean = false;
  isPM: boolean = false;
  isDisabled: boolean = false;
  SlotTypes = SlotType;
  DEFAULT_ACTIVITY = DEFAULT_ACTIVITY;

  constructor() {}

  ngOnInit(): void {
    this.activity =
      this.activities.find(
        (a) => a.name === this.lifeguard.schedule[this.period.name]?.activity
      ) ?? DEFAULT_ACTIVITY;

    this.setLocked();
    this.isDisabled =
      this.type == SlotType.ACTIVITY && !this.period.workingPeriod;
    this.isPM =
      SlotType.ACTIVITY &&
      (this.lifeguard.schedule[this.period.name]?.pm ?? false);
  }

  changeActivity(activity: Activity, event: MouseEvent) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent
    this.activity = activity;

    if (this.type == SlotType.ACTIVITY) {
      const schedule = this.lifeguard.schedule[this.period.name];
      if (schedule) {
        this.lifeguard.schedule[this.period.name].activity = activity.name;
        this.lifeguard.schedule[this.period.name].locked = true;
        if (activity.name === 'HOFF')
          this.lifeguard.schedule[this.period.name].pm = false;
      } else
        this.lifeguard.schedule[this.period.name] = {
          activity: activity.name,
          locked: true,
        };
      this.updateState();
    }

    if (this.type == SlotType.STAFF) {
      Object.keys(this.lifeguard.schedule).forEach((period) => {
        this.lifeguard.schedule[period].activity = activity.name;
      });
      this.lifeguard.locked = true;

      const index = this.staffList.findIndex(
        (l) => l.name === this.lifeguard.name
      );
      if (index !== -1) this.staffList[index] = new Lifeguard(this.lifeguard); // Create a new instance to trigger change detection
      appStore.updateState({ lifeguards: this.staffList });
    }

    this.openActMenu = false; // Close the menu after selecting an activity
  }

  lockSlot(event: any) {
    this.isLocked = event.checked;
    if (this.type == SlotType.ACTIVITY)
      this.lifeguard.schedule[this.period.name].locked = event.checked;
    if (this.type == SlotType.STAFF) this.lifeguard.locked = event.checked;
    this.updateState();
    this.openActMenu = false;
  }

  setManager(event: any) {
    this.isPM = event.checked;
    if (this.type == SlotType.ACTIVITY)
      this.lifeguard.schedule[this.period.name].pm = event.checked;
    if (this.type == SlotType.STAFF) {
      for (const period in this.lifeguard.schedule) {
        if (this.lifeguard.schedule[period].activity != 'HOFF')
          this.lifeguard.schedule[period].pm = event.checked;
      }
    }
    this.updateState();
    this.openActMenu = false;
  }

  //#region Private Methods
  private setLocked() {
    if (this.type == SlotType.ACTIVITY)
      this.isLocked =
        this.lifeguard.schedule[this.period.name]?.locked ?? false;
    if (this.type == SlotType.STAFF) this.isLocked = this.lifeguard.locked;
  }

  private updateState() {
    const lifeguards = appStore.getSnapshot().lifeguards.map((lg) => {
      if (lg.name === this.lifeguard.name) {
        return this.lifeguard;
      }
      return lg;
    });

    appStore.updateState({ lifeguards });
  }
  //#endregion
}
