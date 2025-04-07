import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Activity, DEFAULT_ACTIVITY } from 'src/app/models/activity';
import { Lifeguard } from 'src/app/models/lifeguard';
import { Period } from 'src/app/models/period';
import { appStore } from 'src/app/services/store';

@Component({
  selector: 'slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.scss'],
})
export class SlotComponent implements OnInit {
  @Input() lifeguard: Lifeguard = {} as Lifeguard;
  @Input() period: Period = {} as Period;
  activity: Activity = DEFAULT_ACTIVITY;
  activities: Activity[] = appStore
    .getSnapshot()
    .activities.concat([DEFAULT_ACTIVITY]);
  openActMenu: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.activity =
      this.activities.find(
        (a) => a.name === this.lifeguard.schedule[this.period.name]
      ) ?? DEFAULT_ACTIVITY;
  }

  changeActivity(activity: Activity, event: MouseEvent) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent
    this.activity = activity;
    this.lifeguard.schedule[this.period.name] = activity.name;

    const lifeguards = appStore.getSnapshot().lifeguards.map((lg) => {
      if (lg.name === this.lifeguard.name) {
        return this.lifeguard;
      }
      return lg;
    });

    appStore.updateState({ lifeguards });
    this.openActMenu = false; // Close the menu after selecting an activity
  }
}
