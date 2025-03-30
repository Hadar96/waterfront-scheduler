import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SettingsComponent } from './settings/settings.component';
import { MainComponent } from './main/main.component';
import { StaffListComponent } from './settings/staff-list/staff-list.component';
import { ActionListComponent } from './settings/action-list/action-list.component';
import { DaytypeTabsComponent } from './settings/daytype-tabs/daytype-tabs.component';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    MainComponent,
    StaffListComponent,
    ActionListComponent,
    DaytypeTabsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule, // Required for Angular Material
    HttpClientModule, // Import HttpClientModule here
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
