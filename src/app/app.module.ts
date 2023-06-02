import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HomeComponent, ProfileDialog } from "./pages/home/home.component";
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { MatTableModule } from "@angular/material/table";
import { LeaderboardComponent } from "./pages/leaderboard/leaderboard.component";
//import {MatFormFieldModule} from '@angular/material/form-field';
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { LiveplayersComponent } from "./pages/leaderboard/liveplayers/liveplayers.component";
import { PlayerprofileComponent } from "./pages/leaderboard/playerprofile/playerprofile.component";
import { HttpClientModule } from "@angular/common/http";
import { MatDialogModule } from "@angular/material/dialog";
import { ServiceWorkerModule } from "@angular/service-worker";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { environment } from "../environments/environment";
import { LoginComponent } from "./pages/login/login.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AdminDashboardComponent } from "./pages/admin-dashboard/admin-dashboard.component";
import { ServerSettingsComponent } from "./pages/server-settings/server-settings.component";
import { QuickToolsComponent } from "./pages/quick-tools/quick-tools.component";
import { RoleManagementComponent } from "./pages/role-management/role-management.component";
import { PlayersProfileComponent } from "./pages/players-profile/players-profile.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { LogsViewerComponent } from "./pages/logs-viewer/logs-viewer.component";
import { AdminOptionsComponent } from "./pages/admin-options/admin-options.component";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavBarComponent,
    LeaderboardComponent,
    LiveplayersComponent,
    PlayerprofileComponent,
    ProfileDialog,
    LoginComponent,
    AdminDashboardComponent,

    QuickToolsComponent,
    RoleManagementComponent,
    PlayersProfileComponent,
    ProfileComponent,
    LogsViewerComponent,
    AdminOptionsComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,

    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: false,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
