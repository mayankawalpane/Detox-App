import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimeTrackerService } from '../../services/time-tracker.service';
import { Subscription, interval } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit, OnDestroy {
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  showPopup = false;
  detoxFailed = false;
  username: string = '';
  currentDateTime: string = '';
  
  private timerSubscription?: Subscription;

  constructor(
    private timeTrackerService: TimeTrackerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get user information
    const userInfo = this.timeTrackerService.getUserInfo();
    this.username = userInfo.username;
    this.currentDateTime = `${userInfo.currentDate} ${userInfo.currentTime}`;
    
    // Check if there's an active session
    const settings = this.timeTrackerService.getCurrentSettings();
    if (!settings.isActive) {
      this.router.navigate(['/']);
      return;
    }

    // Update the timer every second
    this.timerSubscription = interval(1000).subscribe(() => {
      const remaining = this.timeTrackerService.getRemainingTime();
      if (!remaining) {
        return;
      }
      this.days = remaining.days;
      this.hours = remaining.hours;
      this.minutes = remaining.minutes;
      this.seconds = remaining.seconds;
    });

    // Check if session already failed
    if (settings.hasFailed) {
      this.showDetoxFailedPopup();
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  showDetoxFailedPopup(): void {
    this.detoxFailed = true;
    this.showPopup = true;
    
    // Hide popup after 5 seconds and navigate back to settings
    setTimeout(() => {
      this.showPopup = false;
      this.timeTrackerService.completeSession(false);
    }, 5000);
  }

  dismissPopup(): void {
    this.showPopup = false;
    this.timeTrackerService.completeSession(false);
  }

  endSession(): void {
    this.timeTrackerService.completeSession(false);
  }
}