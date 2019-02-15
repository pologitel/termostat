import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class ApiBackService {

  constructor(
      private http: HttpClient
  ) { }

  changeTemperature(): Observable<any> {
    return of('changeTemperature');
  }

  deleteTermostat(idTermostat: string): Observable<any> {
    return of ('deleteTermostat');
  }
}
