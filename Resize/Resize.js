/**
 * Resize.js
 *
 * @author beanfondue@gmail.com
 */

//new Resize({
//    attrname:      ResizableNodeAttributeName,
//    attrelement:   ResizableElement,
//    distance:      ResizableZoneDistance,
//    minWidth:      ResizableMinWidth,
//    minHeight:     ResizableMinHeight,
//    defaultCursor: ResizableNodeDefaultCursorAttributeName
//});

function Resize(args)
{
    if (!args.attrname) { alert("arguments not enough"); return; }

    this.attrname      = args.attrname;
    this.attrelement   = args.attrelement;
    this.distance      = args.distance;
    this.minWidth      = args.minWidth;
    this.minHeight     = args.minHeight;
    this.defaultCursor = args.defaultCursor;

    this.f       = function () { return new Function(); };
    this.onstart = (args.handler && typeof args.handler.onstart == "function") ? args.handler.onstart : this.f();
    this.onrun   = (args.handler && typeof args.handler.onrun == "function")   ? args.handler.onrun   : this.f();
    this.onstop  = (args.handler && typeof args.handler.onstop == "function")  ? args.handler.onstop  : this.f();

    this.resizeMode       = false;
    this.element          = null;
    this.direction        = 0;
    this.saveLeft         = 0;
    this.saveTop          = 0;
    this.saveWidth        = 0;
    this.saveHeight       = 0;
    this.marginDistanceXR = 0;
    this.marginDistanceXL = 0;
    this.marginDistanceYT = 0;
    this.marginDistanceYB = 0;
    this.Body             = (document.documentElement || document.body);

    if (window.attachEvent) {
        this.addEvent = function (Element, Handle, Action) { return Element.attachEvent(Handle, Action); }
    } else if (window.addEventListener) {
        this.addEvent = function (Element, Handle, Action) { return Element.addEventListener(Handle.replace(/^on/i,""), Action, false); }
    }

    var that = this;
    this.addEvent(this.Body,"onmousedown",function (event) {
        that.element = event.target || event.srcElement;
        if (that.element.getAttribute(that.attrname) == "true" && (event.button == 0 || event.button == 1)) {
            if (that.element.getAttribute(that.attrelement) != null) { that.element = eval(that.element.getAttribute(that.attrelement)); }
            that.resizeMode = true;
            that.saveLeft   = that.element.offsetLeft;
            that.saveTop    = that.element.offsetTop;
            that.saveWidth  = that.element.offsetWidth;
            that.saveHeight = that.element.offsetHeight;

            var x = that.Body.scrollLeft + event.clientX;
            var y = that.Body.scrollTop + event.clientY;
            that.marginDistanceXR = that.saveLeft + that.saveWidth - x;
            that.marginDistanceXL = x - that.saveLeft;
            that.marginDistanceYT = y - that.saveTop;
            that.marginDistanceYB = that.saveTop + that.saveHeight - y;
            that.onstart();
        }
    });
    this.addEvent(this.Body,"onmousemove",function (event) {
        var element = event.target || event.srcElement;
        if (element.getAttribute(that.attrelement) != null) { element = eval(element.getAttribute(that.attrelement)); }
        var x = that.Body.scrollLeft + event.clientX - element.offsetLeft;
        var y = that.Body.scrollTop + event.clientY - element.offsetTop;
        if (element.getAttribute(that.attrname) == "true" && that.resizeMode == false) {
            var distance = Number(element.getAttribute(that.distance));
            distance = (distance == 0) ? 10 : distance;
            if (x <= distance && y <= distance) {
                that.direction = 1;
                element.style.cursor = "nw-resize";
            } else if (x >= element.offsetWidth - distance && y <= distance) {
                that.direction = 3;
                element.style.cursor = "ne-resize";
            } else if (x >= element.offsetWidth - distance && y >= element.offsetHeight - distance) {
                that.direction = 5;
                element.style.cursor = "se-resize";
            } else if (x <= distance && y >= element.offsetHeight - distance) {
                that.direction = 7;
                element.style.cursor = "sw-resize";
            } else if (y <= distance) {
                that.direction = 2;
                element.style.cursor = "n-resize";
            } else if (x >= element.offsetWidth - distance) {
                that.direction = 4;
                element.style.cursor = "e-resize";
            } else if (y >= element.offsetHeight - distance) {
                that.direction = 6;
                element.style.cursor = "s-resize";
            } else if (x <= distance) {
                that.direction = 8;
                element.style.cursor = "w-resize";
            } else {
                that.direction = 0;
                element.style.cursor = (element.getAttribute(that.defaultCursor)) ? element.getAttribute(that.defaultCursor) : "default";
            }
        }
        if (that.resizeMode == true && (that.direction >= 1 && that.direction <= 8)) {
            var X = that.Body.scrollLeft + event.clientX;
            var Y = that.Body.scrollTop + event.clientY;
            if (that.direction == 1) {
                X -= that.marginDistanceXL;
                Y -= that.marginDistanceYT;
            } else if (that.direction == 2) {
                Y -= that.marginDistanceYT;
            } else if (that.direction == 3) {
                Y -= that.marginDistanceYT;
                X += that.marginDistanceXR;
            } else if (that.direction == 4) {
                X += that.marginDistanceXR;
            } else if (that.direction == 5) {
                X += that.marginDistanceXR;
                Y += that.marginDistanceYB;
            } else if (that.direction == 6) {
                Y += that.marginDistanceYB;
            } else if (that.direction == 7) {
                Y += that.marginDistanceYB;
                X -= that.marginDistanceXL;
            } else if (that.direction == 8) {
                X -= that.marginDistanceXL;
            }

            var widthFromLeft  = (that.saveLeft - X) + that.saveWidth;
            var widthFromRight = X - that.saveLeft;
            var heightFromUp   = (that.saveTop - Y) + that.saveHeight;
            var heightFromDown = Y - that.saveTop;

            var minWidth  = (that.element.getAttribute(that.minWidth)) ? Number(that.element.getAttribute(that.minWidth)) : 0;
            var minHeight = (that.element.getAttribute(that.minHeight)) ? Number(that.element.getAttribute(that.minHeight)) : 0;

            var positioning = true;

            if (widthFromLeft < minWidth) { X = that.saveLeft + (that.saveWidth - minWidth); widthFromLeft = minWidth; }
            widthFromRight = (widthFromRight < minWidth) ? minWidth : widthFromRight;
            if (heightFromUp < minHeight) { Y = that.saveTop + (that.saveHeight - minHeight); heightFromUp = minHeight; }
            heightFromDown = (heightFromDown < minHeight) ? minHeight : heightFromDown;

            switch (that.direction) {
                case 1:
                    that.element.style.left   = X + "px";
                    that.element.style.top    = Y + "px";
                    that.element.style.width  = widthFromLeft + "px";
                    that.element.style.height = heightFromUp + "px";
                    break;
                case 2:
                    that.element.style.top    = Y + "px";
                    that.element.style.height = heightFromUp + "px";
                    break;
                case 3:
                    that.element.style.top    = Y + "px";
                    that.element.style.width  = widthFromRight + "px";
                    that.element.style.height = heightFromUp + "px";
                    break;
                case 4:
                    that.element.style.width  = widthFromRight + "px";
                    break;
                case 5:
                    that.element.style.width  = widthFromRight + "px";
                    that.element.style.height = heightFromDown + "px";
                    break;
                case 6:
                    that.element.style.height = heightFromDown + "px";
                    break;
                case 7:
                    that.element.style.left   = X + "px";
                    that.element.style.width  = widthFromLeft + "px";
                    that.element.style.height = heightFromDown + "px";
                    break;
                case 8:
                    that.element.style.left   = X + "px";
                    that.element.style.width  = widthFromLeft + "px";
                    break;
                default :;
            }

            if (event.preventDefault !== undefined) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            
            that.onrun();
        }
    });
    
    this.addEvent(this.Body,"onmouseup",function () {
        that.element          = null;
        that.direction        = 0;
        that.saveLeft         = 0;
        that.saveTop          = 0;
        that.saveWidth        = 0;
        that.saveHeight       = 0;
        that.marginDistanceXR = 0;
        that.marginDistanceXL = 0;
        that.marginDistanceYT = 0;
        that.marginDistanceYB = 0;
        that.resizeMode       = false;
        that.onstop();
    });
}