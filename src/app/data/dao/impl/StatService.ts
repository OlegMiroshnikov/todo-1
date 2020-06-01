import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StatDAO} from '../interface/StatDAO';
import {Stat} from '../../../model/Stat';

@Injectable({
  providedIn: 'root'
})

export class StatService implements StatDAO {

  url = 'http://localhost:8080/stat';

  constructor(private http: HttpClient) {
  }

  getOverallStat(): Observable<Stat> {
    return this.http.get<Stat>(this.url);
  }


}
