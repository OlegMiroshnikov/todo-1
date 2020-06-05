import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

// сервис для отображения спиннера загрузки
@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  visibility = new BehaviorSubject(false);

  show() {
    this.visibility.next(true);
  }

  hide() {
    this.visibility.next(false);
  }
}
