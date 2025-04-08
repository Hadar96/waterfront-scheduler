import { Component } from '@angular/core';
import { appStore } from '../services/store';
import { DayType } from '../models/daytype';
import { Lifeguard } from '../models/lifeguard';
import { Period } from '../models/period';
import { Activity } from '../models/activity';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  appData$: any;
  activities: Activity[];
  dayTypes: DayType[];
  currDayType: DayType;

  constructor() {
    this.appData$ = appStore.getState();
    this.activities = appStore.getSnapshot().activities;
    this.dayTypes = appStore.getSnapshot().daytypes;
    this.currDayType = appStore.getSnapshot().currentDayType;
  }

  onDayTypeChange(selected: DayType): void {
    appStore.updateState({
      currentDayType: selected,
    });
  }

  changeActStatus(act: Activity) {
    const activity = this.activities.find(
      (activity) => activity.name === act.name
    );
    if (activity) {
      activity.available = !activity.available;
      appStore.updateState({
        activities: this.activities,
      });
    }
  }
}
