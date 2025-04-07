import { Component } from '@angular/core';
import { Activity } from 'src/app/models/activity';
import { DayType } from 'src/app/models/daytype';
import { Lifeguard } from 'src/app/models/lifeguard';
import { appStore } from 'src/app/services/store';

@Component({
  selector: 'schedule-table',
  templateUrl: './schedule-table.component.html',
  styleUrls: ['./schedule-table.component.scss'],
})
export class ScheduleTableComponent {
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

    appStore.getCurrentDayType().subscribe((dayType) => {
      this.currDayType = dayType;
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
