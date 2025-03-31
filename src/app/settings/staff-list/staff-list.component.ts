import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
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

  constructor() {
    this.staffList$ = appStore.getLifeguards();
    this.staffList = appStore.getSnapshot().lifeguards;
    this.selectedStaff = this.staffList[0];
    this.lifeguardForm = new FormGroup({
      name: new FormControl(),
      zonePreference: new FormControl<boolean | undefined>(undefined),
      hoffCoPref: new FormControl(),
    });

    this.updateFormWithSelectedStaff();
  }

  updateFormWithSelectedStaff() {
    if (this.selectedStaff) {
      this.lifeguardForm.patchValue({
        name: this.selectedStaff.name,
        zonePreference: this.selectedStaff.preferPool,
        hoffCoPref: this.selectedStaff.hoffCo,
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
    this.selectedStaff.name = this.lifeguardForm.value.name;
    this.selectedStaff.preferPool = this.lifeguardForm.value.zonePreference;
    this.selectedStaff.hoffCo = this.lifeguardForm.value.hoffCoPref;
    this.staffList.push(this.selectedStaff);
    
    // Remove duplicates
    this.staffList = this.staffList.filter(
      (staff, index, self) =>
        index === self.findIndex((s) => s.name === staff.name)
    );

    // Update the app state
    appStore.updateState({
      lifeguards: this.staffList,
    });
    this.showForm = false;
  }
}
