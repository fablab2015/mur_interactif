launchDrawing = function (windowId, isMaster) {
    var data = { "masterPosition": infos.position };
    var canvas = createCanvas(windowId, "DRAWING", 400, 300, "game", isMaster, false, data);
    if (isMaster) {
        shareMediaDisplay(windowId, "drawing", "DRAWING", false, data);
    }
    
    var app = {
        // Initialize canvas and required variables
        canvas : canvas,
        mouse : { x: 0, y: 0 }, // Array containing particles
        // Function to paint canvas
        paint : function (canvas, x, y, color) {
            var ctx = canvas.getContext('2d');
            ctx.lineWidth = 5;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = color;
            ctx.lineTo(x, y);
            ctx.stroke();
        },
        preparePaint : function (canvas, x, y) {
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    }
    
    var ctx = app.canvas.getContext('2d');
    onPaint = function () {
        var color;
        
        if (infos.orientation == "NW") { color = 'blue'; }
        if (infos.orientation == "NE") { color = 'green'; }
        if (infos.orientation == "SW") { color = 'red'; }
        if (infos.orientation == "SE") { color = 'yellow'; }
        
        app.paint(app.canvas, app.mouse.x, app.mouse.y, color)
        askRemoteGameControl(windowId, "drawing", "paint", { "x": app.mouse.x, "y": app.mouse.y, "color": color}, "except-host");
    }
    /* Mouse Touch Capturing Work */
    
    trackPosition = function (e) {
        if (e.type == "touchmove") {
            e.preventDefault();
            var x = e.changedTouches[0].pageX - $("#" + canvas.parentElement.parentElement.id).position().left;
            var y = e.changedTouches[0].pageY - $("#" + canvas.parentElement.parentElement.id).position().top - $("#" + canvas.parentElement.id).position().top - 10;
        }
        else {
            var x = e.offsetX;
            var y = e.offsetY;
        }
        //var x = (game.W * e.offsetX) / e.currentTarget.width;
        //var y = (game.H * e.offsetY) / e.currentTarget.height; 
        app.mouse.x = x;
        app.mouse.y = y;
    };
    
    
    canvas.addEventListener("mousemove", trackPosition, false);
    canvas.addEventListener("touchmove", trackPosition, false);
    canvas.addEventListener('mousedown', function (e) {
        app.preparePaint(app.canvas, app.mouse.x, app.mouse.y)
        askRemoteGameControl(windowId, "drawing", "preparePaint", { "x": app.mouse.x, "y": app.mouse.y }, "except-host");
        canvas.addEventListener('mousemove', onPaint, false);
    }, false);
    
    canvas.addEventListener('mouseup', function () {
        canvas.removeEventListener('mousemove', onPaint, false);
    }, false);
    
    canvas.addEventListener('touchstart', function (e) {
        x = e.changedTouches[0].pageX - $("#" + canvas.parentElement.parentElement.id).position().left;
        y = e.changedTouches[0].pageY - $("#" + canvas.parentElement.parentElement.id).position().top - $("#" + canvas.parentElement.id).position().top - 10;
        app.mouse.x = x;
        app.mouse.y = y;
        app.preparePaint(app.canvas, app.mouse.x, app.mouse.y)
        askRemoteGameControl(windowId, "drawing", "preparePaint", { "x": app.mouse.x, "y": app.mouse.y }, "except-host");
        canvas.addEventListener('touchmove', onPaint, false);
    }, false);
    
    canvas.addEventListener('touchend', function () {
        canvas.removeEventListener('touchmove', onPaint, false);
    }, false);
    
    windowList[windowId].data = { "game": app }
}