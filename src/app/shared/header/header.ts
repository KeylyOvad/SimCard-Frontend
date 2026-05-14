import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})

export class Header implements OnInit {  
  userName = 'Usuario';
  menuOpen = false;
   constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef 
 ) {}

  ngOnInit() {
    this.obtenerUsuario();
  }

  obtenerUsuario() {
     this.authService.getUser().subscribe({
     next: (res: any) => {
         this.userName = res.nombre;
         this.cd.detectChanges();
      },
      error: () => {
         this.userName = 'Usuario';
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
}