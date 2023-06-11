import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AdminDashboardComponent } from "./pages/admin-dashboard/admin-dashboard.component";
import { ServerSettingsComponent } from "./pages/server-settings/server-settings.component";
import { AdminOptionsComponent } from "./pages/admin-options/admin-options.component";
import { QuickToolsComponent } from "./pages/quick-tools/quick-tools.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { KeysPipe } from "./pipes/key-pipe";
import { CommonModule } from "@angular/common";
import { ReactiveFormComponent } from "./components/reactive-form/reactive-form.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { AppNumberValueAccessorDirective } from "./components/reactive-form/number-value-accessor.directive";
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { RoleManagementComponent } from "./pages/role-management/role-management.component";
import { PlayersProfileComponent } from "./pages/players-profile/players-profile.component";
import { LogsViewerComponent } from "./pages/logs-viewer/logs-viewer.component";
import { MatDialogModule } from "@angular/material/dialog";

const routes: Routes = [
  {
    path: "",
    component: AdminDashboardComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: AdminOptionsComponent },
      { path: "settings", component: ServerSettingsComponent },
      { path: "quick", component: QuickToolsComponent },
      { path: "roles", component: RoleManagementComponent },
      { path: "players", component: PlayersProfileComponent },
      { path: "server-logs", component: LogsViewerComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AdminOptionsComponent,
    ServerSettingsComponent,
    PlayersProfileComponent,
    ReactiveFormComponent,
    RoleManagementComponent,
    LogsViewerComponent,
    AppNumberValueAccessorDirective,
    KeysPipe,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatExpansionModule,
    MatSelectModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class AdminModule {}
