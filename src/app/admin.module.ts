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

const routes: Routes = [
  {
    path: "",
    component: AdminDashboardComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: AdminOptionsComponent },
      { path: "settings", component: ServerSettingsComponent },
      { path: "quick", component: QuickToolsComponent },
    ],
  },
];

@NgModule({
  declarations: [
    ServerSettingsComponent,
    ReactiveFormComponent,
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
    MatInputModule,
    MatSelectModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class AdminModule {}
