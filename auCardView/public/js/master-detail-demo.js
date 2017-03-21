;
var MasterDetailDemo = (function ($) {
    "use strict";

    var controller = (function () {
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


    //function OLD_panelViewUpdater(owner, panel, data) {
    //    var selmgr = owner.getSelectionController().getManager();

    //    var xhdr = $('<div>');
    //    $('<span>').text(data.nome).appendTo(xhdr);
    //    panel.setXHeader(xhdr);

    //    var body = $('<div>');
    //    var tbl = $('<table>').addClass('table table-condensed').appendTo(body);
    //    var th = $('<thead>').appendTo(tbl);
    //    var tr = $('<tr>').appendTo(th);
    //    $('<th>').text('').attr('width', '10%').appendTo(tr);
    //    $('<th>').text('Città').attr('width', '60%').appendTo(tr);
    //    $('<th>').text('Sigla').attr('width', '30%').appendTo(tr);

    //    var tb = $('<tbody>').appendTo(tbl);
    //    data.citta.forEach(function (c) {
    //        tr = $('<tr>').appendTo(tb);
    //        var tc1 = $('<td>').appendTo(tr);
    //        $('<td>').text(c.nome).appendTo(tr);
    //        $('<td>').text(c.sigla).appendTo(tr);

    //        var $ck = $('<div>').css({
    //            'font-size': '1.2em'
    //        }).appendTo(tc1);
    //        $ck.auCheckBox();

    //        var sp = selmgr.createProxy(c);
    //        sp.parent = panel.getSelector();
    //        selmgr.bindCheckBox($ck, sp);
    //    });

    //    panel.setBody(body);
    //}


    function masterOptions() {
        var o = {};

        o.updater = function (owner, parent, gen, dataItems) {
            var result = [];
            dataItems.forEach(function (di) {
                var vm = AuCardView.ViewElement.panelController(owner, parent, gen.next(), di);

                var xhdr = $('<div>');
                $('<span>').text(di.nome).appendTo(xhdr);
                vm.setXHeader(xhdr);

                var lc = AuCardView.ViewElement.listController(owner, parent, $('<div>'), detailOptions());
                lc.setDataItems(di.citta);
                vm.setBody(lc);

                result.push(vm);
            });
            return result;
        }

        return o;
    }


    function detailOptions() {
        var o = {};

        o.builder = function (container) {
            var tbl = $('<table>').addClass('table table-condensed').appendTo(container);
            var th = $('<thead>').appendTo(tbl);
            var tr = $('<tr>').appendTo(th);
            $('<th>').text('').attr('width', '10%').appendTo(tr);
            $('<th>').text('Città').attr('width', '60%').appendTo(tr);
            $('<th>').text('Sigla').attr('width', '30%').appendTo(tr);
            var tb = $('<tbody>').appendTo(tbl);
            return tb;
        }

        o.template = function () {
            return $('<tr>');
        }

        o.updater = function (owner, parent, gen, dataItems) {
            var result = [];
            dataItems.forEach(function (di) {
                var vm = AuCardView.ViewElement.tableRowController(owner, parent, gen.next(), di);
                result.push(vm);
            });
            return result;
        }

        return o;
    }


    //function masterUpdater(owner, gen, dataItems) {
    //    var result = [];
    //    dataItems.forEach(function (di) {
    //        var vm = AuCardView.ViewElement.panelController(owner, gen.next(), di);

    //        var xhdr = $('<div>');
    //        $('<span>').text(di.nome).appendTo(xhdr);
    //        vm.setXHeader(xhdr);

    //        var lc = AuCardView.ViewElement.listController(owner, $('<div>'), detailOptions());
    //        lc.setDataItems(di.citta);
    //        vm.setBody(lc);

    //        result.push(vm);
    //    });
    //    return result;
    //}
    

    var cv3;


    return function () {
        var options3 = {
            showSearch: true,
            showSort: true,
            //showPage: true,
            selectionManager: 'multimd',
            controller: controller,
            //panelViewUpdater: panelViewUpdater,
            listController: masterOptions(),
            sort: {
                active: { field: 'nome', dir: 'asc' },
                options: [
                    { field: 'nome', label: 'Nome' }
                ]
            },
            panelXHeaderCSS: {
                'margin-left': 20
            },
            selectionBorderColor: 'pink'
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
                    log.push('selected=' + e.selected[0].nome);
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
            var reg1 = "Lombardia", reg2 = "Lazio";
            var selmgr = cv3.getSelectionController().getManager();
            selmgr.setSelected(function (p) {
                if (p.parent) {
                    return p.getData().nome[0] === 'P' || p.parent.getData().nome === reg1 || p.parent.getData().nome === reg2;
                }
                else {
                    return p.getData().nome === reg1 || p.getData().nome === reg2;
                }
            });
        });

        $('#bmdsel1').on('click', function () {
            var reg = "Veneto";
            var selmgr = cv3.getSelectionController().getManager();
            selmgr.setSelected(function (p) {
                if (p.parent) {
                    return p.getData().nome[0] === 'A' || p.parent.getData().nome === reg;
                }
                else {
                    return p.getData().nome === reg;
                }
            });
        });
    }

})(jQuery);
