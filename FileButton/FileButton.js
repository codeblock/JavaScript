/**
 * FileButton.js
 *
 * @author beanfondue@gmail.com
 */

function FileButton(imageswap, imagesrc, text)
{
    this.imageswap              = imageswap;
    this.imagesrc               = imagesrc;
    this.text                   = text;
    this.swapnode               = document.getElementsByTagName("INPUT");
    this.filebox                = document.createElement("DIV");
    this.filebox.style.width    = 0;
    this.filebox.style.height   = 0;
    this.filebox.style.margin   = 0;
    this.filebox.style.padding  = 0;
    this.filebox.style.position = "relative";
    this.filebox.style.overflow = "hidden";
    this.textfield              = document.createElement("INPUT");
    this.textfield.readOnly     = true;
}

FileButton.prototype =
{
    getBrowser: function (agent) {
        return (new RegExp(agent)).test(navigator.userAgent);
    },
    outerHtml: function (object) {
        var wrapper = this.filebox.cloneNode(false);
        wrapper.appendChild(object.cloneNode(true));
        var rt = wrapper.innerHTML;
        wrapper = null;
        
        return rt;
    },
    insertProperty: function (object, properties) {
        var object_parent = object.parentNode;
        var object_next = object.nextSibling;
        var wrapper = this.filebox.cloneNode(false);

        wrapper.appendChild(object);
        var property = "";
        for (var i in properties) {
            if (typeof properties[i] === "function") {
                properties[i] = '(' + String(properties[i]).replace(/\r?\n/g, "") + ')(event)';
            }
            property = ' ' + i + '="' + String(properties[i]).replace(/"/g, "'") + '"';
            //wrapper.innerHTML = wrapper.innerHTML.replace(/^([^>]+)/, '$1' + property);
            wrapper.innerHTML = wrapper.innerHTML.replace(/^([^\s]+)/, '$1' + property);
        }
        object_parent.insertBefore(wrapper.firstChild, object_next);
        wrapper = null;
    },
    swap: function (swapnode) {
        var that = this;
        var filebox = this.filebox.cloneNode(true);
        var image = new Image();
        var imageurl = swapnode.getAttribute(this.imagesrc);

        swapnode.parentNode.insertBefore(filebox, swapnode);
        filebox.appendChild(swapnode);
        filebox.appendChild(image);
        filebox.style.width  = swapnode.offsetWidth + "px";
        filebox.style.height = swapnode.offsetHeight + "px";
        image.onload = function () {
            this.parentNode.style.backgroundImage  = "url(" + this.src + ")";
            this.parentNode.style.backgroundRepeat = "no-repeat";
            this.parentNode.style.width            = this.width + "px";
            this.parentNode.style.height           = this.height + "px";
            this.previousSibling.style.filter      = "alpha(opacity=0)";
            this.previousSibling.style.opacity     = 0;
            this.previousSibling.style.fontSize    = (Math.max(this.width, this.height) + 30) + "px";
            this.previousSibling.style.position    = "absolute";
            this.previousSibling.style.height      = (this.height + 30) + "px";
            this.previousSibling.style.left        = (0 - this.previousSibling.offsetWidth) + "px";
            this.previousSibling.style.top         = "-10px";

            var filect           = this.parentNode.parentNode;
            var parentnode       = this.parentNode;
            parentnode.innerHTML = that.outerHtml(this.previousSibling);

            var file      = parentnode.firstChild;
            var fileright = file.offsetLeft + file.offsetWidth;
            var boxright  = parentnode.offsetLeft + parentnode.offsetWidth;
            if (fileright < boxright) { file.style.left = (file.offsetLeft + parentnode.offsetWidth + 30) + "px"; }

            file.setAttribute(that.imageswap, "swapped");

            var text = file.getAttribute(that.text);
            if (text !== null) {
                var textbox            = that.filebox.cloneNode(true);
                textbox.style.width    = this.width + "px";
                textbox.style.height   = this.height + "px";
                textbox.style.position = "absolute";
                textbox.style.overflow = "hidden";

                var tablefortextalign                  = document.createElement("TABLE");
                tablefortextalign.style.borderCollapse = "collapse";
                tablefortextalign.style.borderSpacing  = 0;
                tablefortextalign.style.width          = "100%";
                tablefortextalign.style.height         = "100%";
                tablefortextalign.insertRow(-1);
                tablefortextalign.rows[0].insertCell(-1);

                var tablefortextaligntd                 = tablefortextalign.rows[0].cells[0];
                tablefortextaligntd.style.textAlign     = "center";
                tablefortextaligntd.style.verticalAlign = "middle";
                tablefortextaligntd.innerHTML           = text;

                textbox.appendChild(tablefortextalign);
                parentnode.insertBefore(textbox, file);
                //push margin effect
                that.insertProperty(parentnode, {
                    'onmousedown': function (e) {
                        var pmeobj = (e.target || e.srcElement).previousSibling;
                        if (e.button == 0 || e.button == 1) {
                            if (pmeobj !== null) { pmeobj.style.margin = '1px 0 0 1px'; }
                        }
                    },
                    'onmouseup': function (e) {
                        var pmeobj = (e.target || e.srcElement).previousSibling;
                        if (pmeobj !== null) { pmeobj.style.margin = 0; }
                    },
                    'onmouseout': function (e) {
                        var pmeobj = (e.target || e.srcElement).previousSibling;
                        if (pmeobj !== null) { pmeobj.style.margin = 0; }
                    }
                });
                //push margin effect
                textbox.style.margin  = 0;
                textbox.style.padding = 0;
            }

            //input field effect
            var file_class = file.className;
            var textfield = that.textfield.cloneNode(true);
            textfield.style.width = Math.floor(this.width * 1.5) + "px";
            textfield.style.height = this.height + "px";
            textfield.style.fontSize = Math.floor(this.height / 1.6) + "px";
            if (file_class == "") {
                textfield.style.border = "1px solid silver";
            } else {
                textfield.className = file_class;
            }
            var filepanel = that.filebox.cloneNode(true);
            var filepanel_tf = that.filebox.cloneNode(true);
            filepanel_tf.style.width = textfield.style.width;
            filepanel_tf.style.height = textfield.style.height;
            if (that.getBrowser("MSIE") === true) { filepanel_tf.style.height = (this.height + 1) + "px"; }
            filepanel_tf.appendChild(textfield);
            that.insertProperty(textfield, {
                'onkeydown': function (e, text) {
                    var keycode = (e.which || e.keyCode);
                    var me = (e.target || e.srcElement);
                    var panel = me.parentNode.parentNode;
                    var file = (me.parentNode.nextSibling.firstChild.nextSibling === null) ? me.parentNode.nextSibling.firstChild : me.parentNode.nextSibling.firstChild.nextSibling;
                    if (keycode == 27) {
                        var file_parent_el = file.parentNode;
                        var file_next_el = file.nextSibling;
                        var form_temp = document.createElement('FORM');
                        form_temp.appendChild(file);
                        form_temp.reset();
                        file_parent_el.insertBefore(file, file_next_el);
                        me.value = '';
                        form_temp = null;
                    } else if (keycode == 107 || keycode == 187) {
                        var panel_clone = panel.cloneNode(true);
                        panel.parentNode.appendChild(panel_clone);
                        panel_clone.firstChild.firstChild.focus();
                    } else if (keycode == 109 || keycode == 189) {
                        panel.parentNode.removeChild(panel);
                    } else if (/Opera/.test(navigator.userAgent)) {
                        if (keycode == 43 || (e.shiftKey && keycode == 61)) {
                            var panel_clone = panel.cloneNode(true);
                            panel.parentNode.appendChild(panel_clone);
                            panel_clone.firstChild.firstChild.focus();
                        } else if (keycode == 45) {
                            panel.parentNode.removeChild(panel);
                        }
                    }
                }
            });
            filepanel.appendChild(filepanel_tf);
            filepanel.appendChild(filect.getElementsByTagName("DIV")[0]);
            filepanel.style.height = this.height + "px";
            if (that.getBrowser("MSIE") === true) { filepanel.style.height = (this.height + 1) + "px"; }
            filepanel.firstChild.nextSibling.style.left = (Math.floor(this.width * 1.5) + 2) + "px";
            filepanel.firstChild.nextSibling.style.top = (0 - this.height) + "px";
            filepanel.style.width = (Math.floor(this.width * 1.5) + this.width + 2) + "px";
            file = (text !== null) ? filepanel.firstChild.nextSibling.firstChild.nextSibling : filepanel.firstChild.nextSibling.firstChild;
            that.insertProperty(file, {
                'onchange': function (e) {
                    var me = (e.target || e.srcElement);
                    var tf = me.parentNode.parentNode.firstChild.firstChild;
                    tf.value = me.value;
                }
            });
            filect.appendChild(filepanel);
            if (document.compatMode != "BackCompat") {
                if (that.getBrowser("Gecko") === true) {
                    filepanel.firstChild.firstChild.style.width = (filepanel.firstChild.firstChild.offsetWidth - 4) + "px";
                } else {
                    filepanel.firstChild.firstChild.style.width = (filepanel.firstChild.firstChild.offsetWidth - 8) + "px";
                }
                filepanel.firstChild.firstChild.style.height = (filepanel.firstChild.firstChild.offsetHeight - 8) + "px";
            }
            //input field effect
        }
        image.src = swapnode.getAttribute(this.imagesrc);
    },
    write: function (source) {
        var spanid = "spanforFileButton" + new Date().getTime();
        document.write('<span id="' + spanid + '">' + source + '</span>');
        var span = document.getElementById(spanid);
        this.swap(span.firstChild);
        span.parentNode.insertBefore(span.firstChild, span);
        span = null;
    },
    run: function () {
        for (var i = 0; i < this.swapnode.length; i++) {
            var swapnode = this.swapnode[i];
            if (swapnode.type == "file" && swapnode.getAttribute(this.imageswap) == "true") {
                this.swap(swapnode);
            }
        }
    }
}
