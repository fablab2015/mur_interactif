
launchInteractifMedia = function (windowId, str) {

	var url;
	if(str == "ch"){
		url = "./static/ch.png";
	}
	else if(str == "k7"){
		url = "./static/k7.png";
	}
	var img = new Image();
    img.src = url;
    // when the image loaded, draw the image on HTML5 canvas
    img.addEventListener("load", function () {
        var data = { "masterPosition": infos.position, "image": this }
        var canvas = createCanvas(windowId, "TABLEAU INTERACTIF", 400, 300, "interactif", true, false, data);
        
        var backing_canvas = document.getElementById("backing_" + canvas.id);
        backing_canvas.height = this.height;
        backing_canvas.width = this.width;
        var backing_context = backing_canvas.getContext('2d');
        backing_context.drawImage(img, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
        
       var context = canvas.getContext('2d');
       context.drawImage(backing_canvas, 0, 0, canvas.width, canvas.height);        

    });
	
	
	
    
}