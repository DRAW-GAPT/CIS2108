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
        dragView: true,
        zoomView: false,
        beforeDrag: (data: any) => {
          const node = data.nodes[0];
          const newPosition = data.pointer.canvas;
          const nodePosition = this.networkInstance.getPositions([node])[node];
          const container = this.visNetwork.nativeElement;
    
          // calculate the container bounds, taking into account padding
          const containerBounds = {
            minX: 50,
            minY: 50,
            maxX: container.clientWidth - 50,
            maxY: container.clientHeight - 50,
          };
    
          // calculate the new node position after dragging
          const newNodePosition = {
            x: nodePosition.x + newPosition.x - data.event.clientX,
            y: nodePosition.y + newPosition.y - data.event.clientY,
          };
    
          // check if the new position is within the container bounds
          if (
            newNodePosition.x < containerBounds.minX ||
            newNodePosition.y < containerBounds.minY ||
            newNodePosition.x > containerBounds.maxX ||
            newNodePosition.y > containerBounds.maxY
          ) {
            // if it's outside the bounds, return false to prevent dragging
            return false;
          }
    
          // if it's within the bounds, return true to allow dragging
          return true;
        },
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
  
    // Save the original position of the network
    const originalPosition = this.networkInstance.getViewPosition();
  
    // Add mousedown event listener to the container element
    container.nativeElement.addEventListener('mousedown', (event: MouseEvent) => {
      // Check if the mousedown event occurred inside the container
      const { left, top } = container.nativeElement.getBoundingClientRect();
      const x = event.clientX - left;
      const y = event.clientY - top;
      const isInsideContainer = x >= 0 && x <= container.nativeElement.offsetWidth
                            && y >= 0 && y <= container.nativeElement.offsetHeight;
      
      if (isInsideContainer) {
        // Release the current dragging gesture
        this.networkInstance.releaseFunction();
      }
    });
  
    // Add dragEnd event listener to reset the position if the network is dragged outside the container
    this.networkInstance.on('dragEnd', (params: any) => {
      const { x, y } = this.networkInstance.getViewPosition();
      const { left, top } = container.nativeElement.getBoundingClientRect();
      const offsetX = x - left;
      const offsetY = y - top;
      const isWithinContainer = offsetX >= 0 && offsetX <= container.nativeElement.offsetWidth
                              && offsetY >= 0 && offsetY <= container.nativeElement.offsetHeight;
      if (!isWithinContainer) {
        this.networkInstance.setView(originalPosition);
      }
    });
  
  

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

