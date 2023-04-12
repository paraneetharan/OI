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
  public get1(date){
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
    let params = new HttpParams().set('reqType', 'niftyoilist')
    // params = params.set('reqDate', date)
    return this.http.get('https://webapi.niftytrader.in/webapi/Option/oi-data', { headers: headers, params: params })
  }
  public get(){
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.get('https://oi-api.onrender.com/oi-data', { headers: headers })
    // return this.http.get('https://subtle-tiramisu-6b1716.netlify.app/.netlify/functions/api/oi-data', { headers: headers })
  }
}
