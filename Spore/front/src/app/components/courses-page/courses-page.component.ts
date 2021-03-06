import { Component, OnInit } from '@angular/core';
import { Course } from '../../../meta/course';
import { CourseOption } from '../../../meta/courseOption';
import { DatabaseService } from '../../../meta/database.service';
import { CookieService } from 'angular2-cookie/core';

@Component({
  selector: 'courses-page',
  templateUrl: './courses-page.component.html',
  styleUrls: ['./courses-page.component.scss']
})

export class CoursesPageComponent implements OnInit {

  private currentSlide: string = "";
  private courses: Array<Course> = [];
  private coursesMaster: Array<Course> = [];
  private deleteCourseCode: string = "";
  private searchDialogRequest: string = "";
  private mockedSearchResults: Array<Course> = [];
  private searchResultSelected: string = "";
  private userID: string;

  constructor (
    private databaseService: DatabaseService,
    private cookieService: CookieService
  ) { }

  public ngOnInit() {
    // Mocked search results ---
    this.mockedSearchResults.push(new Course(true, false, 'CSC108', 'M. Jackson',
    'This course provides an Introduction to Computer Programming. By the end of this course, ' +
    'you should be comfortable programming in Python, understand why good style is critical, ' +
    'and be familiar with core computer science topics like algorithms and complexity.',
    'ABC-DEF-123-GHGH-ZACH-123-ZACH-456', true, 'Held in IB110 from 2:00pm to 5:00pm.',
    [new CourseOption("Tuesday", new Date(1970, 1, 1, 10, 30, 0, 0), new Date(1970, 1, 1, 12, 0, 0, 0)),
    new CourseOption("Thursday", new Date(1970, 1, 1, 4, 0, 0, 0), new Date(1970, 1, 1, 6, 0, 0, 0))],
    [new CourseOption("Friday", new Date(1970, 1, 1, 12, 0, 0, 0), new Date(1970, 1, 1, 13, 0, 0, 0))],
    [],
    '9:00am to 11:30am', 'DH6060', '#fabf8f'));
    this.mockedSearchResults.push(new Course(true, false, 'CSC148', 'Dr. A. Rosenbloom',
    'An investigation of many aspects of modern information security. Major topics cover: Techniques to identify and avoid common ' +
    'software development flaws which leave software vulnerable to crackers. Utilizing modern operating systems security features to ' +
    'deploy software in a protected environment. Common threats to networks and networked computers and tools to deal with them. ' +
    'Cryptography and the role it plays in software development, systems security and network security.',
    'ZACH-ZACH-ZACH-1234-1234-ZACH-123', true, 'Held in CC1080 from 9:00am to 11:00am.',
    [new CourseOption("Wednesday", new Date(1970, 1, 1, 12, 30, 0, 0), new Date(1970, 1, 1, 15, 30, 0, 0))],
    [],
    [new CourseOption("Monday", new Date(1970, 1, 1, 4, 0, 0, 0), new Date(1970, 1, 1, 8, 0, 0, 0))],
    '1:30pm to 4:00pm', 'OPH7010', '#cc99cc'));
    // Mocked search results ---

    if (this.cookieService.get('userID')) {
      this.userID = this.cookieService.get('userID');
      this.databaseService.getUserCourses(this.userID).then(response => {
        if (response.error === 0) {
          for (var i = 0; i < response.data.length; i++) {
            this.cleanUpCourse(response.data[i]);
          }

          this.courses = response.data;
          this.coursesMaster = JSON.parse(JSON.stringify(this.courses));
        } else {
          console.log('Error during course population: ' + response.data);
        }
      });
    }
  }

  private saveCourse(course: Course): any {
    this.databaseService.addCourse(this.userID, course).then(response => {
      if (response.error === 0) {
        this.cleanUpCourse(response.data);
        this.courses.splice(this.courses.indexOf(course), 1);
        let courseMaster = this.coursesMaster.find(c => c.id == course.id);
        this.coursesMaster.splice(this.coursesMaster.indexOf(courseMaster), 1);
        this.courses.push(response.data);
        this.coursesMaster.push(<Course>JSON.parse(JSON.stringify(response.data)));
        setTimeout(function() {
          let panel = document.getElementById(response.data.id + 'Toggle');
          this.currentSlide = response.data.id;
          if (panel) {
            panel.click();
          }
        }, 50);
      } else {
        console.log('Error during course addition: ' + response.data);
      }
    });
  }

  private updateCourse(course: Course): any {
    this.databaseService.updateCourse(course).then(response => {
      if (response.error === 0) {
        this.cleanUpCourse(response.data);
        this.courses.splice(this.courses.indexOf(course), 1);
        let courseMaster = this.coursesMaster.find(c => c.id == course.id);
        this.coursesMaster.splice(this.coursesMaster.indexOf(courseMaster), 1);
        this.courses.push(response.data);
        this.coursesMaster.push(<Course>JSON.parse(JSON.stringify(response.data)));
        setTimeout(function() {
          let panel = document.getElementById(response.data.id + 'Toggle');
          this.currentSlide = response.data.id;
          if (panel) {
            panel.click();
          }
        }, 50);
      } else {
        console.log('Error during course update: ' + response.data);
      }
    });
  }

  private switchSlide(course: Course): any {
    if (this.currentSlide != course.id) {
      this.currentSlide = course.id;
    } else {
      this.currentSlide = "";
    }
  }

  private addCourse(id?: string): any {
    let course: Course;
    if (id) {
      course = this.mockedSearchResults.find(c => c.id == id);
    } else {
      course = new Course();
    }

    this.courses.push(course);
    setTimeout(function() {
      let panel = document.getElementById(course.id + 'Toggle');
      let courseField = document.getElementById(course.id + 'Course');
      if (panel) {
        panel.click();
        if (courseField) {
          courseField.focus();
        }
      }
    }, 50);
  }

  private deleteCourse(): any {
    let course = this.courses.find(c => c.id == this.currentSlide);
    if (!course.isDraft || course.is_parse) {
      this.databaseService.deleteCourse(this.userID, course).then(response => {
        if (response.status === 200) {
          this.removeFromCourseList(course);
        } else {
          console.log('Error during course delete, status: ' + response.status + '.');
        }
      });
    } else {
      this.removeFromCourseList(course);
    }
  }

  private removeFromCourseList(course: Course): any {
    this.courses.splice(this.courses.indexOf(course), 1);
    let courseMaster = this.coursesMaster.find(c => c.id == this.currentSlide);
    this.coursesMaster.splice(this.coursesMaster.indexOf(courseMaster), 1);
  }

  private addCourseOption(course: Course, section: Array<CourseOption>): any {
    if (section.length < 5) {
      section.push(new CourseOption());
    }
    this.updateButtonCheck(course);
  }

  private removeCourseOption(course: Course, section: Array<CourseOption>, type: string): any {
    section.pop();
    this.updateButtonCheck(course);
  }

  private updateButtonCheck(course: Course): any {
    let masterCourse = this.coursesMaster.find(c => c.id == course.id);
    let btn = document.getElementById(course.id + "UpdateButton");
    if (btn && btn.className) {
      if (JSON.stringify(masterCourse) !== JSON.stringify(course)) {
        if (btn.className.includes("disabled")) {
          btn.className = btn.className.replace(" disabled", "");
        }
      } else {
        if (!btn.className.includes("disabled")) {
          btn.className += " disabled";
        }
      }
    }
  }

  private openSearch(): any {
    if (this.searchDialogRequest.length > 0) {
      this.searchResultSelected = '';
      document.getElementById('checkButton').click();
    }
  }

  private toggleSwitch(course: Course): any {
    course.exams = !course.exams;
    this.updateButtonCheck(course);
  }

  private cleanUpCourse(course: any) {
    course.id = course._id;

    var lec = Array<CourseOption>();
    if (course.lectures) {
      for (var j = 0; j < course.lectures.length; j++) {
        if (course.lectures[j].times) {
          for (var i = 0; i < course.lectures[j].times.length; i++) {
            lec.push(new CourseOption(
              course.lectures[j].times[i].day.charAt(0).toUpperCase() + course.lectures[j].times[i].day.slice(1).toLowerCase(),
              new Date(course.lectures[j].times[i].start),
              new Date(course.lectures[j].times[i].end)
            ));
          }
        } else if (course.lectures[j].day && course.lectures[j].startTime && course.lectures[j].endTime) {
          lec.push(new CourseOption(
            course.lectures[j].day.charAt(0).toUpperCase() + course.lectures[j].day.slice(1).toLowerCase(),
            new Date(course.lectures[j].startTime),
            new Date(course.lectures[j].endTime)
          ));
        }
      }
    }
    course.lectures = lec;

    var pra = Array<CourseOption>();
    if (course.practicals) {
      for (var j = 0; j < course.practicals.length; j++) {
        if (course.practicals[j].times) {
          for (var i = 0; i < course.practicals[j].times.length; i++) {
            pra.push(new CourseOption(
              course.practicals[j].times[i].day.charAt(0).toUpperCase() + course.practicals[j].times[i].day.slice(1).toLowerCase(),
              new Date(course.practicals[j].times[i].start),
              new Date(course.practicals[j].times[i].end)
            ));
          }
        } else if (course.practicals[j].day && course.practicals[j].startTime && course.practicals[j].endTime) {
          pra.push(new CourseOption(
            course.practicals[j].day.charAt(0).toUpperCase() + course.practicals[j].day.slice(1).toLowerCase(),
            new Date(course.practicals[j].startTime),
            new Date(course.practicals[j].endTime)
          ));
        }
      }
    }
    course.practicals = pra;

    var tut = Array<CourseOption>();
    if (course.tutorials) {
      for (var j = 0; j < course.tutorials.length; j++) {
        if (course.tutorials[j].times) {
          for (var i = 0; i < course.tutorials[j].times.length; i++) {
            tut.push(new CourseOption(
              course.tutorials[j].times[i].day.charAt(0).toUpperCase() + course.tutorials[j].times[i].day.slice(1).toLowerCase(),
              new Date(course.tutorials[j].times[i].start),
              new Date(course.tutorials[j].times[i].end)
            ));
          }
        } else if (course.tutorials[j].day && course.tutorials[j].startTime && course.tutorials[j].endTime) {
          tut.push(new CourseOption(
            course.tutorials[j].day.charAt(0).toUpperCase() + course.tutorials[j].day.slice(1).toLowerCase(),
            new Date(course.tutorials[j].startTime),
            new Date(course.tutorials[j].endTime)
          ));
        }
      }
    }
    course.tutorials = tut;

    if (course.colour) {
      course.colour = course.colour.toLowerCase();
    } else {
      course.colour = '#ffcc66';
    }

    if (course.office_hours && course.office_location) {
      course.officeHoursInfo = 'Held in ' + course.office_location + ' from ' + course.office_hours + '.';
    }

  }
}
