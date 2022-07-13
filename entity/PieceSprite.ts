import { Square } from "chess.js";
import { Sprite, Texture } from "pixi.js";
import { PieceColor } from "../types";
import { toIndex } from "../utils/mapping";

class PieceSprite extends Sprite {
    name: string;
    color: PieceColor;
    i: number;
    j: number;

    constructor(texture: Texture, name: string, color: PieceColor, i: number, j: number) {
        super(texture);
        this.name = name;
        this.color = color;
        this.i = i;
        this.j = j;
        this.setZIndex(i);
    }

    setZIndex(i: number) {
        this.zIndex = (i + 1) * 10;
    }

    moveToIndex(i: number, j: number) {
        this.i = i;
        this.j = j;
        // TODO
        this.setZIndex(i);
        this.x = j * 32 + 32;
        this.y = i * 32 + 32;
    }


    moveToSquare(square: Square) {
        const { i, j } = toIndex(square);
        this.moveToIndex(i, j);
    }

    activeState() {
        this.alpha = 0.8;
    }

    deactiveState() {
        this.alpha = 1;
    }

        
}

export default PieceSprite;