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
  staffList: Lifeguard[];
  activities: Activity[];
  dayTypes: DayType[];
  currDayType: DayType;

  constructor() {
    this.appData$ = appStore.getState();
    this.staffList = appStore.getSnapshot().lifeguards;
    this.activities = appStore.getSnapshot().activities;
    this.dayTypes = appStore.getSnapshot().daytypes;
    this.currDayType = appStore.getSnapshot().currentDayType;

    // appStore.getCurrentDayType().subscribe((dayType) => {
    //   this.currDayType = dayType;
    // });
  }

  onDayTypeChange(selected: DayType): void {
    appStore.updateState({
      currentDayType: selected,
    });
  }

  getActivityColor(actName: string) {
    const activity = this.activities.find(
      (activity) => activity.name === actName
    );
    return activity ? activity.color : 'white';
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
