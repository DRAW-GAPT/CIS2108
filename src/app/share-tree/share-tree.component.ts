import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';

@Component({
  selector: 'app-share-tree',
  templateUrl: './share-tree.component.html',
  styleUrls: ['./share-tree.component.scss']
})

export class ShareTreeComponent implements AfterViewInit {
  @Input() permissions: any;
  @ViewChild('visNetwork', { static: true }) visNetwork!: ElementRef;
  private networkInstance: any;

  constructor() {}

  ngAfterViewInit(): void {
    const container = this.visNetwork;

    let temp: any[] = []
    this.permissions.forEach((p: any, i: number) => {
      let name = p.id === 'anyoneWithLink' ? "Anyone with link" : p.displayName || "Unknown user"
      temp.push({
        id: i, 
        label: name + '\n' + capitaliseFirstLetter(p.role), 
        image: p.photoLink ?? 'https://lh3.googleusercontent.com/a/default-user=s64', 
        title: p.id === 'anyoneWithLink' ? "Anyone with link" : p.emailAddress || "Unknown email address"      })
    });
  
    const nodes = new DataSet<any>(temp);
 
    const edges = new DataSet<any>([
      { from: '1', to: '5' },
      { from: '1', to: '6' },
      { from: '1', to: '3' },
      { from: '3', to: '4' },
      { from: '3', to: '2' },
    ]);

    const options = {
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
        dragView: false,
        zoomView: false,
      },
      layout: {
        hierarchical: {
          direction: "LR", 
          levelSeparation: 150, 
          nodeSpacing: 100,
        },
      },
    };
 
    const data = { nodes, edges };
    this.networkInstance = new Network(container.nativeElement, data, options);
  }

  zoomIn() {
    const newScale = this.networkInstance.getScale() * 1.5;
    this.networkInstance.moveTo({ scale: newScale });
  }

  zoomOut() {
    const newScale = this.networkInstance.getScale() / 1.5;
    this.networkInstance.moveTo({ scale: newScale });
  }
}

function capitaliseFirstLetter(s: string): string{
  let temp = s.charAt(0).toUpperCase() + s.slice(1);
  return temp
}

