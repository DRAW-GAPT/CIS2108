import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent {
  constructor(
    private _Activatedroute: ActivatedRoute,
    private _router: Router,
  ) {}

  sub: any;
  file : any;
  id: any;

  ngOnInit() {
    this.sub = this._Activatedroute.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.file = null; // FETCH FILE WITH ID
    });

  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
