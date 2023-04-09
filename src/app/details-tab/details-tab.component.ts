import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details-tab',
  templateUrl: './details-tab.component.html',
  styleUrls: ['./details-tab.component.scss']
})
export class DetailsTabComponent {
  @Input() file: any;

  formatCreated(date: Date): string{
    let options: any = { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric"};
    return new Date(date).toLocaleDateString(undefined, options);
  }

  formatLastModified = (date: Date, user:any): string => {
    user = user?.displayName;
    let options: any = { day: '2-digit', month: '2-digit', year: 'numeric' };
    let dateTime = new Date(date).toLocaleDateString(undefined, options);
    
    if (user) return dateTime + " by " + user;
    else return dateTime
  }
}
