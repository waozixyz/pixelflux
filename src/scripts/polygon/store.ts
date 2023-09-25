import { fabric } from "fabric";
import { CustomRectOptions } from "./interfaces";

export interface Store {
    selectedSquare: fabric.Rect & CustomRectOptions | null ;
    colorPicker: string[];
}

export const store: Store = {
    selectedSquare: null,
    colorPicker: ["#FFD700", "#8B4513"]
};

export function setSelectedSquare(square: fabric.Rect & CustomRectOptions | null ) {
    store.selectedSquare = square;
}
