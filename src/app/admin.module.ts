import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AdminDashboardComponent } from "./pages/admin-dashboard/admin-dashboard.component";
import { ServerSettingsComponent } from "./pages/server-settings/server-settings.component";
import { AdminOptionsComponent } from "./pages/admin-options/admin-options.component";
import { QuickToolsComponent } from "./pages/quick-tools/quick-tools.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { KeysPipe } from "./pipes/key-pipe";
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { ReactiveFormComponent } from "./components/reactive-form/reactive-form.component";

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
  declarations: [ServerSettingsComponent, ReactiveFormComponent, KeysPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class AdminModule {}
