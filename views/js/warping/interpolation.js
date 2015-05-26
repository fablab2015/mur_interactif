var ImgWarper = ImgWarper || {};

ImgWarper.BilinearInterpolation = function(width, height, canvas){
  this.width = width;
  this.height = height;
  this.ctx = canvas.getContext("2d");
  this.imgTargetData = this.ctx.createImageData(this.width, this.height);
};

ImgWarper.BilinearInterpolation.prototype.generate = 
    function(source, fromGrid, toGrid) {
  this.imgData = source;
  for (var i = 0; i < toGrid.length; ++i) {
    this.fill( fromGrid[i],toGrid[i]);
  }
  return this.imgTargetData;
};

ImgWarper.BilinearInterpolation.prototype.fill = 
    function(sourcePoints, fillingPoints) {
    //transformgrid sourcegrid
  
  //interpolation bilinéaire:voir http://en.wikipedia.org/wiki/Bilinear_interpolation
  var i, j;
  var srcX, srcY;
  var x0 = fillingPoints[0].x;
  var x1 = fillingPoints[2].x;
  var y0 = fillingPoints[0].y;
  var y1 = fillingPoints[2].y;
  x0 = Math.max(x0, 0); 
  y0 = Math.max(y0, 0); 
  x1 = Math.min(x1, this.width - 1);
  y1 = Math.min(y1, this.height - 1);

  var xl, xr, topX, topY, bottomX, bottomY;
  var yl, yr, rgb, index;
  for (i = x0; i <= x1; ++i) {
    xl = (i - x0) / (x1 - x0);
    xr = 1 - xl;
    topX = xr * sourcePoints[0].x + xl * sourcePoints[1].x;
    topY = xr * sourcePoints[0].y + xl * sourcePoints[1].y;
    bottomX = xr * sourcePoints[3].x + xl * sourcePoints[2].x;
    bottomY = xr * sourcePoints[3].y + xl * sourcePoints[2].y;
    for (j = y0; j <= y1; ++j) {
      yl = (j - y0) / (y1 - y0);
      yr = 1 - yl;
      srcX = topX * yr + bottomX * yl;
      srcY = topY * yr + bottomY * yl;//(i,j) correspond à (x,y) dans l'algo et (srcX,srcY)=f(i,j)
      index = ((j * this.width) + i) * 4;
      if (srcX < 0 || srcX > this.width - 1 ||
          srcY < 0 || srcY > this.height - 1) {
        /*
        this.imgTargetData.data[index] = 255;
        this.imgTargetData.data[index + 1] = 255;
        this.imgTargetData.data[index + 2] = 255;
        this.imgTargetData.data[index + 3] = 255;
        */
        continue;
      }
      var srcX1 = Math.floor(srcX);
      var srcY1 = Math.floor(srcY);
      var base = ((srcY1 * this.width) + srcX1) * 4;

      this.imgTargetData.data[base] = this.imgData[index];
      this.imgTargetData.data[base + 1] = this.imgData[index + 1];
      this.imgTargetData.data[base + 2] = this.imgData[index + 2];
      this.imgTargetData.data[base + 3] = this.imgData[index + 3];
      
      
    }
  }
  

  
};

