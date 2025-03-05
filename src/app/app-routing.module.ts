import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeSettingsComponent } from './components/time-settings/time-settings.component';
import { CountdownComponent } from './components/countdown/countdown.component';

const routes: Routes = [
  { path: '', component: TimeSettingsComponent },
  { path: 'countdown', component: CountdownComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }