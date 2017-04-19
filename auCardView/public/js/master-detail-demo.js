;
var MasterDetailDemo = (function ($) {
    "use strict";

    var dataController = (function () {
        var me = {};

        me.get = function (params) {
            var d = $.Deferred();
            $.getJSON("regioni", params)
                .done(function (data) {
                    d.resolve(data);
                }).fail(function (err) {
                    d.reject(err);
                });
            return d.promise();
        }

        return me;
    })();


    //function masterOptions() {
    //    var o = {};

    //    o.updater = function (owner, controller, gen) {
    //        var result = [];
    //        var items = controller.getData() || [];
    //        items.forEach(function (di) {
    //            var vm = AuCardView.ViewElement.panelController(owner, controller, gen.next());
    //            vm.setData(di);

    //            var xhdr = $('<div>');
    //            $('<span>').text(di.nome).appendTo(xhdr);
    //            vm.setXHeader(xhdr);

    //            var lc = AuCardView.ViewElement.tableController(owner, vm, $('<div>'), detailOptions());
    //            lc.setData(di.citta);
    //            vm.setBody(lc);

    //            result.push(vm);
    //        });
    //        return result;
    //    }

    //    return o;
    //}


    //function detailOptions() {
    //    var o = {};

    //    o.columns = [
    //        { selection: true },
    //        { name: 'nome', width: '60%', title: 'Città' },
    //        { name: 'sigla', width: '30%', title: 'Sigla' }
    //    ];

    //    o.updater = function (owner, controller, gen) {
    //        var result = [];
    //        var items = controller.getData() || [];
    //        items.forEach(function (di) {
    //            var vm = AuCardView.ViewElement.tableRowController(owner, controller, gen.next());
    //            vm.setData(di);
    //            result.push(vm);
    //        });
    //        return result;
    //    }

    //    return o;
    //}


    function Y() {
        var me = AuCardView.ViewElement.table();
        me.setColumns([
            { selection: true },
            { name: 'nome', width: '60%', title: 'Città' },
            { name: 'sigla', width: '30%', title: 'Sigla' }
        ]);

        me.template = function (data) {
            var vm = AuCardView.ViewElement.tableRow();
            vm.setOptions({
                selkey: data.id,
                selectionBorderColor: 'pink'
            });
            return vm;
        }

        return me;
    }


    function Z() {
        var me = AuCardView.ViewElement.list();

        me.template = function (data) {
            var vm = AuCardView.ViewElement.panel();
            vm.setOptions({
                selkey: data.id,
                panelXHeaderCSS: {
                    'margin-left': 20
                },
                selectionBorderColor: 'pink',
                panelClickEnabled: true
            });

            var xhdr = $('<div>');
            $('<span>').text(data.nome).appendTo(xhdr);
            vm.setXHeader(xhdr);

            var lc = Y();
            lc.setData(data.citta);
            vm.setBody(lc);

            return vm;
        }

        return me;
    }

    var cv3;


    return function () {
        var options3 = {
            showSearch: true,
            showSort: true,
            //showPage: true,
            selectionManager: 'multimd',
            dataController: dataController,
            //panelViewUpdater: panelViewUpdater,
            //listController: masterOptions(),
            itemsController: Z(),
            sort: {
                active: { field: 'nome', dir: 'asc' },
                options: [
                    { field: 'nome', label: 'Nome' }
                ]
            },
            //panelXHeaderCSS: {
            //    'margin-left': 20
            //},
            //selectionBorderColor: 'pink'
        };
        $('#cv3').auCardView(options3);
        cv3 = $('#cv3').data('auCardView');

        //logger
        var log = [];
        $('#cv3').on('selection', function (e) {
            switch (e.selected.length) {
                case 0:
                    log.push('selected=(none)');
                    break;
                case 1:
                    log.push('selected=' + e.selected[0]);
                    break;
                default:
                    log.push('selected=(' + e.selected.length + ' items)');
                    break;
            }
            if (log.length > 40) log.splice(0, log.length - 40);
            $('#mdlog').val(log.join('\n'));
        });

        //selection test
        $('#cv3').on('init', function (e) {
            //var reg1 = "Lombardia", reg2 = "Lazio";
            //var selmgr = cv3.getSelectionController().getManager();
            //selmgr.setSelected(function (p) {
            //    var controller = p.getController(), pp = selmgr.getLogicalParent(p);
            //    if (pp) {
            //        var pctl = pp.getController();
            //        return controller.getData().nome[0] === 'P' || pctl.getData().nome === reg1 || pctl.getData().nome === reg2;
            //    }
            //    else {
            //        return controller.getData().nome === reg1 || controller.getData().nome === reg2;
            //    }
            //});
        });

        $('#bmdsel1').on('click', function () {
            var reg = "Veneto";

            var sel = {};
            cv3.getItemsController().getControllers().forEach(function (cr) {
                cr.getBody().getControllers().forEach(function (cc) {
                    if (cr.getData().nome === reg || cc.getData().nome[0] === 'A') {
                        sel[cc.getOptions().selkey] = 1;
                    }
                });
            });

            cv3.getSelectionManager().setSelected(sel, true);
            //var reg = "Veneto";
            //var selmgr = cv3.getSelectionController().getManager();
            //selmgr.setSelected(function (p) {
            //    var controller = p.getController(), pp = selmgr.getLogicalParent(p);
            //    if (pp) {
            //        var pctl = pp.getController();
            //        return controller.getData().nome[0] === 'A' || pctl.getData().nome === reg;
            //    }
            //    else {
            //        return controller.getData().nome === reg;
            //    }
            //});
        });
    }

})(jQuery);
