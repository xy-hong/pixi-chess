import { Application, Sprite, Texture, utils, Loader, Graphics } from 'pixi.js';
import { Chess } from 'chess.js';

//Construct a Pixi.JS application
const app = new Application({
  backgroundColor: 0x000000,
  resolution: window.devicePixelRatio || 1,
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.diplaye = 'block';
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(app.view);

setup();

function setup() {
  const chess = new Chess();
  const initBoard = chess.board();
  app.loader
  .add("image/chess.json")
  .load(() => {
    const scale = 1
    const padding = 32 * scale
    const sheet = app.loader.resources["image/chess.json"].spritesheet;
    drawChessBoard(padding, scale);
    palcePiece(initBoard, sheet, padding)
  })

  // Listen for animate update
  app.ticker.add((delta) => {
    // use delta to create frame-independent transform
    // container.rotation -= 0.01 * delta;
  });


}


function palcePiece(position, sheet, padding, scale = 1) {
  console.log(position)
  for(let row of position) {
    for(let cell of row) {
      if(cell) {
        // load sprite
        const sprite = getPieceSprite(sheet, cell.type, cell.color);
        const {x, y} = positionMapping(cell.square);
        sprite.x = x + padding;
        sprite.y = y + padding;
        app.stage.addChild(sprite);
      }
    }
  }
}

// draw a chess board
function drawChessBoard(padding, scale = 1) {
  // outer border
  const graphics = new Graphics();
  graphics.beginFill(0x333333)
  graphics.drawRect(0, 0, 32 * 10 * scale, 32 * 10 * scale);
  app.stage.addChild(graphics);

  // inner board
  let colorIndex = 0;
  const colors = [0xd1d1d1, 0x5c5c5c];
  for(let i=0; i<8; i++) {
    for(let j=0; j<8; j++) {
      const cell = new Graphics();
      cell.beginFill(colors[colorIndex]);
      colorIndex = (colorIndex + 1) % 2;
      cell.drawRect(i*32 + padding, j*32 + padding, 32, 32);
      cell.scale.x = scale
      cell.scale.y = scale
      app.stage.addChild(cell);
    }
    colorIndex = (colorIndex + 1) % 2;
  }
}

// get piece sprite
function getPieceSprite(sheet, pieceType, pieceColor) {
  const texture = sheet.textures[pieceColor + pieceType];
  const sprite = new Sprite(texture);
  return sprite;
}

// calculate the position of the piece
function positionMapping(square) {
  const i = square.charCodeAt(0) - 97;
  const j = 8 - Number(square.charAt(1))
  
  const x = i * 32;
  const y = j * 32;
  return {x, y} 
}