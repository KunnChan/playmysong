import { Injectable } from '@angular/core';
import { Configfile } from '../configfile';
import { HttpClient } from '@angular/common/http';
import { map } from "rxjs/operators";
import { Observable, BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private config: Configfile, private http: HttpClient, private storage: Storage) { 
    this.storage.get(this.config.keyAuth)
      .then(auth => {
        this.currentUserSubject = new BehaviorSubject<any>(auth);
        this.currentUser = this.currentUserSubject.asObservable();
      })
  }

  currentUserValue() {
    if(this.currentUserSubject)
      return this.currentUserSubject.value;
    return {};
  }

  login(reqData): Observable<any>{
    let body = "grant_type=password&username=" + reqData.username + "&password=" + reqData.password;
    return this.http
    .post(this.config.urlToken, body).pipe(map(user => {
        this.storage.set(this.config.keyUserName, reqData.username);
        this.storage.set(this.config.keyAuth, user)
        .then(res =>  this.getUserInfo(reqData.username))
        this.currentUserSubject.next(user);
        return user;
    }));
  }

  logout() {
    this.storage.remove(this.config.keyAuth)
    this.currentUserSubject.next(null);
  }

  refreshTokenObservable(): Observable<any> {
    // const headers = getUrlEncodedHeader();
    // const serviceUrl = ConfigProvider.serviceUrl;
    // const refresh_token = ConfigProvider.refreshToken;
    // const url = this.config.getUrl(serviceUrl, ConfigUrl.urlToken);
    // let body = "grant_type=refresh_token&refresh_token=" + refresh_token;
    // return this.http.post(url, body, { headers }).pipe(map(res => res));
    return null;
  }

  feedback(reqData): Observable<any>{
    return this.http
      .post(this.config.urlFeedback, reqData).pipe(map(user => {
          return user;
      }));
  }

  register(reqData): Observable<any>{
    return this.http
      .post(this.config.urlSaveUser, reqData).pipe(map(data => {
          return data;
      }));
  }

  getUserInfo(username){
    return this.http
      .get(this.config.urlUserInfo + username).pipe(map(data => {
          return data;
      })).subscribe(result => {
        this.storage.set(this.config.keyUserInfo, result);
      }, error => {
        console.log("Error ", error);
        
      })
  }
}
