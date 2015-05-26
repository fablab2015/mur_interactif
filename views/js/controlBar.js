function getFillStyle(el) {
    var str = '', 
        id = el.id, 
        min = el.min || 0, 
        perc = (el.max) ? ~~(100 * (el.value - min) / (el.max - min)) : el.value, 
        val = '', style, w, h, sw, sh, r;
    
    if (el.classList.contains('fill--2')) {
        style = getComputedStyle(el);
        w = ~~style.width.split('px')[0];
        h = ~~style.height.split('px')[0];
        sw = (w - h) / 4;
        sh = h / 2 - 2;
        
        val += sw + 'px ' + sh + 'px,';
        
        if (el.classList.contains('numbered')) {
            str += '.js #' + id + '/deep/ #track:after{width:' + ~~(perc * w / 100) + 'px}';
        }
    }
    
    val += val + perc + '% 100%';
    
    for (var j = 0; j < n_pp; j++) {
        str += '.js #' + id + '::' + pp[j] + 'track{background-size:' + val + '}';
    }
    
    return str;
};

getTipStyle = function (el) {
    var id = el.id, val = el.value, 
        str = '.js #' + id + ' /deep/ #thumb:after{content:"' + val + '"}';
    
    return str;
};
    