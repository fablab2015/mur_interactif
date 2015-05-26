var ImgWarper = ImgWarper || {};

ImgWarper.Warper = function(
    canvas, img, imgData, optGridSize, optAlpha) {
  this.alpha = optAlpha || 1;
  this.gridSize = optGridSize || 20;
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  var source = img;
  
  this.width = canvas.width;
  this.height = canvas.height; 
  this.imgData = imgData.data;
  this.bilinearInterpolation = 
    new ImgWarper.BilinearInterpolation(this.width, this.height, canvas);
}

ImgWarper.Warper.prototype.warp = function(  fromPoints,toPoints,contx, canvass) {
  var deformation = 
    new ImgWarper.AffineDeformation(toPoints, fromPoints, this.alpha);
  /**********grille n points*/
  //symétries : pour les points sur les deux horizontales de départ
  var lgToPoints=fromPoints.length;
  for (var i=0;i<lgToPoints;i++)
  {
  	if (fromPoints[i].y==0){
  		fromPoints[i].hori=1;//Pour distinguer les vrais points des symétries crées pour la grille
  		fromPoints[i].indice=i;
  		var sym=new ImgWarper.Point(fromPoints[i].x,this.height);
  		//ajout pour test : on met à la symétrie l'indice de sa symétrie
  		sym.indice=i;
  		////
  		fromPoints.push(sym);
  	
  	}
  	
  	else if (fromPoints[i].y==this.height){
  		fromPoints[i].hori=1;
  		fromPoints[i].indice=i;
			var sym=new ImgWarper.Point(fromPoints[i].x,0);
			//ajout pour test : on met à la symétrie l'indice de sa symétrie
  		sym.indice=i;
  		////
			fromPoints.push(sym);
  	}
  
  
  }
  
  
   //symétries : pour les points sur les deux verticales de départ
   lgToPoints=toPoints.length;
  
  for (var i=0;i<lgToPoints;i++)
  {
  	if ( ((toPoints[i].x==0) || (toPoints[i].x==this.width)) && (toPoints[i].y!=0) &&  (toPoints[i].y!=this.height) ){
  		for (var j=0;j<lgToPoints;j++){
  			if(toPoints[j].hori!==undefined && toPoints[j].hori==1)//le point j se trouvait à la base sur une horizontale =>on projete sur ce point
  			{	  
  					toPoints[i].hori=1;
  					toPoints[i].indice=i;
  					var sym=new ImgWarper.Point(toPoints[j].x,toPoints[i]);
  					//ajout pour test : on met à la symétrie l'indice de sa symétrie
  					sym.indice=i;
  					////
  					toPoints.push(sym);
  			}
  		}

  		
  	}
  	
  
  
  }
  
  //enlever les doublures
  n=fromPoints.length;
  for(var i=0;i<n;i++)
  {
  	for(var j=i;j<n;j++)
  	{
			if ((j!=i) && (fromPoints[j].x==fromPoints[i].x) && (fromPoints[j].y==fromPoints[i].y) )
			{
				fromPoints.splice(j,1);
				n--;
			}
  	}
  }
  
  ///construction de la grille*/
  var lignes=[];
  var sortedPoints=[];
  var min=this.height;
  var nbLg=0;
  var y=0;
  lgToPoints=fromPoints.length;
  while(y<=this.height)
  {
  	cpt=0;
  	for(var i=0;i<lgToPoints;i++)
  	{
  		if(fromPoints[i].y<min && fromPoints[i].y!=y && y!==this.height ){
  			//mis à jour du min des y pour éviter d'incrémenter de 1
  			min=fromPoints[i].y;
  		}
  		if(y===this.height)//cas limite
  			min++;
  		//enregistrer les points par ligne
			if (fromPoints[i].y==y){
				cpt++;
				sortedPoints.push(fromPoints[i]);//tableau trié selon x ci dessous
			}
			
			
  	}
  	lignes[nbLg]=cpt;//enregistrer le nombre de points sur cette ligne
		nbLg++;
		
  	y=min;//prochaine ligne à considérer
  
  }
  
  /*tri*/
  var fin =false;
  while(!fin)
  {
  	fin=true;
  	for(var i=0;i<sortedPoints.length-1;i++)
  	{
  		if((sortedPoints[i].y==sortedPoints[i+1].y) &&  (sortedPoints[i].x>sortedPoints[i+1].x)){
				var tmp=sortedPoints[i];
				sortedPoints[i]=sortedPoints[i+1];
				sortedPoints[i+1]=tmp;
				fin=false;
  		}
  	}
  }
  
  
  ///*remplissage de la grille*//
  var grid=[];
  var debLig=0;
  for(var i=0;i<lignes.length-1;i++)
  {
  
  	for(var j=0;j<lignes[i]-1;j++)
  	{
  		var p11=sortedPoints[debLig+j];
  		var p12=sortedPoints[debLig+j+1];
  		var p22=sortedPoints[debLig+lignes[i]+j+1];
  		var p21=sortedPoints[debLig+lignes[i]+j];
  		grid.push([p11,p12,p22,p21 ] );
  	}
  	debLig=debLig+lignes[i];
  	
  
  }
  

  //////////////////
  var transformedGrid = [];
  for (var i = 0; i < grid.length; ++i) {
  
  	var gr=[];
  	for (var j=0;j<4;j++)
  	{
  		if (grid[i][j]!==undefined && grid[i][j].hori==1)//point de base se trouvant dans toPoint
  				gr.push(new ImgWarper.Point(toPoints[grid[i][j].indice].x,toPoints[grid[i][j].indice].y));
  		else //c'est une symétrie
  		{
  		
  				//TODO:Ce cas aurait été utile pour le cas où on a plus de 4 points
  				//On a pas eu le temps de le traiter:Trouver les coordonnées des symétries est assez compliqué
  				//le code ci dessous ne marche donc pas 
  				gr.push(grid[i][j]);
  			
  		}
  	}
    transformedGrid[i] = gr;
  }
  
    var newImg = this.bilinearInterpolation
    .generate(this.imgData,transformedGrid , grid);
		this.ctx.putImageData(newImg, 0, 0);
  
		contx.drawImage(this.canvas, 0, 0);
		
}


ImgWarper.AffineDeformation = function(fromPoints, toPoints, alpha) {
  this.w = null;
  this.pRelative = null;
  this.qRelative = null;
  this.A = null;
  if (fromPoints.length != toPoints.length) {
    console.error('Points are not of same length.'); 
    return;
  }
  this.n = fromPoints.length;  
  this.fromPoints = fromPoints;
  this.toPoints = toPoints;
  this.alpha = alpha;
};
