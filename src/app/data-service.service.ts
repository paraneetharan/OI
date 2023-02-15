import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {

  constructor(private http: HttpClient) { }

  public get_data() {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.get('https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY', { headers: headers })
  }
}
