import { Application, Sprite, Graphics, Spritesheet } from 'pixi.js';
import { Chess, PieceType, Square } from 'chess.js';
import { toIndex, toSquare } from './utils/mapping'

//Construct a Pixi.JS application
const app = new Application({
  backgroundColor: 0x000000,
  resolution: window.devicePixelRatio || 1,
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';

app.renderer.resize(window.innerWidth, window.innerHeight);
app.stage.sortableChildren = true

document.body.appendChild(app.view);

const chess = new Chess();
const scale = 1
const padding = 32 * scale

setup();

function setup() {
  const initBoard = chess.board();
  app.loader
  .add("image/chess.json")
  .add("image/chess_active.json")
  .load(() => {
    const chessSheet = app.loader.resources["image/chess.json"].spritesheet;
    const activeChessSheet = app.loader.resources["image/chess_active.json"].spritesheet
    drawChessBoard(padding, scale);
    setupPiece(initBoard, chessSheet!!, padding)
  })

  // Listen for animate update
  app.ticker.add((delta) => {
    // use delta to create frame-independent transform
    // container.rotation -= 0.01 * delta;
  });


}

function setupPiece(position, sheet: Spritesheet, padding: number, scale = 1) {
  console.log(position)
  for (let i=0; i<8; i++) {
    for(let j=0; j<8; j++) {
      const cell = position[i][j]
      if(cell) {
        // load sprite
        const sprite = getPieceSprite(sheet, cell.type, cell.color);
        sprite.interactive = true
        sprite.buttonMode = true
        const {x, y} = positionMapping(cell.square);
        sprite.x = x + padding;
        sprite.y = y + padding;
        sprite.addListener('click', (e)=> pieceOnclick(e, i, j))
        app.stage.addChild(sprite);
      }
    }
  }
}

// draw a chess board
function drawChessBoard(padding: number, scale = 1) {
  // outer border
  const graphics = new Graphics();
  graphics.beginFill(0x333333)
  graphics.drawRect(0, 0, 32 * 10 * scale, 32 * 10 * scale);
  graphics.zIndex = 1
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
      cell.zIndex = 2
      app.stage.addChild(cell);
    }
    colorIndex = (colorIndex + 1) % 2;
  }
}

type PieceColor = 'w' | 'b'

// get piece sprite
function getPieceSprite(sheet: Spritesheet, pieceType: PieceType, pieceColor: PieceColor) {
  const texture = sheet.textures[pieceColor + pieceType];
  const sprite = new Sprite(texture);
  sprite.zIndex = 100
  return sprite;
}

// calculate the position of the piece
function positionMapping(square: Square) {
  const {i, j} = toIndex(square)
  const y = i * 32;
  const x = j * 32;
  return {x, y} 
}

// pieces onClick 
function pieceOnclick(e, i: number, j: number) {
  const p = toSquare(i, j)
  const aviliablePosstions = chess.moves({square: p, verbose: true})
  // todo draw a cycle on aviliable square
  console.log('e', e)
  console.log('onClick', i, j)
  console.log('aviliable postions', aviliablePosstions)
  for(const move of aviliablePosstions) {
      const {x, y} = positionMapping(move.to)
      const highlight = new Graphics()
      highlight.beginFill(0xfa66a5)
      highlight.drawRect(x + padding, y + padding, 32, 32);
      highlight.zIndex = 3
      console.log('highlight ', x+padding, y+padding)
      app.stage.addChild(highlight)
  }        
  
}