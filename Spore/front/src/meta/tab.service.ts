import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CookieService } from 'angular2-cookie/core';

@Injectable()
export class TabService implements OnInit {

    constructor(
      private cookieService: CookieService
    ) { }

    // Constants
    public calendarTab: string = 'CalendarTab';
    public calculatorTab: string = 'CalculatorTab';
    public coursesTab: string = 'CoursesTab';
    public tasksTab: string = 'TasksTab';
    public filesTab: string = 'FilesTab';
    public helpTab: string = 'HelpTab';
    public mapTab: string = 'MapTab';
    public settingsTab: string = 'SettingsTab';
    public defaultTab: string = 'DefaultTab';
    public friendsTab: string = 'FriendsTab';
    public appStoreTab: string = 'AppStoreTab';

    // Observable sources
    public tabSelectedSource = new Subject<String>();

    // Observable streams
    public tabSelectedStream = this.tabSelectedSource.asObservable();

    public ngOnInit() {
      this.tabSelectedSource.next(this.calendarTab);
    }

    // Service commands
    public switchTabs(selected: string) {
      this.cookieService.put('userTab', selected);
      this.tabSelectedSource.next(selected);
    }
}
