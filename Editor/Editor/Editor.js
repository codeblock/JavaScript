/**
 * Editor.js
 *
 * @author beanfondue@gmail.com
 */

/*
var myEditor       = new Editor();
myEditor.sourceObj = document.getElementById("text-area-id");
myEditor.path      = "/Editor/";
myEditor.border    = "1px solid #3f4b28";
myEditor.foreColor = "#ffffff";
myEditor.backColor = "#000000";
myEditor.run();
*/

function getCaretManager(args) {
    var m_mode_string = false;
    var m_id_attr = "data-id";
    var m_id_prefix = "";
    var m_map = new Map();

    if (args != null) {
        if (args.m_mode_string != null) {
            m_mode_string = new Boolean(args.m_mode_string);
        }
        if (args.m_id_attr != null) {
            m_id_attr = String(args.m_id_attr);
        }
        if (args.m_id_prefix != null) {
            m_id_prefix = String(args.m_id_prefix);
        }
    }
    var m_id_attr_root = m_id_attr.concat("-root");

    var closure = {
        newid: function () {
            return m_id_prefix + String(Date.now());
        },
        get: function (el) {
            var rtn = { element: null, pos: 0 };

            if (el.selectionStart !== undefined || el.selectionStart == 0) {
                rtn.pos = el.selectionStart;
            } else if (document.selection !== undefined) {
                el.focus();
                var sel = document.selection.createRange();
                sel.moveStart("character", 0 - el.value.length);
                rtn.pos = sel.text.length;
            } else if (document.getSelection !== undefined) {
                // <iframe>.contentWindow.document.designMode = 'on' || <element>.contentEditable = true
                var doc = el.contentWindow?.document || document;
                var selection = doc.getSelection();
                if (selection.rangeCount > 0) {
                    rtn.pos = selection.baseOffset;
                    rtn.element = selection.baseNode;

                    if (m_mode_string == true) {
                        if (selection.baseNode.nodeType != 1) {
                            if (selection.baseNode.parentNode.getAttribute(m_id_attr) != null) {
                                selection.baseNode = selection.baseNode.parentNode;
                                rtn.element = selection.baseNode.parentNode;
                            } else {
                                var span = document.createElement("span");
                                span.innerHTML = selection.baseNode.data;
                                span.setAttribute(m_id_attr, this.newid());
                                selection.baseNode.parentNode.replaceChild(span, selection.baseNode);
                                selection.baseNode = span;
                                rtn.element = span;
                            }
                        }

                        el.setAttribute(m_id_attr_root, rtn.element.getAttribute(m_id_attr));
                    } else {
                        var k = el.getAttribute(m_id_attr_root);
                        if (k == null) {
                            var k = this.newid();
                            el.setAttribute(m_id_attr_root, k);
                        }
                        m_map.set(k, rtn.element);
                    }
                }
            }

            return rtn;
        },
        set: function (el, pos) {
            if (el.setSelectionRange !== undefined) {
                el.focus();
                el.setSelectionRange(pos, pos);
            } else if (el.createTextRange !== undefined) {
                var range = el.createTextRange();
                range.collapse(true);
                range.moveEnd("character", pos);
                range.moveStart("character", pos);
                range.select();
            } else if (document.getSelection !== undefined) {
                // <iframe>.contentWindow.document.designMode = 'on' || <element>.contentEditable = true
                var doc = el.contentWindow?.document || document;
                var el_is = el.contentWindow?.document?.body || el;

                // // ----------------- lost the saved Selection forcingly (selected element info initialization)
                // if (m_mode_string == true) {
                //     var lost_asis_selection_forcingly = el_is.innerHTML;
                //     el_is.innerHTML = lost_asis_selection_forcingly;
                // }
                // // ----------------- lost the saved Selection forcingly (selected element info initialization)

                var selection = doc.getSelection();
                if (selection.rangeCount > 0 && el.getAttribute(m_id_attr_root) != null) {
                    var k = el.getAttribute(m_id_attr_root);
                    var el_focused = null;

                    if (m_mode_string == true) {
                        el_focused = el_is.querySelector("[" + m_id_attr + '="' + k + '"]');
                        if (el_focused != null && el_focused.firstChild != null) {
                            var range = selection.getRangeAt(0);
                            pos = Math.min(Math.max(0, pos), el_focused.firstChild.nodeValue.length);
                            range.setStart(el_focused.firstChild, pos);
                            range.setEnd(el_focused.firstChild, pos);
                        }
                    } else {
                        el_focused = m_map.get(k);
                        if (el_focused != null) {
                            var range = selection.getRangeAt(0);
                            pos = Math.min(Math.max(0, pos), el_focused.length);
                            range.setStart(el_focused, pos);
                            range.setEnd(el_focused, pos);
                        }
                    }
                }
                el_is.focus();
            }
        },
    };

    return closure;
}
var caretManagerWithDataset = getCaretManager({ m_mode_string: true, m_id_attr: "data-caret", m_id_prefix: "data_caret_" });

function Editor() {
    this.border = this.border ? this.border : "0 none";
    this.foreColor = this.foreColor ? this.foreColor : "#000000";
    this.backColor = this.backColor ? this.backColor : "#ffffff";
    this.fontSize = "0.86em";
    this.sourceObj = null;
    this.editorObj = null;
    this.sourceCaret = 0;
    this.editorCaret = 0;
    this.formObj = null;
    this.basicStyle =
        this.basicStyle && this.basicStyle.head && this.basicStyle.foot
            ? this.basicStyle
            : {
                  head: '<html><head><style type="text/css">html, body { font-size: 1.0em; word-wrap: break-word; } body, p { margin: 0; }</style></head><body><p>',
                  foot: "</p></body></html>",
              };
    this.path = this.path ? this.path : "./Editor/";
    this.buttonCursor = this.buttonCursor ? this.buttonCursor : "pointer";

    this.listFont = ["Arial", "Segoe UI", "Times New Roman", "Tahoma", "Verdana", "Comic Sans MS", "Consolas", "Courier New"];
    this.listFontSize = [1, 2, 3, 4, 5, 6, 7];
    this.listPalette = [
        ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e"],
        ["#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50"],
        ["#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6"],
        ["#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"],
    ];
    this.editMode = true;
    this.IE = /(MSIE|Trident\/|Edge\/)/i.test(navigator.userAgent); // window.document.documentMode !== undefined
    this.NL = document.createElement("br");
}

Editor.prototype = {
    run: function () {
        this.initialize();
    },
    initialize: function () {
        var that = this;

        if (this.sourceObj !== null && this.sourceObj !== undefined && this.sourceObj.form !== null) {
            this.formObj = this.sourceObj.form;
        }

        this.editorBox = document.createElement("div");
        this.editorBox.style.display = "inline-block";
        this.editorBox.style.position = "relative";
        this.editorBox.style.border = this.border;
        this.editorBox.style.width = this.sourceObj.offsetWidth + "px";

        this.buttonBox = document.createElement("div");
        this.buttonBox.style.textAlign = "center";
        this.buttonBox.style.backgroundColor = this.backColor;
        this.buttonBox.style.borderBottom = this.border;

        this.editorObject = document.createElement("iframe");
        this.editorObject.frameBorder = "0";
        this.editorObject.style.width = this.sourceObj.offsetWidth + "px";
        this.editorObject.style.height = this.sourceObj.offsetHeight + "px";

        this.sourceObj.parentNode.insertBefore(this.editorBox, this.sourceObj);
        this.sourceObj.style.display = "none";

        this.editorBox.appendChild(this.buttonBox);
        this.editorBox.appendChild(this.editorObject);
        this.editorBox.appendChild(this.sourceObj);

        this.editorObj = this.editorObject.contentWindow;
        this.editorObj.document.open();
        this.editorObj.document.write(this.basicStyle.head + this.sourceObj.value + this.basicStyle.foot);
        this.editorObj.document.close();
        this.editorObj.document.designMode = "on";
        this.editorObj.document.fgColor = this.foreColor;
        this.editorObj.document.bgColor = this.backColor;

        // TODO: tobe
        // this.editorObj.document.execCommand("BackgroundImageCache", false, true);
        // this.editorObj.document.execCommand("2D-Position", false, true);
        // this.editorObj.document.execCommand("enableObjectResizing", false, true);

        if (window.attachEvent !== undefined) {
            this.editorObj.document.attachEvent("onclick", function () {
                that.hideButtonMenu();
            });
            this.editorObj.document.attachEvent("onmousedown", function (e) {
                that.selectObject(e);
            });
            this.editorObj.document.attachEvent("onkeydown", function (e) {
                return that.transKeyCode(e);
            });
            this.editorObj.document.attachEvent("onkeyup", function () {
                that.update();
            });
        } else {
            this.editorObj.document.addEventListener(
                "click",
                function () {
                    that.hideButtonMenu();
                },
                false
            );
            this.editorObj.document.addEventListener(
                "mousedown",
                function (e) {
                    that.selectObject(e);
                },
                false
            );
            this.editorObj.document.addEventListener(
                "keydown",
                function (e) {
                    return that.transKeyCode(e);
                },
                false
            );
            this.editorObj.document.addEventListener(
                "keyup",
                function () {
                    that.update();
                },
                false
            );
        }

        var makeButtonBoxItem = function (handlers) {
            var rtn = document.createElement("a");

            rtn.href = "";
            rtn.title = this.title;
            rtn.style.verticalAlign = "middle";
            rtn.style.cursor = that.buttonCursor;
            rtn.style.display = "inline-block";
            rtn.style.padding = "1.0em";
            rtn.style.backgroundImage = "url(" + this.icon + ")";
            rtn.style.backgroundPosition = "center center";
            rtn.style.backgroundRepeat = "no-repeat";
            that.addEvent(rtn, "click", function (e) {
                var e = e || window.event;
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            });
            for (var i in handlers) {
                that.addEvent(rtn, i, handlers[i]);
            }

            return rtn;
        };

        var toolbox = {
            styledelete: {
                gui: true,
                button: null,
                menu: null,
                title: "style delete",
                icon: that.path + "toolbox/style_delete.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "removeFormat", me.menu);
                        },
                    });
                },
            },
            fontname: {
                gui: true,
                button: null,
                menu: null,
                title: "font name",
                icon: that.path + "toolbox/text_allcaps.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "", me.menu);
                        },
                    });

                    this.menu = document.createElement("div");
                    this.menu.style.border = that.border;
                    this.menu.style.backgroundColor = that.backColor;
                    this.menu.style.position = "absolute";
                    this.menu.style.display = "none";
                    this.menu.style.padding = "0.2em";
                    this.menu.style.fontSize = this.fontSize;
                    for (var i in that.listFont) {
                        var item = document.createElement("a");
                        var text = that.listFont[i];
                        item.href = "javascript:;";
                        item.style.color = that.foreColor;
                        item.style.textDecoration = "none";
                        item.style.cursor = that.buttonCursor;
                        item.style.display = "block";
                        item.style.fontFamily = text;
                        item.appendChild(document.createTextNode(text));
                        item.onclick = function () {
                            that.action(me.button, "fontName", this.style.fontFamily);
                            me.menu.style.display = "none";
                        };
                        this.menu.appendChild(item);
                    }
                },
            },
            fontsize: {
                gui: true,
                button: null,
                menu: null,
                title: "font size",
                icon: that.path + "toolbox/text_smallcaps.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "", me.menu);
                        },
                    });

                    this.menu = document.createElement("div");
                    this.menu.style.border = that.border;
                    this.menu.style.backgroundColor = that.backColor;
                    this.menu.style.position = "absolute";
                    this.menu.style.display = "none";
                    this.menu.style.padding = "0.2em";
                    this.menu.style.fontSize = this.fontSize;
                    for (var i in that.listFontSize) {
                        var item = document.createElement("a");
                        var font = document.createElement("font");
                        var text = that.listFontSize[i] + " (This is a text)";
                        item.href = "javascript:;";
                        item.style.color = that.foreColor;
                        item.style.textDecoration = "none";
                        item.style.cursor = that.buttonCursor;
                        item.style.display = "block";
                        item.style.textAlign = "left";
                        font.size = that.listFontSize[i];
                        font.style.color = that.foreColor;
                        font.appendChild(document.createTextNode(text));
                        item.appendChild(font);
                        item.onclick = function () {
                            that.action(me.button, "fontSize", this.firstChild.size);
                            me.menu.style.display = "none";
                        };
                        this.menu.appendChild(item);
                    }
                },
            },
            forecolor: {
                gui: true,
                button: null,
                menu: null,
                title: "fore color",
                icon: that.path + "toolbox/palette.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "", me.menu);
                        },
                    });

                    this.menu = document.createElement("div");
                    this.menu.style.border = that.border;
                    this.menu.style.backgroundColor = that.backColor;
                    this.menu.style.position = "absolute";
                    this.menu.style.display = "none";

                    var fn = function () {
                        that.action(me.button, "foreColor", this.style.backgroundColor);
                        me.menu.style.display = "none";
                    };
                    var palette = that.makePalette(fn);
                    this.menu.appendChild(palette);
                },
            },
            backcolor: {
                gui: true,
                button: null,
                menu: null,
                title: "back color",
                icon: that.path + "toolbox/color_swatch.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "", me.menu);
                        },
                    });

                    this.menu = document.createElement("div");
                    this.menu.style.border = that.border;
                    this.menu.style.backgroundColor = this.backColor;
                    this.menu.style.position = "absolute";
                    this.menu.style.display = "none";

                    var fn = function () {
                        if (that.IE == true) {
                            that.action(me.button, "backColor", this.style.backgroundColor);
                        } else {
                            that.action(me.button, "hiliteColor", this.style.backgroundColor);
                        }
                        me.menu.style.display = "none";
                    };
                    var palette = that.makePalette(fn);
                    this.menu.appendChild(palette);
                },
            },
            bold: {
                gui: true,
                button: null,
                menu: null,
                title: "bold",
                icon: that.path + "toolbox/text_bold.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "bold", me.menu);
                        },
                    });
                },
            },
            italic: {
                gui: true,
                button: null,
                menu: null,
                title: "italic",
                icon: that.path + "toolbox/text_italic.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "italic", me.menu);
                        },
                    });
                },
            },
            underline: {
                gui: true,
                button: null,
                menu: null,
                title: "underline",
                icon: that.path + "toolbox/text_underline.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "underline", me.menu);
                        },
                    });
                },
            },
            strike: {
                gui: true,
                button: null,
                menu: null,
                title: "strike",
                icon: that.path + "toolbox/text_strikethrough.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "strikeThrough", me.menu);
                        },
                    });
                },
            },
            alignleft: {
                gui: true,
                button: null,
                menu: null,
                title: "align left",
                icon: that.path + "toolbox/text_align_left.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "justifyLeft", me.menu);
                        },
                    });
                },
            },
            aligncenter: {
                gui: true,
                button: null,
                menu: null,
                title: "align center",
                icon: that.path + "toolbox/text_align_center.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "justifyCenter", me.menu);
                        },
                    });
                },
            },
            alignright: {
                gui: true,
                button: null,
                menu: null,
                title: "align right",
                icon: that.path + "toolbox/text_align_right.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "justifyRight", me.menu);
                        },
                    });
                },
            },
            link: {
                gui: true,
                button: null,
                menu: null,
                title: "insert link",
                icon: that.path + "toolbox/link.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "", me.menu);
                        },
                    });

                    this.menu = document.createElement("div");
                    this.menu.style.border = that.border;
                    this.menu.style.color = that.foreColor;
                    this.menu.style.backgroundColor = that.backColor;
                    this.menu.style.position = "absolute";
                    this.menu.style.display = "none";
                    this.menu.style.fontSize = this.fontSize;
                    this.menu.style.padding = "0.2em";

                    var text = document.createElement("input");
                    var submit = document.createElement("input");
                    text.type = "TEXT";
                    text.style.border = that.border;
                    text.style.color = that.foreColor;
                    text.style.backgroundColor = that.backColor;
                    submit.type = "BUTTON";
                    submit.value = "    OK    ";
                    submit.style.border = that.border;
                    submit.style.color = that.foreColor;
                    submit.style.backgroundColor = that.backColor;
                    submit.onclick = function () {
                        if (me.menu.firstChild.value != "") {
                            var nodevalue = that.rangeEmpty == false ? that.range : me.menu.firstChild.value;
                            var node = that.createNode("a", nodevalue);
                            node.href = me.menu.firstChild.value;
                            node.target = "_blank";
                            that.setContents(node);
                        }

                        me.menu.firstChild.value = "";
                        me.menu.style.display = "none";
                    };
                    this.menu.appendChild(text);
                    this.menu.appendChild(that.NL.cloneNode(false));
                    this.menu.appendChild(document.createTextNode("input link address"));
                    this.menu.appendChild(that.NL.cloneNode(false));
                    this.menu.appendChild(submit);
                },
            },
            image: {
                gui: true,
                button: null,
                menu: null,
                title: "insert image",
                icon: that.path + "toolbox/picture.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "", me.menu);
                        },
                    });

                    this.menu = document.createElement("div");
                    this.menu.style.border = that.border;
                    this.menu.style.color = that.foreColor;
                    this.menu.style.backgroundColor = that.backColor;
                    this.menu.style.position = "absolute";
                    this.menu.style.display = "none";
                    this.menu.style.fontSize = this.fontSize;
                    this.menu.style.padding = "0.2em";

                    var text = document.createElement("input");
                    text.type = "TEXT";
                    text.style.border = that.border;
                    text.style.color = that.foreColor;
                    text.style.backgroundColor = that.backColor;

                    var submit = document.createElement("input");
                    submit.type = "BUTTON";
                    submit.value = "    OK    ";
                    submit.style.border = that.border;
                    submit.style.color = that.foreColor;
                    submit.style.backgroundColor = that.backColor;
                    submit.onclick = function () {
                        if (me.menu.firstChild.value != "") {
                            var node = that.createNode("img");
                            node.src = me.menu.firstChild.value;
                            that.setContents(node);
                        }

                        me.menu.firstChild.value = "";
                        me.menu.style.display = "none";
                    };
                    this.menu.appendChild(text);
                    this.menu.appendChild(that.NL.cloneNode(false));
                    this.menu.appendChild(document.createTextNode("input image address"));
                    this.menu.appendChild(that.NL.cloneNode(false));
                    this.menu.appendChild(submit);
                },
            },
            media: {
                gui: true,
                button: null,
                menu: null,
                title: "insert media",
                icon: that.path + "toolbox/television.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "", me.menu);
                        },
                    });

                    this.menu = document.createElement("div");
                    this.menu.style.border = that.border;
                    this.menu.style.color = that.foreColor;
                    this.menu.style.backgroundColor = that.backColor;
                    this.menu.style.position = "absolute";
                    this.menu.style.display = "none";
                    this.menu.style.fontSize = this.fontSize;
                    this.menu.style.padding = "0.2em";

                    var text = document.createElement("input");
                    text.type = "TEXT";
                    text.style.border = that.border;
                    text.style.color = that.foreColor;
                    text.style.backgroundColor = that.backColor;

                    var submit = document.createElement("input");
                    submit.type = "BUTTON";
                    submit.value = "    OK    ";
                    submit.style.border = that.border;
                    submit.style.color = that.foreColor;
                    submit.style.backgroundColor = that.backColor;
                    submit.onclick = function () {
                        if (me.menu.firstChild.value != "") {
                            var src = me.menu.firstChild.value;
                            var node = that.createNode("object");
                            node.wmode = "transparent";
                            node.quality = "high";
                            node.allowScriptAccess = "always";
                            node.allowFullScreen = true;
                            if (/\.swf$/i.test(src)) {
                                node.type = "application/x-shockwave-flash";
                                node.pluginspage = "http://www.macromedia.com/go/getflashplayer";
                            } else {
                                node.type = "text/html";
                                node.data = src;
                            }
                            node.src = src;
                            that.setContents(node);
                        }

                        me.menu.firstChild.value = "";
                        me.menu.style.display = "none";
                    };
                    this.menu.appendChild(text);
                    this.menu.appendChild(that.NL.cloneNode(false));
                    this.menu.appendChild(document.createTextNode("input media address"));
                    this.menu.appendChild(that.NL.cloneNode(false));
                    this.menu.appendChild(submit);
                },
            },
            emoticon: {
                gui: true,
                button: null,
                menu: null,
                title: "emoticon",
                icon: that.path + "toolbox/emoticon_smile.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.action(me.button, "", me.menu);
                        },
                    });

                    this.menu = document.createElement("div");
                    this.menu.style.border = that.border;
                    this.menu.style.color = that.foreColor;
                    this.menu.style.backgroundColor = that.backColor;
                    this.menu.style.position = "absolute";
                    this.menu.style.display = "none";
                    this.menu.style.fontSize = this.fontSize;
                    this.menu.style.padding = "0.2em";
                    this.menu.style.width = "200px";
                    this.menu.style.height = "200px";
                    this.menu.style.overflow = "auto";
                    for (var i = 1; i <= 70; i++) {
                        var item = new Image();
                        item.src = that.path + "emoticon/" + i + ".png";
                        item.width = "25";
                        item.height = "25";
                        item.style.cursor = that.buttonCursor;
                        item.onclick = function () {
                            var node = that.createNode("img");
                            node.src = this.getAttribute("src"); // for relative path
                            node.width = this.width;
                            node.height = this.height;
                            that.setContents(node);
                            me.menu.style.display = "none";
                        };
                        this.menu.appendChild(item);
                    }
                },
            },
            /*
             * TODO: tobe
             *
            layer:       {gui: true,  button: null, menu: null, title: "layer",        icon: that.path + "toolbox/layers.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {"click": function () { that.createAbsolutePosition(); }});
                }
            },
            */
            source: {
                gui: false,
                button: null,
                menu: null,
                title: "source code",
                icon: that.path + "toolbox/tag.png",
                create: function () {
                    var me = this;

                    this.button = makeButtonBoxItem.call(this, {
                        click: function () {
                            that.switchObject();
                        },
                    });
                },
            },
        };

        if (this.toolbox === undefined) {
            this.toolbox = [];
        }
        if (this.toolbox.length == 0) {
            for (var i in toolbox) {
                this.toolbox.push(i);
            }
        }

        for (var i in this.toolbox) {
            var tool = toolbox[this.toolbox[i]];
            if (tool === undefined) {
                this.toolbox[i] = null;
            } else {
                tool.create();
                this.buttonBox.appendChild(tool.button);
                if (tool.menu !== null) {
                    this.buttonBox.appendChild(tool.menu);
                }
                this.toolbox[i] = tool;
            }
        }

        if (window.attachEvent !== undefined) {
            if (this.formObj !== null) {
                this.formObj.attachEvent("onsubmit", function () {
                    that.finalize();
                });
            }
            this.editorObject.attachEvent("onload", function () {
                that.editorObj.document.body.onunload = function () {
                    that.finalize();
                };
            });
        } else {
            if (this.formObj !== null) {
                this.formObj.addEventListener(
                    "submit",
                    function () {
                        that.finalize();
                    },
                    false
                );
            }
            this.editorObject.addEventListener(
                "load",
                function () {
                    that.editorObj.document.body.onunload = function () {
                        that.finalize();
                    };
                },
                false
            );
        }
    },
    finalize: function () {
        this.sourceObj.value = this.sourceObj.value.replace(/<\/?script[^>]*/gi, "<!script");
        this.sourceObj.value = this.sourceObj.value.replace(/onclick=/gi, "0nclick=");
        this.sourceObj.value = this.sourceObj.value.replace(/ondblclick=/gi, "0ndblclick=");
        this.sourceObj.value = this.sourceObj.value.replace(/onerror=/gi, "0nerror=");
        this.sourceObj.value = this.sourceObj.value.replace(/onmouseover=/gi, "0nmouseover=");
        this.sourceObj.value = this.sourceObj.value.replace(/onmousedown=/gi, "0nmousedown=");
        this.sourceObj.value = this.sourceObj.value.replace(/onmousemove=/gi, "0nmousemove=");
        this.sourceObj.value = this.sourceObj.value.replace(/onkeydown=/gi, "0nkeydown=");
        this.sourceObj.value = this.sourceObj.value.replace(/onkeypress=/gi, "0nkeypress=");
        this.sourceObj.value = this.sourceObj.value.replace(/onkeyup=/gi, "0nkeyup=");
        this.sourceObj.value = this.sourceObj.value.replace(/onfocus=/gi, "0nfocus=");
        this.sourceObj.value = this.sourceObj.value.replace(/onblur=/gi, "0nblur=");
        this.sourceObj.value = this.sourceObj.value.replace(/onload=/gi, "0nload=");
        this.sourceObj.value = this.sourceObj.value.replace(/onunload=/gi, "0nunload=");
    },
    update: function () {
        if (this.editMode == true) {
            this.sourceObj.value = this.editorObj.document.body.innerHTML;
        } else {
            this.editorObj.document.body.innerHTML = this.sourceObj.value;
        }
        if (this.IE == true) {
            var killMarginP = this.editorObj.document.getElementsByTagName("p");
            for (var i = 0; i < killMarginP.length; i++) {
                killMarginP[i].style.margin = "0";
            }
            var changeTargetA = this.editorObj.document.getElementsByTagName("a");
            for (var i = 0; i < changeTargetA.length; i++) {
                changeTargetA[i].target = "_blank";
            }
            this.sourceObj.value = this.editorObj.document.body.innerHTML;
        }
    },
    loadCaret: function (el, pos) {
        let rtn = 0;

        if (pos != null && pos != "" && isNaN(pos) == false) {
            // set
            pos = Number(pos);
            caretManagerWithDataset.set(el, pos);
            rtn = pos;
        } else {
            // get
            var caretinfo = caretManagerWithDataset.get(el);
            rtn = caretinfo.pos;
        }

        return rtn;
    },
    setSelection: function () {
        this.selection = null;
        this.range = null;
        this.rangeEmpty = null;

        if (this.editorObj.getSelection) {
            // https://developer.mozilla.org/en-US/docs/Web/API/Selection
            // https://developer.mozilla.org/en-US/docs/Web/API/Range
            this.selection = this.editorObj.getSelection();
            if (this.selection.rangeCount > 0) {
                this.range = this.selection.getRangeAt(0);
                this.rangeEmpty = this.range.collapsed;
            }
        } else {
            // https://msdn.microsoft.com/en-us/library/ms535869(v=vs.85).aspx
            // https://msdn.microsoft.com/en-us/library/ms535872(v=vs.85).aspx
            this.selection = this.editorObj.document.selection;
            this.range = this.selection.createRange();
            this.rangeEmpty = this.range.htmlText == "";
        }

        this.editorObj.document.body.focus();
    },
    setContents: function (node) {
        if (this.editorObj.getSelection) {
            if (this.range.collapsed == false) {
                this.range.deleteContents();
            }

            this.range.insertNode(node);

            if (this.selection.isCollapsed == false) {
                this.selection.collapseToEnd();
            }

            this.range.collapse(false);
            this.selection.removeAllRanges();
            this.selection.addRange(this.range);

            this.range.detach();
            this.selection.deleteFromDocument();
        } else {
            this.range.pasteHTML(node.outerHTML);
            if (node.parentNode != null) {
                node.parentNode.removeChild(node);
            }
        }

        this.update();
        this.editorObj.document.body.focus();
    },
    createNode: function (holder, source) {
        if (holder === undefined || holder === null || holder == "") {
            holder = "span";
        }

        // WrongDocumentError in IE when using iframe
        // different with created scope(current window) and pasted scope(editor window)
        // because : document.createElement(...) to this.editorObj.document.createElement(...)
        var rtn = this.editorObj.document.createElement(holder);

        if (source === this.range) {
            if (this.editorObj.getSelection) {
                rtn.appendChild(source.extractContents());
            } else {
                rtn.innerHTML = source.htmlText;
            }
        } else if (typeof source == "string") {
            rtn.innerHTML = source;
        }

        return rtn;
    },
    transKeyCode: function (e) {
        var rtn = true;

        var e = e || window.event;

        this.setSelection();

        switch (e.which || e.keyCode) {
            // tab to 4 spaces
            case 9:
                var tab_to_indent = "&nbsp;&nbsp;&nbsp;&nbsp;";
                var node = this.createNode("", tab_to_indent);
                this.setContents(node);

                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }

                break;
        }

        return rtn;
    },
    selectObject: function (e) {
        this.hideButtonMenu();
        var e = e || window.event;
        if (e.button == 0 || e.button == 1) {
            this.targetObject = e.target || e.srcElement;
            //console.log(this.targetObject.nodeName);
        }
        this.update();
    },
    // TODO: tobe
    createAbsolutePosition: function () {
        if (!this.targetObject || this.targetObject.nodeName == "HTML" || this.targetObject.nodeName == "BODY") {
            return;
        }
        this.targetObject.style.position = "absolute";
        this.update();
    },
    actionMenu: function (buttonObj, property) {
        this.setSelection();
        this.hideButtonMenu();
        property.style.left = buttonObj.offsetLeft + "px";
        property.style.top = buttonObj.offsetTop + buttonObj.offsetHeight + "px";
        property.style.display = property.style.display == "inline-block" ? "none" : "inline-block";
    },
    action: function (buttonObj, method, property) {
        if (this.editMode == false) {
            return;
        }
        this.editorObj.document.body.focus();
        if (method == "" && property) {
            this.actionMenu(buttonObj, property);
            return;
        }
        this.editorObj.document.execCommand(method, false, property);
        this.editorObj.document.body.focus();
    },
    hideButtonMenu: function () {
        for (var i in this.toolbox) {
            var tool = this.toolbox[i];
            if (tool !== null) {
                if (tool.menu !== null) {
                    tool.menu.style.display = "none";
                }
            }
        }
    },
    makePalette: function (fn) {
        var table = document.createElement("table");
        var tbody = document.createElement("tbody");
        var tmpl_tr = document.createElement("tr");
        var tmpl_td = document.createElement("td");
        var tmpl_a = document.createElement("a");

        table.style.borderCollapse = "collapse";
        table.style.borderSpacing = 0;

        tmpl_td.style.padding = 0;

        tmpl_a.href = "javascript:;";
        tmpl_a.style.display = "block";
        tmpl_a.style.width = "40px";
        tmpl_a.style.height = "20px";
        tmpl_a.style.cursor = this.buttonCursor;

        for (var i in this.listPalette) {
            var tr = tmpl_tr.cloneNode(false);
            for (var j in this.listPalette[i]) {
                var td = tmpl_td.cloneNode(false);
                var a = tmpl_a.cloneNode(false);
                a.style.backgroundColor = this.listPalette[i][j];
                a.onclick = function () {
                    return fn.call(this);
                };
                td.appendChild(a);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        return table;
    },
    switchObject: function () {
        if (this.editMode == true) {
            // this.setSelection();
            this.editorCaret = this.loadCaret(this.editorObject); // save editor caret
            this.update();
            this.editMode = false;

            for (var i in this.toolbox) {
                var tool = this.toolbox[i];
                if (tool !== null && tool.button != null && tool.gui == true) {
                    tool.button.style.filter = "alpha(opacity = 20)";
                    tool.button.style.opacity = "0.2";
                }
            }

            this.editorObject.style.display = "none";
            this.sourceObj.style.display = "inline-block";
            this.hideButtonMenu();

            this.loadCaret(this.sourceObj, this.sourceCaret); // load source caret
            // this.sourceObj.focus();
        } else {
            this.sourceCaret = this.loadCaret(this.sourceObj); // save source caret
            this.update();
            this.editMode = true;

            for (var i in this.toolbox) {
                var tool = this.toolbox[i];
                if (tool !== null && tool.button != null && tool.gui == true) {
                    tool.button.style.filter = "alpha(opacity = 100)";
                    tool.button.style.opacity = "1.0";
                }
            }

            this.sourceObj.style.display = "none";
            this.editorObject.style.display = "inline-block";

            this.loadCaret(this.editorObject, this.editorCaret); // load editor caret
            // this.editorObj.document.body.focus();
        }
    },
    addEvent: function (object, events, func) {
        if (window.attachEvent !== undefined) {
            object.attachEvent("on" + events, func);
        } else {
            object.addEventListener(events, func, false);
        }
    },
};
