import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ServerSettingsComponent } from './pages/server-settings/server-settings.component';
import { QuickToolsComponent } from './pages/quick-tools/quick-tools.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RoleManagementComponent } from './pages/role-management/role-management.component';
import { LogsViewerComponent } from './pages/logs-viewer/logs-viewer.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', loadChildren: () => import('./admin.module').then(m=> m.AdminModule) },
  // { path: 'admin/settings', component: ServerSettingsComponent },
  // { path: 'admin/quick', component: QuickToolsComponent },
  // { path: 'admin/player', component: ProfileComponent },
  // { path: 'admin/roles', component: RoleManagementComponent },
  // { path: 'admin/logs', component: LogsViewerComponent },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
