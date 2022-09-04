import { Rectangle, Sprite, Texture } from "pixi.js";
import { PieceColor } from "../types";
import { PieceSelectedEvent } from "../world/events/piece";
import { getWorld } from "../world/world";

class PieceSprite extends Sprite {
    constructor(
        texture: Texture,
        name: string,
        public color: PieceColor,
        public i: number,
        public j: number,
    ) {
        super(texture);
        this.name = name;
        this.zIndex = 100;
        this.hitArea = new Rectangle(0, 0, 32, 32);

        // register click handler
        this.addListener('click', (ev) => {
            this.showAvailablePos();
        });
     
    }

    private showAvailablePos() {
        getWorld().app.stage.emit('pieceSelectedEvent', {piece: this} as PieceSelectedEvent);
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