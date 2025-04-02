import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';
import { appStore } from '../services/store';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  constructor(private dbService: DbService) {}

  ngOnInit(): void {}

  saveAllChanges() {
    const updatedData = this.cleanData(appStore.getSnapshot());
    if (this.dbService.saveDataToLocalStorage(updatedData)) {
      console.log('Data saved successfully to local storage.');
    } else {
      console.error('Error saving data to local storage.');
    }
  }

  restoreData() {
    this.dbService.cleanDataFromLocalStorage();
  }

  private cleanData(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.cleanData(item));
    } else if (typeof data === 'object' && data !== null) {
      return Object.keys(data).reduce((acc, key) => {
        const newKey = key.replace(/_/g, ''); // Remove underscores from the key
        acc[newKey] = this.cleanData(data[key]); // Recursively clean the value
        return acc;
      }, {} as any);
    }
    // If the data is a primitive value, return it as is
    return data;
  }
}
