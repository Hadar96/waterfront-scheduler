import { Component, Input, OnInit } from '@angular/core';
import { Activity, DEFAULT_ACTIVITY } from 'src/app/models/activity';
import { Lifeguard } from 'src/app/models/lifeguard';
import { Period } from 'src/app/models/period';
import { appStore } from 'src/app/services/store';

export enum SlotType {
  HEAD = 'head',
  ACTIVITY = 'activity',
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
  SlotTypes = SlotType;

  constructor() {}

  ngOnInit(): void {
    this.activity =
      this.activities.find(
        (a) => a.name === this.lifeguard.schedule[this.period.name]?.activity
      ) ?? DEFAULT_ACTIVITY;
  }

  //#region head type methods
  changeActivity(activity: Activity, event: MouseEvent) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent
    this.activity = activity;
    this.lifeguard.schedule[this.period.name].activity = activity.name;

    this.updateState();
    this.openActMenu = false; // Close the menu after selecting an activity
  }

  lockSlot(event: any) {
    event.stopPropagation();
    this.lifeguard.schedule[this.period.name].locked = event.checked;
    this.updateState();
    this.openActMenu = false;
  }
  //#endregion

  //#region Lifeguard type methods
  setLifeguardDay(act: Activity, lg: Lifeguard, $event: MouseEvent) {
    $event.stopPropagation();

    Object.keys(lg.schedule).forEach((period) => {
      lg.schedule[period].activity = act.name;
    });
    const index = this.staffList.findIndex((l) => l.name === lg.name);
    if (index !== -1) this.staffList[index] = new Lifeguard(lg); // Create a new instance to trigger change detection

    appStore.updateState({ lifeguards: this.staffList });
    this.openActMenu = false;
  }
  //#endregion

  //#region Private Methods
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
