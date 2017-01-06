import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { User } from '../meta/user';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Event } from '../meta/event';
import { Moment } from 'moment';

@Injectable()
export class DatabaseService {

    private server: string = ENV == "production" ? "https://spore.life" : "https://localhost:8081";
    user: Observable<User>;
    private _user: BehaviorSubject<User>;
    private dataStore: {
        user: User
    }

    constructor(private http: Http) {
        this.dataStore = { user: new User() },
        this._user = <BehaviorSubject<User>>new BehaviorSubject(new User);
        this.user = this._user.asObservable();
    }

    loadUser(id: string) {
        this.http
            .get(this.BuildGetUserRequest(id))
            .map(response => this.BuildUserFromResponse(response.json()))
            .subscribe(data => {
                console.log('IN LOADUSER');
                this.dataStore.user = data;
                this._user.next(Object.assign({}, this.dataStore).user);
            }, error => console.log('Could not load user.'));
    }

    getUser(id: string): any {
        this.loadUser(id);
        return this.http
            .get(this.BuildGetUserRequest(id))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    addUser(user: User): any {
        this.loadUser(user.UserID);
        return this.http
            .post(this.BuildAddUserRequest(user), {fb: user.UserID, first: user.FirstName, last: user.LastName, email: user.Email, pic: user.PictureURL})
            .toPromise()
            .then(response => response.json().data as Response)
            .catch(this.handleError);
    }

    echo(something: string): any {
        return this.http
            .get(this.BuildEchoRequest(something))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    addEvent(userId: string, event: Event): any {
        return this.http
            .post(this.BuildAddEventRequest(userId, event), {user: userId, start: event.Start, end: event.End, title: event.Title})
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getUserEvents(userId: string, start: Moment, end: Moment): any {
        return this.http
            .get(this.BuildGetUserEventsRequest(userId, start, end))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    deleteEvent(eventId: string): any {
        return this.http
            .delete(this.BuildDeleteEventRequest(eventId))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    deleteUserEvent(userId: string, eventId: string): any {
        return this.http
            .delete(this.BuildDeleteUserEventRequest(userId, eventId))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    updateEvent(event: Event) {
        return this.http
            .put(this.BuildUpdateEventRequest(event), {title: event.Title, start: event.Start, end: event.End, id: event.Id})
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    private BuildGetUserRequest(id: string): string {
        return this.server + '/api/users?'
            + 'fb=' + encodeURIComponent(id);
    }

    private BuildAddUserRequest(user: User): string {
        return this.server + '/api/users?'
            + 'fb=' + encodeURIComponent(user.UserID)
            + '&email=' + encodeURIComponent(user.Email)
            + '&last=' + encodeURIComponent(user.LastName)
            + '&first=' + encodeURIComponent(user.FirstName)
            + '&pic=' + encodeURIComponent(user.PictureURL);
    }

    private BuildEchoRequest(something: string): string {
        return this.server + '/api/echo?'
            + 'value=' + encodeURIComponent(something);
    }

    private BuildAddEventRequest(userId: string, event: Event): string {
        let startRequest = event.Start ? '&start=' + encodeURIComponent(event.Start.toISOString().substring(0, 10)) : '';
        let endRequest = event.End ? '&end=' + encodeURIComponent(event.End.toISOString().substring(0, 10)) : '';
        let titleRequest = event.Title ? '&title=' + encodeURIComponent(event.Title) : '';
        return this.server + '/api/events?'
            + 'user=' + encodeURIComponent(userId)
            + startRequest
            + endRequest
            + titleRequest;
    }

    private BuildGetUserEventsRequest(userId: string, start: Moment, end: Moment): string {
        return this.server + '/api/events?'
            + 'user=' + encodeURIComponent(userId)
            + '&start=' + encodeURIComponent(start.toISOString().substring(0, 10))
            + '&end=' + encodeURIComponent(end.toISOString().substring(0, 10));
    }

    private BuildDeleteEventRequest(eventId: string): string {
        return this.server + '/api/events?'
            + 'Event=' + encodeURIComponent(eventId);
    }

    private BuildDeleteUserEventRequest(userId: string, eventId: string): string {
        return this.server + '/api/events?'
            + 'user=' + encodeURIComponent(userId)
            + '&Event=' + encodeURIComponent(eventId);
    }

    private BuildUpdateEventRequest(event: Event): string {
        let titleRequest = event.Title ? '&title=' + event.Title : '';
        let startRequest = event.Start ? '&start=' + event.Start.toISOString().substring(0, 10) : '';
        let endRequest = event.End ? '&end=' + event.End.toISOString().substr(0, 10) : '';
        let descriptionRequest = event.Description ? '&desc=' + event.Description : '';
        return this.server + '/api/events?'
            + 'Event=' + event.Id
            + titleRequest
            + startRequest
            + endRequest
            + descriptionRequest;
    }

    private BuildUserFromResponse(response: any): User {
        if (response && response.data) {
            return new User(response.data.facebook_id, response.data.first, response.data.last, response.data.email, response.data.picture_uri);
        }
        return new User();
    }

    private handleError(error: any) {
        console.error('IN ERROR HANDLER: An error occurred: ', error);
        return Promise.reject(error.message || error);
    }
}
