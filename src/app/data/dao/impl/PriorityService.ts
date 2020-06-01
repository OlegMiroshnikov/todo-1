import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {CommonService} from './CommonService';
import {Priority} from '../../../model/Priority';
import {PriorityDAO} from '../interface/PriorityDAO';
import {PrioritySearchValues} from '../search/SearchObjects';

export const PRIORITY_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
  providedIn: 'root'
})

export class PriorityService extends CommonService<Priority> implements PriorityDAO {

  constructor(@Inject(PRIORITY_URL_TOKEN) private baseUrl,
              private http: HttpClient // для выполнения HTTP запросов
  ) {
    super(baseUrl, http);
  }

  findPriorities(prioritySearchValues: PrioritySearchValues) {
    return this.http.post<Priority[]>(this.baseUrl + '/search', prioritySearchValues);
  }

}
