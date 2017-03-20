import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NavService {

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

    // Observable sources
    public navOpenSource = new Subject<Boolean>();

    // Observable streams
    public navOpen$ = this.navOpenSource.asObservable();

    // Service commands
    public toggleNav(isOpen: boolean) {
        this.navOpenSource.next(isOpen);
    }
}
