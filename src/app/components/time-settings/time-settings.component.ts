import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TimeTrackerService } from '../../services/time-tracker.service';

@Component({
  selector: 'app-time-settings',
  templateUrl: './time-settings.component.html',
  styleUrls: ['./time-settings.component.scss']
})
export class TimeSettingsComponent implements OnInit {
  timeForm!: FormGroup;
  lastSession: any = null;
  username: string = '';
  currentDateTime: string = '';

  constructor(
    private fb: FormBuilder,
    private timeTrackerService: TimeTrackerService
  ) { }

  ngOnInit(): void {
    // Get user information
    const userInfo = this.timeTrackerService.getUserInfo();
    this.username = userInfo.username;
    this.currentDateTime = `${userInfo.currentDate} ${userInfo.currentTime}`;
    
    this.timeForm = this.fb.group({
      seconds: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      minutes: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      hours: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
      days: [0, [Validators.required, Validators.min(0)]]
    });

    // Check if there was a previous session to show success/failure message
    const settings = this.timeTrackerService.getCurrentSettings();
    if (!settings.isActive && settings.hasFailed !== undefined) {
      this.lastSession = {
        successful: !settings.hasFailed
      };

      // Clear the message after 5 seconds
      setTimeout(() => {
        this.lastSession = null;
      }, 5000);
    }
  }

  onSubmit(): void {
    if (this.timeForm.valid) {
      const { seconds, minutes, hours, days } = this.timeForm.value;
      
      // Ensure at least one unit of time is selected
      if (seconds === 0 && minutes === 0 && hours === 0 && days === 0) {
        alert('Please set at least one second, minute, hour, or day.');
        return;
      }
      
      this.timeTrackerService.startSession(seconds, minutes, hours, days);
    }
  }
}