import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-mission-popup',
  templateUrl: './mission-popup.component.html',
  styleUrls: ['./mission-popup.component.scss']
})
export class MissionPopupComponent implements OnInit {
  @Input() detoxFailed: boolean = false;
  @Output() dismissed = new EventEmitter<void>();
  
  constructor() { }

  ngOnInit(): void {
    // Play sound or vibration when popup shows
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  dismiss(): void {
    this.dismissed.emit();
  }
}