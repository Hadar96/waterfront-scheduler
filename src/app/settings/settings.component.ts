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
    if (this.dbService.saveDataToLocalStorage(appStore.getSnapshot())) {
      console.log('Data saved successfully to local storage.');
    } else {
      console.error('Error saving data to local storage.');
    }
  }

  restoreData() {
    this.dbService.clearDataFromLocalStorage();
  }
}
