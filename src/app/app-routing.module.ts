import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component'; // Import the SettingsComponent
import { MainComponent } from './main/main.component'; // Import the MainComponent

const routes: Routes = [
  { path: '', component: MainComponent }, // Set MainComponent as the default route
  { path: 'settings', component: SettingsComponent }, // Add the /settings route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
