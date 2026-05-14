import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/header/header';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-parametros',
  standalone: true, 
  imports: [CommonModule, Header, RouterModule], 
  templateUrl: './parametros.html',
  styleUrls: ['./parametros.css']
})

export class Parametros {} 