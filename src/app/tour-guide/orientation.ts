import {Orientation} from 'ngx-guided-tour';
export interface OrientationConfiguration {
    /** Where the tour step will appear next to the selected element */
    orientationDirection: Orientation,
    /** When this orientation configuration starts in pixels */
    maximumSize?: number
  }