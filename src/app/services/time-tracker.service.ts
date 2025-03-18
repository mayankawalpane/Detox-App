import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface TimeSettings {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
  hasFailed?: boolean;
  lastPauseTime?: number; // When screen was turned off
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
  
  private userInfo = {
    username: 'mayank',
    currentDate: '2025-03-05',
    currentTime: '10:32:21'
  };

  constructor(private router: Router) {
    this.loadFromStorage();
    this.checkActiveSession();
    
    // Screen lock/unlock detection
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange(document.visibilityState);
    });
  }

  private handleVisibilityChange(state: string): void {
    const settings = this.timeSettings.value;
    if (!settings.isActive) return;
    
    if (state === 'hidden') {
      // Screen turned off - just store the time
      settings.lastPauseTime = Date.now();
      this.saveToStorage(settings);
    } else if (state === 'visible') {
      // Screen turned back on - check if detox succeeded or failed
      if (!settings.lastPauseTime) return;
      
      const now = Date.now();
      const pauseTime = settings.lastPauseTime;
      
      // If the timer ended while screen was off, this is a success
      if (settings.endTime && now >= settings.endTime.getTime()) {
        this.completeSession(true);
        return;
      }
      
      // Otherwise, turning the screen on means the detox failed
      this.failSession();
    }
  }

  getUserInfo(): { username: string, currentDate: string, currentTime: string } {
    return this.userInfo;
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