
export class User implements IUser {

  public userID: string;
  public firstName: string;
  public lastName: string;
  public password: string;
  public email: string;
  public gender: string;
  public facebookID: string;
  public pictureURL: string;
  public school: string;
  public theme: string;

  constructor(userID?: string, firstName?: string, lastName?: string, password?: string,
              email?: string, gender?: string, facebookId?: string, pic?: string,
              school?: string, theme?: string) {
    this.userID = userID || '' ;
    this.firstName = firstName || '';
    this.lastName = lastName || '';
    this.password = password || '';
    this.email = email || '';
    this.gender = gender || '';
    this.facebookID = facebookId || '';
    this.pictureURL = pic || 'https://scontent.xx.fbcdn.net/v/t1.0-1/c15.0.50.50/p50x50/10354686_' +
      '10150004552801856_220367501106153455_n.jpg?oh=6c801f82cd5a32fd6e5a4258ce00a314&oe=589AAD2F';
    this.school = school || '';
    this.theme = theme || 'Default';
  }

}

export interface IUser {
  userID: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  gender: string;
  facebookID: string;
  pictureURL: string;
  school: string;
  theme: string;
}

