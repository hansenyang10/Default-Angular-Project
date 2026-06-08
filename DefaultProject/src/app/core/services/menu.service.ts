import { Injectable, signal } from '@angular/core'
import { MenuItem } from '../models/menu'

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private menus = signal<MenuItem[]>([])

  getMenus() {
    return this.menus
  }

  loadMenus(roles: string[]) {
    let menuList: MenuItem[] = []
    const commonMenus: MenuItem[] = [
      { 
        label: 'Home', 
        icon: 'home', 
        route: '/' 
      },
      {
        label: 'My Profile', 
        icon: 'manage_accounts',
        route: '/profile'
      }
    ];
    if (roles.includes('Admin')) {
    menuList = [
      ...commonMenus,
      {
        label: 'Employee Hub',
        icon: 'admin_panel_settings', 
        children: [
          { label: 'Employees', route: '/employees' },
          { label: 'Roles', route: '/roles' }
        ]
      }
    ];
  } else {
    menuList = [...commonMenus];
  }
    this.menus.set(menuList)
  }
}