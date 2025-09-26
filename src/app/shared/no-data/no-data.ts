import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-no-data',
  imports: [],
  templateUrl: './no-data.html',
  styleUrl: './no-data.scss'
})
export class NoData {
    @Input() message = 'No Data!';
}
