import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './carrusel.html',
  styleUrls: ['./carrusel.css']
})
export class CarruselComponent {
  carouselImages = [
    {
      url: 'assets/autogenerador.png',
      eyebrow: 'AUTOGENERADORES',
      title: 'Autogeneración',
      desc: 'Monitoreo de sistemas de generación distribuida integrados a la red.'
    },
    {
      url: 'assets/estacion-meteorologica.png',
      eyebrow: 'CLIMA',
      title: 'Estaciones Meteorológicas',
      desc: 'Medición de variables climáticas en tiempo real.'
    },
    {
      url: 'assets/panel-solar.png',
      eyebrow: 'SOLAR',
      title: 'Sistemas Fotovoltaicos',
      desc: 'Control de comunicaciones en parques y plantas de energía solar.'
    },
    {
      url: 'assets/Panel-solar-2.png',
      eyebrow: 'ENERGÍA',
      title: 'Generación Limpia',
      desc: 'Gestión y conectividad de activos solares descentralizados.'
    },
    {
      url: 'assets/telemedida.jpg',
      eyebrow: 'REDES',
      title: 'Telemedida de Redes',
      desc: 'Supervisión remota avanzada del consumo de energía.'
    }
  ];
}