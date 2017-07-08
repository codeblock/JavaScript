/**
 * Drag.js
 *
 * @author beanfondue@gmail.com
 */

//new Drag(
//    ObjectAttributeName,
//    DragElement,
//    DragAreaNode,
//    DragDirection[0 - Both, 1 - Horizontal, 2 - Vertical],
//    ScalePercentageAttributeName
//);

function Drag(Name, Dragelement, Dragarea, Direction, ScalePercent)
{
    this.Name         = Name;
    this.Dragelement  = Dragelement;
    this.Dragarea     = Dragarea;
    this.Direction    = Direction;
    this.ScalePercent = ScalePercent;
    this.DragMode     = false;
    this.Element      = null;
    this.Collection   = [];
    this.Body         = document.documentElement;
    this.Limit        = null;
    this.LimitStartX  = 0;
    this.LimitEndX    = 0;
    this.LimitStartY  = 0;
    this.LimitEndY    = 0;
    this.ScaleX       = 0;
    this.ScaleY       = 0;
    this.setX         = 0;
    this.setY         = 0;

    if (window.attachEvent) {
        this.addEvent = function (Element, Handle, Action) { return Element.attachEvent(Handle, Action); }
    } else if (window.addEventListener) {
        this.addEvent = function (Element, Handle, Action) { return Element.addEventListener(Handle.replace(/^on/i,""), Action, false); }
    }
    this.run();
}

Drag.prototype =
{
    moveX : function (PositionX) {
        if (this.Limit != null) {
            if (this.LimitStartX >= PositionX) { this.Element.style.left = this.LimitStartX + "px"; }
            else if (this.LimitEndX <= (PositionX + this.Element.offsetWidth)) { this.Element.style.left = (this.LimitEndX - this.Element.offsetWidth) + "px"; }
            else { this.Element.style.left = PositionX + "px"; }
            if (this.Element.getAttribute(this.ScalePercent)) {
                var ScalePercent = Number(this.Element.getAttribute(this.ScalePercent));
                this.ScaleX = Math.ceil((this.Element.offsetLeft - this.LimitStartX) * (ScalePercent / (this.LimitEndX - this.LimitStartX - this.Element.offsetWidth)));
            }
        } else {
            this.Element.style.left = PositionX + "px";
        }
    },
    moveY : function (PositionY) {
        if (this.Limit != null) {
            if (this.LimitStartY >= PositionY) { this.Element.style.top = this.LimitStartY + "px"; }
            else if (this.LimitEndY <= (PositionY + this.Element.offsetHeight)) { this.Element.style.top = (this.LimitEndY - this.Element.offsetHeight) + "px"; }
            else { this.Element.style.top = PositionY + "px"; }
            if (this.Element.getAttribute(this.ScalePercent)) {
                var ScalePercent = Number(this.Element.getAttribute(this.ScalePercent));
                this.ScaleY = Math.ceil((this.Element.offsetTop - this.LimitStartY) * (ScalePercent / (this.LimitEndY - this.LimitStartY - this.Element.offsetHeight)));
            }
        } else {
            this.Element.style.top = PositionY + "px";
        }
    },
    run : function () {
        var that = this;
        this.addEvent(this.Body,"onmousedown",function (event) {
            if (event.button == 0 || event.button == 1) {
                that.Element  = event.target || event.srcElement;
                that.DragMode = (that.Element.getAttribute(that.Name) == "true") ? true : false;
                
                if (that.DragMode == true) {
                    if (that.Element.getAttribute(that.Dragelement)) { that.Element = eval(that.Element.getAttribute(that.Dragelement)); }
                    //addCollection
                    for (var i = 0; i < that.Collection.length; i++) { if (that.Element === that.Collection[i]) { break; } }
                    if (i == that.Collection.length) {
                        that.Element.style.zIndex = that.Collection.length + 1;
                        that.Collection.push(that.Element);
                        that.Element.style.position = "absolute";
                    }
                    //addCollection
                    //reset z-Index
                    var tmpElement = [];
                    var tmpzIndex = that.Collection.length - 1;
                    for (var i = tmpzIndex; i >= 0; i--) { tmpElement[that.Collection[i].style.zIndex - 1] = that.Collection[i]; }
                    for (var i = tmpzIndex; i >= 0; i--) { tmpElement[i].style.zIndex = (tmpElement[i] === that.Element) ? tmpElement.length : tmpzIndex--; }
                    //reset z-Index
                    if (that.Element.getAttribute(that.Dragarea)) {
                        that.Limit       = eval(that.Element.getAttribute(that.Dragarea));
                        that.LimitStartX += that.Limit.offsetLeft;
                        that.LimitEndX   += that.LimitStartX + that.Limit.clientWidth;
                        that.LimitStartY += that.Limit.offsetTop;
                        that.LimitEndY   += that.LimitStartY + that.Limit.clientHeight;
                    }
                    that.setX = event.clientX - that.Element.offsetLeft;
                    that.setY = event.clientY - that.Element.offsetTop;
                }
            }
        });
        this.addEvent(this.Body,"onmousemove",function (event) {
            if (that.DragMode == true) {
                var PositionX = event.clientX - that.setX;
                var PositionY = event.clientY - that.setY;
                switch (that.Element.getAttribute(that.Direction)) {
                    case "0" :
                        that.moveX(PositionX);
                        that.moveY(PositionY);
                        break;
                    case "1" :
                        that.moveX(PositionX);
                        break;
                    case "2" :
                        that.moveY(PositionY);
                        break;
                    default :
                        that.moveX(PositionX);
                        that.moveY(PositionY);
                }

                if (event.preventDefault !== undefined) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }
            }
        });
        this.addEvent(this.Body, "onmouseup", function () {
            that.DragMode    = false;
            that.Element     = null;
            that.Limit       = null;
            that.LimitStartX = 0;
            that.LimitEndX   = 0;
            that.LimitStartY = 0;
            that.LimitEndY   = 0;
            that.setX        = 0;
            that.setY        = 0;
        });
    }
}