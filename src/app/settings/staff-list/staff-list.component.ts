import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Activity } from 'src/app/models/activity';
import { Lifeguard } from 'src/app/models/lifeguard';
import { appStore } from 'src/app/services/store';

@Component({
  selector: 'staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss'],
})
export class StaffListComponent {
  staffList$: Observable<Lifeguard[]>;
  staffList: Lifeguard[];
  selectedStaff: Lifeguard;
  showForm: boolean = false;
  lifeguardForm: FormGroup;
  switchesState: any;
  mainActs: Activity[];

  constructor() {
    this.staffList$ = appStore.getLifeguards();
    this.staffList = appStore.getSnapshot().lifeguards;
    this.selectedStaff = this.staffList[0];
    this.mainActs = appStore.getSnapshot().activities.filter((a) => a.isMain);
    this.lifeguardForm = new FormGroup({
      name: new FormControl(),
      zonePreference: new FormControl<string | undefined>(undefined),
      hoffCoPref: new FormControl(),
      isLT: new FormControl(),
      daycamp: new FormControl(),
    });
    this.switchesState = appStore.getSnapshot().switchesState;

    this.updateFormWithSelectedStaff();
  }

  updateFormWithSelectedStaff() {
    if (this.selectedStaff) {
      this.lifeguardForm.patchValue({
        name: this.selectedStaff.name,
        zonePreference: this.selectedStaff.actPref,
        hoffCoPref: this.selectedStaff.hoffCo,
        isLT: this.selectedStaff.isLT,
        daycamp: this.selectedStaff.daycampCount,
      });
    }
  }

  addStaff() {
    this.selectedStaff = new Lifeguard('');
    this.showForm = true;
    this.updateFormWithSelectedStaff(); // Update the form with the new staff
  }

  deleteStaff() {
    if (this.selectedStaff?.name) {
      this.staffList = this.staffList.filter(
        (staff) => staff.name !== this.selectedStaff.name
      );
    }

    appStore.updateState({
      lifeguards: this.staffList,
    });

    this.showForm = false;
    this.selectedStaff = this.staffList[0];
    this.updateFormWithSelectedStaff(); // Update the form with the new selected staff
  }

  editStaff() {
    this.showForm = true;
    this.updateFormWithSelectedStaff(); // Ensure the form is updated when editing
  }

  cancel() {
    this.showForm = false;
  }

  onSubmit() {
    const oldBuddyName = this.selectedStaff.hoffCo; // in case the buddy is changed

    this.selectedStaff.name = this.lifeguardForm.value.name;
    this.selectedStaff.actPref = this.lifeguardForm.value.zonePreference;
    this.selectedStaff.hoffCo = this.lifeguardForm.value.hoffCoPref;
    this.selectedStaff.isLT = this.lifeguardForm.value.isLT;
    this.selectedStaff.daycampCount = this.lifeguardForm.value.daycamp;
    this.staffList.push(this.selectedStaff);

    // Remove duplicates
    this.staffList = this.staffList.filter(
      (staff, index, self) =>
        index === self.findIndex((s) => s.name === staff.name)
    );

    // Set HOFF buddies -> if A chose B, then B should also have A as a buddy
    if (this.lifeguardForm.value.hoffCoPref) {
      const oldBuddy = this.staffList.find((s) => s.name === oldBuddyName);
      if (oldBuddy) oldBuddy.hoffCo = undefined;

      const buddy = this.staffList.find(
        (s) => s.name === this.lifeguardForm.value.hoffCoPref
      );
      if (buddy) buddy.hoffCo = this.selectedStaff.name;
    }

    // Update the app state
    appStore.updateState({
      lifeguards: this.staffList,
    });
    this.showForm = false;
  }
}
