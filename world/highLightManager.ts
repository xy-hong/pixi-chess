import { Move } from "chess.js";
import { Graphics } from "pixi.js";
import PieceSprite from "../entity/PieceSprite";
import { positionMapping } from "../utils/mapping";
import { getWorld } from "./world";

const HIGHLIGHT_ZINDEX = 2;

export class HighlightManager {
    private selected: PieceSprite;
    private highlights: Graphics[];
    constructor(
        private padding: number,
    ) {
        this.highlights = [];
    }

    changeSelected(piece: PieceSprite, moveablePos: Move[]) {
        if (this.selected === piece) {
            return;
        }
        console.log("hls: ", this.highlights)
        this.cleanHiglights();
        const world = getWorld();
        this.selected = piece;
        const prePos = piece.toSquare();
        for (const move of moveablePos) {
            const { x, y } = positionMapping(move.to);
            const hl = this.newHighLight(x, y);
            hl.addListener('click', () => {
                if (piece.moveTo(move.to)) {
                    world.changeTurn();
                    world.state.lastMove = { from: prePos, to: move.to };
                    console.debug('move to ', move.to);
                    piece.deactiveState();
                    this.cleanHiglights();
                }
            });

            world.app.stage.addChild(hl);
            this.highlights.push(hl);
        }
        console.log('highlights', world.chess.moves({ square: prePos }));
    }

    private cleanHiglights() {
        console.log('cleaning')
        for (const h of this.highlights) {
            h.destroy();
        }
        this.highlights = [];
    }

    private newHighLight(x: number, y: number): Graphics {
        const hl = new Graphics();
        hl.beginFill(0xfa66a5);
        hl.drawRect(x + this.padding, y + this.padding, 32, 32);

        hl.alpha = 0.5;
        hl.zIndex = HIGHLIGHT_ZINDEX;
        hl.interactive = true;
        hl.buttonMode = true;
        return hl;
    }


}