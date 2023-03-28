import { Component } from '@angular/core';

@Component({
  selector: 'app-recently-accessed',
  templateUrl: './recently-accessed.component.html',
  styleUrls: ['./recently-accessed.component.scss']
})
export class RecentlyAccessedComponent {
  // documents = ['doggy.docx', 'apple.docx', 'wayne.png', 'spongebob.png'];
  documents = [    { name: 'doggy.docx', owner: 'Rianne Azzopardi', preview: 'https://material.angular.io/assets/img/examples/shiba2.jpg' },    { name: 'apple.docx', owner: 'Andrea Borg', preview: 'https://material.angular.io/assets/img/examples/shiba2.jpg' },    { name: 'wayne.png', owner: 'David Briffa', preview: 'https://material.angular.io/assets/img/examples/shiba2.jpg' }, { name: 'spongebob.png', owner: 'Wayne Borg', preview: 'https://material.angular.io/assets/img/examples/shiba2.jpg' }, { name: 'ema.docx', owner: 'Ema Grech', preview: 'https://material.angular.io/assets/img/examples/shiba2.jpg' } ];

}
