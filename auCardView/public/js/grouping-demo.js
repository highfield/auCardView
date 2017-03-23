;
var GroupingDemo = (function ($) {
    "use strict";

    var dataController = (function () {
        var me = {};

        me.get = function (params) {
            var d = $.Deferred();
            $.getJSON("citta", params)
                .done(function (data) {
                    d.resolve(data);
                }).fail(function (err) {
                    d.reject(err);
                });
            return d.promise();
        }

        return me;
    })();


    function TTable(fname) {
        var columns = [
            { selection: true },
            { name: 'nome', title: 'Città' },
            { name: 'sigla_automobilistica', title: 'Sigla' }
        ];
        if (!fname) columns.push({ name: 'regione', title: 'Regione' });

        var me = AuCardView.ViewElement.table();
        me.setColumns(columns);

        me.template = function (data) {
            return AuCardView.ViewElement.tableRow();
        }

        return me;
    }


    function TCard(fname) {
        var me = AuCardView.ViewElement.list();

        me.project = function (data) {
            var group = {};
            data.forEach(function (o) {
                var g = group[o[fname]] = group[o[fname]] || [];
                g.push(o);
            });
            var result = [];
            for (var k in group) {
                result.push({ key: k, values: group[k] });
            }
            return result;
        }

        me.template = function (data) {
            var vm = AuCardView.ViewElement.panel();

            var xhdr = $('<div>');
            $('<span>').text(data.key).appendTo(xhdr);
            vm.setXHeader(xhdr);

            var lc = TTable(fname);
            lc.setData(data.values);
            vm.setBody(lc);

            return vm;
        }

        return me;
    }


    return function () {
        var options4 = {
            showSearch: true,
            showSort: true,
            showPage: true,
            selectionManager: 'multimd',
            dataController: dataController,
            //itemsController: TTable(),
            sort: {
                active: { field: 'regione', dir: 'asc' },
                options: [
                    { field: 'nome', label: 'Nome' },
                    { field: 'regione', label: 'Regione' }
                ]
            }
        };
        $('#cv4').auCardView(options4);
        var cv4 = $('#cv4').data('auCardView');


        function groupBy(fname) {
            cv4.setItemsController(TCard(fname));
        }

        function ungroup() {
            cv4.setItemsController(TTable());
        }

        ungroup();

        $('#groupby_region').on('change', function () {
            var v = $(this).prop('checked');
            v ? groupBy('regione') : ungroup();
        });
    }


})(jQuery);
