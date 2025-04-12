import { Component } from '@angular/core';
import { appStore } from '../services/store';
import { DayType } from '../models/daytype';
import { Activity } from '../models/activity';
import { DbService } from '../services/db.service';
import { UtilsService } from '../services/utils.service';

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
  isAllLocked: boolean = false;

  constructor(private dbService: DbService, private utils: UtilsService) {
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

  saveAllChanges() {
    if (this.dbService.saveDataToLocalStorage(appStore.getSnapshot())) {
      console.log('Data saved successfully to local storage.');
    } else {
      console.error('Error saving data to local storage.');
    }
  }

  generateSchedule() {
    this.utils.generateSchedule();
  }

  lockAll() {
    this.isAllLocked = !this.isAllLocked;
    const staff = appStore.getSnapshot().lifeguards;
    staff.forEach((lg) => (lg.locked = this.isAllLocked));
    appStore.updateState({ lifeguards: staff });
  }

  exportExcel() {
    throw new Error('Method not implemented.');
  }
}
