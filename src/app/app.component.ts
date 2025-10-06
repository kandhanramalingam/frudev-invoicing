import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import {Sidebar} from "./layouts/sidebar/sidebar";
import {Toast} from "primeng/toast";

@Component({
  selector: "app-root",
    imports: [RouterOutlet, Sidebar, Toast],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss"
})
export class AppComponent {}
