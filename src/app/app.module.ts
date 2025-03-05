import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TimeSettingsComponent } from './components/time-settings/time-settings.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { MissionPopupComponent } from './components/mission-popup/mission-popup.component';

// import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    TimeSettingsComponent,
    CountdownComponent,
    MissionPopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      // enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }