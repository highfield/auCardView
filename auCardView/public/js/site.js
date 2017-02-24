
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
            var cell = $('<div>').addClass('input-group').appendTo(cctr);
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
                owner.refresh(true);
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
            owner.refresh(true);
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
                tfind = input = null;
                if (vis) {
                    cctr.css('display', '');
                    build();
                }
                else {
                    cctr.empty();
                    cctr.css('display', 'none');
                }
                owner.refresh(true);
            }
        }

        me._buildParams = function (params) {
            if (vis && tfind && tfind.length) {
                params.find = tfind;
            }
        }

        me._measure = function () {
            return vis ? cctr.width() : 0;
        }

        me._arrange = function (l, w) {
            cctr.css({ left: l, width: w });
        }

        return me;
    }


    function sortController(owner, row) {
        function build() {
            var cell = $('<div>').addClass('btn-group').appendTo(cctr);
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
            owner.refresh(true);
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
                owner.refresh(true);
            }
        }

        me._buildParams = function (params) {
            if (reqSetting) {
                params.sort = reqSetting;
            }
        }

        me._update = function (info) {
            if (!info.sort) return;
            activeField = info.sort.field;
            activeDir = info.sort.dir === 'desc' ? 'desc' : 'asc';
            update();
        }

        me._measure = function () {
            return vis ? cctr.width() : 0;
        }

        me._arrange = function (l, w) {
            cctr.css({ left: l, width: w });
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
                params.page = {
                    index: reqix,
                    size: owner.options.pageSize
                }
            }
        }

        me._update = function (info) {
            if (!vis || !info || !info.page) return;
            index = +info.page.index;
            count = Math.max(+info.page.count, 1);
            total = +info.count;
            reliable = true;
            update();
        }

        me._measure = function () {
            return vis ? cctr.width() : 0;
        }

        me._arrange = function (l, w) {
            cctr.css({ left: l, width: w });
        }

        return me;
    }


    function selectionController(owner, row, panels) {
        function build() {
            var bcell = $('<div>').appendTo(cctr);
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

        var me = {}, mode = 'none', btn, reqaction = 'all';
        var cctr = $('<div>').addClass('auCardView-toolbar-cell').appendTo(row);

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

        me._selChanged = function (psrc) {
            if (mode === 'single') {
                if (psrc.getSelected()) {
                    panels.forEach(function (p) {
                        if (p !== psrc) p.setSelected(false);
                    });
                }
            }
        }

        me._measure = function () {
            return (mode === 'multi') ? cctr.width() : 0;
        }

        me._arrange = function (l, w) {
            cctr.css({ left: l, width: w });
        }

        return me;
    }


    function panelItemController(owner, row, data) {
        function build() {
            panel = $('<panel>').addClass('panel panel-default auCardView-card-panel').appendTo(row);
            var hdr = $('<div>').addClass('panel-heading').appendTo(panel);
            ptitle = $('<h4>').addClass('panel-title').appendTo(hdr);
            pselect = $('<div>').css('display', 'inline-block').appendTo(ptitle);
            pxhdr = $('<div>').css('display', 'inline-block').appendTo(ptitle);
            phdr = $('<div>').appendTo(ptitle);
            //var a = $('<a>').attr({
            //    'data-toggle': 'collapse',
            //    href: '#collapse_' + item.id,
            //    'aria-expanded': false,
            //    'aria-controls': 'collapse_' + item.id
            //}).appendTo(title);
            //$('<i>').addClass('fa fa-bath').attr('aria-hidden', true).appendTo(a);
            //$('<span>').text(item.nome + ' (' + item.sigla_automobilistica + ')').appendTo(a);

            var exp = $('<div>').attr('id', 'collapse_' + uid).appendTo(panel);
            pbody = $('<div>').addClass('panel-body panel-default auCardView-card-body').appendTo(exp);
            //$('<h6>').addClass('card-subtitle mb-2 text-muted').text(item.regione).appendTo(body);
            //$('<p>').addClass('card-text').text("Coordinate: long=" + item.longitudine + "; lat=" + item.latitudine).appendTo(body);
            //$('<a>').addClass('card-link').attr({
            //    'href': 'http://maps.google.com/maps?q=' + item.latitudine + ',' + item.longitudine,
            //    'target': '_blank'
            //}).text('Apri mappa...').appendTo(body);
        }

        function update() {
            var canSelect = selectable && globalSelectable();
            if (canSelect !== cached.canSelect) {
                pselect.empty();
                if (canSelect) {
                    $('<input>').attr({ type: 'checkbox' }).css({ 'margin-right': 20 }).appendTo(pselect).on('change', function () {
                        me.setSelected($(this).prop('checked'));
                    });
                }
                cached.canSelect = canSelect;
            }

            if (selected !== cached.selected) {
                var inp = pselect.children('input');
                if (inp.length) inp.prop('checked', selected);
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
        var selected = false, selectable = false, collapsed = false, collapsible = false, cached = {};
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

        build();
        return me;
    }


    function Deferrer(callback, delay) {
        var me = {}, tmr;

        me.trigger = function () {
            if (tmr) return;
            tmr = setTimeout(callback, delay);
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
                    var p = panelItemController(me, ctr, items[i]);
                    panels.push(p);
                    me.options.panelViewUpdater && me.options.panelViewUpdater(p, items[i]);
                    //me.options.itemViewBuilder(ctr, items[i]);
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

        function updater() {
            resize();
            mrow.css('min-height', mrow.height());

            var params = {};
            ctlSearch._buildParams(params);
            ctlSort._buildParams(params);
            ctlPage._buildParams(params, dirty);
            dirty = false;

            $.when(me.options.loader(params))
                .then(function (data) {
                    //alert(data.count);
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
                    //TODO
                    deferrer.release();
                });
        }


        function resize() {
            if (!mrow) return;
            var wrow = mrow.width(), margin = 10;

            //header
            var l = 0;
            var wl = ctlSelect._measure();
            var ws = ctlSearch._measure();
            var wr = ctlSort._measure();
            if (wl) {
                ctlSelect._arrange(l, wl);
                l += margin;
            }
            if (ws) {
                ws = wrow;
                if (wl) ws -= wl + margin;
                if (wr) ws -= wr + margin;
                ws = Math.min(200, ws);
                ctlSearch._arrange(l, ws);
            }
            if (wr) {
                l = wrow - wr;
                if (wl) l -= wl;
                if (ws) l -= ws;
                ctlSort._arrange(l, wr);
            }

            //footer
            ctlPage._arrange(0, wrow);
        }

        $(window).on('resize', resize);

        var me = {}, ctlSearch, ctlSort, ctlPage, ctlSelect, hrow, mrow, frow, dirty = true, panels = [];
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

            mrow = $('<div>').addClass('row auCardView-body').appendTo(mainctr);

            frow = $('<div>').addClass('row auCardView-footer').appendTo(mainctr);
            ctlPage = pageController(me, frow);
            ctlPage.setVisible(me.options.showPage);
        };

        me.refresh = function (d) {
            if (d) dirty = true;
            deferrer.trigger();
        }

        me.refresh(true);
        return me;
    }

})(jQuery);


$(function () {

    function loader(params) {
        var d = $.Deferred();

        $.getJSON("citta", params)
            .done(function (data) {
                d.resolve(data);
            }).fail(function (err) {
                d.reject(err);
            });

        return d.promise();
    }


    function panelViewUpdater(panel, data) {
        var xhdr = $('<div>');
        $('<i>').addClass('fa fa-bath').attr('aria-hidden', true).appendTo(xhdr);
        $('<span>').text(data.nome + ' (' + data.sigla_automobilistica + ')').appendTo(xhdr);
        panel.setXHeader(xhdr);

        var body = $('<div>');
        $('<h6>').addClass('card-subtitle mb-2 text-muted').text(data.regione).appendTo(body);
        $('<p>').addClass('card-text').text("Coordinate: long=" + data.longitudine + "; lat=" + data.latitudine).appendTo(body);
        $('<a>').addClass('card-link').attr({
            'href': 'http://maps.google.com/maps?q=' + data.latitudine + ',' + data.longitudine,
            'target': '_blank'
        }).text('Apri mappa...').appendTo(body);
        panel.setBody(body);

        if (demoCardCollapsible) panel.setCollapsible(regionArea[data.regione] !== 'nord');
        if (demoCardCollapsed) panel.setCollapsed(regionArea[data.regione] !== 'centro');
        if (demoCardSelectable) panel.setSelectable(regionArea[data.regione] !== 'sud');
    }


    $("#grid-basic").bootgrid({});

    var options1 = {
        //showSearch: true,
        //showSort: true,
        //showPage: true,
        //selectMode: 'multi',
        loader: loader,
        panelViewUpdater: panelViewUpdater,
        sort: {
            active: { field: 'nome', dir: 'asc' },
            options: [
                { field: 'nome', label: 'Nome' }
            ]
        }
    };
    $('#cv1').auCardView(options1);
    var cv1 = $('#cv1').data('auCardView');

    $('#cv2').auCardView(options1);
    var cv2 = $('#cv2').data('auCardView');


    /**
    * demo controls
    */

    var regionArea = {
        'Abruzzo': 'sud',
        'Basilicata': 'sud',
        'Calabria': 'sud',
        'Campania': 'sud',
        'Emilia-Romagna': 'nord',
        'Friuli-Venezia Giulia': 'nord',
        'Lazio': 'centro',
        'Liguria': 'nord',
        'Lombardia': 'nord',
        'Marche': 'centro',
        'Molise': 'sud',
        'Piemonte': 'nord',
        'Puglia': 'sud',
        'Sardegna': 'sud',
        'Sicilia': 'sud',
        'Toscana': 'centro',
        'Trentino-Alto Adige/Südtirol': 'nord',
        'Umbria': 'centro',
        'Valle d\'Aosta/ Vallée d\'Aoste': 'nord',
        'Veneto': 'nord'
    }

    $('#searchbox').on('change', function () {
        var v = $(this).prop('checked');
        cv1.getSearchController().setVisible(v);
        cv2.getSearchController().setVisible(v);
    });

    $('#sortbox').on('change', function () {
        var v = $(this).prop('checked');
        cv1.getSortController().setVisible(v);
        cv2.getSortController().setVisible(v);
    });

    $('#pagerbox').on('change', function () {
        var v = $(this).prop('checked');
        cv1.getPageController().setVisible(v);
        cv2.getPageController().setVisible(v);
    });

    $('#selmode1,#selmode2,#selmode3').on('change', function () {
        var v = $('input[name=inlineRadioOptions]:checked').val();
        cv1.getSelectionController().setMode(v);
        cv2.getSelectionController().setMode(v);
    });



    var demoCardCollapsible = false;
    var demoCardCollapsed = false;
    var demoCardSelectable = false;
    var demoCardSelected = '';

    $('#card_collapsible').on('change', function () {
        var v = $(this).prop('checked');
        demoCardCollapsible = v;
        cv1.refresh();
        cv2.refresh();
    });

    $('#card_collapsed').on('change', function () {
        var v = $(this).prop('checked');
        demoCardCollapsed = v;
        cv1.refresh();
        cv2.refresh();
    });

    $('#card_selectable').on('change', function () {
        var v = $(this).prop('checked');
        demoCardSelectable = v;
        cv1.refresh();
        cv2.refresh();
    });

});
