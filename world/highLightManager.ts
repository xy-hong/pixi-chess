import { Move } from "chess.js";
import { Graphics } from "pixi.js";
import PieceSprite from "../entity/PieceSprite";
import { positionMapping } from "../utils/mapping";
import { getWorld } from "./world";

const HIGHLIGHT_ZINDEX = 2;

export class HighlightManager {
    private selected: PieceSprite;
    private highlights: Graphics[];
    private lastMoveHighLight: Graphics[];
    constructor(
        private padding: number,
    ) {
        this.highlights = [];
        this.lastMoveHighLight = [];
    }

    changeSelected(piece: PieceSprite ) {
        if (this.selected === piece) {
            return;
        }
        const world = getWorld();
        const moveablePos = world.chess.moves({square: piece.toSquare(), verbose: true})
        this.cleanHiglights();
        this.selected = piece;
        const prePos = piece.toSquare();
        for (const move of moveablePos) {
            const { x, y } = positionMapping(move.to);
            const hl = this.newHighLight(x, y);
            hl.addListener('click', () => {
                const from = piece.toSquare()
                const moveResult = world.chess.move({from: from, to: move.to})
                if (moveResult) {

                    if(world.chess.game_over()) {
                        alert("Game Over");
                    }

                    world.renderPieces();
                    world.state.lastMove = { from: prePos, to: move.to };
                    console.info('move to ', move.to);
                    piece.deactiveState();
                    this.cleanHiglights();
                }
            });

            world.app.stage.addChild(hl);
            this.highlights.push(hl);
        }
        console.log('highlights', world.chess.moves({ square: prePos, verbose: true }));
    }

    private cleanHiglights() {
        console.log('cleaning')
        for (const h of this.highlights) {
            h.destroy();
        }
        this.highlights = [];
    }

    private cleanLastMoveHighLight() {
        for(const hl of this.lastMoveHighLight) {
            hl.destroy();
        }
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