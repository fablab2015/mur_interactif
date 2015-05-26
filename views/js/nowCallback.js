$(function () {
    
    //=============================================================================
    // CALLBACK CONNECTED
    //=============================================================================
    now.callbackConnected = function (infos) {
        callbackConnected(infos);
    };
});

//=============================================================================
// CREATE MEDIA WINDOW : (VIDEO, PDF, APPS ETC...)
//=============================================================================

function askServerLoadPicture(url) {
    now.getWindowId("picture", url);
}

function askServerLoadVideoTiledDisplay(url) {
    now.getWindowId("video-tiled", url);
}

function askServerLoadPdf(url) {
    now.getWindowId("pdf", url);
}

function askServerLoadSharedWindow() {
    now.getWindowId("shared");
}

function askServerLoadPingPong() {
    now.getWindowId("ping-pong");
}

function askServerLoadMultiDisplay() {
    now.getWindowId("multi-display");
}

function askServerLoadDrawing() {
    now.getWindowId("drawing");
}

now.launchWindow = function (windowId, type, url) {
    launchWindow(windowId, type, url);
};

//=============================================================================
// SHARE AND UPDATE WINDOW DATA : (POSITION, ROTATION, CSS ETC...)
//=============================================================================

getWindowId = function () {
    return now.getWindowId();
};

shareWindow = function (windowId, title, type) {
    now.shareWindow(windowId, title, type);
};

now.createSharedWindow = function (windowId, title, type) {
    createSharedWindow(windowId, title, type);
};

shareWindowPosition = function (windowID, orientation, top, left, hostWidth, hostHeight) {
    now.shareWindowPosition(windowID, orientation, top, left, hostWidth, hostHeight);
};

now.updateWindowPosition = function (windowId, orientation, top, left, hostWidth, hostHeight) {
    updateWindowPosition(windowId, orientation, top, left, hostWidth, hostHeight);
};

askWindowRotation = function (windowID, degree) {
    now.askWindowRotation(windowID, degree);
};

now.windowRotation = function (windowId, degree) {
    windowRotation(windowId, degree);
};

shareWindowAngle = function (windowID, positionRemoteClient, degree) {
    now.shareWindowAngle(windowID, positionRemoteClient, degree);
};

now.updateWindowAngle = function (windowId, positionRemoteClient, degree) {
    updateWindowAngle(windowId, positionRemoteClient, degree);
};

shareWindowSize = function (windowID, event) {
    now.shareWindowSize(windowID, event);
};

now.resizeWindow = function (windowId, event) {
    resizeWindow(windowId, event);
};


//=============================================================================
// SHARE MEDIA WINDOW : (VIDEO, PDF, APPS ETC...)
//=============================================================================

shareMediaDisplay = function (windowId, type, title, isPlayingAudio, data) {
    now.shareMediaDisplay(windowId, type, title, isPlayingAudio, data);
};

now.launchSharedMediaDisplay = function (windowId, type, title, data) {
    launchSharedMediaDisplay(windowId, type, title, data);
};

askCloseWindow = function (windowId) {
    now.askCloseWindow(windowId);
};

now.closeWindow = function (windowId) {
    closeWindow(windowId);
};

ReadyToReceiveMedia = function (windowId, type) {
    now.ReadyToReceiveMedia(windowId, type);
};

ReadyToPlayAudio = function (windowId) {
    now.ReadyToPlayAudio(windowId);
};

//=============================================================================
// STREAMING VIDEO AND AUDIO
//=============================================================================
//THE HOST SET THE EVENT LISTENER TO SEND SYNC THE STREAMING WITH THE HTML VIDEO STATE
now.broadcastVideo = function (windowId, isPlayingAudio) {
    broadcastVideo(windowId, isPlayingAudio);
};
//THE HOST OF THE HTML VIDEO SEND A SCREEN CAPTURE OF THE CANVAS EVERY (n:*fixed) ms
shareImage = function (windowID, image) {
    now.shareImage(windowID, image);
};

//ALL CLIENTS (INCLUDING HOST) OF THE SHARED MEDIA GROUP UPDATE CANVAS WITH THE IMAGE SENT BY HOST
now.updateCanvas = function (windowId, image) {
    updateCanvas(windowId, image);
};

streamAudioToClient = function (videoPath) {
    now.streamAudioToClient(videoPath);
};

now.playAudio = function () {
    playAudio();
};

//=============================================================================
// REMOTE CONTROL FOR SYNCHRONIZING MEDIA OF CLIENTS
//=============================================================================
askRemoteMediaControl = function (windowId, mediaType, controlType, value, destination) {
    now.askRemoteMediaControl(windowId, mediaType, controlType, value, destination);
}

now.remoteMediaControl = function (windowId, mediaType, controlType, value) {
    remoteMediaControl(windowId, mediaType, controlType, value);
}

now.switchToTiledDisplay = function (windowId) {
    switchToTiledDisplay(windowId);
}

now.switchToNormalDisplay = function (windowId) {
    switchToNormalDisplay(windowId);
}

askSwitchToTiledDisplay = function (windowId) {
    now.askSwitchToTiledDisplay(windowId);
};

// called from client - just execute one client context (host)
askSwitchToNormalDisplay = function (windowId) {
    // update the data to the other clients other than host
    now.askSwitchToNormalDisplay(windowId);
};

//=============================================================================
// REMOTE CONTROL FOR SYNCHRONIZING PING-PONG GAME BETWEEN CLIENTS
//=============================================================================

now.remoteGameControl = function (windowId, game, controlType, value) {
    remoteGameControl(windowId, game, controlType, value);
}

askRemoteGameControl = function (windowId, game, controlType, value, destination) {
    now.askRemoteGameControl(windowId, game, controlType, value, destination);
}














