import { fabric } from "fabric";
import { CustomRectOptions } from "./interfaces";

export interface Store {
    selectedSquare: fabric.Rect & CustomRectOptions | null ;
    currentBlockchainTab: string;
}

export const store: Store = {
    selectedSquare: null,
    currentBlockchainTab: "polygon-content"
};

// Helper functions to modify the store
export function setSelectedSquare(square: fabric.Rect & CustomRectOptions | null ) {
    store.selectedSquare = square;
}

export function setCurrentBlockchainTab(tab: string) {
    store.currentBlockchainTab = tab;
}
