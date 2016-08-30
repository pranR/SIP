/**
 * Created by anatale on 8/12/2016.
 */
import {Component, Input} from 'angular2/core';

@Component({
    selector: 'sip-info-panel',
    templateUrl: 'app/views/login-page/info-panel/info-panel.view.html',
    styleUrls: ['app/views/login-page/info-panel/info-panel.view.scss'],
    directives: []
})
export class InfoPanelView {
    @Input() panelName:string;
    @Input() panelDescription:string;
    @Input() imageUrl:string;
}