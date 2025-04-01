import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Lifeguard } from '../models/lifeguard';
import { Activity } from '../models/activity';
import { DayType } from '../models/daytype';

export interface AppState {
  lifeguards: Lifeguard[];
  activities: Activity[];
  daytypes: DayType[];
  currentDayType: DayType | null;
}

const initialState: AppState = {
  lifeguards: [],
  activities: [],
  daytypes: [],
  currentDayType: null,
};

export class AppStore {
  private state$ = new BehaviorSubject<AppState>(initialState);

  // Get the current state as an observable
  getState() {
    return this.state$.asObservable();
  }

  /** Get the current state value */
  getSnapshot() {
    return this.state$.getValue();
  }

  // Update the state
  updateState(partialState: Partial<AppState>) {
    const currentState = this.state$.getValue();
    // console.log('Current State:', currentState);
    // console.log('Partial State:', partialState);
    this.state$.next({ ...currentState, ...partialState });
  }

  // Reset the state to the initial state
  resetState() {
    this.state$.next(initialState);
  }

  // Specific getters for new properties
  getLifeguards() {
    return this.getState().pipe(map((state) => state.lifeguards));
  }

  getActivities() {
    return this.state$.asObservable().pipe(map((state) => state.activities));
  }

  getCurrentDayType() {
    return this.state$
      .asObservable()
      .pipe(map((state) => state.currentDayType));
  }

  getAllDayTypes() {
    return this.state$.asObservable().pipe(map((state) => state.daytypes));
  }
}

export const appStore = new AppStore();
