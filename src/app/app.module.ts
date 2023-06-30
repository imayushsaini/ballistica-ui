import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HomeComponent, ProfileDialog } from "./pages/home/home.component";
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { MatTableModule } from "@angular/material/table";
import { LeaderboardComponent } from "./pages/leaderboard/leaderboard.component";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { LiveplayersComponent } from "./pages/leaderboard/liveplayers/liveplayers.component";
import { HttpClientModule } from "@angular/common/http";
import { MatDialogModule } from "@angular/material/dialog";
import { ServiceWorkerModule } from "@angular/service-worker";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { LoginComponent } from "./pages/login/login.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PlayerprofileComponent } from "./pages/leaderboard/playerprofile/playerprofile.component";
import { AdminDashboardComponent } from "./pages/admin-dashboard/admin-dashboard.component";
import { authInterceptorProvider } from "./helpers/auth.interceptor";
import { SelectServerComponent } from "./pages/select-server/select-server.component";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavBarComponent,
    LeaderboardComponent,
    PlayerprofileComponent,
    LiveplayersComponent,
    AdminDashboardComponent,
    SelectServerComponent,
    ProfileDialog,
    LoginComponent,
  ],
  imports: [
    FormsModule,
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
      enabled: true,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
  providers: [authInterceptorProvider],
  bootstrap: [AppComponent],
})
export class AppModule {}
