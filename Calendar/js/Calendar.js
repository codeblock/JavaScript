/**
 * Calendar.js
 *
 * @author beanfondue@gmail.com
 */

//new Calendar({
//    css:       "./css/Calendar.css",
//    classname: "calendar",
//    format:    "dd/mm/yy",
//    week:      [" Sun ", " Mon ", " Tue ", " Wed ", " Thu ", " Fri ", " Sat "],
//    month:     ["", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
//});

function Calendar(args)
{
    this.element = null;
    this.panel = null;
    this.stylesheet = null;
    this.classname = (args && args.classname) ? args.classname : "calendar";
    this.format = (args && args.format) ? args.format : "YYYY-MM-DD";
    this.week = (args && args.week && args.week.constructor == Array && args.week.length == 7) ? args.week : ["S", "M", "T", "W", "T", "F", "S"];
    this.month = (args && args.month && args.month.constructor == Array && args.month.length == 13) ? args.month : ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (args && args.css) { this.loadcss(args.css); }
    this.init();
    this.build();
}

Calendar.prototype =
{
    addEvent: function (object, handler, action) {
        if (window.addEventListener) {
            return object.addEventListener(handler.replace(/^on/i, ""), action, false);
        } else if (window.attachEvent) {
            return object.attachEvent(handler, action);
        }
    },
    getLastDate: function (year, month) {
        var lastdate = 0;
        if (Number(month) == 1 || Number(month) == 3 || Number(month) == 5 || Number(month) == 7 || Number(month) == 8 || Number(month) == 10 || Number(month) == 12) {
            lastdate = 31;
        } else if (Number(month) == 2) {
            if (Number(year) % 4 == 0) {
                if (Number(year) % 100 == 0 && Number(year) % 400 != 0) {
                    lastdate = 29;
                } else {
                    lastdate = 28;
                }
            } else {
                lastdate = 28;
            }
        } else {
            lastdate = 30;
        }
        return lastdate;
    },
    parseFormat: function (y, m, d) {
        if (/^[ymd]+$/i.test(this.format)) { this.format = "YYYY-MM-DD"; }
        var formats = {
            YYYY: function () { return y; },
            YY: function () { return String(y).substr(2, 2); },
            MM: function () { if (m < 10) { m = "0" + m; } return m; },
            M: function () { return m; },
            DD: function () { if (d < 10) { d = "0" + d; } return d; },
            D: function () { return d; },
            yyyy: function () { return y; },
            yy: function () { return String(y).substr(2, 2); },
            mm: function () { if (m < 10) { m = "0" + m; } return m; },
            m: function () { return m; },
            dd: function () { if (d < 10) { d = "0" + d; } return d; },
            d: function () { return d; }
        };
        var format_count = 0;
        return this.format.replace(/[ymd]+/ig, function () {
            try {
                return formats[arguments[0]]();
            } catch (e) {
                return [formats.YYYY, formats.MM, formats.DD][format_count]();
            }
            format_count++;
        });
    },
    init: function () {
        var that = this;
        this.panel = document.createElement("div");
        this.panel.className = this.classname;
        this.panel.style.position = "absolute";
        this.panel.style.display = "none";
        document.body.appendChild(this.panel);
        if (this.constructor.addOnclick !== true) { //once regist onclick event
            this.addEvent(document, "onclick", function (event) {
                var el = event.target || event.srcElement;
                if (el != that.element && el.getAttribute("nohide") != "true") { that.hide(); }
            });
            this.constructor.addOnclick = true;
        }
    },
    loadcss: function (css) {
        this.stylesheet = document.createElement("link");
        this.stylesheet.type = "text/css";
        this.stylesheet.rel = "stylesheet";
        this.stylesheet.href = css;
        var head = document.getElementsByTagName("head")[0];
        var link = head.getElementsByTagName("link");
        for (var i = 0, i_len = link.length; i < i_len; i++) { if (this.stylesheet.href == link[i].href) { break; } }
        if (i == i_len) { head.appendChild(this.stylesheet); }
    },
    build: function (y, m, d) {
        y = Number(y);
        m = Number(m);
        d = Number(d);
        if (this.panel.firstChild != null) { this.panel.removeChild(this.panel.firstChild); }
        var that = this;
        var myDate = new Date();
        if (y) { myDate.setFullYear(y); }
        if (m) { myDate.setMonth(m - 1); }
        if (d) { myDate.setDate(d); }
        var year = myDate.getFullYear();
        var month = myDate.getMonth() + 1;
        var date = myDate.getDate();
        var lastdate = this.getLastDate(year, month);
        var arr_full = [];
        var arr_white_start = new Date(year, month - 1, 1).getDay();
        var arr_white_end = 0;

        var div = document.createElement("div");
        var table = document.createElement("table");

        var bdrs = table.insertRow(-1);
        var bd_tl = bdrs.insertCell(-1);
        var bd_tc = bdrs.insertCell(-1);
        var bd_tr = bdrs.insertCell(-1);
        bd_tl.className = this.classname + "BorderTopLeft";
        bd_tc.className = this.classname + "BorderTopCenter";
        bd_tr.className = this.classname + "BorderTopRight";
        bd_tc.colSpan = 7;

        var tm = table.insertRow(-1);
        var bd_ml    = tm.insertCell(-1);
        var tm_fprev = tm.insertCell(-1);
        var tm_prev  = tm.insertCell(-1);
        var tm_title = tm.insertCell(-1);
        var tm_next  = tm.insertCell(-1);
        var tm_fnext = tm.insertCell(-1);
        var bd_mr    = tm.insertCell(-1);

        bd_ml.className = this.classname + "BorderMiddleLeft";
        bd_mr.className = this.classname + "BorderMiddleRight";

        tm_fprev.className = this.classname + "NavFastPrev";
        tm_prev.className  = this.classname + "NavPrev";
        tm_title.className = this.classname + "NavCenter";
        tm_next.className  = this.classname + "NavNext";
        tm_fnext.className = this.classname + "NavFastNext";

        tm_title.colSpan = 3;
        tm_title.innerHTML = this.month[month] + " " + year;

        tm_fprev.setAttribute("nohide", "true");
        tm_prev.setAttribute("nohide", "true");
        tm_next.setAttribute("nohide", "true");
        tm_fnext.setAttribute("nohide", "true");

        tm_fprev.onclick = function () {
            that.build(year - 1, month, date);
        }
        tm_prev.onclick = function () {
            month--;
            if (month == 0) {
                year--;
                month = 12;
            }
            that.build(year, month, date);
        }
        tm_next.onclick = function () {
            that.build(year, month + 1, date);
        }
        tm_fnext.onclick = function () {
            that.build(year + 1, month, date);
        }

        //build calendar header
        var th = table.insertRow(-1);
        var bd_ml = th.insertCell(-1);
        for (var i = 0; i < this.week.length; i++) {
            var td = th.insertCell(-1);
            td.className = this.classname + "Week";
            td.innerHTML = this.week[i].replace(/ /g, "&nbsp;");
        }
        var bd_mr = th.insertCell(-1);
        bd_ml.className = this.classname + "BorderMiddleLeft";
        bd_mr.className = this.classname + "BorderMiddleRight";
        //build calendar header

        //build cube date
        for (var i = 1; i <= lastdate; i++) { arr_full[i - 1] = i; }
        for (var i = 0; i < arr_white_start; i++) { arr_full.unshift(""); }
        arr_white_end = Math.ceil(arr_full.length / 7) * 7 - arr_full.length;
        for (var i = 0; i < arr_white_end; i++) { arr_full.push(""); }
        //build cube date

        //build calendar body
        var tr = table.insertRow(-1);
        for (var i = 0, i_len = arr_full.length; i < i_len; i++) {
            if (i == 0) {
                var bd_ml = tr.insertCell(-1);
                bd_ml.className = this.classname + "BorderMiddleLeft";
            }
            if (i > 0 && (i % 7 == 0)) {
                tr = table.insertRow(-1);
                var bd_ml = tr.insertCell(-1);
                bd_ml.className = this.classname + "BorderMiddleLeft";
            }
            var td = tr.insertCell(-1);
            var td_div = div.cloneNode(true);
            if (date == arr_full[i]) {
                td_div.className = this.classname + "DateNow";
            } else {
                td_div.className = this.classname + "Date";
            }
            td_div.innerHTML = arr_full[i];
            if (arr_full[i] != "") {
                this.addEvent(td_div, "onclick", function (event) {
                    var el = event.target || event.srcElement;
                    try {
                        that.element.value = that.parseFormat(year, month, Number(el.innerHTML));
                    } catch (e) {}
                });
            } else {
                td_div.style.visibility = "hidden";
            }
            td.appendChild(td_div);

            if ((i + 1) % 7 == 0) {
                var bd_mr = tr.insertCell(-1);
                bd_mr.className = this.classname + "BorderMiddleRight";
            }
        }
        //build calendar body

        //build calendar foot
        var tf = table.insertRow(-1);

        var bd_ml = tf.insertCell(-1);
        bd_ml.className = this.classname + "BorderMiddleLeft";

        var td = tf.insertCell(-1);
        td.colSpan = 7;
        td.className = this.classname + "TodayPanel";
        var div_today = div.cloneNode(true);
        div_today.setAttribute("nohide", "true");
        div_today.className = this.classname + "Today";
        div_today.onclick = function () {
            var today = new Date();
            that.build(today.getFullYear(), today.getMonth() + 1, today.getDate());
        }
        div_today.innerHTML = "TODAY";
        td.appendChild(div_today);

        var bd_mr = tf.insertCell(-1);
        bd_mr.className = this.classname + "BorderMiddleRight";
        //build calendar foot

        var bdrs = table.insertRow(-1);
        var bd_bl = bdrs.insertCell(-1);
        var bd_bc = bdrs.insertCell(-1);
        var bd_br = bdrs.insertCell(-1);
        bd_bl.className = this.classname + "BorderBottomLeft";
        bd_bc.className = this.classname + "BorderBottomCenter";
        bd_br.className = this.classname + "BorderBottomRight";
        bd_bc.colSpan = 7;

        this.panel.appendChild(table);
    },
    show: function (el) {
        this.element = el;
        if (this.element.value) {
            var myDate = new Date();
            var dates = [];
            var formats = [];
            var y = 0, m = 0, d = 0;
            this.element.value.replace(/[0-9]+/ig, function () { dates.push(arguments[0]); });
            this.format.replace(/[ymd]+/ig, function () { formats.push(arguments[0]); });
            for (var i = 0, i_len = formats.length; i < i_len; i++) {
                if (/y+/i.test(formats[i])) {
                    y = dates[i];
                    if (y.length < 4) {
                        Y = String(myDate.getFullYear());
                        y = Y.substr(0, Y.length - y.length) + y;
                    }
                }
                if (/m+/i.test(formats[i])) {
                    m = dates[i];
                }
                if (/d+/i.test(formats[i])) {
                    d = dates[i];
                }
            }
            this.build(y, m, d);
        }
        this.panel.style.left = this.element.offsetLeft + "px";
        this.panel.style.top = (this.element.offsetTop + this.element.offsetHeight) + "px";
        this.panel.style.display = "";
    },
    hide: function () {
        this.panel.style.display = "none";
    }
}