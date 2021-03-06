﻿;
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


var AuCardView = (function ($) {
    "use strict";

    var NS = {};

    $.fn.auCardView = function (options) {
        return this.each(function () {
            var obj = _AuCardView();
            obj.init(options, this);
            $(this).data('auCardView', obj);
        });
    };

    $.fn.auCardView.options = {
        showSearch: false,
        showSort: false,
        showPage: false,
        selectionManager: 'none',
        pageSize: 15,
        sort: null,
        dataController: null,
        itemsController: null,
        //panelViewUpdater: null,
        panelClickEnabled: true,
        selectionBorderColor: 'transparent',
        panelHeaderCSS: null,
        panelXHeaderCSS: null
    };


    var uidgen = (function () {
        var n = 10000;
        return function () { return 'auCardView_ID' + ++n; }
    })();


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
                owner.refresh(true);
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
                owner.refresh(true);
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
                owner.refresh(true);
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


    function selectionToolbarController(owner, row) {

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
            owner.getSelectionManager().command(reqaction);
            reqaction = v ? 'none' : 'all';
            update();
        }

        var me = {}, vis = false, btn, reqaction = 'all';
        var cctr = $('<div>').addClass('auCardView-toolbar-cell').appendTo(row);

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                if (vis) {
                    cctr.css('display', '');
                    build();
                    update();
                }
                else {
                    cctr.empty();
                    cctr.css('display', 'none');
                    btn = null;
                }
                owner.refresh();
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

    /*
    function selectionController(owner, row) {

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
            manager.command(reqaction);
            reqaction = v ? 'none' : 'all';
            update();
        }

        function considerRaiseEvent() {
            deferrer.release();
            if (manager && manager.hasChanged()) {
                var event = $.Event("selection");
                event.selected = manager.getSelected();
                owner.$elem.trigger(event);
            }
        }

        var me = {}, btn, reqaction = 'all', manager;
        var cctr = $('<div>').addClass('auCardView-toolbar-cell').appendTo(row);
        var deferrer = Deferrer(considerRaiseEvent, 100);

        me.getManager = function () { return manager; }
        me.setManager = function (v) {
            if (manager) manager.notify = null;
            if (typeof v === 'string') {
                v = NS.SelectionManager[v]();
            }
            manager = v;
            cctr.empty();
            btn = null;
            if (manager) {
                manager.notify = function () {
                    deferrer.release();
                    deferrer.trigger();
                }
            }
            if (manager && manager.maxCount() > 1) {
                cctr.css('display', '');
                build();
                update();
            }
            else {
                cctr.css('display', 'none');
            }
            owner.refresh();
        }

        me._measure = function () {
            return (manager && manager.maxCount() > 1) ? cctr.width() : 0;
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
    */

    function _AuCardView() {

        function updater(args) {
            function release() {
                spinLayer.hide();
                deferrer.release();
                resize();
            }

            try {
                spinLayer.show();
                resize();
                mrow.css('min-height', mrow.height());

                var params = {};
                ctlSearch._buildParams(params);
                ctlSort._buildParams(params);
                ctlPage._buildParams(params, dirty);
                dirty = false;

                //var selmgr = ctlSelect.getManager();
                //if (selmgr) selmgr.command('clear');
                if (ctlSelMng) {
                    if (ctlSelMng.maxCount() > 1 && ctlPage.getVisible()) {
                        throw new Error('Cannot use multiple-selection together with the pagination.');
                    }
                    ctlSelMng._clearBindings();
                    var sl = ctlSelMng.getSelected();
                    if (sl.length && typeof sl[0] === 'string') {
                        params.selected = sl[0];
                    }
                }

                var action = args.action || 'get';
                $.when(me.options.dataController[action](params, args.data))
                    .then(function (data) {
                        //alert(data.count);
                        //spinLayer.hide();
                        ctlSort._update(data);
                        ctlPage._update(data);
                        try {
                            if (data && $.isArray(data.items)) {
                                if (ctlItems) {
                                    ctlItems.setData(data.items);
                                    ctlItems._load();
                                }
                                mrow.css('min-height', 0);
                            }
                        }
                        finally {
                            if (ctlSelMng) ctlSelMng._updateBindings();
                            release();
                            if (!run1) {
                                run1 = true;
                                me.$elem.trigger('init');
                            }
                        }
                    },
                    function (err) {
                        console.error(err);
                        mrow.css('min-height', 0);
                        //TODO notify error
                        release();
                    });
            }
            catch (err) {
                console.error(err);
                //TODO notify error
                release();
            }
        }


        function resize() {
            if (!mrow) return;
            var wrow = mrow.width(), margin = 10;

            //header
            var l = 0, r = 0;
            var wl = ctlSelTbar._measure();
            var ws = ctlSearch._measure();
            var wr = ctlSort._measure();
            if (wl) {
                ctlSelTbar._arrange(l, null);
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

        var me = {}, ctlItems, ctlSearch, ctlSort, ctlPage, ctlSelTbar, ctlSelMng; // ctlSelect;
        var hrow, mrow, frow, dirty = true, run1, panels = [], spinLayer;
        var deferrer = Deferrer(updater, 200);

        me.getSearchController = function () { return ctlSearch; }
        me.getSortController = function () { return ctlSort; }
        me.getPageController = function () { return ctlPage; }
        //me.getSelectionController = function () { return ctlSelect; }

        me.getSelectionManager = function () { return ctlSelMng; }
        me.setSelectionManager = function (v) {
            if (typeof v === 'string') {
                v = NS.SelectionManager[v](me);
            }
            ctlSelMng = v;
            ctlSelTbar.setVisible(ctlSelMng && ctlSelMng.maxCount() > 1);
            me.refresh();
        }

        me.getItemsController = function () { return ctlItems; }
        me.setItemsController = function (v) {
            ctlItems = v;
            if (ctlItems) ctlItems._setContext(me, null, mrow, null);
            me.refresh();
        }

        me.init = function (options, elem) {
            me.$elem = $(elem);
            me.options = $.extend({}, $.fn.auCardView.options, options);

            me.$elem.addClass('auCardView');
            var mainctr = $("<div>").addClass('container-fluid auCardView-container').appendTo(me.$elem);

            hrow = $('<div>').addClass('row auCardView-header').appendTo(mainctr);
            ctlSelTbar = selectionToolbarController(me, hrow);
            //ctlSelect = selectionController(me, hrow);
            //ctlSelect.setManager(me.options.selectionManager);

            me.setSelectionManager(me.options.selectionManager);

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

            me.setItemsController(me.options.itemsController);
        };

        me.reset = function () { dirty = true; }

        me.refresh = function (args) {
            deferrer.trigger(args);
        }

        me.refresh();
        return me;
    }


    NS.ViewElement = (function () {
        "use strict";

        function generator(inner, template) {
            var g = {}, i = 0, children = inner.children(), result = [];

            g.next = function () {
                var c;
                if (i >= children.length) {
                    var c = template && template() || $('<div>');
                    c.addClass('auCardView-item').appendTo(inner);
                }
                else {
                    c = $(children[i++]).empty();
                }
                result.push(c);
                return c;
            }

            g.close = function () {
                while (i < children.length) {
                    children[i++].remove();
                }
                return result;
            }

            return g;
        }


        var elements = {};

        elements.itemBase = function () {
            var me = {}, uid = uidgen(), owner, parent, container, data, options = {}, inner;

            me.getUid = function () { return uid; }
            me.getOwner = function () { return owner; }
            me.getParent = function () { return parent; }
            me.getContainer = function () { return container; }

            me.getData = function () { return data; }
            me.setData = function (v) { data = v; }

            me.getOptions = function () { return options; }
            me.setOptions = function (v) { options = v || {}; }

            me._setContext = function (o, p, c, d) {
                owner = o;
                parent = p;
                container = c;
                if (d != null) data = d;
            }

            me.build = null;
            me.update = null;

            me._load = function () {
                if (!inner) {
                    //create container
                    inner = me.build && me.build(container) || container;
                }
                if (inner) {
                    //invoke template for projection of data-items to children
                    me.update && me.update(inner);
                }
            }

            me._intoView = function () {
                //see: http://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move
                var box = container.closest('.auCardView-body');
                box[0].scrollTop = container[0].offsetTop;
            }

            return me;
        }


        elements.list = function () {
            var me = elements.itemBase(), dataItems, controllers = [];

            me.project = null;
            me.itemContainer = null;
            me.template = null;

            me.getControllers = function () {
                return controllers.slice(0);
            }

            me.update = function (inner) {
                dataItems = me.project && me.project(me.getData()) || me.getData();
                if (!$.isArray(dataItems)) dataItems = [];

                controllers.length = 0;
                var gen = generator(inner, me.itemContainer);
                for (var i = 0; i < dataItems.length; i++) {
                    var ctl = me.template && me.template(dataItems[i]);
                    if (ctl) {
                        var cctr = gen.next();
                        ctl._setContext(me.getOwner(), me, cctr, dataItems[i]);
                        controllers.push(ctl);
                    }
                }
                gen.close();
                controllers.forEach(function (ctl) {
                    ctl._load();
                });
            }

            return me;
        }


        elements.table = function () {
            var me = elements.list(), columns = [];

            me.getColumns = function () { return columns; }
            me.setColumns = function (v) { columns = v || []; }

            me.build = function (container) {
                var tbl = $('<table>').addClass('table table-condensed').appendTo(container);
                var th = $('<thead>').appendTo(tbl);
                var tr = $('<tr>').appendTo(th);
                for (var i = 0; i < columns.length; i++) {
                    var th = $('<th>').appendTo(tr);
                    if (columns[i].selection) {
                        th.attr('width', 40);
                    }
                    else {
                        if (columns[i].width) th.attr('width', columns[i].width);
                        th.text(columns[i].title || columns[i].name);
                    }
                }
                var tb = $('<tbody>').appendTo(tbl);
                return tb;
            }

            me.itemContainer = function () {
                return $('<tr>');
            };

            return me;
        }


        elements.tableRow = function () {
            var me = elements.itemBase(), cells = [];

            me.build = function (container) {
                var columns = me.getParent().getColumns() || [];
                cells.length = 0;

                var pselect;
                for (var i = 0; i < columns.length; i++) {
                    var td = $('<td>').appendTo(container);
                    cells.push(td);
                    if (columns[i].selection) {
                        pselect = $('<div>').appendTo(td);
                    }
                }

                if (pselect) {
                    //selectable parts
                    var mgr = me.getOwner().getSelectionManager();
                    //var mgr = me.getOwner().getSelectionController().getManager();
                    if (mgr && mgr.maxCount() > 0) {
                        pselect.auCheckBox();
                        var chkapi = pselect.data('auCheckBox');
                        pselect.find('span').css({
                            //'position': 'absolute',
                            //'left': 10,
                            //'top': 10,
                            'font-size': '1.2em',
                        });
                        //mgr.bindController(me, pselect);

                        if (chkapi) {
                            var sp = mgr._bind(me, function (sel) {
                                if (sel === null) {
                                    chkapi.setStatus('indeterminate');
                                }
                                else {
                                    chkapi.setStatus(sel ? 'checked' : 'unchecked');
                                }
                                me.selectionChanged(sel);
                            });
                            if (sp) {
                                pselect.on('click', function (e) {
                                    e.stopPropagation();
                                    switch (chkapi.getStatus()) {
                                        case 'checked': mgr.command('select', sp); break;
                                        case 'unchecked': mgr.command('unselect', sp); break;
                                        case 'indeterminate': mgr.command('indeterminate', sp); break;
                                    }
                                });
                            }
                        }
                    }
                }
                return container;
            }

            me.update = function (inner) {
                var columns = me.getParent().getColumns() || [];
                for (var i = 0; i < columns.length; i++) {
                    var c = columns[i];
                    if (c.name) {
                        if (c.updater) {
                            c.updater(cells[i], c, me.getData());
                        }
                        else {
                            cells[i].text(me.getData()[c.name]);
                        }
                    }
                }
            }

            me.selectionChanged = function (sel) {
                if (me.getOptions().selectionBorderColor) {
                    me.getContainer().css('outline-color', sel ? me.getOptions().selectionBorderColor : 'transparent');
                }
            }

            return me;
        }


        elements.panel = function () {

            function update() {
                if (!panel) return;
                if (collapsible !== cached.collapsible) {
                    pxhdr.empty();
                    if (collapsible) {
                        $('<a>').attr({
                            'data-toggle': 'collapse',
                            href: '#collapse_' + me.getUid(),
                            'aria-expanded': !!collapsed,
                            'aria-controls': 'collapse_' + me.getUid()
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
                    if (collapsible) $('#collapse_' + me.getUid()).collapse(collapsed ? 'hide' : 'show');
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
                    if (body) {
                        if (body instanceof jQuery) {
                            el.append(body);
                        }
                        else if ($.isPlainObject(body)) {
                            body._setContext(me.getOwner(), me, pbody, null);
                            body._load();
                        }
                    }
                    cached.body = body;
                }

                if (panelClass !== cached.panelClass) {
                    if (cached.panelClass) {
                        panel.removeClass(cached.panelClass);
                        pbody.removeClass(cached.panelClass);
                    }
                    if (panelClass) {
                        panel.addClass(panelClass);
                        pbody.addClass(panelClass);
                    }
                    cached.panelClass = panelClass;
                }
                deferrer.release();
            }

            var me = elements.itemBase();
            var cached = {}, xheader, header, body, collapsible, collapsed, panelClass;
            var panel, ptitle, pbody, pselect, pxhdr, phdr;
            var deferrer = Deferrer(update, 10);

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

            me.getPanelClass = function () { return panelClass; }
            me.setPanelClass = function (v) {
                panelClass = v;
                deferrer.trigger();
            }

            me.build = function (container) {
                collapsible = !!(me.getOptions().collapsible != null ? me.getOptions().collapsible : collapsible);
                collapsed = collapsible && !!(me.getOptions().collapsed != null ? me.getOptions().collapsed : collapsed);
                panelClass = me.getOptions().panelClass || panelClass || 'panel-default';

                var css_pselect = {
                    'position': 'absolute',
                    //'right': 15
                    'right': 2,
                    'width': 40,
                    'height': 36,
                    'margin-top': -10,
                    'background-color': 'transparent'
                };
                $.extend(css_pselect, me.getOptions().panelSelectCSS || {});

                var css_pxhdr = {
                    'display': 'inline-block'
                };
                $.extend(css_pxhdr, me.getOptions().panelXHeaderCSS || {});

                var css_phdr = {
                    'display': 'inline-block'
                };
                $.extend(css_phdr, me.getOptions().panelHeaderCSS || {});

                panel = $('<panel>').addClass('panel auCardView-card-panel').appendTo(container);
                var hdr = $('<div>').addClass('panel-heading').appendTo(panel);
                ptitle = $('<h4>').addClass('panel-title').appendTo(hdr);
                pselect = $('<div>').css(css_pselect).appendTo(ptitle);
                pxhdr = $('<div>').css(css_pxhdr).appendTo(ptitle);
                phdr = $('<div>').css(css_phdr).appendTo(ptitle);

                var exp = $('<div>').attr('id', 'collapse_' + me.getUid()).appendTo(panel);
                pbody = $('<div>').addClass('panel-body auCardView-card-body').appendTo(exp);

                //selectable parts
                var mgr = me.getOwner().getSelectionManager();
                //var mgr = me.getOwner().getSelectionController().getManager();
                if (mgr && mgr.maxCount() > 0) {
                    pselect.auCheckBox();
                    var chkapi = pselect.data('auCheckBox');
                    pselect.find('span').css({
                        'position': 'absolute',
                        'left': 10,
                        'top': 10,
                        'font-size': '1.2em',
                    });

                    if (chkapi) {
                        //var sp = mgr.bindController(me, pselect);
                        var sp = mgr._bind(me, function (sel) {
                            if (sel === null) {
                                chkapi.setStatus('indeterminate');
                            }
                            else {
                                chkapi.setStatus(sel ? 'checked' : 'unchecked');
                            }
                            me.selectionChanged(sel);
                        });
                        if (sp) {
                            pselect.on('click', function (e) {
                                e.stopPropagation();
                                switch (chkapi.getStatus()) {
                                    case 'checked': mgr.command('select', sp); break;
                                    case 'unchecked': mgr.command('unselect', sp); break;
                                    case 'indeterminate': mgr.command('indeterminate', sp); break;
                                }
                            });

                            if (me.getOptions().panelClickEnabled) {
                                panel.on('click', function (e) {
                                    mgr.command('panel', sp);
                                });
                            }
                        }
                    }
                }

                return pbody;
            }

            me.update = function (inner) {
                update();
            }

            me.selectionChanged = function (sel) {
                if (me.getOptions().selectionBorderColor) {
                    me.getContainer().css('outline-color', sel ? me.getOptions().selectionBorderColor : 'transparent');
                }
            }

            return me;
        }

        return elements;
    })();


    NS.SelectionManager = (function () {
        "use strict";

        var managers = {};

        managers.base = function (owner, Nmax) {

            function SelProxy(controller, cb) {
                var sp = {}, sel = false, old = false;
                sp.getController = function () { return controller; }
                sp.getKey = function () { return controller.getOptions().selkey; }
                sp.getSel = function () { return sel; }
                sp.setSel = function (v) {
                    if (sel !== v) {
                        sel = v;
                        cb && cb(sel);
                        sp.change && sp.change(sel);
                    }
                }
                //sp.getIndeterminate = function () { return sel == null; }
                //sp.getSelected = function () { return sel; }
                //sp.setSelected = function (v) {
                //    if (sel !== v) {
                //        sel = v;
                //        cb && cb(sel);
                //        sp.change && sp.change(sel);
                //        me._notifyChange();
                //    }
                //}

                //sp.hasChanged = function () {
                //    var f = sel !== old;
                //    old = sel;
                //    return f;
                //}

                sp._start = function () {
                    cb && cb(sel);
                }

                sp.change = null;
                sp.dispose = function () { }
                return sp;
            }

            function considerRaiseEvent() {
                deferrer.release();
                if (selchg) {
                    var event = $.Event("selection");
                    event.manager = me;
                    event.selected = me.getSelected();
                    owner.$elem.trigger(event);
                }
                selchg = false;
                if (intoViewKey) {
                    proxies[intoViewKey] && proxies[intoViewKey].getController()._intoView();
                }
                intoViewKey = null;
            }

            var me = {}, selected = {}, proxies = {}, selchg = false, intoViewKey;
            var deferrer = Deferrer(considerRaiseEvent, 100);

            me.maxCount = function () { return Nmax; }
            me.getProxies = function () { return proxies; }

            me.getSelected = function () { return Object.keys(selected); }
            me.setSelected = function (v, refresh) {
                if (v !== selected) {
                    selected = {};
                    me._setSelectedCore(v).forEach(function (s) {
                        selected[s] = 1;
                    });
                }
                selchg = true;
                deferrer.release();
                deferrer.trigger();
                if (refresh) {
                    intoViewKey = null;
                    owner.refresh();
                }
            }
            me._setSelectedCore = function (v) { return []; }

            //me.hasChanged = function () {
            //    var chg = false;
            //    proxies.forEach(function (p) {
            //        if (p.hasChanged()) chg = true;
            //    });
            //    return chg;
            //}

            //me._notifyChange = function () {
            //    deferrer.release();
            //    deferrer.trigger();
            //}

            me._clearBindings = function () {
                proxies = {};
                me._clearBindingsCore();
            }
            me._clearBindingsCore = $.noop;

            me._updateBindings = function () {
                Object.keys(selected).forEach(function (s) {
                    if (!proxies[s]) {
                        delete selected[s];
                        selchg = true;
                    }
                });
                intoViewKey = me._updateBindingsCore(proxies, selected);
                deferrer.release();
                deferrer.trigger();
            }
            me._updateBindingsCore = $.noop;

            me._bind = function (controller, cb) {
                var proxy = SelProxy(controller, cb);
                var hash = proxy.getKey();
                if (hash) {
                    proxies[hash] = proxy;
                    proxy._start();
                    me._bindCore(proxy);
                    return proxy;
                }
            }
            me._bindCore = $.noop;

            me.command = function (cmd, proxy) {
                switch (cmd) {
                    case 'clear':
                    case 'none':
                        selected = {};
                        for (var k in proxies) {
                            proxies[k].setSel(false);
                        }
                        me.setSelected(selected);
                        break;

                    case 'all':
                        selected = {};
                        for (var k in proxies) {
                            selected[k] = 1;
                            proxies[k].setSel(true);
                        }
                        me.setSelected(selected);
                        break;

                    default:
                        var fn = me._xcommand(cmd, proxy);
                        fn && me.setSelected(fn(proxies, selected));
                }
            }
            me._xcommand = $.noop;

            return me;
        }


        managers.none = function (owner) {
            var me = managers.base(owner, 0);
            return me;
        }


        managers.single = function (owner) {
            var me = managers.base(owner, 1);
            me._setSelectedCore = function (v) {
                if (v == null) return [];
                if ($.isArray(v)) return v.slice(0, 1);
                if ($.isPlainObject(v)) return Object.keys(v).slice(0, 1);
                return [v];
            }
            me._updateBindingsCore = function (proxies, selected) {
                var keys = Object.keys(selected);
                if (keys.length) {
                    var p = proxies[keys[0]];
                    p.setSel(true);
                    return keys[0];
                }
            }
            me._xcommand = function (cmd, proxy) {
                switch (cmd) {
                    case 'panel':
                    case 'select':
                        return function (proxies, selected) {
                            for (var k in proxies) {
                                var p = proxies[k];
                                p.setSel(p === proxy);
                            }
                            return [proxy.getKey()];
                        };

                    case 'unselect':
                        return function (proxies, selected) {
                            for (var k in proxies) {
                                proxies[k].setSel(false);
                            }
                            return [];
                        };
                }
            }
            return me;
        }


        managers.multi = function (owner) {
            var me = managers.base(owner, 1e6);
            me._setSelectedCore = function (v) {
                if (v == null) return [];
                if ($.isArray(v)) return v.slice(0);
                if ($.isPlainObject(v)) return Object.keys(v).slice(0);
                return [v];
            }
            me._updateBindingsCore = function (proxies, selected) {
                var kk;
                for (var k in selected) {
                    proxies[k].setSel(true);
                    kk = kk || k;
                }
                return kk;
            }
            me._xcommand = function (cmd, proxy) {
                switch (cmd) {
                    case 'panel':
                        return function (proxies, selected) {
                            for (var k in proxies) {
                                var p = proxies[k];
                                p.setSel(p === proxy);
                            }
                            return [proxy.getKey()];
                        };

                    case 'select':
                        return function (proxies, selected) {
                            proxy.setSel(true);
                            selected[proxy.getKey()] = 1;
                            return selected;
                        };

                    case 'unselect':
                        return function (proxies, selected) {
                            proxy.setSel(false);
                            delete selected[proxy.getKey()];
                            return selected;
                        };
                }
            }
            return me;
        }


        managers.multimd = function (owner) {
            //function update() {
            //    var group = {};
            //    me.getProxies().forEach(function (p) {
            //        var controller = p.getController(), pctl = controller.getParent().getParent();
            //        var pid = pctl ? pctl.getUid() : controller.getUid();
            //        var g = group[pid] = group[pid] || { nc: 0, ns: 0 };
            //        if (pctl) {
            //            g.nc++;
            //            if (p.getSelected()) g.ns++;
            //        }
            //        else {
            //            g.pp = p;
            //        }
            //    });

            //    for (var k in group) {
            //        var g = group[k];
            //        if (g.ns === 0) {
            //            g.pp.setSelected(false);
            //        }
            //        else if (g.ns === g.nc) {
            //            g.pp.setSelected(true);
            //        }
            //        else {
            //            g.pp.setSelected(null);
            //        }
            //    }
            //}
            function bindBidi(master) {
                function cchange(sel) {
                    var n = 0;
                    children.forEach(function (c) {
                        if (c.getSel()) n++;
                    });
                    if (n === 0) {
                        master.setSel(false);
                    }
                    else if (n === children.length) {
                        master.setSel(true);
                    }
                    else {
                        master.setSel(null);
                    }
                }

                function mchange(sel) {
                    if (sel === null) return;
                    children.forEach(function (c) {
                        c.setSel(sel);
                    });
                }
                master.change = mchange;

                var bb = {}, children = [], mkey = master.getKey();
                bb.getKey = function () { return mkey; }
                bb.bind = function (child) {
                    child.change = cchange;
                    children.push(child);
                }
                bb.setSel = function (v, sel) {
                    master.setSel(v);
                    children.forEach(function (c) {
                        if (v) {
                            sel[c.getKey()] = 1;
                        }
                        else {
                            delete sel[c.getKey()];
                        }
                    });
                }
                return bb;
            }

            var me = managers.base(owner, 1e6), masterProxies = {};
            me._setSelectedCore = function (v) {
                if (v == null) return [];
                if ($.isArray(v)) return v.slice(0);
                if ($.isPlainObject(v)) return Object.keys(v).slice(0);
                return [v];
            }
            me._updateBindingsCore = function (proxies, selected) {
                var kk;
                for (var k in selected) {
                    proxies[k].setSel(true);
                    kk = kk || k;
                }
                return kk;
            }
            me._clearBindingsCore = function () {
                masterProxies = {};
            }
            me._bindCore = function (proxy) {
                var pc = proxy.getController().getParent().getParent();
                if (pc) {
                    masterProxies[pc.getOptions().selkey].bind(proxy);
                }
                else {
                    masterProxies[proxy.getKey()] = bindBidi(proxy);
                }
            }
            me._xcommand = function (cmd, proxy) {
                switch (cmd) {
                    case 'panel':
                        return function (proxies, selected) {
                            var sel = {};
                            for (var k in masterProxies) {
                                masterProxies[k].setSel(k === proxy.getKey(), sel);
                            }
                            //var mp = masterProxies[proxy.getKey()];
                            //masterProxies[proxy.getKey()].forEach(function (p) {
                            //    p.setSel(true);
                            //    sel[p.getKey()] = 1;
                            //});
                            return sel;
                        };

                    case 'select':
                        return function (proxies, selected) {
                            var mp = masterProxies[proxy.getKey()];
                            if (mp) {
                                mp.setSel(true, selected);
                            }
                            else {
                                proxy.setSel(true);
                                selected[proxy.getKey()] = 1;
                            }
                            return selected;
                        };

                    case 'unselect':
                        return function (proxies, selected) {
                            var mp = masterProxies[proxy.getKey()];
                            if (mp) {
                                mp.setSel(false, selected);
                            }
                            else {
                                proxy.setSel(false);
                                delete selected[proxy.getKey()];
                            }
                            return selected;
                        };
                }
            }
            //me._xcommand = function (cmd, proxy) {
            //    if (cmd === 'update') {
            //        update();
            //    }
            //    else {
            //        if (!proxy) return;
            //        if (cmd !== 'select' && cmd !== 'unselect') return;
            //        var f = cmd === 'select';
            //        proxy.setSelected(f);

            //        var controller = proxy.getController();
            //        var parent = controller.getParent().getParent();
            //        if (parent) {
            //            var nc = 0, ns = 0;
            //            me.getProxies().forEach(function (p) {
            //                if (p.getController().getParent().getParent() === parent) {
            //                    nc++;
            //                    if (p.getSelected()) ns++;
            //                }
            //            });

            //            var pproxy = me.getLogicalParent(proxy);
            //            if (ns === 0) {
            //                pproxy.setSelected(false);
            //            }
            //            else if (ns === nc) {
            //                pproxy.setSelected(true);
            //            }
            //            else {
            //                pproxy.setSelected(null);
            //            }
            //        }
            //        else {
            //            me.getProxies().forEach(function (p) {
            //                if (p.getController().getParent().getParent() === controller) p.setSelected(f);
            //            });
            //        }
            //    }
            //}
            return me;
        }

        /*
        managers.base = function (Nmax) {

            function SelProxy(controller) {
                var sp = {}, sel = false, old = false;
                sp.getController = function () { return controller; }
                sp.getIndeterminate = function () { return sel == null; }
                sp.getSelected = function () { return sel; }
                sp.setSelected = function (v) {
                    if (sel !== v) {
                        sel = v;
                        sp._change && sp._change(sel);
                        sp.change && sp.change(sel);
                        me.notify && me.notify();
                    }
                }

                sp.hasChanged = function () {
                    var f = sel !== old;
                    old = sel;
                    return f;
                }

                sp._change = sp.change = null;
                sp.dispose = function () { }
                return sp;
            }

            var me = {}, proxies = [], map = {};
            me.maxCount = function () { return Nmax; }
            me.notify = null;

            me.hasChanged = function () {
                var chg = false;
                proxies.forEach(function (p) {
                    if (p.hasChanged()) chg = true;
                });
                return chg;
            }

            me.getSelected = function (sel) {
                if ($.isFunction(sel)) {
                    proxies.forEach(function (p) {
                        if (p.getSelected()) sel(p);
                    });
                }
                else {
                    var sa = [];
                    proxies.forEach(function (p) {
                        if (p.getSelected()) sa.push(p.getController().getData());
                    });
                    return sa;
                }
            }

            me.setSelected = function (sel) {
                if ($.isFunction(sel)) {
                    proxies.forEach(function (p) {
                        p.setSelected(sel(p));
                    });
                    me.command('update');
                }
                else if ($.isArray(sel)) {
                    proxies.forEach(function (p) {
                        p.setSelected(sel.indexOf(p.getController().getData()) >= 0);
                    });
                    me.command('update');
                }
            }

            me.getProxies = function () {
                return proxies.slice(0);
            }

            me.getProxy = function (controller) {
                return controller && map[controller.getUid()];
            }

            me.getLogicalParent = function (proxy) {
                return me.getProxy(proxy.getController().getParent().getParent());
            }

            me.bindController = function (controller, ckel) {
                var proxy = SelProxy(controller);
                proxies.push(proxy);
                map[controller.getUid()] = proxy;
                proxy._change = function () {
                    var ck = ckel.data('auCheckBox');
                    if (ck) {
                        if (proxy.getIndeterminate()) {
                            ck.setStatus('indeterminate');
                        }
                        else {
                            ck.setStatus(proxy.getSelected() ? 'checked' : 'unchecked');
                        }
                    }
                    controller.selectionChanged(proxy.getSelected());
                }
                proxy._change();

                ckel.on('click', function (e) {
                    e.stopPropagation();
                    var ck = $(this).data('auCheckBox');
                    switch (ck.getStatus()) {
                        case 'checked': me.command('select', proxy); break;
                        case 'unchecked': me.command('unselect', proxy); break;
                        case 'indeterminate': me.command('indeterminate', proxy); break;
                    }
                });

                return proxy;
            }


            me.command = function (cmd, proxy) {
                console.log(cmd);
                switch (cmd) {
                    case 'clear':
                        proxies.length = 0;
                        map = {};
                        break;

                    case 'none':
                        proxies.forEach(function (p) { p.setSelected(false); })
                        break;

                    case 'all':
                        proxies.forEach(function (p) { p.setSelected(true); })
                        break;

                    default:
                        me.xcommand && me.xcommand(cmd, proxy);
                }
            }

            return me;
        }


        managers.none = function () {
            var me = managers.base(0);
            return me;
        }


        managers.single = function () {
            var me = managers.base(1);
            me.xcommand = function (cmd, proxy) {
                if (cmd === 'update') return;
                me.command('none');
                if (cmd === 'panel' || cmd === 'select') {
                    proxy && proxy.setSelected(true);
                }
            }
            return me;
        }


        managers.multi = function () {
            var me = managers.base(1e6);
            me.xcommand = function (cmd, proxy) {
                switch (cmd) {
                    case 'panel':
                        me.command('none');
                    case 'select':
                        proxy && proxy.setSelected(true);
                        break;
                    case 'unselect':
                        proxy && proxy.setSelected(false);
                        break;
                }
            }
            return me;
        }


        managers.multimd = function () {
            function update() {
                var group = {};
                me.getProxies().forEach(function (p) {
                    var controller = p.getController(), pctl = controller.getParent().getParent();
                    var pid = pctl ? pctl.getUid() : controller.getUid();
                    var g = group[pid] = group[pid] || { nc: 0, ns: 0 };
                    if (pctl) {
                        g.nc++;
                        if (p.getSelected()) g.ns++;
                    }
                    else {
                        g.pp = p;
                    }
                });

                for (var k in group) {
                    var g = group[k];
                    if (g.ns === 0) {
                        g.pp.setSelected(false);
                    }
                    else if (g.ns === g.nc) {
                        g.pp.setSelected(true);
                    }
                    else {
                        g.pp.setSelected(null);
                    }
                }
            }

            var me = managers.base(1e6);
            me.xcommand = function (cmd, proxy) {
                if (cmd === 'update') {
                    update();
                }
                else {
                    if (!proxy) return;
                    if (cmd !== 'select' && cmd !== 'unselect') return;
                    var f = cmd === 'select';
                    proxy.setSelected(f);

                    var controller = proxy.getController();
                    var parent = controller.getParent().getParent();
                    if (parent) {
                        var nc = 0, ns = 0;
                        me.getProxies().forEach(function (p) {
                            if (p.getController().getParent().getParent() === parent) {
                                nc++;
                                if (p.getSelected()) ns++;
                            }
                        });

                        var pproxy = me.getLogicalParent(proxy);
                        if (ns === 0) {
                            pproxy.setSelected(false);
                        }
                        else if (ns === nc) {
                            pproxy.setSelected(true);
                        }
                        else {
                            pproxy.setSelected(null);
                        }
                    }
                    else {
                        me.getProxies().forEach(function (p) {
                            if (p.getController().getParent().getParent() === controller) p.setSelected(f);
                        });
                    }
                }
            }
            return me;
        }
        */

        return managers;
    })();


    return NS;

})(jQuery);
