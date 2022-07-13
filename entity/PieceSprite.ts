import { ChessInstance, Square } from "chess.js";
import { Rectangle, Sprite, Texture } from "pixi.js";
import { PieceColor } from "../types";
import { toIndex } from "../utils/mapping";
import { EvPieceSelected } from "../world/events/piece";
import { getWorld } from "../world/world";

class PieceSprite extends Sprite {
    constructor(
        texture: Texture,
        name: string,
        public color: PieceColor,
        public i: number,
        public j: number,

        private chess: ChessInstance,
    ) {
        super(texture);


        this.name = name;
        this.zIndex = 100;

        // makes piece click able
        this.interactive = true;
        this.buttonMode = true;
        this.hitArea = new Rectangle(0, 0, 32, 32);



        // register click handler
        this.addListener('click', (ev) => {
            this.onClick();
        });
     
    }

    moveTo(dst: Square) {
        const fromSq = this.toSquare();
        const result = this.chess.move({ from: fromSq, to: dst });
        console.debug('move result', result);
        if (result) {

            if (result.captured) {
                // TODO handle captured 
            }
            const { i, j } = toIndex(dst);
            this.i = i;
            this.j = j;
            this.setZIndex(i);
            this.x = j * 32 + 32;
            this.y = i * 32 + 32;
        } else {
            console.log(`${fromSq} can't move to ${dst}`);
        }
        return result;
    }

    onClick() {
        if (getWorld().state.turn !== this.color) {
            return;
        }
        this.showAvailablePos();
    }

    private showAvailablePos() {
        const squarePos = this.toSquare();
        const moveablePos = this.chess.moves({ square: squarePos, verbose: true });
        getWorld().app.stage.emit('evPieceSelected', {
            piece: this,
            moveablePos: moveablePos,
        } as EvPieceSelected);
    }






    toSquare(): Square {
        const a = String.fromCharCode(this.j + 97);
        const b = 8 - this.i;
        return (a + b) as Square;
    }





    setZIndex(i: number) {
        this.zIndex = (i + 1) * 10;
    }


    activeState() {
        this.alpha = 0.8;
    }

    deactiveState() {
        this.alpha = 1;
    }


}

export default PieceSprite;