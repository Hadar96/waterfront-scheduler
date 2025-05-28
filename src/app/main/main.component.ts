import { Component } from '@angular/core';
import { appStore } from '../services/store';
import { DayType } from '../models/daytype';
import { Activity, DEFAULT_ACTIVITY } from '../models/activity';
import { DbService } from '../services/db.service';
import { UtilsService } from '../services/utils.service';
import { Lifeguard } from '../models/lifeguard';
import { ExcelExportService } from '../services/excel.service';
import { DAYCAMP_NAME } from '../models/period';

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
  today: string | number | Date;

  constructor(
    private dbService: DbService,
    private utils: UtilsService,
    private xls: ExcelExportService
  ) {
    this.appData$ = appStore.getState();
    this.activities = appStore.getSnapshot().activities;
    this.dayTypes = appStore.getSnapshot().daytypes;
    this.currDayType = appStore.getSnapshot().currentDayType;
    this.today = new Date();
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
    staff.forEach((lg: Lifeguard) => {
      lg.locked = this.isAllLocked;
      Object.keys(lg.schedule).forEach((period) => {
        lg.schedule[period].locked = this.isAllLocked;
      });
    });
    appStore.updateState({ lifeguards: staff });
  }

  clearAll() {
    this.utils.resetSchedules(true);
  }

  async exportExcel() {
    await this.xls.exportColoredScheduleWithExcelJS();
  }

  updateDaycampCounter() {
    const staff = appStore.getSnapshot().lifeguards;
    staff
      .filter(
        (s) =>
          s.schedule[DAYCAMP_NAME] &&
          this.IsMainActivity(s.schedule[DAYCAMP_NAME].activity)
      )
      .forEach((s) => s.daycampCount++);
    appStore.updateState({ lifeguards: staff });
  }

  checkDaycampExist() {
    return (
      appStore
        .getSnapshot()
        .currentDayType.periods.find((p) => p.name === DAYCAMP_NAME) !==
      undefined
    );
  }

  private IsMainActivity(actName: string): boolean {
    return !!this.activities.find((act) => act.name === actName)?.isMain;
  }
}
