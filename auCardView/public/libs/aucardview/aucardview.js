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


(function ($) {
    "use strict";

    $.fn.auCardView = function (options) {
        return this.each(function () {
            var obj = AuCardView();
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
        controller: null,
        panelViewUpdater: null,
        panelClickEnabled: true,
        selectionBorderColor: 'transparent',
        panelHeaderCSS: null,
        panelXHeaderCSS: null
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
                v = AuCardViewSelectionManager[v]();
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

            if (owner.options.panelClickEnabled) {
                panel.on('click', function (e) {
                    var mgr = owner.getSelectionController().getManager();
                    mgr && mgr.command('panel', selector);
                });
            }
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

        function update() {
            var mgr = owner.getSelectionController().getManager();
            var canSelect = selector && mgr && mgr.maxCount() > 0;
            if (canSelect !== cached.canSelect) {
                pselect.empty();
                if (canSelect) {
                    pselect.auCheckBox();
                    pselect.find('span').css({
                        'position': 'absolute',
                        'left': 10,
                        'top': 10,
                        'font-size': '1.2em',
                    });
                    mgr.bindCheckBox(pselect, selector);
                }
                cached.canSelect = canSelect;
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

        function updatePanelSelection() {
            if (selector && owner.options.selectionBorderColor) {
                panel.parent().css('border-color', selector.getSelected() ? owner.options.selectionBorderColor : 'transparent');
            }
        }

        var me = {}, uid = uidgen(), cached = {}, xheader, header, body, selector;
        var panel, ptitle, pbody, pselect, pxhdr, phdr;
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

        me.getSelector = function () { return selector; }
        me.setSelector = function (v) {
            selector = v;
            if (selector) {
                selector.change = updatePanelSelection;
            }
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
            var selmgr = ctlSelect.getManager();
            if (selmgr) selmgr.command('clear');
            var selectable = selmgr && (me.options.selectable != null ? !!me.options.selectable : true);

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
                    if (selectable) p.setSelector(selmgr.createProxy(dataItem));
                    panels.push(p);
                    me.options.panelViewUpdater && me.options.panelViewUpdater(me, p, dataItem);
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
                        if (!run1) {
                            run1 = true;
                            me.$elem.trigger('init');
                        }
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

        var me = {}, ctlSearch, ctlSort, ctlPage, ctlSelect, hrow, mrow, frow, dirty = true, run1, panels = [], spinLayer;
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
            ctlSelect.setManager(me.options.selectionManager);

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


var AuCardViewSelectionManager = (function () {
    "use strict";

    var managers = {};

    managers.base = function (Nmax) {

        function SelProxy(data) {
            var sp = {}, sel = false, old = false;
            sp.getData = function () { return data; }
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

        var me = {}, proxies = [];
        me.maxCount = function () { return Nmax; }
        me.notify = null;

        me.hasChanged = function () {
            var chg = false;
            proxies.forEach(function (p) {
                if (p.hasChanged()) chg = true;
            });
            return chg;
        }

        me.getSelected = function () {
            var sa = [];
            proxies.forEach(function (p) {
                if (p.getSelected()) sa.push(p.getData());
            });
            return sa;
        }

        me.setSelected = function (sel) {
            if (_.isFunction(sel)) {
                proxies.forEach(function (p) {
                    p.setSelected(sel(p));
                });
            }
            else if (_.isArray(sel)) {
                proxies.forEach(function (p) {
                    p.setSelected(sel.indexOf(p.getData()) >= 0);
                });
            }
        }

        me.createProxy = function (data) {
            var sp = SelProxy(data);
            proxies.push(sp);
            return sp;
        }

        me.getProxies = function () {
            return proxies.slice(0);
        }

        me.bindCheckBox = function (ckel, proxy) {
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
        }


        me.command = function (cmd, proxy) {
            console.log(cmd);
            switch (cmd) {
                case 'clear':
                    proxies.length = 0;
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
        var me = managers.base(1e6);
        me.xcommand = function (cmd, proxy) {
            if (!proxy) return;
            if (cmd !== 'select' && cmd !== 'unselect') return;
            var f = cmd === 'select';
            proxy.setSelected(f);

            if (proxy.parent) {
                var nc = 0, ns = 0;
                me.getProxies().forEach(function (p) {
                    if (p.parent === proxy.parent) {
                        nc++;
                        if (p.getSelected()) ns++;
                    }
                });

                if (ns === 0) {
                    proxy.parent.setSelected(false);
                }
                else if (ns === nc) {
                    proxy.parent.setSelected(true);
                }
                else {
                    proxy.parent.setSelected(null);
                }
            }
            else {
                me.getProxies().forEach(function (p) {
                    if (p.parent === proxy) p.setSelected(f);
                });
            }
        }
        return me;
    }

    return managers;
})();
