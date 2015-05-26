/**
 * Application web sharing built on nowJS and Node.JS
 * Author: Adam Tiamiou and Benoit Perruche
 */

// include utility library
var util = require('./util.js');

// include ExpressJS framework
var express = require('express');

var ffmpeg = require('fluent-ffmpeg');


// create a server from the express
var app = express.createServer(express.logger());

// serve static content in /static directory
app.use("/static", express.static(__dirname + "/static"));
app.use("/includes", express.static(__dirname + "/views/includes"));
app.use("/js", express.static(__dirname + "/views/js"));
app.use("/css", express.static(__dirname + "/views/css"));
app.use("/fonts", express.static(__dirname + "/views/fonts"));
app.use("/flowplayer", express.static(__dirname + "/views/flowplayer"));

var clientAudioStreamList = [];

// handle main page, the client page
app.get("/", function(req, res) {
    res.contentType("text/html");
    res.send(util.template('index'));
});

app.get("/audio0", function (req, res) {
    clientAudioStreamList.push(res);
});

app.get("/audio1", function (req, res) {
    clientAudioStreamList.push(res);
});

app.get("/audio2", function (req, res) {
    clientAudioStreamList.push(res);
});

app.get("/audio3", function (req, res) {
    clientAudioStreamList.push(res);
});

// make this process listen to port 80 or 8080
app.listen(process.env.PORT || 8080);

// include nowJS framework handler
var nowjs = require('now');

// initialize nowJS into everyone object
var everyone = nowjs.initialize(app);

// to create a unique key for each registered session name
var key = 0;

// to store each registered session name
var clientList = new Object();
// to store each registered session name
var hosts = new Object();

var orientation = new Object();
orientation["NW"] = false;
orientation["NE"] = false;
orientation["SW"] = false;
orientation["SE"] = false;


//THE ID 0 IS RESERVED FOR FULLSCREEN CANVAS
var nbWindow = 1;

//=============================================================================
// CALLBACK WHEN CLIENT IS CONNECTED
//=============================================================================

// Trigger when each client user connect to nowjs
nowjs.on('connect', function () {
    // for each client user, check if there has already associated name
    if(!this.now.name) {
	
        var b = false;
        var i, j;
        for (var o in orientation){
            if(!orientation[o]){
                orientation[o] = this;
                this.now.name = 'name' + key;
                this.now.id = key;
                if (o == "NW") { i = 0; j = 0; }
                if (o == "NE") { i = 1; j = 0; }
                if (o == "SW") { i = 0; j = 1; }
                if (o == "SE") { i = 1; j = 1; }
                var client = {"id":this.now.id, "object":this, "orientation":o, "position": {"i" : i,"j" : j}};
                clientList[this.now.id] = client;
                this.now.callbackConnected(client);
                // generate a name for this new client user
		
                key++;
                b= true;
				break;
            }
        }	
        if(!b){
            everyone.removeUser(this.user.clientId);
        }
    }
});

//=============================================================================
// CALLBACK WHEN CLIENT IS DISCONNECTED
//=============================================================================

// trigger when each client user disconnect from nowjs
nowjs.on('disconnect', function() {
    if(this.now.id){
        orientation[clientList[this.now.id].orientation] = false;
        delete clientList[this.now.id];
    }
});

//=============================================================================
// CREATE MEDIA WINDOW : (VIDEO, PDF, APPS ETC...)
//=============================================================================
//called from client - create a window with a new ID
everyone.now.getWindowId = function (type, url) {
    this.now.launchWindow(nbWindow, type, url);
    nbWindow++;
};

//=============================================================================
// SHARE AND UPDATE WINDOW DATA : (POSITION, ROTATION, CSS ETC...)
//=============================================================================

// called from client - just execute one client context (host)
everyone.now.shareWindow = function (windowId, title, type) {
    everyone.now.filterShareWindow(windowId, title, type, this.now.id);
};

// called from everyone - everyone execute the function except the host
everyone.now.filterShareWindow = function (windowId, title, type, hostId) {
    // update the data to the other clients other than host
    if (this.now.id == hostId) return;
    this.now.createSharedWindow(windowId, title, type);

};

// called from client - just execute one client context (host)
everyone.now.shareWindowPosition = function (windowId, orientation, top, left, hostWidth, hostHeight) {
    // update the data to the other clients other than host
    everyone.now.filterShareWindowPosition(windowId, orientation, top, left, hostWidth, hostHeight, this.now.id);
};

// called from client - just execute one client context (host)
everyone.now.filterShareWindowPosition = function (windowId, orientation, top, left, hostWidth, hostHeight, hostId) {
    // update the data to the other clients other than host
    if (this.now.id == hostId) return;
    this.now.updateWindowPosition(windowId, orientation, top, left, hostWidth, hostHeight);

};

// called from client - just execute one client context (host)
everyone.now.askWindowRotation = function (windowId, degree) {
    // update the data to the other clients other than host
    everyone.now.windowRotation(windowId, degree);
};

// called from client - just execute one client context (host)
everyone.now.shareWindowAngle = function (windowId, positionRemoteClient, degree) {
    // update the data to the other clients other than host
    everyone.now.updateWindowAngle(windowId, positionRemoteClient, degree);
};

// called from client - just execute one client context (host)
everyone.now.shareWindowSize = function (windowId, event) {
    // update the data to the other clients other than host
    everyone.now.resizeWindow(windowId, event);
};


//=============================================================================
// SHARE MEDIA WINDOW : (VIDEO, PDF, APPS ETC...)
//=============================================================================

// called from client - just execute one client context (host)
everyone.now.shareMediaDisplay = function (windowId, type, title, isPlayingAudio, data) {
    var client = this;
    var shareMedia = nowjs.getGroup("shareMedia" + windowId);
    // shareMedia.addUser(this.user.clientId);
    countCallback = function (nb) {
        var host = { "client": client.now.id, "group": shareMedia , "nbCurrent": 0, "nbExpected": nb, "isPlayingAudio": isPlayingAudio , "nbReadyAudio": 0, "nbReadyAudioExpected": nb }
        hosts[windowId] = host;
        everyone.now.filterLaunchSharedMediaDisplay(windowId, type, title, data);
    };
    //Launch callback with the number of client in the group
    everyone.count(countCallback);
    
    this.now.ReadyToReceiveMedia(windowId, type);
};

// called from server - execute every client context, then we can do filtering
everyone.now.filterLaunchSharedMediaDisplay = function (windowId, type, title, data) {
    // by right, it will execute in every client context exclude host
    if (this.now.id == hosts[windowId].client) { return; console.log("HOST NOT READY"); }
    this.now.launchSharedMediaDisplay(windowId, type, title, data);
};

// called from client - just execute one client context (host)
everyone.now.askCloseWindow = function (windowId) { 
    everyone.now.closeWindow(windowId);
};

everyone.now.ReadyToReceiveMedia = function (windowId, type) {
    hosts[windowId].nbCurrent++;
    hosts[windowId].group.addUser(this.user.clientId)
    console.log(hosts[windowId].nbCurrent);
    if (hosts[windowId].nbCurrent == hosts[windowId].nbExpected) {
        if (type == "video") {
            clientList[hosts[windowId].client].object.now.broadcastVideo(windowId, hosts[windowId].isPlayingAudio);
        }
    }
};

everyone.now.ReadyToPlayAudio = function (windowId) {
    hosts[windowId].nbReadyAudio++;
    if (hosts[windowId].nbReadyAudio == hosts[windowId].nbReadyAudioExpected) {
        //Play Video only if clients are ready to play audio
        everyone.now.playAudio();
        clientList[hosts[windowId].client].object.now.playVideo();
        
    }
};


//=============================================================================
// STREAMING VIDEO AND AUDIO
//=============================================================================

// called from client - just execute one client context (host)
everyone.now.shareImage = function (windowId, image) {
    // update the data to the other clients other than host
    hosts[windowId].group.now.updateCanvas(windowId, image);
};

everyone.now.streamAudioToClient = function (videoPath) {
    var proc = ffmpeg(videoPath)
   .setFfmpegPath("C:\\dev\\ffmpeg-win64-shared\\bin\\ffmpeg.exe")
   .setFfprobePath("C:\\dev\\ffmpeg-win64-shared\\bin\\ffprobe.exe")
   .setFlvtoolPath("C:\\dev\\flvtool2\\flvtool2.exe")
   // use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
   .preset('flashvideo')
   // setup event handlers
    .format('flv')
    .noVideo()
   .on('end', function () {
        console.log('file has been converted succesfully');
    })
   .on('error', function (err) {
        console.log('an error happened: ' + err.message);
    })
    // save to stream
   .pipe({ end: true }).on('data', function (chunk) {
        //console.log("DATA_AUDIO");
        sendAudioDataToStreamList(chunk);
    });
}

sendAudioDataToStreamList = function (data) {
    for (var i in clientAudioStreamList) {
        clientAudioStreamList[i].write(data);
    }
}


//=============================================================================
// REMOTE CONTROL FOR SYNCHRONIZING MEDIA OF CLIENTS
//=============================================================================

// called from client - just execute one client context (host)
everyone.now.askRemoteMediaControl = function (windowId, mediaType, controlType, value, destination) {
    if (destination == "all") {
        everyone.now.remoteMediaControl(windowId, mediaType, controlType, value);
    }
    else if (destination == "except-host") {
        everyone.now.filterRemoteMediaControl(windowId, mediaType, controlType, value, this.now.id);
    }
    else if(destination == "master"){
        clientList[hosts[windowId].client].object.now.remoteMediaControl(windowId, mediaType, controlType, value);
    }
};

// called from server - execute every client context, then we can do filtering
everyone.now.filterRemoteMediaControl = function (windowId, mediaType, controlType, value, clientId) {
    // by right, it will execute in every client context exclude host
    if (this.now.id == clientId) {return;}
    this.now.remoteMediaControl(windowId, mediaType, controlType, value);
};

//=============================================================================
// REMOTE CONTROL FOR SYNCHRONIZING PING-PONG GAME BETWEEN CLIENTS
//=============================================================================
    
// called from client - just execute one client context (host)
everyone.now.askRemoteGameControl = function (windowId, game, controlType, value, destination) {
    if (destination == "all"){
       everyone.now.remoteGameControl(windowId, game, controlType, value, this.now.id);
    }
    else if (destination == "except-host") {
        everyone.now.filterRemoteGameControl(windowId, game, controlType, value, this.now.id);
    }
    else if (destination == "master") {
        clientList[hosts[windowId].client].object.now.remoteGameControl(windowId, game, controlType, value);
    }
};

// called from server - execute every client context, then we can do filtering
everyone.now.filterRemoteGameControl = function (windowId, game, controlType, value, clientId) {
    //The client which has launched askRemoteGameControl is unauthorized to pass
    if (this.now.id == clientId) { return; }
    this.now.remoteGameControl(windowId, game, controlType, value);
};

//=============================================================================
// Web Application to communicate with the Java Server (Tableau Interactif)
//=============================================================================

var javaPort = 8081;
var javaServer = require('net').createServer();

javaServer.on('connection', function (javaSocket) {
    var clientAddress = javaSocket.address().address + ':' + javaSocket.address().port;
    console.log('Java ' + clientAddress + ' connected');

    var firstDataListenner = function (data) {	
        everyone.now.launchSharedMediaDisplay(nbWindow, "interactif", "TABLEAU INTERACTIF", ab2str(data))
		nbWindow++;
        javaSocket.removeListener('data', firstDataListenner);
    }

    javaSocket.on('data', firstDataListenner);

    javaSocket.on('close', function () {
        console.log('Java ' + clientAddress + ' disconnected');
    });
});
javaServer.listen(javaPort);


function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}





















