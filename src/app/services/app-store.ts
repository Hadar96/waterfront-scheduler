import { BehaviorSubject } from 'rxjs';

export interface AppState {
    user: { id: string; name: string } | null;
    settings: { theme: string; language: string };
    notifications: { id: string; message: string; read: boolean }[];
}

const initialState: AppState = {
    user: null,
    settings: { theme: 'light', language: 'en' },
    notifications: [],
};

export class AppStore {
    private state$ = new BehaviorSubject<AppState>(initialState);

    // Get the current state as an observable
    getState() {
        return this.state$.asObservable();
    }

    // Get the current state value
    getSnapshot() {
        return this.state$.getValue();
    }

    // Update the state
    updateState(partialState: Partial<AppState>) {
        const currentState = this.state$.getValue();
        this.state$.next({ ...currentState, ...partialState });
    }

    // Reset the state to the initial state
    resetState() {
        this.state$.next(initialState);
    }
}

export const appStore = new AppStore();