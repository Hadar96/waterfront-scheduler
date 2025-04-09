import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Activity, DEFAULT_ACTIVITY } from 'src/app/models/activity';
import { DayType } from 'src/app/models/daytype';
import { Lifeguard } from 'src/app/models/lifeguard';
import { appStore } from 'src/app/services/store';
import { SlotType } from '../slot/slot.component';

@Component({
  selector: 'schedule-table',
  templateUrl: './schedule-table.component.html',
  styleUrls: ['./schedule-table.component.scss'],
})
export class ScheduleTableComponent implements OnInit {
  appData$: any;
  staffList: Lifeguard[];
  activities: Activity[];
  dayTypes: DayType[];
  currDayType: DayType;
  SlotTypes = SlotType;

  constructor(private cdr: ChangeDetectorRef) {
    this.appData$ = appStore.getState();
    this.staffList = appStore.getSnapshot().lifeguards;
    this.activities = appStore
      .getSnapshot()
      .activities.concat([DEFAULT_ACTIVITY]);
    this.dayTypes = appStore.getSnapshot().daytypes;
    this.currDayType = appStore.getSnapshot().currentDayType;
  }

  ngOnInit() {
    appStore.getCurrentDayType().subscribe((dayType) => {
      this.currDayType = dayType;
    });
    appStore.getLifeguards().subscribe((lifeguards) => {
      this.staffList = [...lifeguards];
    });
  }

  getActivityColor(actName: string) {
    const activity = this.activities.find(
      (activity) => activity.name === actName
    );
    return activity ? activity.color : 'white';
  }
}
