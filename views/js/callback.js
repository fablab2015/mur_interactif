

    var infos;
    var audioplayer;
    var menu;

$(document).ready(function () {
    var event = new Event('draw');
    var eventCloseMenu = new Event('closeMenu');
    var eventEndFullscreen = new Event('endfullscreen');
    var eventTimeUpdate = new Event('dataupdate');
    var isRotating = false;
    
    //=============================================================================
    // CALLBACK WHEN CLIENT IS CONNECTED TO SERVER
    //=============================================================================
    
    callbackConnected = function (data) {
        infos = data;
        initializeEventListener();
        createFullscreenCanvas()
        //initialize audio link for flowplayer
        initializeAudioLink(infos.id);
        manageControlBar();
        menu = new mlPushMenu(document.getElementById('mp-menu'), document.getElementById('trigger'));

        audioplayer = flowplayer("audioPlayer", "/includes/flowplayer.swf", {
            width: 0,
            heigth: 0,
            clip: {
                // baseUrl for both parent and instream clips
                url: "/audio" + infos.id,
                autoBuffering: true,
                autoPlay: false,
                onBegin: function () {
                    audioplayer.toggle();
                    audioplayer.toggle();
                    console.log("META");

                    ReadyToPlayAudio(0);

                }
            }
        });
        console.log(infos);
    }
    
    setAudioPlayer = function (player) {
        audioplayer = player;
    }
    
    //=============================================================================
    // CREATE MEDIA WINDOW : (VIDEO, PDF, APPS ETC...)
    //=============================================================================

    launchWindow = function (windowId, type, url) {
        if (type == "picture") {
            loadPicture(windowId, url)
        }
        else if (type == "video-tiled") {
            loadVideoTiledDisplay(windowId, url);
        }
        else if (type == "pdf") {
            loadPdf(windowId, url);
        }
        else if (type == "shared") {
            loadSharedWindow(windowId);
        }
        else if (type == "ping-pong") {
            launchPingPongGame(windowId, true);
        }
        else if (type == "drawing") {
            launchDrawing(windowId, true);
        }
        else if (type == "multi-display") {
            launchMultiDisplay(windowId, true);
        }
        menu.trigger.dispatchEvent(eventCloseMenu);
    };

    //=============================================================================
    // SHARE AND UPDATE WINDOW DATA : (POSITION, ROTATION, CSS ETC...)
    //=============================================================================
    
    createSharedWindow = function (windowId, title, type) {
        var canvas = createCanvas(windowId, "SHARED TEST", 400, 300, "shared", false, true);
        var rows = 2;
        if (infos.position.j <= ((rows / 2) - 1)) {
            if (!windowList[windowId].isRotated) {
                windowRotation(windowId, 90);
            }
        }
    };
    
    // called from server - to update the image data just for this client page
    // the data is a base64-encoded image
    updateWindowPosition = function (windowId, positionRemoteClient, top, left, hostWidth, hostHeight) {
        var window = getWindow(windowId);
        if (!isRotating) {
            window.style.removeProperty('-webkit-transition');
            window.style.removeProperty('transition');
        }
        var isInTheDisplay = false;
        if (window.style.left >= 0 || window.style.left + window.clientWidth <= width || window.style.top >= 0 || window.style.top + window.clientHeight <= height) isInTheDisplay = true;
        var width = $('div.display').width();
        var height = $('div.display').height();
        var windowWidth = $('#window' + windowId).width();
        var windowHeight = $('#window' + windowId).height();
        //Adapt the scale if the host has a different height and width of display
        //left = (left * width) / hostWidth;
        //top = (top * height) / hostHeight;
        var rows = 2;
        var i = infos.position.i;
        var j = infos.position.j;
        var x, y;
        if (positionRemoteClient.j <= ((rows / 2) - 1)) {
            //Si les tables sont de sens opposés, on adapte la position de la fenêtre
            if (j <= ((rows / 2) - 1)) {
                left = width - left;
                top = height - top;
            }
            else {
                left = (width - left) - windowWidth;
                top = (height - top) - windowHeight;
            }
        }
        x = positionRemoteClient.i * width + left;
        y = positionRemoteClient.j * height + top;
        
        
        left = x - i * width;
        top = y - j * height;

        if (j <= ((rows / 2) - 1)) {
            //Si les tables sont de sens opposés, on adapte la position de la fenêtre
            if (positionRemoteClient.j > ((rows / 2) - 1)) {
                left = (width - left) - windowWidth;
                top = (height - top) - windowHeight;
            }
            else {
                left = width - left;
                top = height - top;
            }
        }
        //if (isInTheDisplay && (left < 0 || left + window.clientWidth > width || top < 0 || top + window.clientHeight > height )) return;

        window.style.top = top + "px";
        window.style.left = left + "px";
        
        //If the window is on the display
        //if (left >= 0 && left <= width && top >= 0 && top <= height && (left + windowWidth) >= 0 && (left + windowWidth) <= width && (top + windowHeight) >= 0 && (top + windowHeight) <= height) {
        if (left >= (0 + 20) && left <= (width - 20) && top >= (0 + 20) && top <= (height - 20) && (left + windowWidth) >= (0 + 20) && (left + windowWidth) <= (width - 20) && (top + windowHeight) >= (0 + 20) && (top + windowHeight) <= (height - 20)) {
console.log("DO ROTATION")           
		   if (windowList[windowId].angle != 0 &&  !isRotating) {
                console.log("DO ROTATION")
                //askWindowRotation(windowId, -windowList[windowId].angle);
				shareWindowAngle(windowId, infos.position,-windowList[windowId].angle);
            }
        }
    };
    
    // called from server - to update the image data just for this client page
    // the data is a base64-encoded image
    windowRotation = function (windowId, degree) {
        var window = getWindow(windowId);
        var angle = (windowList[windowId].angle + degree)%360;
        windowList[windowId].angle = angle;
        isRotating = true;
        setTimeout(function () {isRotating = false;}, 1000);
        window.style.WebkitTransitionDuration = '1s';
        window.style.webkitTransform = 'rotate(' + angle + 'deg)' + ' translate(' 
                              + windowList[windowId].offset.x + 'px,' 
                              + windowList[windowId].offset.y + 'px)';;
        windowList[windowId].isRotated = !windowList[windowId].isRotated;
    };
    
    // called from server - to update the image data just for this client page
    // the data is a base64-encoded image
    updateWindowAngle = function (windowId, shouldEase, degree) {
        var rows = 2;
        var window = getWindow(windowId);
        if (!shouldEase) {
            window.style.removeProperty('-webkit-transition');
            window.style.removeProperty('transition');
        }
        else {
            isRotating = true;
            setTimeout(function () { isRotating = false; }, 1000);
            window.style.WebkitTransitionDuration = '1s';
        }
        

        var angle = (windowList[windowId].angle + degree)%360;
        
        //if (positionRemoteClient.j <= ((rows / 2) - 1)) {
        //    //If the master client is not oriented like this client
        //    if (infos.position.j > ((rows / 2) - 1)) {
        //        //We do the rotation in the opposite direction
        //        angle = (windowList[windowId].angle + degree)% 360;
        //    }  
        //}
        //else {
        //    //If the master client is not oriented like this client
        //    if (infos.position.j <= ((rows / 2) - 1)) {
        //        //We do the rotation in the opposite direction
        //        angle = (windowList[windowId].angle + degree)% 360;
        //    }
        //}
        windowList[windowId].angle = angle;
        window.style.webkitTransform = 'rotate(' + angle + 'deg)' + ' translate(' 
                              + windowList[windowId].offset.x + 'px,' 
                              + windowList[windowId].offset.y + 'px)';
    };
    
    resizeWindow = function (windowId, event) {
        var window = getWindow(windowId);
        window.style.removeProperty('-webkit-transition');
        window.style.removeProperty('transition');
        
        var deltaHeight = event.rect.height - window.clientHeight;
        // update the element's style
        window.style.width = event.rect.width + 'px';
        window.style.height = event.rect.height + 'px';
        
        // translate when resizing from top or left edges
        windowList[windowId].offset.x += event.deltaRect.left;
        windowList[windowId].offset.y += event.deltaRect.top;
        //if((windowList[windowId].offset.x != 0) || (windowList[windowId].offset.y != 0)) {
            window.style.webkitTransform = 'rotate(' + windowList[windowId].angle + 'deg)' + ' translate(' 
                              + windowList[windowId].offset.x + 'px,' 
                              + windowList[windowId].offset.y + 'px)';
        //}
        

        var windowFormDiv = window.getElementsByClassName('window-form')[0];
        var canvas = document.getElementById("canvas" + windowId);       
        canvas.width = windowFormDiv.clientWidth;
        if (deltaHeight >= 0) {
            canvas.height = windowFormDiv.clientHeight;
        }
        else {
            canvas.height = windowFormDiv.clientHeight - 4;
        }
        reloadCanvas(canvas);
    };

    //=============================================================================
    // SHARE MEDIA WINDOW : (VIDEO, PDF, APPS ETC...)
    //=============================================================================
    
    launchSharedMediaDisplay = function (windowId, type, title, data) {
        console.log("LAUNCHING");
        rows = 2;
        if (type == "ping-pong") {
            if ((data.masterPosition.i == infos.position.i)) {
                launchPingPongGame(windowId, false);
            }
            else {
                return;
            }
        }
        else if (type == "drawing") {
                launchDrawing(windowId, false);
        }
        else if (type == "multi-display") {
            launchMultiDisplay(windowId, false);
        }
		else if (type == "interactif") {
                launchInteractifMedia(windowId, data);
				return;
        }
        else {
            createCanvas(windowId, title, 400, 300, type, false, true, data);

			if (data.masterPosition.j <= ((rows / 2) - 1) && infos.position.j > ((rows / 2) - 1) ) {
					windowRotation(windowId, 180);
			}
			else if (data.masterPosition.j > ((rows / 2) - 1) && infos.position.j <= ((rows / 2) - 1)) {
					windowRotation(windowId, 180);
			}
		}
        // initializeAudioplayer(now.id, windowId);
        ReadyToReceiveMedia(windowId, type);
    };
    
    closeWindow = function (windowId) {  
        if (windowList[windowId].type == "video" && windowList[windowId].isMaster ) {
            var video = document.getElementById("video" + windowId);
            video.parentElement.removeChild(video);
        }
        var window = getWindow(windowId);
        window.parentElement.removeChild(window);
        
        var children = window.getElementsByTagName('div');
        for(var i = 0; i< children.length;i++) {
			if (children[i].getAttribute('id') == 'windowForm'+windowId) {
				if(typeof children[i].beforeclose == 'function')
        			children[i].beforeclose();
			}
		}
        
        delete windowList[windowId];
    };
    
    //=============================================================================
    // STREAMING VIDEO AND AUDIO
    //=============================================================================
    
    // multi-display
    function fillOriDstPoints(proj, points, coef_width, coef_height, warper, video) {
								
		var angle = 0;
		
		var end = false;
    
		for (i=0, iLen=points.length; i<iLen; i++) {
			switch(angle){
				case 0 :
					warper.oriPoints.push(new ImgWarper.Point(0, 0));
					warper.dstPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, (points[i].p_y-proj.translation.y)*coef_height));
					angle++;
					break;
				case 1 :
					if(points[i].p_original) {
						i--;
						angle++;
						continue;
					}
					warper.oriPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, 0));
					warper.dstPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, (points[i].p_y-proj.translation.y)*coef_height));
					break;
				case 2 :
					warper.oriPoints.push(new ImgWarper.Point(video.videoWidth, 0));
					warper.dstPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, (points[i].p_y-proj.translation.y)*coef_height));
					angle++;
					break;
				case 3 :
					if(points[i].p_original) {
						i--;
						angle++;
						continue;
					}
					warper.oriPoints.push(new ImgWarper.Point(video.videoWidth, (points[i].p_y-proj.translation.y)*coef_height));
					warper.dstPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, (points[i].p_y-proj.translation.y)*coef_height));
					break;
				case 4 :
					warper.oriPoints.push(new ImgWarper.Point(video.videoWidth, video.videoHeight));
					warper.dstPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, (points[i].p_y-proj.translation.y)*coef_height));
					angle++;
					break;
				case 5 :
					if(points[i].p_original) {
						i--;
						angle++;
						continue;
					}
					warper.oriPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, video.videoHeight));
					warper.dstPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, (points[i].p_y-proj.translation.y)*coef_height));
					break;
				case 6 :
					warper.oriPoints.push(new ImgWarper.Point(0, video.videoHeight));
					warper.dstPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, (points[i].p_y-proj.translation.y)*coef_height));
					angle++;
					break;
				case 7 :
					if(points[i].p_original) {
						end = true;
					}
					if(end) {
						break;
					}
					warper.oriPoints.push(new ImgWarper.Point(0, (points[i].p_y-proj.translation.y)*coef_height));
					warper.dstPoints.push(new ImgWarper.Point((points[i].p_x-proj.translation.x)*coef_width, (points[i].p_y-proj.translation.y)*coef_height));
					break;
			}
		}
    }
    
    broadcastVideo = function (windowId, isPlayingAudio) {
        //initializeAudioplayer(now.id, windowId);
        var canvas = document.createElement("canvas");
        var context = canvas.getContext('2d');
		
        // get HTML5 video handler
        var video = document.getElementById("video" + windowId);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        $(canvas).css("display", "none");
        var videoPlayed = false;

		// multi-display
		Object.currVideo+=1;
		
		if(Object.projs !== undefined && Object.projs[Object.currVideo] !== undefined) {
		
			videoPlayed = true;
			
			var curr = Object.currVideo;
			
			var canvass = [];
			
			var proj = Object.projs[curr];
			
			var displays = proj.displays;
			
			var coef_width = video.videoWidth/Object.width_display;
			var coef_height = video.videoHeight/Object.height_display;
		
			for(k=0, kLen=displays.length; k<kLen; k++) {
			
				if(displays[k]['url'] == null)
					continue;
			
				displays[k]['video'] = createVideo(displays[k]['url']);
		
				videok = displays[k]['video'];
		
				canvass[k] = document.createElement('canvas');
				canvass[k].style.width = "100%";
				canvass[k].width = video.videoWidth;
				canvass[k].height = video.videoHeight;
				
				/*
				contextk = canvass[k].getContext("2d");
				var imgData = contextk.getImageData(0, 0, video.videoWidth, video.videoHeight); 
  				var warper = new ImgWarper.PointDefiner(canvass[k], videok, imgData);
  				
				var points = displays[k]['points'];
			
				var coef_width = video.videoWidth/Object.width_display;
				var coef_height = video.videoHeight/Object.height_display;
			
				fillOriDstPoints(Object.projs[curr], points, coef_width, coef_height, warper, video);
				*/
			}
		}
		
        // trigger when the video is played
        video.addEventListener("play", function () {
            videoPlayed = true;
            // re adjust the canvas width and height based on the video's one...
            var w = video.videoWidth;
            var h = video.videoHeight;
            
            draw(this, context, w, h);
            
            // multi-display
			if(displays !== undefined) {
				for(k=0, kLen=displays.length; k<kLen; k++) {
					if(displays[k]['video'] == null)
						continue;
					displays[k]['video'].play();
				}
			}
    		
    		
        }, false);
        
        // trigger when the video is paused
        video.addEventListener("pause", function () {
            // mark this video is in not playing mode
            videoPlayed = false;
            
            // multi-display
			if(displays !== undefined) {
				for(k=0, kLen=displays.length; k<kLen; k++) {
					if(displays[k]['video'] == null)
						continue;
					displays[k]['video'].pause();
				}
			}
    		
    		
        }, false);
        
        // draw the video into HTML5 canvas
        var draw = function (v, ctx, w, h) {
            // if the video is not in playing, we not draw the screen
            if (!videoPlayed) return;
            // re initialize the backing canvas
            ctx.clearRect(0, 0, w, h);
            	
			// multi-display
			if(Object.projs !== undefined) {
				var video = v;
			
				//var displays = Object.displayss[curr];
			
				for(k=0, kLen=displays.length; k<kLen; k++) {
		
					canvass[k] = document.createElement('canvas');
					canvass[k].style.width = "100%";
					canvass[k].width = video.videoWidth;
					canvass[k].height = video.videoHeight;
			
					if(displays[k]['url'] == null)
						continue;
			
					videok = displays[k]['video'];
					
					contextk = canvass[k].getContext("2d");
					//contextk.translate(-proj.translation.x,-proj.translation.y);
					contextk.drawImage(videok, 
						0/*+proj.translation.x*/, 0/*+proj.translation.y*/, 
						w/*+proj.translation.x*/, h/*+proj.translation.y*/);
					
					var imgData = contextk.getImageData(0/*+proj.translation.x*/, 0/*+proj.translation.y*/,
						video.videoWidth/*+proj.translation.x*/, video.videoHeight/*+proj.translation.y*/); 
	  				var warper = new ImgWarper.PointDefiner(canvass[k], videok, imgData);
	  				
					var points = displays[k]['points'];
				
					fillOriDstPoints(proj, points, coef_width, coef_height, warper, video);
					
					warper.redraw(ctx);
				}
					
			} else {
				ctx.drawImage(v, 0, 0, w, h);
			}
            shareImage(windowId, canvas.toDataURL("image/jpeg"));
            setTimeout(draw, 40, v, ctx, w, h);
        };
        if (isPlayingAudio) {
            //streamAudioToClient("C:/Users/Adam/Desktop/RT1/static/snk.mp4");
            //Stream audio to all client and waiting for playing video
            streamAudioToClient("./static/snk.mp4");
            //streamAudioToClient(video.src);
        }
        else {
            //Play video directly if there is no audio to stream
            //video.play();
        }
			/*
		canvas.style.webkitTransform = 'rotate(90deg)';
	  	canvas.style.transform = "rotate(90deg)";	
	  	canvas.style.display = "none";
	  	$(canvas).css("display", "none");
	  	$(canvas).css("webkitTransform", "rotate(90deg)");
	  	*/
    }
    
    // called from server - to update the image data just for this client page
    // the data is a base64-encoded image
    updateCanvas = function (windowId, image) {
        var window = getWindow(windowId);
        var canvasToDraw = document.getElementById("canvas" + windowId);
        var draw = canvasToDraw.getContext('2d');
        var rotated = false;
        // create a blank HTML image, put the data into the image src
        var img = new Image();
        img.src = image;
        
        // when the image loaded, draw the image on HTML5 canvas
        img.addEventListener("load", function () {
            var isTiled = windowList[windowId].isTiled;
            var masterPosition = windowList[windowId].data.masterPosition;

            var backing_canvas = document.getElementById("backing_" + canvasToDraw.id);
            backing_canvas.width = img.width;
            backing_canvas.height = img.height;
            var context = backing_canvas.getContext('2d');
            
            var rows = 2;
            var cols = 2;
            var tileX = 0;
            var tileY = 0;
            var tileWidth = img.width;
            var tileHeight = img.height;
            
            var orientation;
            //If picture has to be tiled
            if (isTiled) {
                tileWidth = Math.round(img.width / cols);
                tileHeight = Math.round(img.height / rows);
                var tileCenterX = tileWidth / 2;
                var tileCenterY = tileHeight / 2;
                var i, j;
                if (masterPosition.j > ((rows/2) - 1)) {
                    //SENS CARTESIEN NORMALE
                    i = infos.position.i;
                    j = infos.position.j;
                }
                else {
                    //SENS CARTESIEN INVERSEE
                    //(NBTOTAL - 1) - COORDONNEE
                    i = (cols - 1) - infos.position.i;
                    j = (rows - 1) - infos.position.j;
                }
                tileX = tileX + i * tileWidth;
                tileY = tileY + j * tileHeight;
                if (j <= ((rows / 2) - 1)) {
                    if (!windowList[windowId].isRotated) {
                        windowList[windowId].isRotated = true;
                    }
                }
            }
            else {
                if (windowList[windowId].isRotated) {
                    windowList[windowId].isRotated = false;
                }
            }
            
            
            
            context.drawImage(img, tileX, tileY, tileWidth, tileHeight, 0, 0, img.width, img.height);
            draw.drawImage(backing_canvas, 0, 0, canvasToDraw.width, canvasToDraw.height);
            canvasToDraw.dispatchEvent(event);
        });
    };
    

    //=============================================================================
    // REMOTE CONTROL FOR SYNCHRONIZING MEDIA OF CLIENTS
    //=============================================================================
    
    remoteMediaControl = function (windowId, mediaType, controlType, value) {
        if (mediaType == "all") {
            if (controlType == "tiled-display") {
                var canvas = document.getElementById("canvas" + windowId);
                windowList[windowId].data.masterPosition = value;
                windowList[windowId].isTiled = true;
                fullWindow(canvas);
            }
            else if (controlType == "endfullscreen") {
                var canvas = document.getElementById('canvas' + windowId);
                windowList[windowId].isTiled = false;
                canvas.dispatchEvent(eventEndFullscreen);
            }
        }
        else if (mediaType == "video") {
           if (controlType == "seekbar") {
                var video = document.getElementById('video' + windowId)
                video.currentTime = (value * video.duration) / 100;
            }
            else if (controlType == "play") {
                if (value == "event") {
                    var canvas = document.getElementById('canvas' + windowId);
                    windowList[windowId].data.paused = false;
                    var play = document.getElementById('play-video' + windowId);
                    play.innerHTML = "PAUSE";
                }
                else {
                    var video = document.getElementById('video' + windowId);
                    var play = document.getElementById('play-video' + windowId);
                    play.innerHTML = "PAUSE";
                    video.play();
                }

            }
            else if (controlType == "pause") {
                if (value == "event") {
                    var canvas = document.getElementById('canvas' + windowId);
                    windowList[windowId].data.paused = true;
                    var play = document.getElementById('play-video' + windowId);
                    play.innerHTML = "PLAY";
                }
                else {
                    var video = document.getElementById('video' + windowId);
                    var play = document.getElementById('play-video' + windowId);
                    play.innerHTML = "PLAY";
                    video.pause();
                }
            }
            else if (controlType == "currentTime") {
                var canvas = document.getElementById("canvas" + windowId);
                windowList[windowId].data.currentTime = value.currentTime;
                canvas.dispatchEvent(eventTimeUpdate);
            }
        }
        else if (mediaType == "pdf") {
            if (controlType == "tiled-display") {
                var canvas = document.getElementById("canvas" + windowId);
                windowList[windowId].data.masterPosition = value;
                windowList[windowId].isTiled = true;
                fullWindow(canvas);
            }
            else if (controlType == "seekbar") {
                var seekBar = document.getElementById('video-slider' + windowId)
                seekBar.value = value;
                var eventInput = new Event('input');
                seekBar.dispatchEvent(eventInput);
            }
            else if (controlType == "seekbar-event") {
                var seekBar = document.getElementById('video-slider' + windowId)
                seekBar.value = value;
                windowList[windowId].data.currentPosition = value;
                
                if (seekBar.classList.contains('fill')) {
                    styles[windowId] = getFillStyle(seekBar);
                }
                else {
                    styles[windowId] = '';
                }
                if (seekBar.classList.contains('tip')) {
                    styles[windowId] += getTipStyle(seekBar);
                }
                s.textContent = styles.join('');
            }
            else if (controlType == "previous") {
                if (value == "event") {
                    var seekBar = document.getElementById('video-slider' + windowId)
                    seekBar.value--;
                    if (seekBar.classList.contains('fill')) {
                        styles[windowId] = getFillStyle(seekBar);
                    }
                    else {
                        styles[windowId] = '';
                    }
                    if (seekBar.classList.contains('tip')) {
                        styles[windowId] += getTipStyle(seekBar);
                    }
                    s.textContent = styles.join('');
                    windowList[windowId].data.currentPosition--;
                }
                else {
                    var previous = document.getElementById('previous-pdf' + windowId)
                    var eventPrevious = new Event('previous');
                    previous.dispatchEvent(eventPrevious);
                }

            }
            else if (controlType == "next") {
                if (value == "event") {
                    var seekBar = document.getElementById('video-slider' + windowId)
                    seekBar.value++;
                    if (seekBar.classList.contains('fill')) {
                        styles[windowId] = getFillStyle(seekBar);
                    }
                    else {
                        styles[windowId] = '';
                    }
                    if (seekBar.classList.contains('tip')) {
                        styles[windowId] += getTipStyle(seekBar);
                    }
                    s.textContent = styles.join('');
                    windowList[windowId].data.currentPosition++;
                }
                else {
                    var next = document.getElementById('next-pdf' + windowId)
                    var eventNext = new Event('next');
                    next.dispatchEvent(eventNext);
                }
            }   
        }
    }
    
    switchToTiledDisplay = function (windowId){
        var canvas = document.getElementById("canvas" + windowId);
        windowList[windowId].isTiled = true;
        fullWindow(canvas);
    }

    switchToNormalDisplay = function (windowId) {
        var canvas = document.getElementById("canvas" + windowId);
        windowList[windowId].isTiled = false;
    }

    playAudio = function () {
        document.getElementById("audio").play();
        //audioplayer.toggle();
    };
    
    //=============================================================================
    // REMOTE CONTROL FOR SYNCHRONIZING PING-PONG GAME BETWEEN CLIENTS
    //=============================================================================
    remoteGameControl = function (windowId, game, controlType, value) {
        if (game == "ping-pong") {
            if (controlType == "start") {
                console.log("REMOTE START")
                windowList[windowId].data.game.start();
            }
            else if (controlType == "restart") {
                windowList[windowId].data.game.restart();
            }
            else if (controlType == "moveBall") {
                var x = (value.x * windowList[windowId].data.game.W) / value.W;
                var y = (value.y * windowList[windowId].data.game.H) / value.H;
                windowList[windowId].data.game.ball.x = windowList[windowId].data.game.W - x;
                windowList[windowId].data.game.ball.y = windowList[windowId].data.game.H - y;
            }
            else if (controlType == "movePaddle") {
                var x = (value.x * windowList[windowId].data.game.W) / value.W;
                windowList[windowId].data.game.movePaddle(value.id, windowList[windowId].data.game.W - windowList[windowId].data.game.paddles[value.id].w - x);
            }
            else if (controlType == "increasePoints") {
                windowList[windowId].data.game.increasePoints();
            }
            else if (controlType == "gameOver") {
                windowList[windowId].data.game.gameOver(windowList[windowId].data.game.canvas);
            }
            else if (controlType == "tiled-display") {
                windowList[windowId].isTiled = true;
                windowList[windowId].data.game.launchFullScreen();  
            }
            else if (controlType == "endfullscreen") {
                var eventEndFullscreen = new Event('endfullscreen');
                var canvas = document.getElementById('canvas' + windowId);
                windowList[windowId].isTiled = false;
                canvas.dispatchEvent(eventEndFullscreen);   
            }
        }
        else if (game == "drawing") {
            if (controlType == "paint") {
                var app = windowList[windowId].data.game;
                app.mouse.x = value.x;
                app.mouse.y = value.y;
                app.paint(app.canvas, app.mouse.x, app.mouse.y, value.color);
            }
           else if (controlType == "preparePaint") {
                var app = windowList[windowId].data.game;
                app.preparePaint(app.canvas, value.x, value.y)
            }
        }
    }
});
