
launchPingPongGame = function (windowId, isMaster) {
    var data = {"masterPosition": infos.position};
    var canvas = createCanvas(windowId, "PING PONG", 400, 300, "game", isMaster, false, data);
    if (isMaster) {
        shareMediaDisplay(windowId, "ping-pong", "PING PONG", false, data);
    }
    var game = {
        // Initialize canvas and required variables
        canvas : canvas,
        W : canvas.width, // Window's width
        H : canvas.height, // Window's height
        particles : [], // Array containing particles
        ball : {}, // Ball object
        paddles : [2], // Array containing two paddles
        mouse : {}, // Mouse object to store it's current position
        points : 0, // Varialbe to store points
        fps : 60, // Max FPS (frames per second)
        particlesCount : 20, // Number of sparks when ball strikes the paddle
        flag : 0, // Flag variable which is changed on collision
        particlePos : {}, // Object to contain the position of collision 
        multiplier : 1, // Varialbe to control the direction of sparks
        startBtn : {}, // Start button object
        restartBtn : {}, // Restart button object
        over : 0, // flag varialbe, cahnged when the game is over
        init: {}, // variable to initialize animation
        paddleHit: {},
        quitBtn: { x: 0, y: 0, h: 0, w: 0 },
        areaSide : 0,

        // Initialise the collision sound
        collision : document.getElementById("collide"),
        
        // Set the canvas's height and width to full screen
        //canvas.width = W;
        //canvas.height = H;
        
        // Function to paint canvas
        paintCanvas : function (canvas) {
            var ctx = canvas.getContext("2d");
            //ctx.rotate(90 * Math.PI / 180);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, this.W, this.H);
        },

        // Function for creating particles object
        createParticles : function (x, y, m) {
            this.x = x || 0;
            this.y = y || 0;
            
            this.radius = 1.2;
            
            this.vx = -1.5 + Math.random() * 3;
            this.vy = m * Math.random() * 1.5;
        },
        
        // Draw everything on canvas
        draw : function (canvas) {
            this.paintCanvas(canvas);
            var ctx = canvas.getContext("2d");
            
            //for (var i = 0; i < this.paddles.length; i++) {
            //    p = this.paddles[i];
            
            //    ctx.fillStyle = "white";
            //    ctx.fillRect(p.x, p.y, p.w, p.h);
            //}
            p = this.paddles[1];
            ctx.fillStyle = "white";
            ctx.fillRect(p.x, p.y, p.w, p.h);
            
            this.ball.draw(canvas);
            if (windowList[windowId].isTiled) {
                this.quitBtn.draw(canvas);
            }
            this.update(canvas);
        },
        
        // Function to increase speed after every 5 points
        increaseSpd : function () {
            if (this.points % 4 == 0) {
                if (Math.abs(this.ball.vx) < 15) {
                    this.ball.vx += (this.ball.vx < 0) ? -1 : 1;
                    this.ball.vy += (this.ball.vy < 0) ? -2 : 2;
                }
            }
        },
        
        moveBall : function () {
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;
        },
        movePaddle : function (paddleId, x) {
            this.paddles[paddleId].x = x;
        },
        
        // Function to update positions, score and everything.
        // Basically, the main game logic is defined here
        update : function (canvas) {
            // Update scores
            this.updateScore(canvas);
            
            // Move the paddles on mouse move
            if (this.mouse.x && this.mouse.y) {
                //Move only his paddle
                this.movePaddle(1, this.mouse.x - p.w / 2);
                askRemoteGameControl(windowId, "ping-pong", "movePaddle", { "id": 2, "x": this.paddles[1].x, "W": this.W }, "except-host");
            }
            
            if (isMaster) {
                // Move the ball
                this.moveBall();
                askRemoteGameControl(windowId, "ping-pong", "moveBall", { "x": this.ball.x, "y": this.ball.y, "W": this.W, "H": this.H }, "except-host");
            }
            
            // Collision with paddles
            p1 = this.paddles[1];
            p2 = this.paddles[2];
            
            // If the ball strikes with paddles,
            // invert the y-velocity vector of ball,
            // increment the points, play the collision sound,
            // save collision's position so that sparks can be
            // emitted from that position, set the flag variable,
            // and change the multiplier
            if (this.collides(this.ball, p1)) {
                this.collideAction(this.ball, p1);
            }
	
	
            else if (this.collides(this.ball, p2)) {
                this.collideAction(this.ball, p2);
            } 
	
            else {
                // Collide with walls, If the ball hits the top/bottom,
                // walls, run gameOver() function
                if (this.ball.y + this.ball.r > this.H) {
                    this.ball.y = this.H - this.ball.r;
                    if (isMaster) {
                        this.gameOver(canvas);
                        askRemoteGameControl(windowId, "ping-pong", "gameOver", "", "except-host");
                    }
                } 
		
                else if (this.ball.y < 0) {
                    this.ball.y = this.ball.r;
                    if (isMaster) {
                        this.gameOver(canvas);
                        askRemoteGameControl(windowId, "ping-pong", "gameOver", "", "except-host");
                    }
                }
                
                // If ball strikes the vertical walls, invert the 
                // x-velocity vector of ball
                if (this.ball.x + this.ball.r > this.W) {
                    this.ball.vx = -this.ball.vx;
                    this.ball.x = this.W - this.ball.r;
                }
		
                else if (this.ball.x - this.ball.r < 0) {
                    this.ball.vx = -this.ball.vx;
                    this.ball.x = this.ball.r;
                }
            }

            // If flag is set, push the particles
            if (this.flag == 1) {
                for (var k = 0; k < this.particlesCount; k++) {
                    this.particles.push(new this.createParticles(this.particlePos.x, this.particlePos.y, this.multiplier));
                }
            }
            
            // Emit particles/sparks
            this.emitParticles(this.canvas);
            
            // reset flag
            this.flag = 0;
        },
        
        //Function to check collision between ball and one of
        //the paddles
        collides : function (b, p) {
            if (b.x + this.ball.r >= p.x && b.x - this.ball.r <= p.x + p.w) {
                if (b.y >= (p.y - p.h) && p.y > 0) {
                    this.paddleHit = 1;
                    return true;
                }
		
                else if (b.y <= p.h && p.y == 0) {
                    this.paddleHit = 2;
                    return true;
                }
		
                else return false;
            }
        },
        
        //Do this when collides == true
        collideAction : function (ball, p) {
            ball.vy = -ball.vy;
            
            if (this.paddleHit == 1) {
                ball.y = p.y - p.h;
                this.particlePos.y = ball.y + ball.r;
                this.multiplier = -1;
                this.flag = 1;
            }
	
            else if (this.paddleHit == 2) {
                ball.y = p.h + ball.r;
                this.particlePos.y = ball.y - ball.r;
                this.multiplier = 1;
            }
            if (isMaster) {
                askRemoteGameControl(windowId, "ping-pong", "increasePoints", "", "except-host");
                this.increasePoints();
            }
            this.increaseSpd();
            
            if (this.collision) {
                if (this.points > 0)
                    this.collision.pause();
                
                this.collision.currentTime = 0;
                this.collision.play();
            }
            
            this.particlePos.x = ball.x;
            
        },
        
        // Function for emitting particles
        emitParticles : function (canvas) {
            var ctx = canvas.getContext("2d");
            for (var j = 0; j < this.particles.length; j++) {
                par = this.particles[j];
                
                ctx.beginPath();
                ctx.fillStyle = "white";
                if (par.radius > 0) {
                    ctx.arc(par.x, par.y, par.radius, 0, Math.PI * 2, false);
                }
                ctx.fill();
                
                par.x += par.vx;
                par.y += par.vy;
                
                // Reduce radius so that the particles die after a few seconds
                par.radius = Math.max(par.radius - 0.05, 0.0);
		
            }
        },
        // Function for updating points
        increasePoints : function () {
            this.points++; 
        },

        // Function for updating score
        updateScore : function (canvas) {
            var ctx = canvas.getContext("2d");
            ctx.fillStlye = "white";
            ctx.font = "16px Arial, sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText("Score: " + this.points, 20, 20);
        },
        
        // Function to run when the game overs
        gameOver : function (canvas) {
            var ctx = canvas.getContext("2d");
            ctx.fillStlye = "white";
            ctx.font = "20px Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Game Over - You scored " + this.points + " points!", this.W / 2, (this.H / 2) + 25);

            // Stop the Animation
            cancelRequestAnimFrame(this.init);
            
            // Set the over flag
            this.over = 1;
            
            // Show the restart button
            this.restartBtn.draw(canvas);
        },
        
        
        
        // Function to execute at startup
        startScreen : function (canvas) {
            this.draw(canvas);
            this.startBtn.draw(canvas);
        },
        launchFullScreen: function () {
            fullWindowPingPong();
        },
        
        start : function () {
            animloop(this.canvas);
            // Delete the start button after clicking it
            this.startBtn = {};
        },
        restart : function () {
            this.ball.x = 20;
            this.ball.y = 20;
            this.points = 0;
            this.ball.vx = 4;
            this.ball.vy = 8;
            this.over = 0;
            animloop(this.canvas);
        }
    }
    
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.oRequestAnimationFrame || 
		window.msRequestAnimationFrame ||  
		function (callback) {
            return window.setTimeout(callback, 1000 / game.fps);
        };
    })();
    
    window.cancelRequestAnimFrame = (function () {
        return window.cancelAnimationFrame ||
		window.webkitCancelRequestAnimationFrame ||
		window.mozCancelRequestAnimationFrame ||
		window.oCancelRequestAnimationFrame ||
		window.msCancelRequestAnimationFrame ||
		clearTimeout
    })();

    // Function for running the whole animation
    animloop = function () {
        game.init = requestAnimFrame(animloop);
        game.draw(game.canvas);
    }
    
    
    startPingPong = function () {
        // Function for creating paddles
        Paddle = function (pos) {
            // Height and width
            this.h = 5;
            this.w = 150;
            
            // Paddle's position
            this.x = (game.W / 2) - (this.w / 2);
            this.y = (pos == "top") ? 0 : game.canvas.height - this.h;
	
        }
        
        // Push two new paddles into the paddles[] array
        game.paddles.push(new Paddle("bottom"));
        game.paddles.push(new Paddle("top"));
        
        // Ball object
        game.ball = {
            x: 50,
            y: 50, 
            r: 5,
            c: "white",
            vx: 4,
            vy: 8,
            
            // Function for drawing ball on canvas
            draw: function (canvas) {
                //Show ball if it is on the upper area side
                if ((this.y - (game.canvas.height / 2)) >= 0) {
                    var ctx = canvas.getContext("2d");
                    ctx.beginPath();
                    ctx.fillStyle = this.c;
                    ctx.arc(this.x, (2 * this.y) - game.H, this.r, 0, Math.PI * 2, false);
                    ctx.fill();
                }
            }
        };
        
        // Start Button object
        game.startBtn = {
            w: 100,
            h: 50,
            x: game.W / 2 - 50,
            y: (game.canvas.height) / 2 - 25,
            
            draw: function (canvas) {
                var ctx = canvas.getContext("2d");
                ctx.strokeStyle = "white";
                ctx.lineWidth = "2";

                ctx.strokeRect(this.x, this.y, this.w, this.h);
                ctx.font = "18px Arial, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStlye = "white";
                ctx.fillText("Start", this.x + 50, this.y + 25);
            }
        };
        
        // Restart Button object
        game.restartBtn = {
            w: 100,
            h: 50,
            x: game.canvas.width / 2 - 50,
            y: game.canvas.height / 2 - 50,
            
            draw: function (canvas) {
                var ctx = canvas.getContext("2d");
                ctx.strokeStyle = "white";
                ctx.lineWidth = "2";
                ctx.strokeRect(this.x, this.y, this.w, this.h);
                ctx.font = "18px Arial, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStlye = "white";
                ctx.fillText("Restart", this.x + 50, this.y + 25);
            }
        };
        
        // Restart Button object
        game.quitBtn = {
            w: 90,
            h: 50,
            x: 5,
            y: game.canvas.height - 55,
            
            draw: function (canvas) {
                var ctx = canvas.getContext("2d");
                ctx.strokeStyle = "white";
                ctx.lineWidth = "2";
                ctx.strokeRect(this.x, this.y, this.w, this.h);
                ctx.font = "18px Arial, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "white";
                ctx.fillText("Quit", this.x + 50, this.y + 25);
            }
        };
        // Show the start screen
        game.startScreen(game.canvas);
    }
    //Stop animation and reset game data
    cancelPingPong = function () {
        // Stop the Animation
        cancelRequestAnimFrame(game.init);
        
        // Set the over flag
        game.over = 1;
        game.paddles = [2];
    }
    
    // Track the position of mouse cursor
    trackPosition = function (e) {
        if (e.type == "touchmove") {
            e.preventDefault();
            var x = e.changedTouches[0].clientX;
            var y = e.changedTouches[0].clientY;
        }
        else {
            var x = e.offsetX;
            var y = e.offsetY;
        }
        //var x = (game.W * e.offsetX) / e.currentTarget.width;
        //var y = (game.H * e.offsetY) / e.currentTarget.height; 
        game.mouse.x = x;
        game.mouse.y = y;
    };

    // On button click (Restart and start)
    btnClick = function (e) {
        // Variables for storing mouse position on click
        var mx = e.offsetX;
        var my = e.offsetY;
        
        // Click start button
        if (mx >= game.startBtn.x && mx <= (game.startBtn.x + game.startBtn.w) && my >= game.startBtn.y && my <= (game.startBtn.y + game.startBtn.h)) {
            askRemoteGameControl(windowId, "ping-pong", "start", "", "except-host");
            game.start();
        }
        
        // If the game is over, and the restart button is clicked
        if (game.over == 1) {
            if (mx >= game.restartBtn.x && mx <= (game.restartBtn.x + game.restartBtn.w) && my >= game.restartBtn.y && my <= (game.restartBtn.y + game.restartBtn.h)) {
                askRemoteGameControl(windowId, "ping-pong", "restart", "" , "except-host");
                game.restart();
            }
        }
        if (windowList[windowId].isTiled) {
            if (mx >= game.quitBtn.x && mx <= (game.quitBtn.x + game.quitBtn.w) && my >= game.quitBtn.y && my <= (game.quitBtn.y + game.quitBtn.h)) {
                askRemoteGameControl(windowId, "ping-pong", "endfullscreen", "", "all");
            }
        }
    }
    
    
    function fullWindowPingPong() {
        if (!fullWindowState) {
            fullWindowState = true;
            var windowId = canvas.id.split('canvas')[1];
            
            // Canvas goes full window
            var canvasFullscreen = document.getElementById('canvasFullscreen');
            launchFullScreen(document.documentElement);
            
            saveLeft = canvas.parentElement.parentElement.offsetLeft;
            saveTop = canvas.parentElement.parentElement.offsetTop;
            saveDisplay = canvas.style.display;
            canvas.style.display = "none";
            
            canvasFullscreen.width = window.innerWidth;
            canvasFullscreen.height = window.innerHeight;
            canvasFullscreen.style.display = "block";
            
            game.canvas = canvasFullscreen;
            game.W = canvasFullscreen.width;
            game.H = canvasFullscreen.height;
                        
            var endFullscreen = function (e) {
                cancelFullScreen(document.documentElement);
                canvas.style.display = saveDisplay;
                game.canvas = canvas;
                game.W = canvas.width;
                game.H = canvas.height;
                canvas.parentElement.parentElement.style.top = saveTop + "px";
                canvas.parentElement.parentElement.style.left = saveLeft + "px";
                
                
                canvasFullscreen.style.display = "none";
                fullWindowState = false;
                
                canvasFullscreen.removeEventListener("mousemove", trackPosition, false);
                canvasFullscreen.removeEventListener("touchmove", trackPosition, false);
                canvasFullscreen.removeEventListener("mousedown", btnClick, false);
                canvas.removeEventListener("endfullscreen", endFullscreen, false);
                
                cancelPingPong();
                startPingPong();
            }
            var askEndFullscreen = function (e) {
                askRemoteGameControl(windowId, "ping-pong", "endfullscreen", "", "all");
            }
            
            canvasFullscreen.addEventListener("mousemove", trackPosition, false);
            canvasFullscreen.addEventListener("touchmove", trackPosition, false);
            canvasFullscreen.addEventListener("mousedown", btnClick, false);
            canvas.addEventListener('endfullscreen', endFullscreen , false);
            //fullscreenButton.addEventListener('mousedown', askEndFullscreen , false);
            cancelPingPong();
            startPingPong();
        }
    }
    
    // Add mousemove and mousedown events to the canvas
    canvas.addEventListener("mousemove", trackPosition, true);
    canvas.addEventListener("touchmove", trackPosition, true);
    canvas.addEventListener("mousedown", btnClick, true);
    canvas.addEventListener("touchdown", btnClick, true);

    windowList[windowId].data = { "game": game }

    startPingPong();
}