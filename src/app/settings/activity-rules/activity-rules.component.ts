import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity } from 'src/app/models/activity';
import { appStore } from 'src/app/services/store';

export type ActRule = {
  name: string;
  min: number | undefined;
  max: number | undefined;
};

@Component({
  selector: 'activity-rules',
  templateUrl: './activity-rules.component.html',
  styleUrls: ['./activity-rules.component.scss'],
})
export class ActivityRulesComponent {
  @Input() rules: ActRule[] = []; // Input from parent
  @Output() rulesChange = new EventEmitter<ActRule[]>(); // Output to parent

  activities$: Observable<Activity[]> = appStore.getActivities();
  activities: Activity[] = [];
  showForm: boolean = false;

  constructor() {
    this.activities$.subscribe((activities) => {
      this.activities = activities;
    });
  }

  saveRule(rule: ActRule) {
    // Check if the rule already exists
    const existingRule = this.rules.some((r) => r.name === rule.name);
    if (existingRule) {
      this.rules = this.rules.map((r) => (r.name === rule.name ? rule : r));
    } else {
      // Add new rule if it represents a valid activity and not already in rules
      if (this.activities.find((activity) => activity.name === rule.name)) {
        this.rules.push(rule);
      }
    }

    // Remove duplicates or invalid rules
    this.rules = this.rules.filter(
      (act, index, self) =>
        index === self.findIndex((a) => a.name === act.name) &&
        this.activities.some((activity) => activity.name === act.name)
    );

    this.rulesChange.emit(this.rules); // Emit updated rules to parent
    this.showForm = false;
  }

  deleteRule(actName: string) {
    this.rules = this.rules.filter((r) => r.name !== actName);
    this.rulesChange.emit(this.rules); // Emit updated rules to parent
  }
}
