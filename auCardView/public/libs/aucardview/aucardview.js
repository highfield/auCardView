;
/**
    MIT License
    Copyright (c) 2017 Mario Vernari
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */


if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() { }
        F.prototype = obj;
        return new F();
    };
}

(function ($) {
    "use strict";

    $.fn.auCardView = function (options) {
        if ($.isPlainObject(options)) {
            return this.each(function () {
                var obj = Object.create(AuCardView());
                obj.init(options, this);
                $(this).data('auCardView', obj);
            });
        } else if (typeof options === 'string' && options.indexOf('_') !== 0) {
            var obj = $(this).data('auCardView');
            var method = obj[options];
            return method.apply(obj, $.makeArray(arguments).slice(1));
        }
    };

    $.fn.auCardView.options = {
        showSearch: false,
        showSort: false,
        showPage: false,
        selectMode: 'none',
        pageSize: 15,
        sort: null
    };


    var uidgen = (function () {
        var n = 10000;
        return function () { return 'auCardView_ID' + ++n; }
    })();


    function searchController(owner, row) {
        function build() {
            var cell = $('<div>').addClass('input-group auCardView-toolbar-cell-content').appendTo(cctr);
            var gclear = $('<span>').addClass('input-group-btn').appendTo(cell);
            var bclear = $('<button>').addClass('btn btn-default').attr('type', 'button').appendTo(gclear);
            $('<span>').addClass('glyphicon glyphicon-remove').appendTo(bclear);

            input = $('<input>').addClass('form-control').attr({
                type: 'text',
                placeholder: 'Search for...'
            }).appendTo(cell);

            //var gsearch = $('<span>').addClass('input-group-btn').appendTo(cell);
            //var bsearch = $('<button>').addClass('btn btn-default').attr('type', 'button').appendTo(gsearch);
            //$('<span>').addClass('glyphicon glyphicon-search').appendTo(bsearch);

            bclear.on('click', function (e) {
                e.preventDefault();
                tfind = '';
                input.val(tfind);
                owner.reset();
                owner.refresh();
            });

            input.on('input', function () {
                deferrer.trigger();
                //tfind = input.val().trim();
                //owner.refresh(true);
            });

            //bsearch.on('click', function (e) {
            //    e.preventDefault();
            //    tfind = input.val().trim();
            //    owner.refresh(true);
            //});
        }

        function search() {
            tfind = input.val().trim();
            owner.reset();
            owner.refresh();
            deferrer.release();
        }

        var me = {}, vis = false, tfind, input;
        var cctr = $('<div>').addClass('auCardView-toolbar-cell').appendTo(row);
        var deferrer = Deferrer(search, 700);

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                deferrer.release();
                input = null;
                if (vis) {
                    cctr.css('display', '');
                    build();
                }
                else {
                    cctr.empty();
                    cctr.css('display', 'none');
                }
                if (!!tfind) owner.reset();
                owner.refresh();
                tfind = null;
            }
        }

        me._buildParams = function (params) {
            if (vis && tfind && tfind.length) {
                params.findExpr = tfind;
            }
        }

        me._measure = function () {
            return vis ? cctr.width() : 0;
        }

        me._arrange = function (l, r) {
            if (l == null) {
                cctr.css({ right: r });
            }
            else if (r == null) {
                cctr.css({ left: l });
            }
            else {
                cctr.css({ left: l, width: r - l });
            }
        }

        return me;
    }


    function sortController(owner, row) {
        function build() {
            var cell = $('<div>').addClass('btn-group auCardView-toolbar-cell-content').appendTo(cctr);
            bselect = $('<button>').addClass('btn btn-default dropdown-toggle').attr({
                type: 'button',
                'data-toggle': 'dropdown',
                'aria-haspopup': true,
                'aria-expanded': false
            }).appendTo(cell);
            $('<span>').addClass('glyphicon glyphicon-sort-by-alphabet').css('width', 24).appendTo(bselect);
            $('<span>').appendTo(bselect);
            $('<span>').addClass('caret').appendTo(bselect);

            ul = $('<ul>').addClass('dropdown-menu dropdown-menu-right').appendTo(cell);
        }

        function update() {
            if (!bselect) return;
            var sortinfo = owner.options.sort || {};
            var options = sortinfo.options || [];
            if (!activeDir) {
                if (sortinfo && sortinfo.active) {
                    activeField = sortinfo.active.field;
                    if (sortinfo.active.dir) {
                        activeDir = sortinfo.active.dir === 'desc' ? 'desc' : 'asc';
                        reqSetting = { field: activeField, dir: activeDir };
                    }
                }
            }

            //dropdown-menu items
            var activeLabel = null;
            ul.empty();
            options.forEach(function (o) {
                dirs.forEach(function (d) {
                    var li = $('<li>').appendTo(ul);
                    if (o.field === activeField && d.key === activeDir) {
                        li.addClass('active');
                        activeLabel = o.label || o.field;
                    }
                    var a = $('<a>').attr('href', '#').appendTo(li);
                    $('<span>').addClass(d.icon).css('width', 24).appendTo(a);
                    $('<span>').text(o.label || o.field).appendTo(a);
                    a.data('setting', { field: o.field, dir: d.key });
                    a.on('click', reqsort);
                });
            });

            if (!activeLabel) {
                activeField = activeDir = reqSetting = null;
            }

            //dropdown button
            var icon = bselect.children().eq(0), capt = bselect.children().eq(1);
            switch (activeDir) {
                case 'asc': icon.attr('class', dirs[0].icon); break;
                case 'desc': icon.attr('class', dirs[1].icon); break;
                default: icon.attr('class', 'glyphicon glyphicon-sort'); break;
            }
            capt.text(row.width() >= 480 ? activeLabel : '');
        }

        function reqsort(e) {
            if (e) e.preventDefault();
            reqSetting = $(this).data('setting');
            owner.reset();
            owner.refresh();
        }

        var me = {}, vis = false, bselect, ul, activeField, activeDir, reqSetting;
        var cctr = $('<div>').addClass('auCardView-toolbar-cell').appendTo(row);
        var dirs = [
            { key: 'asc', icon: 'glyphicon glyphicon-sort-by-attributes' },
            { key: 'desc', icon: 'glyphicon glyphicon-sort-by-attributes-alt' }
        ];

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                bselect = ul = null;
                if (vis) {
                    cctr.css('display', '');
                    build();
                    update();
                }
                else {
                    cctr.empty();
                    cctr.css('display', 'none');
                }
                owner.reset();
                owner.refresh();
            }
        }

        me._buildParams = function (params) {
            if (reqSetting) {
                params.sortField = reqSetting.field;
                params.sortDir = reqSetting.dir;
            }
        }

        me._update = function (info) {
            if (!info.sortField || !info.sortDir) return;
            activeField = info.sortField;
            activeDir = info.sortDir === 'desc' ? 'desc' : 'asc';
            update();
        }

        me._measure = function () {
            return vis ? cctr.width() : 0;
        }

        me._arrange = function (l, r) {
            if (l == null) {
                cctr.css({ right: r });
            }
            else if (r == null) {
                cctr.css({ left: l });
            }
            else {
                cctr.css({ left: l, width: r - l });
            }
        }

        return me;
    }


    function pageController(owner, row) {
        function build() {
            var bcell = $('<div>').attr('aria-label', 'Page navigation').appendTo(cctr);
            bctr = $('<ul>').addClass('pagination').appendTo(bcell);

            pcell = $('<div>').appendTo(cctr);
        }

        function update() {
            //navigation toolbar
            bctr.empty();

            var bprev, liprev = $('<li>').appendTo(bctr);
            if (index === 0) {
                bprev = $('<span>').appendTo(liprev.addClass('disabled'));
            }
            else {
                bprev = $('<a>').attr({
                    'href': '#',
                    'aria-label': 'Previous'
                }).appendTo(liprev);

                bprev.on('click', function (e) {
                    e.preventDefault();
                    reqix = index - 1;
                    owner.refresh();
                });
            }
            $('<span>').attr('aria-hidden', true).html('&laquo;').appendTo(bprev);

            for (var n = 0, i = Math.max(0, index - 2); n < 5 && i < count; i++ , n++) {
                var li = $('<li>').appendTo(bctr);
                if (i === index) {
                    var s = $('<span>').text(i + 1).appendTo(li.addClass('active'));
                    $('<span>').addClass('sr-only').text('(current)').appendTo(s);
                }
                else {
                    var a = $('<a>').attr('href', '#').text(i + 1).appendTo(li);
                    a.on('click', function (e) {
                        e.preventDefault();
                        reqix = $(this).text() - 1;
                        owner.refresh();
                    });
                }
            }
            //var li8 = $('<li>').addClass('disabled').appendTo(bctr);
            //$('<span>').css({'padding':'6px 3px', 'background-color':'#ddd'}).text('-').appendTo(li8);
            //var li9 = $('<li>').appendTo(bctr);
            //$('<a>').attr('href', '#').text('888').appendTo(li9);

            var bnext, linext = $('<li>').appendTo(bctr);
            if (index >= count - 1) {
                bnext = $('<span>').appendTo(linext.addClass('disabled'));
            }
            else {
                bnext = $('<a>').attr({
                    'href': '#',
                    'aria-label': 'Next'
                }).appendTo(linext);

                bnext.on('click', function (e) {
                    e.preventDefault();
                    reqix = index + 1;
                    owner.refresh();
                });
            }
            $('<span>').attr('aria-hidden', true).html('&raquo;').appendTo(bnext);

            //page x of N indication
            pcell.empty();
            //if (reliable) {
            //    $('<div>').text('Page ' + (index + 1) + ' of ' + count).appendTo(pcell);
            //}
        }

        var me = {}, vis = false, bctr, pcell;
        var index, count, total, reliable = false, reqix = 0;
        var cctr = $('<div>').addClass('auCardView-toolbar-cell').appendTo(row);

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                reliable = false;
                index = 0;
                count = 1;
                if (vis) {
                    cctr.css('display', '');
                    build();
                    update();
                }
                else {
                    cctr.empty();
                    cctr.css('display', 'none');
                    bctr = pcell = null;
                }
                owner.refresh();
            }
        }

        me._buildParams = function (params, clear) {
            if (vis) {
                if (clear || !reliable) reqix = 0;
                params.pageIndex = reqix;
                params.pageSize = owner.options.pageSize;
            }
        }

        me._update = function (info) {
            if (!vis || !info) return;
            index = +info.pageIndex;
            count = Math.max(+info.pageCount, 1);
            total = +info.count;
            reliable = true;
            update();
        }

        me._measure = function () {
            return vis ? cctr.width() : 0;
        }

        me._arrange = function (l, r) {
            if (l == null) {
                cctr.css({ right: r });
            }
            else if (r == null) {
                cctr.css({ left: l });
            }
            else {
                cctr.css({ left: l, width: r - l });
            }
        }

        return me;
    }


    function selectionController(owner, row, panels) {
        function build() {
            var bcell = $('<div>').addClass('auCardView-toolbar-cell-content').appendTo(cctr);
            btn = $('<button>').addClass('btn btn-default').attr({ 'type': 'button' }).appendTo(bcell);
            $('<span>').attr('aria-hidden', true).appendTo(btn);
            btn.on('click', select);
        }

        function update() {
            if (btn) {
                var cls = (reqaction === 'all') ? 'glyphicon glyphicon-check' : 'glyphicon glyphicon-unchecked';
                btn.children('span').attr('class', cls);
            }
        }

        function select() {
            var v = reqaction === 'all';
            panels.forEach(function (p) {
                p.setSelected(v);
            });
            reqaction = v ? 'none' : 'all';
            update();
        }

        function considerRaiseEvent() {
            deferrer.release();
            var selected = [], chg = false;
            for (var i = 0; i < panels.length; i++) {
                var p = panels[i];
                if (p.getSelected()) {
                    selected.push(p);
                    if (oldsel[i] !== p) chg = true;
                    oldsel[i] = p;
                }
                else {
                    if (oldsel[i]) chg = true;
                    oldsel[i] = null;
                }
            }
            if (chg) {
                var event = $.Event("selection");
                event.selected = selected;
                owner.$elem.trigger(event);
            }
        }

        var me = {}, mode = 'none', btn, reqaction = 'all', oldsel = new Array(panels.length);
        var cctr = $('<div>').addClass('auCardView-toolbar-cell').appendTo(row);
        var deferrer = Deferrer(considerRaiseEvent, 100);

        me.getMode = function () { return mode; }
        me.setMode = function (v) {
            if (mode !== v) {
                switch (v) {
                    case 'single':
                    case 'multi':
                        mode = v;
                        break;

                    default:
                        mode = 'none';
                        break;
                }
                cctr.empty();
                btn = null;
                if (mode === 'multi') {
                    cctr.css('display', '');
                    build();
                    update();
                }
                else {
                    cctr.css('display', 'none');
                }
                owner.refresh();
            }
        }

        me.clear = function () {
            panels.forEach(function (p) {
                p.setSelected(false);
            });
        }

        me._selChanged = function (psrc) {
            if (mode === 'single') {
                if (psrc.getSelected()) {
                    panels.forEach(function (p) {
                        if (p !== psrc) p.setSelected(false);
                    });
                }
            }
            deferrer.release();
            deferrer.trigger();
        }

        me._measure = function () {
            return (mode === 'multi') ? cctr.width() : 0;
        }

        me._arrange = function (l, r) {
            if (l == null) {
                cctr.css({ right: r });
            }
            else if (r == null) {
                cctr.css({ left: l });
            }
            else {
                cctr.css({ left: l, width: r - l });
            }
        }

        return me;
    }


    function panelItemController(owner, row, data) {
        function build() {
            var css_pselect = {
                'position': 'absolute',
                //'right': 15
                'right': 2,
                'width': 40,
                'height': 36,
                'margin-top': -10,
                'background-color': 'transparent'
            };
            _.merge(css_pselect, owner.options.panelSelectCSS || {});

            var css_pxhdr = {
                'display': 'inline-block'
            };
            _.merge(css_pxhdr, owner.options.panelXHeaderCSS || {});

            var css_phdr = {
                'display': 'inline-block'
            };
            _.merge(css_phdr, owner.options.panelHeaderCSS || {});

            panel = $('<panel>').addClass('panel auCardView-card-panel').appendTo(row);
            var hdr = $('<div>').addClass('panel-heading').appendTo(panel);
            ptitle = $('<h4>').addClass('panel-title').appendTo(hdr);
            pselect = $('<div>').css(css_pselect).appendTo(ptitle);
            pxhdr = $('<div>').css(css_pxhdr).appendTo(ptitle);
            phdr = $('<div>').css(css_phdr).appendTo(ptitle);

            var exp = $('<div>').attr('id', 'collapse_' + uid).appendTo(panel);
            pbody = $('<div>').addClass('panel-body auCardView-card-body').appendTo(exp);

            setPanelClass(owner.options.panelClass || 'panel-default');

            pselect.on('click', function (e) {
                e.stopPropagation();
                me.setSelected(!me.getSelected());
                updateCheckbox();
            });

            panel.on('click', function () {
                if (selectable && globalSelectable()) {
                    owner.getSelectionController().clear();
                    me.setSelected(true);
                }
            });
        }

        function setPanelClass(cls) {
            var old = panel.data('cls');
            if (cls !== old) {
                if (old) {
                    panel.removeClass(old);
                    pbody.removeClass(old);
                }
                if (cls) {
                    panel.addClass(cls);
                    pbody.addClass(cls);
                }
                panel.data('cls', cls);
            }
        }

        function updateCheckbox() {
            var sp = pselect.find('span');
            sp.attr('class', me.getSelected() ? 'glyphicon glyphicon-check' : 'glyphicon glyphicon-unchecked');
            sp.css('opacity', me.getSelected() ? 1.0 : 0.25);

            if (owner.options.selectionBorderColor) {
                panel.parent().css('border-color', me.getSelected() ? owner.options.selectionBorderColor : 'transparent');
            }
        }

        function update() {
            var canSelect = selectable && globalSelectable();
            if (canSelect !== cached.canSelect) {
                pselect.empty();
                if (canSelect) {
                    $('<span>').attr('aria-hidden', true).css({
                        'position': 'absolute',
                        'left': 10,
                        'top': 10,
                        'font-size': '1.2em',
                        //'opacity': 0.65
                    }).appendTo(pselect);
                    //var inp = $('<input>').attr({ type: 'checkbox' }).css({
                    //    //'margin-right': 20
                    //    'position': 'absolute',
                    //    'left': 10,
                    //    'top': 10
                    //}).appendTo(pselect);
                    //inp.on('change', function () {
                    //    me.setSelected($(this).prop('checked'));
                    //});
                }
                cached.canSelect = canSelect;
            }

            if (selected !== cached.selected) {
                //var inp = pselect.children('input');
                //if (inp.length) inp.prop('checked', selected);
                updateCheckbox();
                owner.getSelectionController()._selChanged(me);
                cached.selected = selected;
            }

            if (collapsible !== cached.collapsible) {
                pxhdr.empty();
                if (collapsible) {
                    $('<a>').attr({
                        'data-toggle': 'collapse',
                        href: '#collapse_' + uid,
                        'aria-expanded': !!collapsed,
                        'aria-controls': 'collapse_' + uid
                    }).appendTo(pxhdr);
                    pbody.parent().addClass('collapse');
                }
                else {
                    $('<div>').appendTo(pxhdr);
                    pbody.parent().removeClass('collapse');
                }
                cached.xheader = null;
                cached.collapsible = collapsible;
            }

            if (collapsed !== cached.collapsed) {
                if (collapsible) $('#collapse_' + uid).collapse(collapsed ? 'hide' : 'show');
                cached.collapsed = collapsed;
            }

            if (xheader !== cached.xheader) {
                var el = pxhdr.children().eq(0).empty();
                if (xheader) el.append(xheader);
                cached.xheader = xheader;
            }

            if (header !== cached.header) {
                var el = phdr.empty();
                if (header) el.append(header);
                cached.header = header;
            }

            if (body !== cached.body) {
                var el = pbody.empty();
                if (body) el.append(body);
                cached.body = body;
            }
            deferrer.release();
        }

        function globalSelectable() {
            return owner.getSelectionController().getMode() !== 'none';
        }

        var me = {}, uid = uidgen(), xheader, header, body;
        var panel, ptitle, pbody, pselect, pxhdr, phdr;
        var selected = false, cached = {};
        var selectable = owner.options.selectable != null ? !!owner.options.selectable : true;
        var collapsible = owner.options.collapsible != null ? !!owner.options.collapsible : false;
        var collapsed = owner.options.collapsed != null ? !!owner.options.collapsed : false;
        var deferrer = Deferrer(update, 10);

        me.getData = function () { return data; }

        me.getXHeader = function () { return xheader; }
        me.setXHeader = function (v) {
            xheader = v;
            deferrer.trigger();
        }

        me.getHeader = function () { return header; }
        me.setHeader = function (v) {
            header = v;
            deferrer.trigger();
        }

        me.getBody = function () { return body; }
        me.setBody = function (v) {
            body = v;
            deferrer.trigger();
        }

        me.getSelected = function () { return selected; }
        me.setSelected = function (v) {
            selected = !!v && selectable && globalSelectable();
            deferrer.trigger();
        }

        me.getSelectable = function () { return selectable; }
        me.setSelectable = function (v) {
            selectable = !!v && globalSelectable();
            selected = selected && selectable;
            deferrer.trigger();
        }

        me.getCollapsed = function () { return collapsed; }
        me.setCollapsed = function (v) {
            collapsed = !!v && collapsible;
            deferrer.trigger();
        }

        me.getCollapsible = function () { return collapsible; }
        me.setCollapsible = function (v) {
            collapsible = !!v;
            collapsed = collapsed && collapsible;
            deferrer.trigger();
        }

        me.getPanelClass = function () { return panel && panel.data('cls'); }
        me.setPanelClass = function (v) { setPanelClass(v); }

        build();
        return me;
    }


    function Deferrer(callback, delay) {
        var me = {}, tmr, cbargs;

        me.trigger = function (args) {
            if (tmr) {
                if (!args) return;
                clearTimeout(tmr);
            }
            cbargs = args;
            tmr = setTimeout(function () {
                callback(cbargs || {});
                cbargs = null;
            }, delay);
        }

        me.release = function () {
            if (tmr) clearTimeout(tmr);
            tmr = null;
        }

        return me;
    }


    function AuCardView() {
        function viewBuilder(items) {
            var children = mrow.children();
            panels.length = 0;
            var proj = me.options.projection || function (x) { return x; }
            try {
                var i = 0;
                for (; i < items.length; i++) {
                    var ctr;
                    if (i >= children.length) {
                        ctr = $('<div>').addClass('auCardView-card').appendTo(mrow);
                    }
                    else {
                        ctr = $(children[i]);
                        ctr.empty();
                    }

                    var dataItem = proj(items[i]);
                    var p = panelItemController(me, ctr, dataItem);
                    panels.push(p);
                    me.options.panelViewUpdater && me.options.panelViewUpdater(p, dataItem);
                }
                while (i < children.length) {
                    children[i++].remove();
                }
            }
            catch (err) {
                console.error(err);
                //TODO
            }
        }

        function updater(args) {
            spinLayer.show();
            resize();
            mrow.css('min-height', mrow.height());

            var params = {};
            ctlSearch._buildParams(params);
            ctlSort._buildParams(params);
            ctlPage._buildParams(params, dirty);
            dirty = false;

            var action = args.action || 'get';
            $.when(me.options.controller[action](params, args.data))
                .then(function (data) {
                    //alert(data.count);
                    spinLayer.hide();
                    ctlSort._update(data);
                    ctlPage._update(data);
                    try {
                        if (data && data.items && data.items.constructor === Array) {
                            viewBuilder(data.items);
                            mrow.css('min-height', 0);
                        }
                    }
                    finally {
                        deferrer.release();
                    }
                },
                function (err) {
                    console.error(err);
                    spinLayer.hide();
                    mrow.css('min-height', 0);
                    //TODO
                    deferrer.release();
                });
        }


        function resize() {
            if (!mrow) return;
            var wrow = mrow.width(), margin = 10;

            //header
            var l = 0, r = 0;
            var wl = ctlSelect._measure();
            var ws = ctlSearch._measure();
            var wr = ctlSort._measure();
            if (wl) {
                ctlSelect._arrange(l, null);
                l += wl + margin;
            }
            if (ws) {
                ws = wrow;
                if (wl) ws -= wl + margin;
                if (wr) ws -= wr + margin;
                ws = Math.min(200, ws);
                ctlSearch._arrange(l, l + ws);
            }
            if (wr) {
                ctlSort._arrange(null, r);
            }
            mrow.parent().css('top', (wl || ws || wr) ? 56 : 0);

            //footer
            var wp = ctlPage._measure();
            ctlPage._arrange(0, wrow);
            mrow.parent().css('bottom', wp ? 80 : 0);
        }


        $(window).on('resize', resize);

        var me = {}, ctlSearch, ctlSort, ctlPage, ctlSelect, hrow, mrow, frow, dirty = true, panels = [], spinLayer;
        var deferrer = Deferrer(updater, 200);

        me.getSearchController = function () { return ctlSearch; }
        me.getSortController = function () { return ctlSort; }
        me.getPageController = function () { return ctlPage; }
        me.getSelectionController = function () { return ctlSelect; }

        me.init = function (options, elem) {
            me.$elem = $(elem);
            me.options = $.extend({}, $.fn.auCardView.options, options);

            me.$elem.addClass('auCardView');
            var mainctr = $("<div>").addClass('container-fluid auCardView-container').appendTo(me.$elem);

            hrow = $('<div>').addClass('row auCardView-header').appendTo(mainctr);
            ctlSelect = selectionController(me, hrow, panels);
            ctlSelect.setMode(me.options.selectMode);

            ctlSearch = searchController(me, hrow);
            ctlSearch.setVisible(me.options.showSearch);

            ctlSort = sortController(me, hrow);
            ctlSort.setVisible(me.options.showSort);

            mrow = $('<div>').appendTo($('<div>').addClass('row auCardView-body').appendTo(mainctr));

            frow = $('<div>').addClass('row auCardView-footer').appendTo(mainctr);
            ctlPage = pageController(me, frow);
            ctlPage.setVisible(me.options.showPage);

            spinLayer = $('<div>').addClass('auCardView-spin-layer').appendTo(me.$elem).hide();
            $('<div>').addClass('auCardView-spinner').appendTo($('<div>').appendTo(spinLayer));
        };

        me.reset = function () { dirty = true; }

        me.refresh = function (args) {
            deferrer.trigger(args);
        }

        me.refresh();
        return me;
    }

})(jQuery);

