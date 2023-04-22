import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { forEach } from 'lodash';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';

@Component({
  selector: 'app-share-tree',
  templateUrl: './share-tree.component.html',
  styleUrls: ['./share-tree.component.scss']
})

export class ShareTreeComponent implements AfterViewInit {
  private _nodes: any;
  private _edges: any;
  
  get nodes(): any {
    return this._nodes;
  }

  @Input()
  set nodes(value: any) {
    console.log("nodes setter")

    this._nodes = value;
    if (this.networkInstance) {
      this.updateGraph();
    }
  }  

  get edges(): any {
    return this._edges;
  }

  @Input()
  set edges(value: any) {
    console.log("edge setter")

    this._edges = value;
    if (this.networkInstance) {
      this.updateGraph();
    }
  }

  updateGraph(){
    console.log("updateGraph")
    if(!this.nodes || !this.edges)
      return;
    this.nodes.forEach((n: any) => {
      if(n.outline === "dashed") {  
        n.shapeProperties = {borderDashes: [5, 5, 5, 5]} 
        n.borderWidth = 5
      }
    });
    const nodes = new DataSet<any>(this._nodes);
    const edges = new DataSet<any>(this.edges);
    this.networkInstance.setData({ nodes,edges });
  }

  @ViewChild('visNetwork', { static: true }) visNetwork!: ElementRef;
  private networkInstance: any;

  constructor() {}

  ngAfterViewInit(): void {
    console.log(this.nodes, this._edges)
    const container = this.visNetwork;  
    const nodes = new DataSet<any>(this._nodes);
    const edges = new DataSet<any>(this._edges);
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
        label: 'Label',
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

