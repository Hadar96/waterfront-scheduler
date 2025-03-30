import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private dbFilePath = 'assets/app-data.json'; // Path to your database file

  constructor(private http: HttpClient) {}

  // Method to fetch data from the database file
  getData(): Observable<any> {
    return this.http.get<any>(this.dbFilePath);
  }
}
