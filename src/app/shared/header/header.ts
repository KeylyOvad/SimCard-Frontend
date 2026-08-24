import { Component, OnInit, ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {  
  // Variables del estado del usuario y menu
  userName = 'Usuario';
  menuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    // Lee el nombre guardado y luego lo actualiza desde el servidor
    this.userName = this.authService.getNombre();
    this.obtenerUsuario();
  }

  // Carga los datos del usuario logueado
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

  // Alterna la visibilidad del menu desplegable
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Cierra la sesion y redirige al login
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Cierra el menu si el usuario hace clic fuera del componente
  @HostListener('document:click', ['$event'])
  clickOut(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
      this.cd.detectChanges();
    }
  }
}