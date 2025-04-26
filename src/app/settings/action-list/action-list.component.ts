import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Activity } from 'src/app/models/activity';
import { appStore } from 'src/app/services/store';

@Component({
  selector: 'action-list',
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.scss'],
})
export class ActionListComponent {
  actList$: Observable<Activity[]>;
  actList: Activity[];
  selectedAct: Activity;
  showForm: boolean = false;
  activityForm: FormGroup;

  constructor() {
    this.actList$ = appStore.getActivities();
    this.actList = appStore.getSnapshot().activities;
    this.selectedAct = this.actList[0];
    this.activityForm = new FormGroup({
      name: new FormControl(),
      color: new FormControl(),
      min: new FormControl(),
      max: new FormControl(),
      allowLT: new FormControl(),
    });

    this.updateFormWithSelected();
  }

  updateFormWithSelected() {
    if (this.selectedAct) {
      this.activityForm.patchValue({
        name: this.selectedAct.name,
        color: this.selectedAct.color,
        min: this.selectedAct.min,
        max: this.selectedAct.max,
        allowLT: this.selectedAct.allowLT,
      });
    }
  }

  addAct() {
    this.selectedAct = new Activity('');
    this.showForm = true;
    this.updateFormWithSelected(); // Update the form with the new staff
  }

  deleteAct() {
    if (this.selectedAct?.name) {
      this.actList = this.actList.filter(
        (act) => act.name !== this.selectedAct.name
      );
    }

    appStore.updateState({
      activities: this.actList,
    });

    this.showForm = false;
    this.selectedAct = this.actList[0];
    this.updateFormWithSelected(); // Update the form with the new selected staff
  }

  editAct() {
    this.showForm = true;
    this.updateFormWithSelected(); // Ensure the form is updated when editing
  }

  cancel() {
    this.showForm = false;
  }

  onSubmit() {
    this.selectedAct.name = this.activityForm.value.name;
    this.selectedAct.color = this.activityForm.value.color;
    this.selectedAct.min = this.activityForm.value.min;
    this.selectedAct.max = this.activityForm.value.max;
    this.selectedAct.allowLT = this.activityForm.value.allowLT;
    this.actList.push(this.selectedAct);

    // Remove duplicates
    this.actList = this.actList.filter(
      (act, index, self) => index === self.findIndex((a) => a.name === act.name)
    );

    // Update the app state
    appStore.updateState({
      activities: this.actList,
    });
    this.showForm = false;
  }
}
