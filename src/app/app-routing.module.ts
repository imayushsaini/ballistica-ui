import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { LeaderboardComponent } from "./pages/leaderboard/leaderboard.component";
import { LoginComponent } from "./pages/login/login.component";
import { SelectServerComponent } from "./pages/select-server/select-server.component";

const routes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "leaderboard", component: LeaderboardComponent },
  { path: "switch-server", component: SelectServerComponent },
  { path: "login", component: LoginComponent },
  {
    path: "admin",
    loadChildren: () => import("./admin.module").then((m) => m.AdminModule),
  },
  { path: "**", redirectTo: "home" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
