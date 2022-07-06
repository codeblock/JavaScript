/**
 * Drag.js
 *
 * @author beanfondue@gmail.com
 */

//new Drag({
//    attrname:      DraggableNodeAttributeName,
//    attrelement:   DraggableElement,
//    attrarea:      DraggableArea,
//    attrdirection: DraggableDirection,
//    attrscale:     DraggableScale,
//    defaultzIndex: DraggableNodeDefaultzIndex
//    handler:       DraggableNodeAdditionalHandler
//});

function Drag(args) {
    if (!args.attrname) {
        alert("arguments not enough");
        return;
    }

    this.attrname = args.attrname;
    this.attrelement = args.attrelement;
    this.attrarea = args.attrarea;
    this.attrdirection = args.attrdirection;
    this.attrscale = args.attrscale;
    this.defaultzIndex = 0;
    if (args.defaultzIndex != null && isNaN(args.defaultzIndex) == false) {
        this.defaultzIndex = parseInt(args.defaultzIndex, 10);
    }

    this.f = function () {};
    this.onstart = args.handler && typeof args.handler.onstart == "function" ? args.handler.onstart : this.f;
    this.onrun = args.handler && typeof args.handler.onrun == "function" ? args.handler.onrun : this.f;
    this.onstop = args.handler && typeof args.handler.onstop == "function" ? args.handler.onstop : this.f;

    this.dragMode = false;
    this.element = null;
    this.collection = [];
    this.body = document.documentElement || document.body;
    this.limit = null;
    this.limitStartX = 0;
    this.limitEndX = 0;
    this.limitStartY = 0;
    this.limitEndY = 0;
    this.percentX = 0;
    this.percentY = 0;
    this.setX = 0;
    this.setY = 0;

    if (window.addEventListener !== undefined) {
        this.addEvent = function (element, handle, action) {
            return element.addEventListener(handle.replace(/^on/i, ""), action, false);
        };
    } else if (window.attachEvent !== undefined) {
        this.addEvent = function (element, handle, action) {
            return element.attachEvent(handle, action);
        };
    }

    this.run();
}

Drag.prototype = {
    enums: {
        eMin: 0,
        eBoth: 0,
        eHorizontal: 1,
        eVertical: 2,
        eMax: 2,
    },
    setMode: function (mode) {
        this.dragMode = mode;
    },
    moveX: function (positionX) {
        if (this.limit != null) {
            if (this.limitStartX >= positionX) {
                this.element.style.left = this.limitStartX + "px";
            } else if (this.limitEndX <= positionX + this.element.offsetWidth) {
                this.element.style.left = this.limitEndX - this.element.offsetWidth + "px";
            } else {
                this.element.style.left = positionX + "px";
            }
            if (this.element.getAttribute(this.attrscale)) {
                var attrscale = Number(this.element.getAttribute(this.attrscale));
                this.percentX = Math.ceil(
                    (this.element.offsetLeft - this.limitStartX) * (attrscale / (this.limitEndX - this.limitStartX - this.element.offsetWidth))
                );
            }
        } else {
            this.element.style.left = positionX + "px";
        }
    },
    moveY: function (positionY) {
        if (this.limit != null) {
            if (this.limitStartY >= positionY) {
                this.element.style.top = this.limitStartY + "px";
            } else if (this.limitEndY <= positionY + this.element.offsetHeight) {
                this.element.style.top = this.limitEndY - this.element.offsetHeight + "px";
            } else {
                this.element.style.top = positionY + "px";
            }
            if (this.element.getAttribute(this.attrscale)) {
                var attrscale = Number(this.element.getAttribute(this.attrscale));
                this.percentY = Math.ceil(
                    (this.element.offsetTop - this.limitStartY) * (attrscale / (this.limitEndY - this.limitStartY - this.element.offsetHeight))
                );
            }
        } else {
            this.element.style.top = positionY + "px";
        }
    },
    scaleX: function () {
        return this.percentX;
    },
    scaleY: function () {
        return this.percentY;
    },
    run: function () {
        var that = this;

        this.addEvent(this.body, "onmousedown", function (event) {
            if (event.button == 0 || event.button == 1) {
                that.element = event.target || event.srcElement;
                that.dragMode = that.element.getAttribute(that.attrname) == "true" ? true : false;
                if (that.dragMode == true) {
                    if (that.element.getAttribute(that.attrelement)) {
                        that.element = eval(that.element.getAttribute(that.attrelement));
                    }

                    //addCollection
                    for (var i = 0; i < that.collection.length; i++) {
                        if (that.element === that.collection[i]) {
                            break;
                        }
                    }

                    if (i == that.collection.length) {
                        that.element.style.zIndex = that.collection.length + 1 + that.defaultzIndex;
                        that.collection.push(that.element);
                        that.element.style.position = "absolute";
                    }
                    //addCollection
                    //reset z-Index
                    var tmpElement = [];
                    var tmpzIndex = that.collection.length - 1 - that.defaultzIndex;
                    for (var i = tmpzIndex; i >= 0; i--) {
                        tmpElement[that.collection[i].style.zIndex - 1] = that.collection[i];
                    }
                    for (var i = tmpzIndex; i >= 0; i--) {
                        tmpElement[i].style.zIndex = that.defaultzIndex + (tmpElement[i] === that.element ? tmpElement.length : tmpzIndex--);
                    }
                    //reset z-Index
                    var el_area = that.element.getAttribute(that.attrarea);
                    if (el_area != null && el_area != "") {
                        if (el_area.indexOf("this.") == 0) {
                            that.limit = that.element[el_area.substring(5, el_area.length)];
                        } else {
                            that.limit = eval(el_area);
                            if (that.limit.contains(that.element) == false) {
                                that.limit.appendChild(that.element);
                            }
                        }

                        if (getComputedStyle(that.limit).position == "absolute" || getComputedStyle(that.limit).position == "relative") {
                            that.limitStartX += 0;
                            that.limitStartY += 0;
                        } else {
                            that.limitStartX += that.limit.offsetLeft;
                            that.limitStartY += that.limit.offsetTop;
                        }

                        that.limitEndX += that.limitStartX + that.limit.clientWidth;
                        that.limitEndY += that.limitStartY + that.limit.clientHeight;
                    }
                    that.setX = event.clientX - that.element.offsetLeft;
                    that.setY = event.clientY - that.element.offsetTop;

                    that.onstart.call(that.element, event);
                }
            }
        });

        this.addEvent(this.body, "onmousemove", function (event) {
            if (that.dragMode == true) {
                // that.onrun.call(that.element, event);
                var positionX = event.clientX - that.setX;
                var positionY = event.clientY - that.setY;
                var direction = that.element.getAttribute(that.attrdirection);
                direction = Number(direction);

                switch (direction) {
                    case that.enums.eBoth:
                        that.moveX(positionX);
                        that.moveY(positionY);
                        break;
                    case that.enums.eHorizontal:
                        that.moveX(positionX);
                        break;
                    case that.enums.eVertical:
                        that.moveY(positionY);
                        break;
                    default:
                        that.moveX(positionX);
                        that.moveY(positionY);
                }

                if (event.preventDefault !== undefined) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }

                that.onrun.call(that.element, event);
            }
        });

        this.addEvent(this.body, "onmouseup", function (event) {
            if (that.dragMode == true) {
                that.onstop.call(that.element, event);
            }

            that.element = null;
            that.limit = null;
            that.limitStartX = 0;
            that.limitEndX = 0;
            that.limitStartY = 0;
            that.limitEndY = 0;
            that.percentX = 0;
            that.percentY = 0;
            that.setX = 0;
            that.setY = 0;
            that.dragMode = false;
        });
    },
};
