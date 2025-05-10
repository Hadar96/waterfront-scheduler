import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';
import { appStore } from '../services/store';

enum SwitchOptions {
  HOFF,
  SMART,
  LT,
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  SwitchOptions = SwitchOptions;
  switchesState: any;

  constructor(private dbService: DbService) {}

  ngOnInit(): void {
    this.switchesState = appStore.getSnapshot().switchesState;
  }

  toggleSwitchBtn(option: SwitchOptions, event: any) {
    switch (option) {
      case SwitchOptions.HOFF:
        this.switchesState.hoff = event.checked;
        break;
      case SwitchOptions.SMART:
        this.switchesState.smart = event.checked;
        break;
      case SwitchOptions.LT:
        this.switchesState.lt = event.checked;
        break;

      default:
        break;
    }
    appStore.updateState({ switchesState: this.switchesState });
  }

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
