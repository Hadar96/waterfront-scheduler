import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Lifeguard } from '../models/lifeguard';
import { Activity } from '../models/activity';
import { DayType } from '../models/daytype';

export interface AppState {
  lifeguards: Lifeguard[];
  activities: Activity[];
  daytypes: DayType[];
  currentDayType: DayType;
}

const initialState: AppState = {
  lifeguards: [],
  activities: [],
  daytypes: [],
  currentDayType: {} as DayType,
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
    const staff: Lifeguard[] = partialState.lifeguards
      ? this.sortStaff(partialState.lifeguards)
      : this.getSnapshot().lifeguards;
    partialState.lifeguards = staff;

    const currentState = this.state$.getValue();
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

  private sortStaff(staff: Lifeguard[]): Lifeguard[] {
    const lt = staff
      .filter((lg) => lg.isLT)
      .sort((a, b) => a.name.localeCompare(b.name));
    const nonLt = staff
      .filter((lg) => !lg.isLT)
      .sort((a, b) => a.name.localeCompare(b.name));
    return nonLt.concat(lt);
  }
}

export const appStore = new AppStore();
