//=============================================================================
// LOAD VIDEO AND SHARE IT TO OTHER CLIENTS
//=============================================================================
function loadPicture(windowId, url) {
    
    var img = new Image();
    img.src = url;
    // when the image loaded, draw the image on HTML5 canvas
    img.addEventListener("load", function () {
        var data = { "masterPosition": infos.position, "image": this }
        var canvas = createCanvas(windowId, "IMAGE", 400, 300, "picture", true, true, data);
        
        var backing_canvas = document.getElementById("backing_" + canvas.id);
        backing_canvas.height = this.height;
        backing_canvas.width = this.width;
        var backing_context = backing_canvas.getContext('2d');
        backing_context.drawImage(img, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
        
        //var context = canvas.getContext('2d');
        //context.drawImage(backing_canvas, 0, 0, canvasToDraw.width, canvasToDraw.height); 
        //var data = { "image": this};
        //Send data to other clients without data of picture
        data = { "masterPosition": infos.position}
        shareMediaDisplay(windowId, "picture", "IMAGE", false, data);
        shareImage(windowId, backing_canvas.toDataURL("image/jpeg"));
        var width = $('div.display').width();
        var height = $('div.display').height();
        shareWindowPosition(windowId, infos.position, 25, 25, width, height);

    });
}


//=============================================================================
// LOAD VIDEO AND SHARE IT TO OTHER CLIENTS
//=============================================================================
function loadVideoTiledDisplay(windowId, url) {
    var video = document.createElement('video');
    video.id = "video" + windowId;
    video.style.display = "none";
    video.src = url;
    video.autoplay = false;
    video.loop = true;
    video.muted = false;
    //getWindow(windowId).appendChild(video);
    $('body').append(video);
    console.log(video);
    video.addEventListener('loadedmetadata', function () {
        //var canvas = createCanvas(windowId, "VIDEO", this.videoWidth, this.videoHeight);
       var data = { "masterPosition": infos.position, "duration": video.duration, "currentTime": video.currentTime, "paused": video.paused };
       var canvas = createCanvas(windowId, "VIDEO", 400, 300,"video",true, true, data);
       var ctx = canvas.getContext('2d');
       ctx.drawImage(this, 0, 0, this.videoWidth, this.videoHeight);
        shareMediaDisplay(windowId, "video", "VIDEO", false, data);
        shareImage(windowId, canvas.toDataURL("image/jpeg"));
        var width = $('div.display').width();
        var height = $('div.display').height();
        shareWindowPosition(windowId, infos.position, 25, 25, width, height);
    });
}

function createVideo(url) {
    var video = document.createElement('video');
    video.style.display = "none";
    video.src = url;
    video.autoplay = false;
    video.loop = true;
    video.muted = false;
    //getWindow(windowId).appendChild(video);
    return video;
}


function loadInputFile(div) {
    var fileInput = document.getElementById('video-input');
    var input = document.createElement('input');
    input.type = "file";
    input.className = "upload";
}

//=============================================================================
// LOAD PDF AND SHARE IT TO OTHER CLIENTS
//=============================================================================
function loadPdf(windowId, url) {
    PDFJS.getDocument(url).then(function (pdf) {
        //PDFJS.disableWorker = true;
        var data = { "masterPosition":infos.position, "pdf": pdf, "currentPosition": 1, "total": pdf.numPages};
        createCanvas(windowId, "PDF", 400, 300, "pdf", true, true, data);
        //We send data to clients without the pdf object
        data = { "masterPosition": infos.position, "currentPosition": 1, "total": pdf.numPages };
        shareMediaDisplay(windowId, "pdf", "PDF", false, data);
        var width = $('div.display').width();
        var height = $('div.display').height();
        shareWindowPosition(windowId, infos.position, 25, 25, width, height);
        //Load the first page
        loadPdfPage(windowId, 1);
    });
}

//=============================================================================
// DISPLAY A PDF PAGE INTO CANVAS
//=============================================================================
function loadPdfPage(windowId, index) {
    var canvas = document.getElementById("canvas" + windowId);
    var data = windowList[windowId].data;
    data.pdf.getPage(index).then(function (page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);
        
        //
        // Prepare canvas using PDF page dimensions
        //
        var backing_canvas = document.getElementById("backing_" + canvas.id);
        backing_canvas.height = viewport.height;
        backing_canvas.width = viewport.width;
        var backing_context = backing_canvas.getContext('2d');
        
        //
        // Render PDF page into canvas context
        //
        var renderContext = {
            canvasContext: backing_context,
            viewport: viewport
        };
        page.render(renderContext).promise.then(function () {
            //var context = canvas.getContext('2d');
            //context.drawImage(backing_canvas, 0, 0, canvas.width, canvas.height);
            shareImage(windowId, backing_canvas.toDataURL("image/jpeg"));
        });;
    });
    data.currentPosition = index;
}


function loadSharedWindow(windowId) {
    var canvas = createCanvas(windowId, "SHARED MAIN", 400, 300, "shared", true, true);
    var rows = 2;
    //if (infos.position.j <= ((rows / 2) - 1)) {
    //    if (!windowList[windowId].isRotated) {
    //        windowRotation(windowId, 180);
    //    }
    //}
    shareWindow(windowId, "SHARED TEST", "shared");
    var width = $('div.display').width();
    var height = $('div.display').height();
    shareWindowPosition(windowId, infos.position, 25, 25, width, height);
}
