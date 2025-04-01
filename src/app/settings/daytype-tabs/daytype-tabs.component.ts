import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Observable } from 'rxjs';
import { DayType } from 'src/app/models/daytype';
import { appStore } from 'src/app/services/store';
import { ActRule } from '../activity-rules/activity-rules.component';
import { Period } from 'src/app/models/period';

@Component({
  selector: 'daytype-tabs',
  templateUrl: './daytype-tabs.component.html',
  styleUrls: ['./daytype-tabs.component.scss'],
})
export class DaytypeTabsComponent {
  daytypeList$: Observable<DayType[]>;
  typeList: DayType[];
  selectedType: DayType;
  daytypeForm: FormGroup;
  selectedIndex: number = 0;

  constructor() {
    this.daytypeList$ = appStore.getAllDayTypes();
    this.typeList = appStore.getSnapshot().daytypes;
    this.selectedType = this.typeList[this.selectedIndex];
    this.daytypeForm = new FormGroup({
      name: new FormControl(),
    });

    this.updateFormWithSelected();
  }

  onRulesChange(updatedRules: ActRule[]) {
    this.selectedType.actRules = updatedRules;
    this.updateSelectedTypeInList();
  }

  onPeriodsChange(updatedPeriods: Period[]) {
    this.selectedType.periods = updatedPeriods;
    this.updateSelectedTypeInList();
  }

  onTabChange($event: MatTabChangeEvent) {
    this.selectedIndex = $event.index;
    this.selectedType = this.typeList[this.selectedIndex];
    this.updateFormWithSelected();
  }

  updateSelectedTypeInList() {
    if (this.selectedType) {
      this.typeList[this.selectedIndex] = this.selectedType;
    }
  }

  updateFormWithSelected() {
    if (this.selectedType) {
      this.daytypeForm.patchValue({
        name: this.selectedType.name,
      });
    }
  }

  addTab() {
    this.typeList.push(new DayType('New type...', []));
    this.selectedIndex = this.typeList.length - 1;
    this.selectedType = this.typeList[this.selectedIndex];
    this.updateFormWithSelected(); // Update the form with the new staff
  }

  deleteTab() {
    if (this.selectedType?.name) {
      this.typeList = this.typeList.filter(
        (act) => act.name !== this.selectedType.name
      );
    }

    appStore.updateState({
      daytypes: this.typeList,
    });

    this.selectedType = this.typeList[0];
    this.updateFormWithSelected(); // Update the form with the new selected staff
  }

  cancel() {
    this.selectedType = this.typeList[this.selectedIndex];
    this.updateFormWithSelected();
  }

  saveTab() {
    this.selectedType.name = this.daytypeForm.value.name;
    const existingType = this.typeList.some(
      (dt) => dt.name === this.selectedType.name
    );
    if (existingType) {
      this.typeList[this.selectedIndex] = this.selectedType;
    } else {
      this.typeList.push(this.selectedType);
    }

    // Update the app state
    appStore.updateState({
      daytypes: this.typeList,
    });
  }
}
