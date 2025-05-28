import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DAYCAMP_NAME, Period } from 'src/app/models/period';

@Component({
  selector: 'period-list',
  templateUrl: './period-list.component.html',
  styleUrls: ['./period-list.component.scss'],
})
export class PeriodListComponent implements OnChanges {
  @Input() periods: Period[] = [];
  @Output() periodsChange = new EventEmitter<Period[]>();

  selected: Period;
  showForm: boolean = false;
  periodForm: FormGroup;

  constructor() {
    this.selected = this.periods[0];
    this.periodForm = new FormGroup({
      name: new FormControl(),
      start: new FormControl(),
      end: new FormControl(),
      workingPeriod: new FormControl(),
    });

    this.updateFormWithSelected();
  }

  ngOnChanges() {
    this.selected = this.periods[0];
  }

  onPeriodSelected(event: any) {
    this.selected = event;
  }

  updateFormWithSelected() {
    if (this.selected) {
      this.periodForm.patchValue({
        name: this.selected.name,
        start: this.selected.start,
        end: this.selected.end,
        workingPeriod: this.selected.workingPeriod,
      });
    }
  }

  add() {
    this.selected = new Period('', '0000', '0000');
    this.showForm = true;
    this.updateFormWithSelected(); // Update the form with the new staff
  }

  delete() {
    if (this.selected?.name) {
      this.periods = this.periods.filter((p) => p.name !== this.selected.name);
    }

    this.showForm = false;
    this.selected = this.periods[0];
    this.periodsChange.emit(this.periods); // Emit updated periods to parent
    this.updateFormWithSelected(); // Update the form with the new selected staff
  }

  edit() {
    this.showForm = true;
    this.updateFormWithSelected(); // Ensure the form is updated when editing
  }

  cancel() {
    this.showForm = false;
  }

  onSubmit() {
    this.selected.name = this.formatName(this.periodForm.value.name);
    this.selected.start = this.periodForm.value.start;
    this.selected.end = this.periodForm.value.end;
    this.selected.workingPeriod = this.periodForm.value.workingPeriod;
    this.periods.push(this.selected);

    // Remove duplicates
    this.periods = this.periods.filter(
      (act, index, self) => index === self.findIndex((a) => a.name === act.name)
    );

    this.periodsChange.emit(this.periods); // Emit updated periods to parent
    this.showForm = false;
  }

  private formatName(name: string): string {
    const normalizedName = name.toLowerCase().replace(/[\s-]/g, '');
    if (normalizedName === 'daycamp') {
      return DAYCAMP_NAME;
    }
    return name;
  }
}
