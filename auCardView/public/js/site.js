﻿
$(function () {
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


    //function panelViewUpdater(owner, panel, data) {
    //    var xhdr = $('<div>');
    //    $('<i>').addClass('fa fa-bath').attr('aria-hidden', true).appendTo(xhdr);
    //    $('<span>').text(data.nome + ' (' + data.sigla_automobilistica + ')').appendTo(xhdr);
    //    panel.setXHeader(xhdr);

    //    var body = $('<div>');
    //    $('<h6>').addClass('card-subtitle mb-2 text-muted').text(data.regione).appendTo(body);
    //    $('<p>').addClass('card-text').text("Coordinate: long=" + data.longitudine + "; lat=" + data.latitudine).appendTo(body);
    //    $('<a>').addClass('card-link').attr({
    //        'href': 'http://maps.google.com/maps?q=' + data.latitudine + ',' + data.longitudine,
    //        'target': '_blank'
    //    }).text('Apri mappa...').appendTo(body);
    //    panel.setBody(body);

    //    if (demoCardCollapsible) panel.setCollapsible(regionArea[data.regione] !== 'nord');
    //    if (demoCardCollapsed) panel.setCollapsed(regionArea[data.regione] !== 'centro');
    //    if (demoCardSelectable) panel.setSelectable(regionArea[data.regione] !== 'sud');
    //    if (demoCardColorized) panel.setPanelClass(panelShades[Math.floor(Math.random() * panelShades.length)]);
    //}

    function TT() {
        var me = AuCardView.ViewElement.list();

        me.template = function (data) {
            var vm = AuCardView.ViewElement.panel();
            vm.setOptions({
                selkey: data.id,
                panelXHeaderCSS: {
                    'margin-left': 20
                },
                selectionBorderColor: 'blue',
                panelClickEnabled: true
            });

            var xhdr = $('<div>');
            $('<i>').addClass('fa fa-bath').attr('aria-hidden', true).appendTo(xhdr);
            $('<span>').text(data.nome + ' (' + data.sigla_automobilistica + ')').appendTo(xhdr);
            vm.setXHeader(xhdr);

            var body = $('<div>');
            $('<h6>').addClass('card-subtitle mb-2 text-muted').text(data.regione).appendTo(body);
            $('<p>').addClass('card-text').text("Coordinate: long=" + data.longitudine + "; lat=" + data.latitudine).appendTo(body);
            $('<a>').addClass('card-link').attr({
                'href': 'http://maps.google.com/maps?q=' + data.latitudine + ',' + data.longitudine,
                'target': '_blank'
            }).text('Apri mappa...').appendTo(body);
            vm.setBody(body);

            if (demoCardCollapsible) vm.setCollapsible(regionArea[data.regione] !== 'nord');
            if (demoCardCollapsed) vm.setCollapsed(regionArea[data.regione] !== 'centro');
            if (demoCardColorized) vm.setPanelClass(panelShades[Math.floor(Math.random() * panelShades.length)]);

            return vm;
        }

        return me;
    }


    var options1 = {
        dataController: dataController,
        itemsController: TT(),
        sort: {
            active: { field: 'nome', dir: 'asc' },
            options: [
                { field: 'nome', label: 'Nome' }
            ]
        }
    };
    $('#cv1').auCardView(options1);
    var cv1 = $('#cv1').data('auCardView');


    var options2 = {
        dataController: dataController,
        itemsController: TT(),
        sort: {
            active: { field: 'nome', dir: 'asc' },
            options: [
                { field: 'nome', label: 'Nome' }
            ]
        }
    };
    $('#cv2').auCardView(options2);
    var cv2 = $('#cv2').data('auCardView');


    MasterDetailDemo();
    GroupingDemo();


    $('#btn_modal').on('click', function () {
        var opts = {
            showSearch: true,
            showSort: true,
            showPage: true,
            selectionManager: 'single',
            dataController: dataController,
            itemsController: TT(),
            sort: {
                active: { field: 'nome', dir: 'asc' },
                options: [
                    { field: 'nome', label: 'Nome' }
                ]
            }
        };

        var ctr = $('<div>').css({
            width: '100%',
            height: 640
        });
        ctr.auCardView(opts);
        var api = ctr.data('auCardView');

        //selection test
        var selmgr = api.getSelectionManager();
        //selmgr.setSelected('28'); //Padova

        ctr.on('init', function (e) {
            selmgr.setSelected('28', true); //Padova
            //selmgr.setSelected(function (p) {
            //    var controller = p.getController();
            //    return controller.getData().nome === 'Padova';
            //});
        });

        BootstrapDialog.show({
            title: 'My dialog',
            message: ctr,
            buttons: [{
                label: 'Close',
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }]
        });
    });



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

    var panelShades = [
        "",
        "panel-default",
        "panel-primary",
        "panel-success",
        "panel-info",
        "panel-warning",
        "panel-danger",
        "panel-custom",
    ]

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
        cv1.setSelectionManager(v);
        cv2.setSelectionManager(v);
        //cv1.getSelectionController().setManager(v);
        //cv2.getSelectionController().setManager(v);
    });



    var demoCardCollapsible = false;
    var demoCardCollapsed = false;
    //var demoCardSelectable = false;
    var demoCardColorized = false;

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

    //$('#card_selectable').on('change', function () {
    //    var v = $(this).prop('checked');
    //    demoCardSelectable = v;
    //    cv1.refresh();
    //    cv2.refresh();
    //});

    $('#card_colorized').on('change', function () {
        var v = $(this).prop('checked');
        demoCardColorized = v;
        cv1.refresh();
        cv2.refresh();
    });

    var log = [];
    $('#cv1,#cv2').on('selection', function (e) {
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
        if (log.length > 8) log.splice(0, log.length - 8);
        $('#evlog').val(log.join('\n'));
    });

});
