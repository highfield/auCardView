
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
        showSearch: true,
        showSort: true,
        showPage: true,
        selectMode: 'none',
        pageSize: 15
    };


    function searchController(owner, row) {
        function build() {
            var cell = $('<div>').addClass('input-group').appendTo(cctr);
            var gclear = $('<span>').addClass('input-group-btn').appendTo(cell);
            var bclear = $('<button>').addClass('btn btn-default').attr('type', 'button').appendTo(gclear);
            $('<span>').addClass('glyphicon glyphicon-remove').appendTo(bclear);

            var input = $('<input>').addClass('form-control').attr({
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

        var me = {}, vis = false, tfind;
        var cctr = $('<div>').appendTo(row);
        var deferrer = Deferrer(search, 700);

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                deferrer.release();
                if (vis) {
                    build();
                }
                else {
                    cctr.empty();
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
        }

        me._arrange = function () {
        }

        return me;
    }


    function sortController(owner, row) {
        function build() {
            var cell = $('<div>').addClass('btn-group').css('float', 'right').appendTo(cctr);
            var bselect = $('<button>').addClass('btn btn-default dropdown-toggle').attr({
                type: 'button',
                'data-toggle': 'dropdown',
                'aria-haspopup': true,
                'aria-expanded': false
            }).appendTo(cell);
            bselect.text('Action');
            $('<span>').addClass('caret').appendTo(bselect);

            var ul = $('<ul>').addClass('dropdown-menu').appendTo(cell);
            for (var i = 0; i < 5; i++) {
                var li = $('<li>').appendTo(ul);
                $('<a>').attr('href', '#').text('Link #' + i).appendTo(li);
            }
        }

        var me = {}, vis = false;
        var cctr = $('<div>').appendTo(row);

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                if (vis) {
                    build();
                }
                else {
                    cctr.empty();
                }
                owner.refresh();
            }
        }

        me._buildParams = function (params) {
        }

        me._measure = function () {
        }

        me._arrange = function () {
        }

        return me;
    }


    function pageController(owner, row) {
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
            if (reliable) {
                $('<div>').text('Page ' + (index + 1) + ' of ' + count).appendTo(pcell);
            }
        }

        function build() {
            var bcell = $('<div>').addClass('col-lg-8').attr('aria-label', 'Page navigation').appendTo(cctr);
            bctr = $('<ul>').addClass('pagination').appendTo(bcell);

            pcell = $('<div>').addClass('col-lg-4').appendTo(cctr);
        }

        var me = {}, vis = false, bctr, pcell;
        var index, count, total, reliable = false, reqix = 0;
        var cctr = $('<div>').appendTo(row);

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                reliable = false;
                index = 0;
                count = 1;
                if (vis) {
                    build();
                    update();
                }
                else {
                    cctr.empty();
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
        }

        me._arrange = function () {
        }

        return me;
    }


    function selectionController(owner, row) {
        var me = {}, mode='none';

        function build() {
            //var bcell = $('<div>').addClass('col-lg-8').attr('aria-label', 'Page navigation').appendTo(cctr);
            //bctr = $('<ul>').addClass('pagination').appendTo(bcell);

            //pcell = $('<div>').addClass('col-lg-4').appendTo(cctr);
        }

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


            }
        }

        me._measure = function () {
        }

        me._arrange = function () {
        }

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
            try {
                var i = 0;
                for (; i < items.length; i++) {
                    var ctr;
                    if (i >= children.length) {
                        ctr = $('<div>').appendTo(mrow);
                    }
                    else {
                        ctr = $(children[i]);
                        ctr.empty();
                    }
                    me.options.itemViewBuilder(ctr, items[i]);
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
            mrow.css('min-height', mrow.height());

            var params = {};
            ctlSearch._buildParams(params);
            ctlSort._buildParams(params);
            ctlPage._buildParams(params, dirty);
            dirty = false;

            $.when(me.options.loader(params))
                .then(function (data) {
                    //alert(data.count);
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
            //header
            var hh
        }

        var me = {}, ctlSearch, ctlSort, ctlPage, ctlSelect, mrow, dirty;
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

            var hrow = $('<div>').addClass('row auCardView-header').appendTo(mainctr);
            ctlSelect = selectionController(me, hrow);
            ctlSelect.setVisible(me.options.showSearch);

            ctlSearch = searchController(me, hrow);
            ctlSearch.setVisible(me.options.showSearch);

            ctlSort = sortController(me, hrow);
            ctlSort.setVisible(me.options.showSort);

            mrow = $('<div>').addClass('row auCardView-body').appendTo(mainctr);

            var frow = $('<div>').addClass('row auCardView-footer').appendTo(mainctr);
            ctlPage = pageController(me, frow);
            ctlPage.setVisible(me.options.showPage);
        };

        me.refresh = function (d) {
            if (d) dirty = true;
            deferrer.trigger();
        }

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

    function itemViewBuilder(ctr, item) {
        var panel = $('<panel>').addClass('panel panel-default auCardView-card').appendTo(ctr);
        var hdr = $('<div>').addClass('panel-heading').appendTo(panel);
        var title = $('<h4>').addClass('panel-title').appendTo(hdr);
        $('<input>').attr({ type: 'checkbox' }).css({ 'margin-right': 20 }).appendTo(title);
        var a = $('<a>').attr({
            'data-toggle': 'collapse',
            href: '#collapse_' + item.id,
            'aria-expanded': false,
            'aria-controls': 'collapse_' + item.id
        }).appendTo(title);
        $('<i>').addClass('fa fa-bath').attr('aria-hidden', true).appendTo(a);
        $('<span>').text(item.nome + ' (' + item.sigla_automobilistica + ')').appendTo(a);

        var exp = $('<div>').addClass('collapse').attr('id', 'collapse_' + item.id).appendTo(panel);
        var body = $('<div>').addClass('panel-body panel-default auCardView-card-body').appendTo(exp);
        $('<h6>').addClass('card-subtitle mb-2 text-muted').text(item.regione).appendTo(body);
        $('<p>').addClass('card-text').text("Coordinate: long=" + item.longitudine + "; lat=" + item.latitudine).appendTo(body);
        $('<a>').addClass('card-link').attr({
            'href': 'http://maps.google.com/maps?q=' + item.latitudine + ',' + item.longitudine,
            'target': '_blank'
        }).text('Apri mappa...').appendTo(body);
        //return panel;
    }


    $("#grid-basic").bootgrid({});

    var options1 = {
        loader: loader,
        itemViewBuilder: itemViewBuilder
    };
    $('#cv1').auCardView(options1);
    var cv1 = $('#cv1').data('auCardView');

    cv1.refresh();
    //var api = t.data('auCardView');

    //$.getJSON("citta", function (data) {
    //    var list = [];
    //    $.each(data.items, function (i, d) {
    //        var tr = $('<tr>');
    //        $('<td>').text(d.id).appendTo(tr);
    //        $('<td>').text(d.nome).appendTo(tr);
    //        $('<td>').text(d.sigla_automobilistica).appendTo(tr);
    //        $('<td>').text(d.latitudine).appendTo(tr);
    //        $('<td>').text(d.longitudine).appendTo(tr);
    //        list.push(tr);
    //    });
    //    api.grid.append(list);
    //});
});
