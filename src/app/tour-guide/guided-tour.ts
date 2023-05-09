import { TourStep } from "./tour-step";
export interface GuidedTour {
    /** Identifier for tour */
    tourId: string;
    /** Use orb to start tour */
    useOrb?: boolean;
    /** Steps for the tour */
    steps: TourStep[];
    /** Function will be called when tour is skipped */
    skipCallback?: (stepSkippedOn: number) => void;
    /** Function will be called when tour is completed */
    completeCallback?: () => void;
    /** Minimum size of screen in pixels before the tour is run, if the tour is resized below this value the user will be told to resize */
    minimumScreenSize?: number;
    /** Dialog shown if the window width is smaller than the defined minimum screen size. */
    resizeDialog?: {
        /** Resize dialog title text */
        title?: string;
        /** Resize dialog text */
        content: string;
    }
  }
  