import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { SupportedSchoolsEnum } from '../../../meta/SupportedSchools';
import { FBConnector } from '../../../assets/facebook/facebook';
import { User } from '../../../meta/user';
import { DatabaseService } from '../../../meta/database.service';
import { UserService } from '../../../meta/user.service';

@Component({
  selector: 'signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})

export class SignUpPageComponent implements OnInit {

  public supportedSchools;
  private fbKey: string = ENV === 'production' ? '309270582738901' : '346211865751257';
  private apiResponse = {userId: '', first_name: '', last_name: '', email: '', confirmEmail: '',
    password: '', confirmPassword: '', dateOfBirth: '', selectedSchool: '',
    pictureUrl: '', termsAndConditions: ''};
  private disabledField = false;
  private hidePasswordField = 'inherit';
  private requiredField = {firstName: '', lastName: '', email: '', confirmEmail: '',
    password: '', confirmPassword: '', termsAndConditions: ''};
  private currentDate = new Date();

  constructor(private router: Router,
              private databaseService: DatabaseService,
              private userService: UserService,
              public zone: NgZone) {
    this.buildSupportedSchools();
  }

  public ngOnInit() {
    let fbCon: FBConnector = new FBConnector(this.fbKey);
    fbCon.initFB();
  }

  public sporeLogin(event: Event) {
    this.router.navigate(['/login']);
  }

  public facebookLogin() {
    FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        let userId = response.authResponse.userID;
        FB.api('/me', {fields: 'last_name,first_name,email,age_range,cover,name,link,gender,' +
        'locale,picture.width(250).height(250),timezone,updated_time,' +
        'verified,education,birthday'}, (response) => {
          this.buildUIResponseObject(response);
        });
      } else if (response.status === 'unknown') {
        FB.login((response) => {
          if (response.status === 'connected') {
            let userId = response.authResponse.userID;
            FB.api('/me', {fields: 'last_name,first_name,email,age_range,cover,name,link,gender,' +
            'locale,picture.width(250).height(250),timezone,updated_time,' +
            'verified,education,birthday'}, (response) => {
              this.buildUIResponseObject(response);
            });
          }
        }, {scope: 'public_profile,email,user_friends,user_education_history, user_birthday'});
      } else if (response.status === 'not_authorized') {
      }
    });
  }

  public buildUIResponseObject(response) {
    this.zone.run(() => {
      this.apiResponse.userId = response.id;
      this.apiResponse.first_name = response.first_name;
      this.apiResponse.last_name = response.last_name;
      this.apiResponse.email = response.email;
      this.apiResponse.dateOfBirth = response.birthday;
      this.apiResponse.pictureUrl = response.picture.data.url;

      let userSchools = response.education;
      let i;
      for (i = 0; i <= userSchools.length; i ++) {
        if (userSchools[i]) {
          if (userSchools[i].type === 'College') {
            this.apiResponse.selectedSchool = userSchools[i].school.name;
          }
        }
      }
      if (this.supportedSchools.indexOf(this.apiResponse.selectedSchool) === -1) {
        this.apiResponse.selectedSchool = 'Other';
      }
      this.hidePasswordField = 'none';
      this.disabledField = true;
      this.verifyForm();
    });
  }

  public buildSupportedSchools() {
    this.supportedSchools = ['-'];
    for (let i = 0; i < _.flatMap(SupportedSchoolsEnum).length / 2 ; i ++) {
      this.supportedSchools.push(_.flatMap(SupportedSchoolsEnum)[i]);
    }
  }

  public signUpUser() {
    if (this.verifyForm()) {
      let pictureUrl = this.apiResponse.pictureUrl || this.userService.getRandomPicture();
      let newUser = new User('', this.apiResponse.first_name, this.apiResponse.last_name, this.apiResponse.password,
        this.apiResponse.email, this.apiResponse.userId,
        pictureUrl, this.apiResponse.selectedSchool);
      this.databaseService.addUser(newUser).then((response) => {
        if (response.error === 0) {
          window.alert('User added');
          this.router.navigate(['login']);
        } else {
          window.alert('Error: User Already Exists in Database');
        }
      }).catch(err => {
        window.alert('Error occurred: ' + err);
      });
    } else {
      window.alert('Error: Form not complete');
    }
  }

  public verifyForm() {
    let response = true;
    if (!this.apiResponse.first_name) {
      this.requiredField.firstName = 'First Name is required';
      response = false;
    } else {
      this.requiredField.firstName = '';
    }

    if (!this.apiResponse.last_name) {
      this.requiredField.lastName = 'Last Name is required';
      response = false;
    } else {
      this.requiredField.lastName = '';
    }

    if (!this.apiResponse.email) {
      this.requiredField.email = 'Email is required';
      response = false;
    } else {
      this.requiredField.email = '';
    }

    if (!this.apiResponse.confirmEmail) {
      this.requiredField.confirmEmail = 'Must confirm email';
      response = false;
    } else if (this.apiResponse.confirmEmail !== this.apiResponse.email) {
      this.requiredField.confirmEmail = 'Emails do not match';
      response = false;
    } else {
      this.requiredField.confirmEmail = '';
    }

    if (!this.apiResponse.password && this.hidePasswordField !== 'none') {
      this.requiredField.password = 'Password is required';
      response = false;
    } else {
      this.requiredField.password = '';
    }

    if (!this.apiResponse.confirmPassword && this.hidePasswordField !== 'none') {
      this.requiredField.confirmPassword = 'Must confirm password';
      response = false;
    } else if (this.apiResponse.confirmPassword !== this.apiResponse.password) {
      this.requiredField.confirmPassword = 'Passwords do not match';
      response = false;
    } else {
      this.requiredField.confirmPassword = '';
    }

    if (!this.apiResponse.termsAndConditions) {
      this.requiredField.termsAndConditions = 'Must accept terms and conditions';
      response = false;
    } else {
      this.requiredField.termsAndConditions = '';
    }

    return response;
  }

}
