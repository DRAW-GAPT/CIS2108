import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-item-tabs',
  templateUrl: './item-tabs.component.html',
  styleUrls: ['./item-tabs.component.scss']
})
export class ItemTabsComponent {
  @Input() file: any;
  @Input() id: any;
  showTabs : boolean = false;
}
