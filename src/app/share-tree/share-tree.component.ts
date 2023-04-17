import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';

@Component({
  selector: 'app-share-tree',
  templateUrl: './share-tree.component.html',
  styleUrls: ['./share-tree.component.scss']
})

export class ShareTreeComponent implements OnInit, AfterViewInit {
  @ViewChild('visNetwork', { static: false }) visNetwork!: ElementRef;
  private networkInstance: any;

  constructor() {}

  ngOnInit(): void {}
 
  ngAfterViewInit(): void {
    // create an array with nodes
    const nodes = new DataSet<any>([
      { id: 1, label: 'Node 1' },
      { id: 2, label: 'Node 2' },
      { id: 3, label: 'Node 3' },
      { id: 4, label: 'Node 4' },
      { id: 5, label: 'Node 5' },
    ]);
 
    // create an array with edges
    const edges = new DataSet<any>([
      { from: '1', to: '3' },
      { from: '1', to: '2' },
      { from: '2', to: '4' },
      { from: '2', to: '5' },
    ]);
 
    const data = { nodes, edges };
 
    const container = this.visNetwork;
    this.networkInstance = new Network(container.nativeElement, data, {});
  }
}


