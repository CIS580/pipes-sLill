"use strict";

/* Classes */

/* Global variables */

var newGame = 1;
var endGame = 0;
var levelTimer;
var levelTimerCounter;
var level;
var score;
var collisionDetected;
var waterRects = [];
var waterRectIndex;
var pipes = [];
var currentFlowDir = "";
var currentPipe;
var leadingWaterX;
var leadingWaterY;
var levelCompleted;

//Visual HTML/CSS
var canvas = document.getElementById('screen');
var background = new Image();
background.src = 'assets/background.png';
var scoreDiv = document.getElementById('scoreDiv');
var levelDiv = document.getElementById('levelDiv');
var messageDiv = document.getElementById('messageDiv');
var timerDiv = document.getElementById('timerDiv');
var instructionsDiv = document.getElementById('instructions');
instructionsDiv.innerHTML = "Guide the water to the other side to advance to the next level. The faster you complete it, the higher your score. Left-Click pieces to rotate them."

//Audio
var backgroundMusic = new Audio('assets/BackgroundMusic.mp3');
var gameLossSound = new Audio('assets/GameOver.mp3');
var levelCompleteSound = new Audio('assets/LevelComplete.mp3');
var rotateSound = new Audio('assets/RotatePipe.mp3');


//Pipes
function Pipe()
{
    //Object properties
    this.pipeType;
    this.pipeX = 0;
    this.pipeY = 0;
    this.containsWater = false;
    this.UP = false;
    this.DOWN = false;
    this.LEFT = false;
    this.RIGHT = false;
    this.canUseUP = false;
    this.canUseDOWN = false;
    this.canUseLEFT = false;
    this.canUseRIGHT = false;


    //Sprite info
    this.spriteX;
    this.spriteY;
    this.spriteLength = 145;
    this.spriteWidth = 145;
    this.spritesheet = new Image();
    this.spritesheet.src = encodeURI('assets/pipes.png');
}

Pipe.prototype.update = function(type)
{
    this.pipeType = type;
    switch (this.pipeType) {
        //4-way piece
        case 0:
            this.spriteX = 0;
            this.spriteY = 0;
            this.UP = true;
            this.DOWN = true;
            this.LEFT = true;
            this.RIGHT = true;
            this.canUseUP = true;
            this.canUseDOWN = true;
            this.canUseLEFT = true;
            this.canUseRIGHT = true;
            break;
            //Curve piece (9-12 o'clock)
        case 1:
            this.spriteX = 32;
            this.spriteY = 32;
            this.LEFT = false;
            this.UP = false;
            this.DOWN = true;
            this.RIGHT = true;
            this.canUseLEFT = false;
            this.canUseUP = false;
            this.canUseDOWN = true;
            this.canUseRIGHT = true;
            break;
            //Curve piece (12-3 o'clock)
        case 2:
            this.spriteX = 64;
            this.spriteY = 32;
            this.UP = false;
            this.RIGHT = false;
            this.LEFT = true;
            this.DOWN = true;
            this.canUseUP = false;
            this.canUseRIGHT = false;
            this.canUseLEFT = true;
            this.canUseDOWN = true;
            break;
            //Curve piece (3-6 o'clock)
        case 3:
            this.spriteX = 64;
            this.spriteY = 64;
            this.DOWN = false;
            this.RIGHT = false;
            this.UP = true;
            this.LEFT = true;
            this.canUseDOWN = false;
            this.canUseRIGHT = false;
            this.canUseUP = true;
            this.canUseLEFT = true;
            break;
            //Curve piece (6-9 o'clock)
        case 4:
            this.spriteX = 32;
            this.spriteY = 64;
            this.LEFT = false;
            this.DOWN = false;
            this.RIGHT = true;
            this.UP = true;
            this.canUseLEFT = false;
            this.canUseDOWN = false;
            this.canUseRIGHT = true;
            this.canUseUP = true;
            break;
            //3-way (down)
        case 5:
            this.spriteX = 32;
            this.spriteY = 96;
            this.UP = false;
            this.DOWN = true;
            this.LEFT = true;
            this.RIGHT = true;
            this.canUseUP = false;
            this.canUseDOWN = true;
            this.canUseLEFT = true;
            this.canUseRIGHT = true;
            break;
            //3-way (left)
        case 6:
            this.spriteX = 64;
            this.spriteY = 96;
            this.RIGHT = false;
            this.UP = true;
            this.DOWN = true;
            this.LEFT = true;
            this.canUseRIGHT = false;
            this.canUseUP = true;
            this.canUseDOWN = true;
            this.canUseLEFT = true;
            break;
            //3-way (up)
        case 7:
            this.spriteX = 64;
            this.spriteY = 128;
            this.DOWN = false;
            this.UP = true;
            this.LEFT = true;
            this.RIGHT = true;
            this.canUseDOWN = false;
            this.canUseUP = true;
            this.canUseLEFT = true;
            this.canUseRIGHT = true;
            break;
            //3-way (right)
        case 8:
            this.spriteX = 32;
            this.spriteY = 128;
            this.LEFT = false;
            this.UP = true;
            this.DOWN = true;
            this.RIGHT = true;
            this.canUseLEFT = false;
            this.canUseUP = true;
            this.canUseDOWN = true;
            this.canUseRIGHT = true;
            break;
            //Short piece (vertical)
        case 9:
            this.spriteX = 96;
            this.spriteY = 64;
            this.LEFT = false;
            this.RIGHT = false;
            this.UP = true;
            this.DOWN = true;
            this.canUseLEFT = false;
            this.canUseRIGHT = false;
            this.canUseUP = true;
            this.canUseDOWN = true;
            break;
            //Short piece (horizontal)
        case 10:
            this.spriteX = 96;
            this.spriteY = 32;
            this.UP = false;
            this.DOWN = false;
            this.LEFT = true;
            this.RIGHT = true;
            this.canUseUP = false;
            this.canUseDOWN = false;
            this.canUseLEFT = true;
            this.canUseRIGHT = true;
            break;

    }
}

Pipe.prototype.render = function (ctx)
{
    ctx.drawImage(this.spritesheet, this.spriteX, this.spriteY, 31, 31, this.pipeX, this.pipeY, this.spriteWidth, this.spriteLength);
}

//Water
function WaterRect(x, y)
{
    this.xLength = 5;
    this.yLength = 5;
    this.xPos = x;
    this.yPos = y;
}

WaterRect.prototype.update = function(time)
{
    switch(currentFlowDir)
    {
        case "right":
            this.yLength = 5;
            this.xLength += 0.2 * level;
            leadingWaterX += 0.2 * level;
            break;
        case "left":
            this.yLength = 5;
            this.xLength -= 0.2 * level;
            leadingWaterX -= 0.2 * level;
            break;
        case "down":
            this.xLength = 5;
            this.yLength += 0.2 * level;
            leadingWaterY += 0.2 * level;
            break;
        case "up":
            this.xLength = 5;
            this.yLength -= 0.2 * level;
            leadingWaterY -= 0.2 * level;
            break;
        default:
            break;
    }
}

WaterRect.prototype.render = function(ctx)
{
    ctx.fillStyle = "blue";
    ctx.fillRect(this.xPos, this.yPos,this.xLength, this.yLength);
}

//Collision detection
function ABIntersect(aX, aY, bX, bY, isMouse)
{
    //Calculate lower-right corner of object
    var bx = bX + 144;
    var by = bY + 146;

    //Correcting for client values for mouse clicks
    if (isMouse == true)
    {
        aX -= 8;
        aY -= 88;
    }

    if (aX > bX && aX < bx && aY < by && aY > bY)
    {
        collisionDetected = 1;
    }
    else
    {
        collisionDetected = 0;
    }
}

//Only sections of a particular pipe piece that are connected to other open sections on a different pipe piece will be active. Other sections of that piece will be "capped off"
function CheckAdjacencies()
{
    for(var i = 2; i < pipes.length; i++)
    {
        //Left edge
        if (((currentPipe.pipeY - pipes[i].pipeY) < 15 && (currentPipe.pipeY - pipes[i].pipeY) > -15 && (currentPipe.pipeX - (pipes[i].pipeX + 145)) > -15 && (currentPipe.pipeX - (pipes[i].pipeX + 145)) < 15) || currentPipe.pipeX < 15)
        {
            if (pipes[i].RIGHT == false)
            {
                currentPipe.canUseLEFT = false;
            }
            else
            {
                currentPipe.canUseLEFT = currentPipe.LEFT;
            }
        }

        //Right edge
        if (((currentPipe.pipeY - pipes[i].pipeY) < 15 && (currentPipe.pipeY - pipes[i].pipeY) > -15 && ((currentPipe.pipeX + 145) - pipes[i].pipeX) > -15 && ((currentPipe.pipeX + 145) - pipes[i].pipeX) < 15) || (860 - (currentPipe.pipeX + 145)) < 30)
        {
            if (pipes[i].LEFT == false)
            {
                currentPipe.canUseRIGHT = false;
            }
            else
            {
                currentPipe.canUseRIGHT = currentPipe.RIGHT;
            }
        }

        //Bottom edge
        if (((currentPipe.pipeX - pipes[i].pipeX) > -15 && (currentPipe.pipeX - pipes[i].pipeX) < 15 && ((currentPipe.pipeY + 145) - pipes[i].pipeY) > -15 && ((currentPipe.pipeY + 145) - pipes[i].pipeY) < 15) || (1024 - currentPipe.pipeY + 145) < 30)
        {
            if (pipes[i].UP == false)
            {
                currentPipe.canUseDOWN = false;
            }
            else
            {
                currentPipe.canUseDOWN = currentPipe.DOWN;
            }
        }

        //Top edge
        if ((currentPipe.pipeX - pipes[i].pipeX) > -15 && (currentPipe.pipeX - pipes[i].pipeX) < 15 && (currentPipe.pipeY - (pipes[i].pipeY + 145)) > -15 || (currentPipe.pipeY - (pipes[i].pipeY + 145)) < 15)
        {
            if (pipes[i].DOWN == false)
            {
                currentPipe.canUseUP = false;
            }
            else
            {
                currentPipe.canUseUP = currentPipe.UP;
            }
        }

    }
}

function CheckAndAdvanceWater(elapsedTime)
{
    waterRectIndex = waterRects.length - 1;
    waterRects[waterRectIndex].update(elapsedTime);
    if (typeof currentPipe != "undefined")
    {
        CheckAdjacencies();
    }
    //Checking what pipe the water is now in
    for(var i = 0; i < pipes.length; i++)
    {
        ABIntersect(leadingWaterX, leadingWaterY, pipes[i].pipeX, pipes[i].pipeY, false);

        if (leadingWaterX > 1050 || leadingWaterX < -10
            || leadingWaterY > 880 || leadingWaterY < -10)
        {
            GameOver();
        }


        //Check that new pipes are correctly alligned when water enters the zone
        if(collisionDetected == 1 && currentPipe.containsWater != pipes[i].containsWater)
        {
            pipes[i].containsWater = true;
            currentPipe = pipes[i];
            CheckAdjacencies();
            if (currentFlowDir == "right" && typeof currentPipe != "undefined" && pipes[i].LEFT == false)
            {
                GameOver();
            }
            if (currentFlowDir == "left" && typeof currentPipe != "undefined" && pipes[i].RIGHT == false)
            {
                GameOver();
            }
            if (currentFlowDir == "up" && typeof currentPipe != "undefined" && pipes[i].DOWN == false)
            {
                GameOver();
            }
            if (currentFlowDir == "down" && typeof currentPipe != "undefined" && pipes[i].UP == false)
            {
                GameOver();
            }
            break;
        }
    }

    //Switch the direction of the water halfway through the pipe. Prioritizes gravity. Tries to flow towards connected pieces before making default actions
    switch(currentFlowDir)
    {
        case "right":
            if (leadingWaterX > (currentPipe.pipeX + 70))
            {
                if (currentPipe.DOWN == true && currentPipe.canUseDOWN == true) {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "down";
                }
                else if (currentPipe.RIGHT == true && currentPipe.canUseRIGHT == true) {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "right";
                }
                else if (currentPipe.UP == true && currentPipe.canUseUP == true) {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "up";
                }
                else {
                    if (currentPipe.DOWN == true) {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "down";
                    }
                    else if (currentPipe.RIGHT == true) {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "right";
                    }
                    else if (currentPipe.UP == true) {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "up";
                    }
                }
            }
            break;
        case "left":
            if (leadingWaterX < (currentPipe.pipeX + 72))
            {
                if (currentPipe.DOWN == true && currentPipe.canUseDOWN == true) {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "down";
                }

                else if (currentPipe.LEFT == true && currentPipe.canUseLEFT == true) {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "left";
                }
                else if (currentPipe.UP == true && currentPipe.canUseUP == true) {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "up";
                }
                else {
                    if (currentPipe.DOWN == true) {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "down";
                    }
                    else if (currentPipe.LEFT == true) {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "left";
                    }
                    else if (currentPipe.UP == true) {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "up";
                    }
                }
            }
            break;
        case "up":
            if (leadingWaterY < (currentPipe.pipeY + 72))
            {
                if (currentPipe.UP == true && currentPipe.canUseUP == true)
                {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "up";
                }
                else if (currentPipe.RIGHT == true && currentPipe.canUseRIGHT == true)
                {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "right";
                    currentPipe.DOWN = false;
                    currentPipe.canUseDOWN = false;

                }
                else if (currentPipe.LEFT == true && currentPipe.canUseLEFT == true)
                {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "left";
                    currentPipe.DOWN = false;
                    currentPipe.canUseDOWN = false;
                }
                else
                {
                    if (currentPipe.UP == true)
                    {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "up";
                    }
                    else if (currentPipe.RIGHT == true)
                    {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "right";
                    }
                    else if (currentPipe.LEFT == true)
                    {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "left";
                    }
                }
            }
            break;
        case "down":
            if (leadingWaterY > (currentPipe.pipeY + 72))
            {
                if (currentPipe.DOWN == true && currentPipe.canUseDOWN == true) {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "down";
                }
                else if (currentPipe.RIGHT == true && currentPipe.canUseRIGHT == true) {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "right";
                }
                else if (currentPipe.LEFT == true && currentPipe.canUseLEFT == true) {
                    waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                    waterRectIndex++;
                    currentFlowDir = "left";
                }
                else {

                    if (currentPipe.DOWN == true) {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "down";
                    }
                    else if (currentPipe.RIGHT == true) {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "right";
                    }
                    else if (currentPipe.LEFT == true) {
                        waterRects[waterRectIndex + 1] = new WaterRect(leadingWaterX, leadingWaterY);
                        waterRectIndex++;
                        currentFlowDir = "left";
                    }
                }
                }            
            break;
    }
}

canvas.oncontextmenu = function(event) {
    event.preventDefault();

    var mouseX = event.clientX;
    var mouseY = event.clientY;

    for(var i = 2; i < pipes.length; i++)
    {
        ABIntersect(mouseX, mouseY, pipes[i].pipeX, pipes[i].pipeY, true);

        if (collisionDetected == 1)
        {
            if (pipes[i].containsWater == false)
            {
                rotateSound.pause();
                rotateSound.currentTime = 0;
                rotateSound.play();
                switch (pipes[i].pipeType) {
                    case 0:
                        break;
                    case 4:
                        pipes[i].update(1);
                        break;
                    case 8:
                        pipes[i].update(5);
                        break;
                    case 10:
                        pipes[i].update(9);
                        break;
                    default:
                        pipes[i].update(pipes[i].pipeType += 1);
                        break;
                }
            }
        }
    }
}

//Sets variables and resets the board for a new game of Pipes
function NewGame()
{
    backgroundMusic.play();
    newGame = 0;
    waterRects = [];
    leadingWaterX = 15;
    leadingWaterY = 68;
    waterRects[0] = new WaterRect(leadingWaterX, leadingWaterY);
    currentFlowDir = "right";
    score = 0;
    levelCompleted = 0;
    level = 1;
    levelTimer = 0;
    levelTimerCounter = 1000;
    levelDiv.innerHTML = "1";
    scoreDiv.innerHTML = "0";
    messageDiv.innerHTML = "LEVEL 1";
    messageDiv.style.left = '435px';

    //Start and end pipe
    pipes[0] = new Pipe();
    pipes[0].update(10);
    pipes[1] = new Pipe();
    pipes[1].update(10);
    pipes[1].pipeX = 878;
    pipes[1].pipeY = 717;
    pipes[0].containsWater = true;
    currentPipe = pipes[0];

    //Remaining pipes randomly generated
    var type;
    var xIndex = 146;
    var yIndex = -5;
    for(var i = 2; i < 42; i++)
    {
        type = Math.floor(Math.random() * 11);
        pipes[i] = new Pipe();
        pipes[i].update(type)
        pipes[i].pipeX = xIndex;
        pipes[i].pipeY = yIndex;

        xIndex += 146;
        if(xIndex > 950)
        {
            xIndex = 0;
            yIndex += 144;
        }
    }
}

function NewLevel(ctx)
{
    levelCompleteSound.play();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    waterRects = []; waterRects[0] = new WaterRect(15, 68);
    currentFlowDir = "right";
    score = score + levelTimerCounter;
    levelCompleted = 0;
    level = level + 1;
    levelTimer = 0;
    levelTimerCounter = 1000;
    levelDiv.innerHTML = level;
    scoreDiv.innerHTML = score;
    messageDiv.innerHTML = "LEVEL " + level;
    messageDiv.style.left = '435px';

    //Start and end pipe
    pipes[0] = new Pipe();
    pipes[0].update(10);
    pipes[1] = new Pipe();
    pipes[1].update(10);
    pipes[1].pipeX = 878;
    pipes[1].pipeY = 717;
    pipes[0].containsWater = true;
    currentPipe = pipes[0];

    //Remaining pipes randomly generated
    var type;
    var xIndex = 146;
    var yIndex = -5;
    for (var i = 2; i < 42; i++) {
        type = Math.floor(Math.random() * 11);
        pipes[i] = new Pipe();
        pipes[i].update(type)
        pipes[i].pipeX = xIndex;
        pipes[i].pipeY = yIndex;

        xIndex += 146;
        if (xIndex > 950) {
            xIndex = 0;
            yIndex += 144;
        }
    }
}

//Ends the game
function GameOver()
{
    backgroundMusic.pause();
    gameLossSound.play();
    levelTimerCounter = 0;
    messageDiv.innerHTML = "GameOver";
    messageDiv.style.left = '395px';
    endGame = 1;
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {

    //Update timer
    levelTimer += elapsedTime;
    if (levelTimer > 1000) {
        levelTimer = 0;
        if (levelTimerCounter > 0)
        {
            levelTimerCounter -= 5;
        }
        messageDiv.innerHTML = "";
    }

    //Check if this is a new game. If so, initialize all values
    if(newGame == 1)
    {
        NewGame();
    }

    //Advancing water
    CheckAndAdvanceWater(elapsedTime);

    //Check if the level has been completed
    ABIntersect(leadingWaterX, leadingWaterY, pipes[1].pipeX, pipes[1].pipeY, false);
    if(collisionDetected == 1)
    {
        collisionDetected = 0;
        levelCompleted = 1;
    }
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    //Draw Pipes
    for (var i = 0; i < pipes.length; i++)
    {
        pipes[i].render(ctx);
    }

    //Draw water
    for (var i = 0; i < waterRects.length; i++)
    {
        waterRects[i].render(ctx);
    }

    //Increment timer
    timerDiv.innerHTML = levelTimerCounter;
    ctx.drawImage(background, 0, 0, 1044, canvas.height);

}

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(levelCompleted == 1)
  {
      levelCompleted = 0;
      NewLevel(this.frontCtx);
  }

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

var game = new Game(canvas, update, render);
/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function (timestamp) {
    if (endGame == 0)
    {
        game.loop(timestamp);
        window.requestAnimationFrame(masterLoop);
    }
}
masterLoop(performance.now());
