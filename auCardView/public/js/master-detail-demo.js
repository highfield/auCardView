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


    function binder(manager, ckel, proxy) {
        function update() {
            var ck = ckel.data('auCheckBox');
            ck.setStatus(proxy.getSelected() ? 'checked' : 'unchecked');
        }

        ckel.on('click', function (e) {
            e.stopPropagation();
            var ck = $(this).data('auCheckBox');
            switch (ck.getStatus()) {
                case 'checked': manager.command('select', proxy); break;
                case 'unchecked': manager.command('unselect', proxy); break;
            }
        });

        proxy.change = update;
        update();
    }


    function panelViewUpdater(owner, panel, data) {
        var selmgr = owner.getSelectionController().getManager();

        var xhdr = $('<div>');
        //$('<i>').addClass('fa fa-bath').attr('aria-hidden', true).appendTo(xhdr);
        $('<span>').text(data.nome).appendTo(xhdr);
        panel.setXHeader(xhdr);

        var body = $('<div>');
        var tbl = $('<table>').addClass('table table-condensed').appendTo(body);
        var th = $('<thead>').appendTo(tbl);
        var tr = $('<tr>').appendTo(th);
        $('<th>').text('').attr('width', '10%').appendTo(tr);
        $('<th>').text('Città').attr('width', '60%').appendTo(tr);
        $('<th>').text('Sigla').attr('width', '30%').appendTo(tr);

        var tb = $('<tbody>').appendTo(tbl);
        data.citta.forEach(function (c) {
            tr = $('<tr>').appendTo(tb);
            var tc1 = $('<td>').appendTo(tr);
            $('<td>').text(c.nome).appendTo(tr);
            $('<td>').text(c.sigla).appendTo(tr);

            var $ck = $('<div>').css({
                'font-size': '1.2em'
            }).appendTo(tc1);
            $ck.auCheckBox();

            var sp = selmgr.createProxy(c);
            sp.parent = panel.getSelector();
            binder(selmgr, $ck, sp);

            //$ck.on('click', function (e) {
            //    e.stopPropagation();
            //    var ck = $(this).data('auCheckBox');
            //    switch (ck.getStatus()) {
            //        case 'checked': selmgr.command('select', sp); break;
            //        case 'unchecked': selmgr.command('unselect', sp); break;
            //    }
            //});

            //var ck = $ck.data('auCheckBox');
            //ck.setStatus(sp.getSelected() ? 'checked' : 'unchecked');

        });

        panel.setBody(body);
    }


    function mdSelectionManager() {
        var me = AuCardViewSelectionManager.base(1e6);
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


    var cv3;


    return function () {
        var options3 = {
            showSearch: true,
            showSort: true,
            //showPage: true,
            selectionManager: mdSelectionManager(),
            controller: controller,
            panelViewUpdater: panelViewUpdater,
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
    }

})(jQuery);
