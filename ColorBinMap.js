class ColorBinMap{
    constructor(divID) {
        this._divID = divID;

        //add background notch map
        this._bgCanvas = document.createElement('canvas');
        this._bgCanvas.id = divID + "_bg";
        this._setBgStyle();
        document.getElementById(this._divID).appendChild(this._bgCanvas);
        
        //add bin map
        this._mapCanvas = document.createElement('canvas');
        this._mapCanvas.id = divID + "_map";
        this._setMapStyle();
        document.getElementById(this._divID).appendChild(this._mapCanvas);

        //add fouce cube
        this._focusDiv = document.createElement('div');
        this._focusDiv.id = divID + "_focus";
        this._setFocusDivStyle();
        document.getElementById(this._divID).appendChild(this._focusDiv);

        this._scaleSize = 0.8; //Map size scale to 80%
        this._mapPosOffsetX = 0;
        this._mapPosOffsetY = 0;

        this._canvasID = this._mapCanvas.id;
        this._width = 800;
        this._height = 800;
        this._bins = [];
        this._maxY = 0;
        this._maxX = 0;
        this._enableDrawLine = false;

        this._onDieInfoEvent = null;

        this._notch = 0;
    }

    set NotchNum(value){
        if(value != 0 && value != 90 && value != 180 && value != 270)
            throw "NotchNum only set [0, 90, 180, 270]";

        this._notch = value;
    }

    get NotchNum(){
        return this._notch;
    }

    set NotchURDL(value){
        if(value != "U" && value != "R" && value != "D" && value != "L")
            throw "NotchURDL only set [U, R, D, L]";
        
        if(value == "U")
            this._notch = 0;
        else if(value == "R")
            this._notch = 90;
        else if(value == "D")
            this._notch = 180;
        else if(value == "L")
            this._notch = 270;

    }

    get NotchURDL(){
        if(this._notch == 0)
            return "U";
        else if(this._notch == 90)
            return "R";
        else if(this._notch == 180)
            return "D";
        else if(this._notch == 270)
            return "L";

        
    }

    set onDieInfoEnvet(value){
        this._onDieInfoEvent = value;
    }    

    get width(){
        return this._width;
    }

    set width(value){
        // document.getElementById(this._divID).style.width = value + "px";
        // document.getElementById(this._canvasID).style.width = value + "px";
        this._bgCanvas.width = value;
        this._mapCanvas.width = value * this._scaleSize;
        //設定 map 置中
        this._mapPosOffsetX = (this._bgCanvas.width - this._mapCanvas.width) / 2;
        //this._mapCanvas.style.left = this._mapPosOffsetX + "px";
        this._mapCanvas.style.padding = this._mapPosOffsetY + "px 0px 0px " + this._mapPosOffsetX  + "px";

        this._width = value;
    }

    get height(){
        return this._height;
    }

    set height(value){
        // document.getElementById(this._divID).style.height = value + "px";
        // document.getElementById(this._canvasID).style.height = value + "px";
        this._bgCanvas.height = value;
        this._mapCanvas.height = value * this._scaleSize;

        //設定 map 置中
        this._mapPosOffsetY = (this._bgCanvas.height - this._mapCanvas.height) / 2;
        //this._mapCanvas.style.top = this._mapPosOffsetY + "px";
        this._mapCanvas.style.padding = this._mapPosOffsetY + "px 0px 0px " + this._mapPosOffsetX  + "px";

        this._height = value;
    }

    get dieWidth(){
        return this._dieWidth;
    }

    set dieWidth(value){
        this._dieWidth = value;
    }

    get dieHeight(){
        return this._dieHeight;
    }

    set dieHeight(value){
        this._dieHeight;
    }

    set enableDrawLine(value){
        this._enableDrawLine = value;
    }

    addBin(x, y, binCode, dut, color){
        this._bins.push({
            x : x,
            y : y,
            binCode :binCode,
            dut : dut,
            color : color
        });
    }

    _setBgStyle(){
        this._bgCanvas.setAttribute("style", "position: fixed;overflow-x: hidden;");
    }

    _setMapStyle(){
        this._mapCanvas.setAttribute("style", "position: fixed;overflow-x: hidden;");
    }

    _setFocusDivStyle(){
        this._focusDiv.setAttribute("style", "position: relative;overflow-x: hidden;border: 2px solid blue;");
    }

    _compute(){
        if(this._bins.length == 0)
            return;
        this._maxX = Math.max(...this._bins.map(p => p.x));
        this._maxY = Math.max(...this._bins.map(p => p.y));
        
        this._dieWidth = this._width / (this._maxX + 1) * this._scaleSize;
        this._dieHeight = this._height / (this._maxY + 1)* this._scaleSize;

        //this._focusDiv.width = this._dieWidth;
        this._focusDiv.style.width = (this._dieWidth - 4) + 'px';
        //this._focusDiv.height = this._dieHeight;
        this._focusDiv.style.height = (this._dieHeight - 4) + 'px';
        this._focusDiv.style.top = this._mapPosOffsetY + "px";
        this._focusDiv.style.left = this._mapPosOffsetX + "px";

        
    }

    draw(){
        this._compute();

        this._setFocueMove();
        this._drawBackgroupd();

        var c = document.getElementById(this._canvasID);
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);

        this._bins.forEach((bin,index)=>{
            ctx.fillStyle = bin.color;
            ctx.fillRect(bin.x * this._dieWidth, bin.y * this._dieHeight, this._dieWidth, this._dieHeight);
        });

        this._drawLine(ctx);


    }

    _drawBackgroupd(){
        var ctx = this._bgCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
        var centX = this.width / 2; //center X
        var centY = this.height / 2; //center Y

        
        ctx.fillStyle = "#C0C0C0";
        ctx.beginPath();
        ctx.arc(centX, centY, centY, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        var notchX = 0;
        var notchY = 0;
        var notchWidth = 0;
        var notchHeight = 0;
        var notchScale = 0.1;
        if(this._notch == 0){
            notchHeight = this.height * notchScale;
            notchWidth = this.width;
        }else if(this._notch == 90){
            notchWidth = this.width * notchScale;
            notchX = this.width - notchWidth;
            notchHeight = this.height;
        }else if(this._notch == 180){
            notchHeight = this.height * notchScale;
            notchY = this.height - notchHeight;
            notchWidth = this.width;
        }else if(this._notch == 270){
            notchWidth = this.width * notchScale;
            notchHeight = this.height;
        }
        //draw notch
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(notchX, notchY, notchWidth, notchHeight);
        ctx.fill();
    }

    _drawLine(ctx){
        if(!this._drawLine){
            return;
        }
        ctx.beginPath(); 
        //vertical line
        for(var x = 0; x <= this._maxX + 1; x++){
            var eleYs;
            if(x == this._maxX + 1){

                eleYs = this._bins.filter(element => element.x == (x - 1) );
            }else{
                eleYs = this._bins.filter(element => element.x == x );
            }
            var fromY = Math.min(...eleYs.map(p => p.y)) * this._dieHeight;
            var toY = (Math.max(...eleYs.map(p => p.y)) + 1) * this._dieHeight;
            var toX = x * this._dieWidth;

            ctx.moveTo(toX, fromY);

            ctx.lineTo(toX, toY);
            ctx.stroke();
        }

        //horizontal line
        for(var y = 0; y <= this._maxY + 1; y++){
            var eleXs;
            if(y == this._maxY + 1){

                eleXs = this._bins.filter(element => element.y == (y - 1) );
            }else{
                eleXs = this._bins.filter(element => element.y == y );
            }

            var fromX = Math.min(...eleXs.map(p => p.x)) * this._dieWidth;
            var toX = (Math.max(...eleXs.map(p => p.x)) + 1) * this._dieWidth;
            var toY = y * this._dieHeight;

            ctx.moveTo(fromX, toY);
            ctx.lineTo(toX, toY);
            ctx.stroke();

        }
    }

    _setFocueMove(){
        var focDiv = this._focusDiv;
        var mapPosOffsetY = this._mapPosOffsetY;
        var mapPosOffsetX = this._mapPosOffsetX;
        var dieHeight = this._dieHeight;
        var dieWidth = this._dieWidth;
        var self = this;

        this._mapCanvas.addEventListener('mousemove', function(e) {
            var mouseX, mouseY;

            if(e.offsetX) {
                mouseX = e.offsetX;
                mouseY = e.offsetY;
            }
            else if(e.layerX) {
                mouseX = e.layerX;
                mouseY = e.layerY;
            }

            var onDieY = Math.floor((mouseY - mapPosOffsetY) / dieHeight);
            var onDieX = Math.floor((mouseX - mapPosOffsetX) / dieWidth);
            
            if(self._containDieXY(onDieX, onDieY) == false)
                return;
            
            if(self._onDieInfoEvent != null){
                var dieInfo = self._getDieInfo(onDieX, onDieY);
                self._onDieInfoEvent(dieInfo.x, dieInfo.y, dieInfo.binCode, dieInfo.dut, dieInfo.color);
            }
            var posTop = (onDieY * dieHeight) + mapPosOffsetY;
            var posLeft= (onDieX * dieWidth) + mapPosOffsetX;

            
            focDiv.style.top = posTop + "px";
            focDiv.style.left = posLeft + "px";
          }, false);
    }

    _containDieXY(x, y){
        var eleXs = this._bins.filter(element => element.y == y );
        if(eleXs.length == 0)
            return false;
        var minX = Math.min(...eleXs.map(p => p.x));
        var maxX = Math.max(...eleXs.map(p => p.x));
        if(x < minX || x > maxX)
            return false;

        return true;
    }

    _getDieInfo(dieX, dieY){
        return this._bins.find(element => element.x == dieX && element.y == dieY);
    }

}
