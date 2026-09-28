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
import { ManagePerksComponent } from "./pages/manage-perks/manage-perks.component";
import { ServerConfigComponent } from "./pages/server-config/server-config.component";
import { EconomyManagementComponent } from "./pages/economy-management/economy-management.component";
import { ReplaysManagementComponent } from "./pages/replays-management/replays-management.component";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AdminGuard } from "./guards/admin.guard";

const routes: Routes = [
  {
    path: "",
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: AdminOptionsComponent },
      { path: "economy", component: EconomyManagementComponent },
      { path: "settings", component: ServerSettingsComponent },
      { path: "quick", component: QuickToolsComponent },
      { path: "roles", component: RoleManagementComponent },
      { path: "players", component: PlayersProfileComponent },
      { path: "server-logs", component: LogsViewerComponent },
      { path: "replays", component: ReplaysManagementComponent },
      { path: "server-config", component: ServerConfigComponent },
      { path: "perks", component: ManagePerksComponent },
      { path: "config", component: ServerConfigComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AdminOptionsComponent,
    EconomyManagementComponent,
    ServerSettingsComponent,
    PlayersProfileComponent,
    ReactiveFormComponent,
    RoleManagementComponent,
    LogsViewerComponent,
    ManagePerksComponent,
    ServerConfigComponent,
    QuickToolsComponent,
    ReplaysManagementComponent,
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
    MatChipsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatInputModule,
    MatExpansionModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSlideToggleModule,
    MatTooltipModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class AdminModule {}
