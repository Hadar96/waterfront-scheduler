import { Component } from '@angular/core';

@Component({
  selector: 'staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss'],
})
export class StaffListComponent {
  selectedStaff: any;
  staffList: any;
  staffControl: any;

  constructor() {
    this.staffList = [
      { name: 'John Doe', id: 1 },
      { name: 'Jane Smith', id: 2 },
      { name: 'Alice Johnson', id: 3 },
      { name: 'Bob Brown', id: 4 },
    ];
    this.selectedStaff = this.staffList[0];
  }
}
