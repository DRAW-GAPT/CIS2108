import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component} from '@angular/core';
import {MatChipEditedEvent, MatChipInputEvent} from '@angular/material/chips';
import * as _ from 'lodash';
import { filter } from 'lodash';
import { GoogleAPIService } from 'src/app/google-api.service';


@Component({
  selector: 'app-new-chips',
  templateUrl: './new-chips.component.html',
  styleUrls: ['./new-chips.component.scss']
})
export class NewChipsComponent {
  
}
