import { Component, OnInit, ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// PrimeNG v21
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MenuModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {  
  userName = 'Usuario';
  menuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.userName = this.authService.getNombre();
    this.obtenerUsuario();
  }

  obtenerUsuario() {
    this.authService.getUser().subscribe({
      next: (res: any) => {
        this.userName = res.nombre;
        this.authService.setNombre(res.nombre); 
        this.cd.detectChanges();
      },
      error: () => {
        this.userName = this.authService.getNombre();
        this.cd.detectChanges();
      }
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickOut(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
      this.cd.detectChanges();
    }
  }
}