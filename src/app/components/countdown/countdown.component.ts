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
  
  private timerSubscription?: Subscription;
  private visibilitySubscription?: Subscription;
  private lastActive = Date.now();
  private checkInterval = 500; // check every 500ms
  private popupDismissed = false;

  constructor(
    private timeTrackerService: TimeTrackerService,
    private router: Router
  ) { }

  ngOnInit(): void {
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

    // Setup activity detection
    this.setupActivityDetection();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.visibilitySubscription) {
      this.visibilitySubscription.unsubscribe();
    }
  }

  private setupActivityDetection(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Track touch/mouse events to detect activity
    document.addEventListener('touchstart', this.handleActivity.bind(this));
    document.addEventListener('touchmove', this.handleActivity.bind(this));
    document.addEventListener('mousemove', this.handleActivity.bind(this));
    document.addEventListener('click', this.handleActivity.bind(this));
    
    // Check activity periodically
    this.visibilitySubscription = interval(this.checkInterval).subscribe(() => {
      this.checkActivity();
    });
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.showDetoxFailedPopup();
    }
  }

  private handleActivity(): void {
    const now = Date.now();
    if (now - this.lastActive > 10000) { // If inactive for more than 10 seconds
      this.showDetoxFailedPopup();
    }
    this.lastActive = now;
  }

  private checkActivity(): void {
    const now = Date.now();
    if (now - this.lastActive > 60000) { // If inactive for more than a minute
      // This is a simple heuristic assuming user put the phone down
      this.lastActive = now; // Reset the timer
    }
  }

  showDetoxFailedPopup(): void {
    if (this.popupDismissed) {
      return; // Don't show popup again if already dismissed
    }
    
    this.detoxFailed = true;
    this.showPopup = true;
    this.timeTrackerService.failSession();
    
    // Hide popup after 5 seconds and navigate back to settings
    setTimeout(() => {
      this.showPopup = false;
      this.timeTrackerService.completeSession(false);
    }, 5000);
  }

  dismissPopup(): void {
    this.showPopup = false;
    this.popupDismissed = true;
    this.timeTrackerService.completeSession(false);
  }

  endSession(): void {
    this.timeTrackerService.completeSession(false);
  }
}