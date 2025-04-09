import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private dbFilePath = 'assets/app-data.json';
  private localStorageKey = 'waterfrontSchedulerData';

  constructor(private http: HttpClient) {}

  /** Get app data from local storage.
   * If not exists, fetch from the database file.
   * @returns Observable of the data
   */
  getData(): Observable<any> {
    const localData = this.getDataFromLocalStorage();
    if (localData) {
      return new Observable((observer) => {
        observer.next(localData);
        observer.complete();
      });
    } else {
      return this.http.get(this.dbFilePath);
    }
  }

  getDataFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.localStorageKey);
      if (data) return JSON.parse(data);
    } catch (error) {
      return null;
    }
    return null;
  }

  clearDataFromLocalStorage() {
    try {
      localStorage.removeItem(this.localStorageKey);
    } catch (error) {
      console.error('Error cleaning local storage:', error);
    }
  }

  // Method to save data to the database file
  saveDataToLocalStorage(data: any): boolean {
    const cData = this.cleanData(data); // Clean the data before saving
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(cData));
      return true;
    } catch (error) {
      console.error('Error saving data to local storage:', error);
      return false;
    }
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
