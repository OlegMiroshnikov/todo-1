import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SettingsDialogComponent} from '../../dialog/settings-dialog/settings-dialog.component';
import {IntroService} from '../../service/intro.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Priority} from '../../model/Priority';
import {DialogAction} from '../../object/DialogResult';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

// "presentational component": отображает полученные данные и отправляет какие-либо действия обработчику
// назначение - работа с меню и другими данными вверху страницы
// класс не видит dataHandler, т.к. напрямую с ним не должен работать
export class HeaderComponent implements OnInit {

  // ----------------------- входящие параметры ----------------------------

  @Input()
  categoryName: string;

  @Input()
  showStat: boolean;

  // ----------------------- исходящие действия----------------------------

  @Output()
  toggleStat = new EventEmitter<boolean>(); // показать/скрыть статистику

  @Output()
  toggleMenu = new EventEmitter(); // показать/скрыть статистику

  @Output()
  settingsChanged = new EventEmitter<Priority[]>();

  // -------------------------------------------------------------------------


  isMobile: boolean; // мобильное ли устройство


  constructor(
    private introService: IntroService, // сервис для вводной справки
    private dialog: MatDialog, // для отображения диалоговых окон
    private deviceService: DeviceDetectorService // для определения устройства пользователя
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit() {
  }


  // окно настроек
  showSettings() {
    const dialogRef = this.dialog.open(SettingsDialogComponent,
      {
        autoFocus: false,
        width: '500px'
      });

    dialogRef.afterClosed().subscribe(result => {

      if (result && result.action === DialogAction.SETTINGS_CHANGE) {
        this.settingsChanged.emit(result.obj);
        return;
      }
    });
  }


  showIntroHelp() {
    this.introService.startIntroJS(false);
  }

  // скрыть/показать статистику
  onToggleStat() {
    this.toggleStat.emit(!this.showStat); // вкл/выкл статистику
  }

  // скрыть/показать левое меню с категоряими
  onToggleMenu() {
    this.toggleMenu.emit(); // показать/скрыть меню
  }


}
