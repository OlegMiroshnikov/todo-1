import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SettingsDialogComponent} from '../../dialog/settings-dialog/settings-dialog.component';
import {IntroService} from '../../service/intro.service';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input()
  categoryName: string;
  @Output()
  toggleMenu = new EventEmitter(); // показать/скрыть боковое меню категорий

  @Output()
  toggleStat = new EventEmitter<boolean>(); // показать/скрыть статистику
  @Input()
  private showStat: boolean;

  private isMobile: boolean;

  constructor(
    private dialog: MatDialog,
    private introService: IntroService,
    private deviceDetector: DeviceDetectorService) {
    this.isMobile = deviceDetector.isMobile();
  }

  ngOnInit() {
  }

  private onToggleStat() {
    this.toggleStat.emit(!this.showStat); // вкл/выкл статистику
  }

  // окно настроек
  private showSettings() {
    const dialogRef = this.dialog.open(SettingsDialogComponent,
      {
        autoFocus: false,
        width: '500px'
      });
    // никаких действий не требуется после закрытия окна
  }

  private showIntroHelp() {
    this.introService.startIntroJS(false);
  }

  private onToggleMenu() {
    this.toggleMenu.emit(); // показать/скрыть меню
  }

}
