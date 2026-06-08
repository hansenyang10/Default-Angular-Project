import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import { SideBarComponent } from "../../features/sidebar/sidebar.component";
import { NavbarComponent } from "../../features/navbar/navbar/navbar.component";

@Component({
  selector: 'login',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, SideBarComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  constructor(
    ) {}    
}
