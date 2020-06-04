import {Component, Input, OnInit} from '@angular/core';
import {DashboardData} from '../../object/DashboardData';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.css']
})

// "presentational component": отображает полученные данные и отправляет какие-либо действия обработчику
// назначение - показать статистику
export class StatComponent implements OnInit {


  // ----------------------- входящие параметры ----------------------------


  @Input()
  dash: DashboardData; // данные дэшбоарда

  @Input()
  showStat: boolean; // показать или скрыть статистику


  // -------------------------------------------------------------------------


  constructor() {
  }

  ngOnInit() {
  }

  getTotal(): number {
    if (this.dash) {
      return this.dash.completedTotal + this.dash.uncompletedTotal;
    }
  }

  getCompletedCount() {
    if (this.dash) {
      return this.dash.completedTotal;
    }
  }

  getUncompletedCount() {
    if (this.dash) {
      return this.dash.uncompletedTotal;
    }
  }

  getCompletedPercent() {
    if (this.dash) {
      return this.dash.completedTotal ? (this.dash.completedTotal / this.getTotal()) : 0;
    }
  }

  getUncompletedPercent() {
    if (this.dash) {
      return this.dash.uncompletedTotal ? (this.dash.uncompletedTotal / this.getTotal()) : 0;
    }
  }
}
