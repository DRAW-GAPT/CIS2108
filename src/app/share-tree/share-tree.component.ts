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
      { id: 1, label: 'Rianne Azzopardi\nOwner', image: 'https://www.hartz.com/wp-content/uploads/2022/04/small-dog-owners-1.jpg' },
      { id: 2, label: 'David Briffa\nEditor', image: 'https://lh3.googleusercontent.com/a-/ACB-R5RxStIkJMNjIGOm84bx6y3QhwGMPCh0e01HUWDwBto=s64' },
      { id: 3, label: 'Andrea Borg\nEditor', image: 'https://lh3.googleusercontent.com/a-/ACB-R5RxStIkJMNjIGOm84bx6y3QhwGMPCh0e01HUWDwBto=s64' },
      { id: 4, label: 'Wayne Borg\nEditor', image: 'https://lh3.googleusercontent.com/a-/ACB-R5RxStIkJMNjIGOm84bx6y3QhwGMPCh0e01HUWDwBto=s64' },
      { id: 5, label: 'Peter Xuereb\nViewer', image: 'https://lh3.googleusercontent.com/a-/ACB-R5RxStIkJMNjIGOm84bx6y3QhwGMPCh0e01HUWDwBto=s64' },
      { id: 6, label: 'Michel Camilleri\nViewer',image: 'https://lh3.googleusercontent.com/a-/ACB-R5RxStIkJMNjIGOm84bx6y3QhwGMPCh0e01HUWDwBto=s64' },
    ]);
 
    // create an array with edges
    const edges = new DataSet<any>([
      { from: '1', to: '5' },
      { from: '1', to: '6' },
      { from: '1', to: '3' },
      { from: '3', to: '4' },
      { from: '3', to: '2' },
    ]);

    const options = {
      directed: true,
          edges: {
            arrows: {
              to: {
                enabled: true
              }
            }
          },
          nodes: {
                shape: 'circularImage',
                image: 'image',
                label: 'Label'
            },
          interaction: {
                  dragNodes: false,
                  dragView: false
          }
      };
 
    const data = { nodes, edges };
 
    const container = this.visNetwork;
    this.networkInstance = new Network(container.nativeElement, data, options);
  }
}



