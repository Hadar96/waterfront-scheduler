import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settings: any;

  constructor(private dbService: DbService) {}

  ngOnInit(): void {
    this.dbService.getData().subscribe(data => {
      this.settings = data.settings;
    });
  }

  save() {}
}
