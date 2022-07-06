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
//    handler:       ResizableNodeAdditionalHandler
//});

function Resize(args) {
    if (!args.attrname) {
        alert("arguments not enough");
        return;
    }

    this.attrname = args.attrname;
    this.attrelement = args.attrelement;
    this.distance = args.distance;
    this.minWidth = args.minWidth;
    this.minHeight = args.minHeight;
    this.defaultCursor = args.defaultCursor;

    this.f = function () {};
    this.onstart = args.handler && typeof args.handler.onstart == "function" ? args.handler.onstart : this.f;
    this.onrun = args.handler && typeof args.handler.onrun == "function" ? args.handler.onrun : this.f;
    this.onstop = args.handler && typeof args.handler.onstop == "function" ? args.handler.onstop : this.f;

    this.resizeMode = false;
    this.element = null;
    this.direction = 0;
    this.saveLeft = 0;
    this.saveTop = 0;
    this.saveWidth = 0;
    this.saveHeight = 0;
    this.marginDistanceXR = 0;
    this.marginDistanceXL = 0;
    this.marginDistanceYT = 0;
    this.marginDistanceYB = 0;
    this.body = document.documentElement || document.body;

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

Resize.prototype = {
    enums: {
        eMin: 1,
        eTopLeft: 1,
        eTop: 2,
        eTopRight: 3,
        eRight: 4,
        eBottomRight: 5,
        eBottom: 6,
        eBottomLeft: 7,
        eLeft: 8,
        eMax: 8,
    },
    setMode: function (mode) {
        this.resizeMode = mode;
    },
    setDirectionAndCursor: function (x, y, element) {
        let rtn = true;

        if (this.resizeMode == false && element.getAttribute(this.attrname) == "true") {
            var distance = Number(element.getAttribute(this.distance));
            distance = distance == 0 ? 10 : distance;
            if (x <= distance && y <= distance) {
                this.direction = this.enums.eTopLeft;
                element.style.cursor = "nw-resize";
            } else if (x >= element.offsetWidth - distance && y <= distance) {
                this.direction = this.enums.eTopRight;
                element.style.cursor = "ne-resize";
            } else if (x >= element.offsetWidth - distance && y >= element.offsetHeight - distance) {
                this.direction = this.enums.eBottomRight;
                element.style.cursor = "se-resize";
            } else if (x <= distance && y >= element.offsetHeight - distance) {
                this.direction = this.enums.eBottomLeft;
                element.style.cursor = "sw-resize";
            } else if (y <= distance) {
                this.direction = this.enums.eTop;
                element.style.cursor = "n-resize";
            } else if (x >= element.offsetWidth - distance) {
                this.direction = this.enums.eRight;
                element.style.cursor = "e-resize";
            } else if (y >= element.offsetHeight - distance) {
                this.direction = this.enums.eBottom;
                element.style.cursor = "s-resize";
            } else if (x <= distance) {
                this.direction = this.enums.eLeft;
                element.style.cursor = "w-resize";
            } else {
                this.direction = 0;
                element.style.cursor = element.getAttribute(this.defaultCursor) ? element.getAttribute(this.defaultCursor) : "default";
                rtn = false;
            }
        } else {
            rtn = false;
        }

        return rtn;
    },
    run: function () {
        var that = this;

        this.addEvent(this.body, "onmousedown", function (event) {
            if (event.button == 0 || event.button == 1) {
                that.element = event.target || event.srcElement;

                var x = that.body.scrollLeft + event.clientX;
                var y = that.body.scrollTop + event.clientY;

                if (that.element.getAttribute(that.attrname) == "true") {
                    if (that.resizeMode == false) {
                        that.resizeMode = that.setDirectionAndCursor(x - that.element.offsetLeft, y - that.element.offsetTop, that.element);
                    }
                }

                if (that.resizeMode == true) {
                    if (that.element.getAttribute(that.attrelement) != null) {
                        var element = eval(that.element.getAttribute(that.attrelement));
                        if (element != null) {
                            if (that.element.getAttribute(that.minWidth) != null && element.getAttribute(that.minWidth) == null) {
                                element.setAttribute(that.minWidth, that.element.getAttribute(that.minWidth));
                            }
                            if (that.element.getAttribute(that.minHeight) != null && element.getAttribute(that.minHeight) == null) {
                                element.setAttribute(that.minHeight, that.element.getAttribute(that.minHeight));
                            }
                            that.element = element;
                        }
                    }

                    that.saveLeft = that.element.offsetLeft;
                    that.saveTop = that.element.offsetTop;
                    that.saveWidth = that.element.offsetWidth;
                    that.saveHeight = that.element.offsetHeight;

                    that.marginDistanceXR = that.saveLeft + that.saveWidth - x;
                    that.marginDistanceXL = x - that.saveLeft;
                    that.marginDistanceYT = y - that.saveTop;
                    that.marginDistanceYB = that.saveTop + that.saveHeight - y;
                }

                if (that.resizeMode == true) {
                    that.onstart.call(that.element, event);
                }
            }
        });

        this.addEvent(this.body, "onmousemove", function (event) {
            var element = event.target || event.srcElement;

            var x = that.body.scrollLeft + event.clientX;
            var y = that.body.scrollTop + event.clientY;

            that.setDirectionAndCursor(x - element.offsetLeft, y - element.offsetTop, element);

            if (that.resizeMode == true) {
                if (that.direction == that.enums.eTopLeft) {
                    x -= that.marginDistanceXL;
                    y -= that.marginDistanceYT;
                } else if (that.direction == that.enums.eTop) {
                    y -= that.marginDistanceYT;
                } else if (that.direction == that.enums.eTopRight) {
                    y -= that.marginDistanceYT;
                    x += that.marginDistanceXR;
                } else if (that.direction == that.enums.eRight) {
                    x += that.marginDistanceXR;
                } else if (that.direction == that.enums.eBottomRight) {
                    x += that.marginDistanceXR;
                    y += that.marginDistanceYB;
                } else if (that.direction == that.enums.eBottom) {
                    y += that.marginDistanceYB;
                } else if (that.direction == that.enums.eBottomLeft) {
                    y += that.marginDistanceYB;
                    x -= that.marginDistanceXL;
                } else if (that.direction == that.enums.eLeft) {
                    x -= that.marginDistanceXL;
                }

                var widthFromLeft = that.saveLeft - x + that.saveWidth;
                var widthFromRight = x - that.saveLeft;
                var heightFromUp = that.saveTop - y + that.saveHeight;
                var heightFromDown = y - that.saveTop;

                var minWidth = that.element.getAttribute(that.minWidth) ? Number(that.element.getAttribute(that.minWidth)) : 0;
                var minHeight = that.element.getAttribute(that.minHeight) ? Number(that.element.getAttribute(that.minHeight)) : 0;

                if (widthFromLeft < minWidth) {
                    x = that.saveLeft + (that.saveWidth - minWidth);
                    widthFromLeft = minWidth;
                }
                widthFromRight = widthFromRight < minWidth ? minWidth : widthFromRight;
                if (heightFromUp < minHeight) {
                    y = that.saveTop + (that.saveHeight - minHeight);
                    heightFromUp = minHeight;
                }
                heightFromDown = heightFromDown < minHeight ? minHeight : heightFromDown;

                switch (that.direction) {
                    case that.enums.eTopLeft:
                        that.element.style.left = x + "px";
                        that.element.style.top = y + "px";
                        that.element.style.width = widthFromLeft + "px";
                        that.element.style.height = heightFromUp + "px";
                        break;
                    case that.enums.eTop:
                        that.element.style.top = y + "px";
                        that.element.style.height = heightFromUp + "px";
                        break;
                    case that.enums.eTopRight:
                        that.element.style.top = y + "px";
                        that.element.style.width = widthFromRight + "px";
                        that.element.style.height = heightFromUp + "px";
                        break;
                    case that.enums.eRight:
                        that.element.style.width = widthFromRight + "px";
                        break;
                    case that.enums.eBottomRight:
                        that.element.style.width = widthFromRight + "px";
                        that.element.style.height = heightFromDown + "px";
                        break;
                    case that.enums.eBottom:
                        that.element.style.height = heightFromDown + "px";
                        break;
                    case that.enums.eBottomLeft:
                        that.element.style.left = x + "px";
                        that.element.style.width = widthFromLeft + "px";
                        that.element.style.height = heightFromDown + "px";
                        break;
                    case that.enums.eLeft:
                        that.element.style.left = x + "px";
                        that.element.style.width = widthFromLeft + "px";
                        break;
                    default:
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
            if (that.resizeMode == true) {
                that.onstop.call(that.element, event);
            }

            that.element = null;
            that.direction = 0;
            that.saveLeft = 0;
            that.saveTop = 0;
            that.saveWidth = 0;
            that.saveHeight = 0;
            that.marginDistanceXR = 0;
            that.marginDistanceXL = 0;
            that.marginDistanceYT = 0;
            that.marginDistanceYB = 0;
            that.resizeMode = false;
        });
    },
};
