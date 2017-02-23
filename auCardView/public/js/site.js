
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
        pageSize: 15
    };


    function searchController(owner, ctr) {
        function build() {
            var cell = $('<div>').addClass('input-group').appendTo(ctr);
            var gclear = $('<span>').addClass('input-group-btn').appendTo(cell);
            var bclear = $('<button>').addClass('btn btn-default').attr('type', 'button').appendTo(gclear);
            $('<span>').addClass('glyphicon glyphicon-remove').appendTo(bclear);

            $('<input>').addClass('form-control').attr({
                type: 'text',
                placeholder: 'Search for...'
            }).appendTo(cell);

            var gsearch = $('<span>').addClass('input-group-btn').appendTo(cell);
            var bsearch = $('<button>').addClass('btn btn-default').attr('type', 'button').appendTo(gsearch);
            $('<span>').addClass('glyphicon glyphicon-search').appendTo(bsearch);
        }

        var me = {}, vis = false;

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                if (vis) {
                    build();
                }
                else {
                    ctr.empty();
                }
            }
        }

        return me;
    }


    function sortController(owner, ctr) {
        function build() {
            var cell = $('<div>').addClass('btn-group').css('float', 'right').appendTo(ctr);
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

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                if (vis) {
                    build();
                }
                else {
                    ctr.empty();
                }
            }
        }

        return me;
    }


    function pageController(owner, ctr) {
        function build() {
            var bcell = $('<div>').addClass('col-lg-8').attr('aria-label', 'Page navigation').appendTo(ctr);
            var ul = $('<ul>').addClass('pagination').appendTo(bcell);

            var pcell = $('<div>').addClass('col-lg-4').appendTo(ctr);
        }

        var me = {}, vis = false;

        me.getVisible = function () { return vis; }
        me.setVisible = function (v) {
            v = !!v;
            if (vis !== v) {
                vis = v;
                if (vis) {
                    build();
                }
                else {
                    ctr.empty();
                }
            }
        }

        return me;
    }


    function AuCardView() {
        //function buildSearchCell(col) {
        //    var cell = $('<div>').addClass('input-group').appendTo(col);
        //    var gclear = $('<span>').addClass('input-group-btn').appendTo(cell);
        //    var bclear = $('<button>').addClass('btn btn-default').attr('type', 'button').appendTo(gclear);
        //    $('<span>').addClass('glyphicon glyphicon-remove').appendTo(bclear);

        //    $('<input>').addClass('form-control').attr({
        //        type: 'text',
        //        placeholder: 'Search for...'
        //    }).appendTo(cell);

        //    var gsearch = $('<span>').addClass('input-group-btn').appendTo(cell);
        //    var bsearch = $('<button>').addClass('btn btn-default').attr('type', 'button').appendTo(gsearch);
        //    $('<span>').addClass('glyphicon glyphicon-remove').appendTo(bsearch);
        //}

        var me = {}, ctlSearch, ctlSort, ctlPage, mrow;

        me.getSearchController = function () { return ctlSearch; }
        me.getSortController = function () { return ctlSort; }
        me.getPageController = function () { return ctlPage; }

        me.init = function (options, elem) {
            me.$elem = $(elem);
            me.options = $.extend({}, $.fn.auCardView.options, options);
            me.overrideOptions();

            me.$elem.addClass('auCardView');
            var mainctr = $("<div>").addClass('container-fluid').appendTo(me.$elem);

            var hrow = $('<div>').addClass('row').appendTo(mainctr);
            ctlSearch = searchController(me, $('<div>').addClass('col-lg-8').appendTo(hrow));
            ctlSearch.setVisible(me.options.showSearch);

            ctlSort = sortController(me, $('<div>').addClass('col-lg-4').appendTo(hrow));
            ctlSort.setVisible(me.options.showSort);

            mrow = $('<div>').addClass('row auCardView-body').appendTo(mainctr);

            var frow = $('<div>').addClass('row').appendTo(mainctr);
            ctlPage = pageController(me, frow);
            ctlPage.setVisible(me.options.showPage);
        };

        me.overrideOptions = function () {
            $.each(me.options, function ($option) {
                //if (typeof (self.$elem.data('jqtile-' + $option)) != "undefined") {
                //    self.options[$option] = self.$elem.data('jqtile-' + $option);
                //}
            });
        };

        me.refresh = function () {
            $.when(me.options.loader({}))
                .then(function (data) {
                    //alert(data.count);
                    mrow.empty();
                    data.items.forEach(function (item) {
                        var vi = me.options.itemViewBuilder(item);
                        mrow.append(vi);
                    });
                },
                function (err) {
                    alert(err);
                });
        }

        return me;
    }
    //init: function (options, elem) {
    //    var self = this;
    //    //self.elem = elem;
    //    self.$elem = $(elem);
    //    self.options = $.extend({}, $.fn.auCardView.options, options);
    //    self.overrideOptions();

    //    var $ctr = $("<div>").appendTo(self.$elem);
    //},

    //overrideOptions: function () {
    //    var self = this;
    //    $.each(self.options, function ($option) {
    //        //if (typeof (self.$elem.data('jqtile-' + $option)) != "undefined") {
    //        //    self.options[$option] = self.$elem.data('jqtile-' + $option);
    //        //}
    //    });
    //},
    //};


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

    function itemViewBuilder(item) {
        var panel = $('<panel>').addClass('panel panel-default');
        var hdr = $('<div>').addClass('panel-heading').appendTo(panel);
        var title = $('<h4>').addClass('panel-title').appendTo(hdr);
        var a = $('<a>').attr({
            'data-toggle': 'collapse',
            href: '#collapse_' + item.id,
            'aria-expanded': false,
            'aria-controls': 'collapse_' + item.id
        }).appendTo(title);
        $('<i>').addClass('fa fa-bath').attr('aria-hidden', true).appendTo(a);
        a.text('Card title');

        var exp = $('<div>').addClass('collapse').attr('id', 'collapse_' + item.id).appendTo(panel);
        var body = $('<div>').addClass('panel-body').appendTo(exp);
        $('<h6>').addClass('card-subtitle mb-2 text-muted').text('Card subtitle').appendTo(body);
        $('<p>').addClass('card-text').text("Some quick example text to build on the card title and make up the bulk of the card's content.").appendTo(body);
        $('<a>').addClass('card-link').attr('href', '#').text('Card link').appendTo(body);
        $('<a>').addClass('card-link').attr('href', '#').text('Another link').appendTo(body);
        return panel;
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
