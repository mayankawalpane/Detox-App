import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface TimeSettings {
  seconds: number; // Added seconds
  minutes: number;
  hours: number;
  days: number;
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
  hasFailed?: boolean; // Track if detox was interrupted
}

@Injectable({
  providedIn: 'root'
})
export class TimeTrackerService {
  private timeSettingsKey = 'digitalWeaving_timeSettings';
  private timeSettings = new BehaviorSubject<TimeSettings>({
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
    isActive: false,
    hasFailed: false
  });

  constructor(private router: Router) {
    this.loadFromStorage();
    this.checkActiveSession();
  }

  private loadFromStorage(): void {
    const storedSettings = localStorage.getItem(this.timeSettingsKey);
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      // Convert strings back to Date objects
      if (settings.startTime) settings.startTime = new Date(settings.startTime);
      if (settings.endTime) settings.endTime = new Date(settings.endTime);
      
      this.timeSettings.next(settings);
    }
  }

  private saveToStorage(settings: TimeSettings): void {
    localStorage.setItem(this.timeSettingsKey, JSON.stringify(settings));
  }

  private checkActiveSession(): void {
    const settings = this.timeSettings.value;
    if (settings.isActive && settings.endTime) {
      const now = new Date();
      if (now >= settings.endTime) {
        // Session has ended successfully
        this.completeSession(true);
      } else {
        // Redirect to countdown if session is active
        if (location.pathname !== '/countdown') {
          this.router.navigate(['/countdown']);
        }
      }
    }
  }

  getTimeSettings(): Observable<TimeSettings> {
    return this.timeSettings.asObservable();
  }

  getCurrentSettings(): TimeSettings {
    return this.timeSettings.value;
  }

  startSession(seconds: number, minutes: number, hours: number, days: number): void {
    const startTime = new Date();
    const endTime = new Date();
    
    // Calculate total time in milliseconds
    const totalSeconds = seconds + (minutes * 60) + (hours * 3600) + (days * 24 * 3600);
    endTime.setSeconds(endTime.getSeconds() + totalSeconds);
    
    const settings: TimeSettings = {
      seconds,
      minutes,
      hours,
      days,
      startTime,
      endTime,
      isActive: true,
      hasFailed: false
    };
    
    this.timeSettings.next(settings);
    this.saveToStorage(settings);
    this.router.navigate(['/countdown']);
  }

  failSession(): void {
    const currentSettings = this.timeSettings.value;
    const settings: TimeSettings = {
      ...currentSettings,
      hasFailed: true
    };
    
    this.timeSettings.next(settings);
    this.saveToStorage(settings);
  }

  completeSession(successful: boolean): void {
    const currentSettings = this.timeSettings.value;
    const settings: TimeSettings = {
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      isActive: false,
      hasFailed: currentSettings.hasFailed || !successful
    };
    
    this.timeSettings.next(settings);
    this.saveToStorage(settings);
    this.router.navigate(['/']);
  }

  getRemainingTime(): { days: number, hours: number, minutes: number, seconds: number } | null {
    const settings = this.timeSettings.value;
    if (!settings.isActive || !settings.endTime) {
      return null;
    }
    
    const now = new Date();
    const endTime = new Date(settings.endTime);
    const diffMs = endTime.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      this.completeSession(true);
      return null;
    }
    
    // Calculate remaining time
    const diffSec = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    
    return { days, hours, minutes, seconds };
  }
}