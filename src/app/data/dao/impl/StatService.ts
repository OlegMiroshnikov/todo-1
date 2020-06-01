import {Observable} from 'rxjs';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StatDAO} from '../interface/StatDAO';
import {Stat} from '../../../model/Stat';

export const STAT_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
  providedIn: 'root'
})

// класс не реализовывает и не наследует, т.к. у него только 1 метод
export class StatService implements StatDAO {

  constructor(@Inject(STAT_URL_TOKEN) private baseUrl,
              private http: HttpClient
  ) {
  }

  // общая статистика
  getOverallStat(): Observable<Stat> {
    return this.http.get<Stat>(this.baseUrl);
  }


}
