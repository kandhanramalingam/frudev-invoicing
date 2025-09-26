import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";
import {Sidebar} from "./layouts/sidebar/sidebar";
import {DbService} from "./core/db.service";

@Component({
  selector: "app-root",
    imports: [RouterOutlet, Sidebar],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {}
