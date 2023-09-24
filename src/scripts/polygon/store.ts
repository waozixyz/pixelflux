import { fabric } from "fabric";
import { CustomRectOptions } from "./interfaces";

export interface Store {
    selectedSquare: fabric.Rect & CustomRectOptions | null ;
}

export const store: Store = {
    selectedSquare: null
};

// Helper functions to modify the store
export function setSelectedSquare(square: fabric.Rect & CustomRectOptions | null ) {
    store.selectedSquare = square;
}
