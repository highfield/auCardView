var express = require('express');
var _ = require('lodash');
var router = express.Router();


var regioni = [{
    "id": "13",
    "nome": "Abruzzo",
    "latitudine": 42.354008,
    "longitudine": 13.391992
}, {
        "id": "17",
        "nome": "Basilicata",
        "latitudine": 40.633333,
        "longitudine": 15.800000
    }, {
        "id": "18",
        "nome": "Calabria",
        "latitudine": 38.910000,
        "longitudine": 16.587500
    }, {
        "id": "15",
        "nome": "Campania",
        "latitudine": 40.833333,
        "longitudine": 14.250000
    }, {
        "id": "8",
        "nome": "Emilia-Romagna",
        "latitudine": 44.493889,
        "longitudine": 11.342778
    }, {
        "id": "6",
        "nome": "Friuli-Venezia Giulia",
        "latitudine": 45.636111,
        "longitudine": 13.804167
    }, {
        "id": "12",
        "nome": "Lazio",
        "latitudine": 41.893056,
        "longitudine": 12.482778
    }, {
        "id": "7",
        "nome": "Liguria",
        "latitudine": 44.411156,
        "longitudine": 8.932661
    }, {
        "id": "3",
        "nome": "Lombardia",
        "latitudine": 45.464161,
        "longitudine": 9.190336
    }, {
        "id": "11",
        "nome": "Marche",
        "latitudine": 43.616667,
        "longitudine": 13.516667
    }, {
        "id": "14",
        "nome": "Molise",
        "latitudine": 41.561000,
        "longitudine": 14.668400
    }, {
        "id": "1",
        "nome": "Piemonte",
        "latitudine": 45.066667,
        "longitudine": 7.700000
    }, {
        "id": "16",
        "nome": "Puglia",
        "latitudine": 41.125278,
        "longitudine": 16.866667
    }, {
        "id": "20",
        "nome": "Sardegna",
        "latitudine": 39.216667,
        "longitudine": 9.116667
    }, {
        "id": "19",
        "nome": "Sicilia",
        "latitudine": 38.115556,
        "longitudine": 13.361389
    }, {
        "id": "9",
        "nome": "Toscana",
        "latitudine": 43.771389,
        "longitudine": 11.254167
    }, {
        "id": "4",
        "nome": "Trentino-Alto Adige/Südtirol",
        "latitudine": 46.066667,
        "longitudine": 11.116667
    }, {
        "id": "10",
        "nome": "Umbria",
        "latitudine": 43.112100,
        "longitudine": 12.388800
    }, {
        "id": "2",
        "nome": "Valle d'Aosta/Vallée d'Aoste",
        "latitudine": 45.737222,
        "longitudine": 7.320556
    }, {
        "id": "5",
        "nome": "Veneto",
        "latitudine": 45.439722,
        "longitudine": 12.331944
    }];


var citta = [{
    "id": "84",
    "id_regione": "19",
    "codice_citta_metropolitana": null,
    "nome": "Agrigento",
    "sigla_automobilistica": "AG",
    "latitudine": 37.31109,
    "longitudine": 13.576548
}, {
        "id": "6",
        "id_regione": "1",
        "codice_citta_metropolitana": null,
        "nome": "Alessandria",
        "sigla_automobilistica": "AL",
        "latitudine": 44.817559,
        "longitudine": 8.704663
    }, {
        "id": "42",
        "id_regione": "11",
        "codice_citta_metropolitana": null,
        "nome": "Ancona",
        "sigla_automobilistica": "AN",
        "latitudine": 43.549325,
        "longitudine": 13.266348
    }, {
        "id": "51",
        "id_regione": "9",
        "codice_citta_metropolitana": null,
        "nome": "Arezzo",
        "sigla_automobilistica": "AR",
        "latitudine": 43.466896,
        "longitudine": 11.88236
    }, {
        "id": "44",
        "id_regione": "11",
        "codice_citta_metropolitana": null,
        "nome": "Ascoli Piceno",
        "sigla_automobilistica": "AP",
        "latitudine": 42.863893,
        "longitudine": 13.589973
    }, {
        "id": "5",
        "id_regione": "1",
        "codice_citta_metropolitana": null,
        "nome": "Asti",
        "sigla_automobilistica": "AT",
        "latitudine": 44.900765,
        "longitudine": 8.206432
    }, {
        "id": "64",
        "id_regione": "15",
        "codice_citta_metropolitana": null,
        "nome": "Avellino",
        "sigla_automobilistica": "AV",
        "latitudine": 40.996451,
        "longitudine": 15.125896
    }, {
        "id": "72",
        "id_regione": "16",
        "codice_citta_metropolitana": "272",
        "nome": "Bari",
        "sigla_automobilistica": "BA",
        "latitudine": 41.117123,
        "longitudine": 16.871976
    }, {
        "id": "110",
        "id_regione": "16",
        "codice_citta_metropolitana": null,
        "nome": "Barletta-Andria-Trani",
        "sigla_automobilistica": "BT",
        "latitudine": 41.200454,
        "longitudine": 16.205148
    }, {
        "id": "25",
        "id_regione": "5",
        "codice_citta_metropolitana": null,
        "nome": "Belluno",
        "sigla_automobilistica": "BL",
        "latitudine": 46.249766,
        "longitudine": 12.196957
    }, {
        "id": "62",
        "id_regione": "15",
        "codice_citta_metropolitana": null,
        "nome": "Benevento",
        "sigla_automobilistica": "BN",
        "latitudine": 41.203509,
        "longitudine": 14.752094
    }, {
        "id": "16",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Bergamo",
        "sigla_automobilistica": "BG",
        "latitudine": 45.85783,
        "longitudine": 9.881998
    }, {
        "id": "96",
        "id_regione": "1",
        "codice_citta_metropolitana": null,
        "nome": "Biella",
        "sigla_automobilistica": "BI",
        "latitudine": 45.562818,
        "longitudine": 8.058272
    }, {
        "id": "37",
        "id_regione": "8",
        "codice_citta_metropolitana": "237",
        "nome": "Bologna",
        "sigla_automobilistica": "BO",
        "latitudine": 44.50051,
        "longitudine": 11.304784
    }, {
        "id": "21",
        "id_regione": "4",
        "codice_citta_metropolitana": null,
        "nome": "Bolzano/Bozen",
        "sigla_automobilistica": "BZ",
        "latitudine": 46.734096,
        "longitudine": 11.288802
    }, {
        "id": "17",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Brescia",
        "sigla_automobilistica": "BS",
        "latitudine": 45.659677,
        "longitudine": 10.385672
    }, {
        "id": "74",
        "id_regione": "16",
        "codice_citta_metropolitana": null,
        "nome": "Brindisi",
        "sigla_automobilistica": "BR",
        "latitudine": 40.611266,
        "longitudine": 17.763621
    }, {
        "id": "92",
        "id_regione": "20",
        "codice_citta_metropolitana": null,
        "nome": "Cagliari",
        "sigla_automobilistica": "CA",
        "latitudine": 39.223763,
        "longitudine": 9.121867
    }, {
        "id": "85",
        "id_regione": "19",
        "codice_citta_metropolitana": null,
        "nome": "Caltanissetta",
        "sigla_automobilistica": "CL",
        "latitudine": 37.490112,
        "longitudine": 14.062893
    }, {
        "id": "70",
        "id_regione": "14",
        "codice_citta_metropolitana": null,
        "nome": "Campobasso",
        "sigla_automobilistica": "CB",
        "latitudine": 41.673887,
        "longitudine": 14.752094
    }, {
        "id": "107",
        "id_regione": "20",
        "codice_citta_metropolitana": null,
        "nome": "Carbonia-Iglesias",
        "sigla_automobilistica": "CI",
        "latitudine": 39.253466,
        "longitudine": 8.572102
    }, {
        "id": "61",
        "id_regione": "15",
        "codice_citta_metropolitana": null,
        "nome": "Caserta",
        "sigla_automobilistica": "CE",
        "latitudine": 41.207835,
        "longitudine": 14.100133
    }, {
        "id": "87",
        "id_regione": "19",
        "codice_citta_metropolitana": null,
        "nome": "Catania",
        "sigla_automobilistica": "CT",
        "latitudine": 37.612598,
        "longitudine": 14.938885
    }, {
        "id": "79",
        "id_regione": "18",
        "codice_citta_metropolitana": null,
        "nome": "Catanzaro",
        "sigla_automobilistica": "CZ",
        "latitudine": 38.889635,
        "longitudine": 16.440587
    }, {
        "id": "69",
        "id_regione": "13",
        "codice_citta_metropolitana": null,
        "nome": "Chieti",
        "sigla_automobilistica": "CH",
        "latitudine": 42.033443,
        "longitudine": 14.379191
    }, {
        "id": "13",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Como",
        "sigla_automobilistica": "CO",
        "latitudine": 45.808042,
        "longitudine": 9.085179
    }, {
        "id": "78",
        "id_regione": "18",
        "codice_citta_metropolitana": null,
        "nome": "Cosenza",
        "sigla_automobilistica": "CS",
        "latitudine": 39.564411,
        "longitudine": 16.252214
    }, {
        "id": "19",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Cremona",
        "sigla_automobilistica": "CR",
        "latitudine": 45.201438,
        "longitudine": 9.983658
    }, {
        "id": "101",
        "id_regione": "18",
        "codice_citta_metropolitana": null,
        "nome": "Crotone",
        "sigla_automobilistica": "KR",
        "latitudine": 39.130986,
        "longitudine": 17.006703
    }, {
        "id": "4",
        "id_regione": "1",
        "codice_citta_metropolitana": null,
        "nome": "Cuneo",
        "sigla_automobilistica": "CN",
        "latitudine": 44.597031,
        "longitudine": 7.611422
    }, {
        "id": "86",
        "id_regione": "19",
        "codice_citta_metropolitana": null,
        "nome": "Enna",
        "sigla_automobilistica": "EN",
        "latitudine": 37.516481,
        "longitudine": 14.379191
    }, {
        "id": "109",
        "id_regione": "11",
        "codice_citta_metropolitana": null,
        "nome": "Fermo",
        "sigla_automobilistica": "FM",
        "latitudine": 43.093137,
        "longitudine": 13.589973
    }, {
        "id": "38",
        "id_regione": "8",
        "codice_citta_metropolitana": null,
        "nome": "Ferrara",
        "sigla_automobilistica": "FE",
        "latitudine": 44.766368,
        "longitudine": 11.764407
    }, {
        "id": "48",
        "id_regione": "9",
        "codice_citta_metropolitana": "248",
        "nome": "Firenze",
        "sigla_automobilistica": "FI",
        "latitudine": 43.767918,
        "longitudine": 11.252379
    }, {
        "id": "71",
        "id_regione": "16",
        "codice_citta_metropolitana": null,
        "nome": "Foggia",
        "sigla_automobilistica": "FG",
        "latitudine": 41.638448,
        "longitudine": 15.594339
    }, {
        "id": "40",
        "id_regione": "8",
        "codice_citta_metropolitana": null,
        "nome": "Forlì-Cesena",
        "sigla_automobilistica": "FC",
        "latitudine": 44.2225,
        "longitudine": 12.040833
    }, {
        "id": "60",
        "id_regione": "12",
        "codice_citta_metropolitana": null,
        "nome": "Frosinone",
        "sigla_automobilistica": "FR",
        "latitudine": 41.657653,
        "longitudine": 13.636272
    }, {
        "id": "10",
        "id_regione": "7",
        "codice_citta_metropolitana": "210",
        "nome": "Genova",
        "sigla_automobilistica": "GE",
        "latitudine": 44.446625,
        "longitudine": 9.145615
    }, {
        "id": "31",
        "id_regione": "6",
        "codice_citta_metropolitana": null,
        "nome": "Gorizia",
        "sigla_automobilistica": "GO",
        "latitudine": 45.90539,
        "longitudine": 13.516373
    }, {
        "id": "53",
        "id_regione": "9",
        "codice_citta_metropolitana": null,
        "nome": "Grosseto",
        "sigla_automobilistica": "GR",
        "latitudine": 42.851801,
        "longitudine": 11.252379
    }, {
        "id": "8",
        "id_regione": "7",
        "codice_citta_metropolitana": null,
        "nome": "Imperia",
        "sigla_automobilistica": "IM",
        "latitudine": 43.941866,
        "longitudine": 7.828637
    }, {
        "id": "94",
        "id_regione": "14",
        "codice_citta_metropolitana": null,
        "nome": "Isernia",
        "sigla_automobilistica": "IS",
        "latitudine": 41.589156,
        "longitudine": 14.193092
    }, {
        "id": "66",
        "id_regione": "13",
        "codice_citta_metropolitana": null,
        "nome": "L'Aquila",
        "sigla_automobilistica": "AQ",
        "latitudine": 42.349848,
        "longitudine": 13.399509
    }, {
        "id": "11",
        "id_regione": "7",
        "codice_citta_metropolitana": null,
        "nome": "La Spezia",
        "sigla_automobilistica": "SP",
        "latitudine": 44.10245,
        "longitudine": 9.824083
    }, {
        "id": "59",
        "id_regione": "12",
        "codice_citta_metropolitana": null,
        "nome": "Latina",
        "sigla_automobilistica": "LT",
        "latitudine": 41.408748,
        "longitudine": 13.08179
    }, {
        "id": "75",
        "id_regione": "16",
        "codice_citta_metropolitana": null,
        "nome": "Lecce",
        "sigla_automobilistica": "LE",
        "latitudine": 40.234739,
        "longitudine": 18.142867
    }, {
        "id": "97",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Lecco",
        "sigla_automobilistica": "LC",
        "latitudine": 45.938294,
        "longitudine": 9.385729
    }, {
        "id": "49",
        "id_regione": "9",
        "codice_citta_metropolitana": null,
        "nome": "Livorno",
        "sigla_automobilistica": "LI",
        "latitudine": 43.023985,
        "longitudine": 10.66471
    }, {
        "id": "98",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Lodi",
        "sigla_automobilistica": "LO",
        "latitudine": 45.240504,
        "longitudine": 9.529251
    }, {
        "id": "46",
        "id_regione": "9",
        "codice_citta_metropolitana": null,
        "nome": "Lucca",
        "sigla_automobilistica": "LU",
        "latitudine": 43.837674,
        "longitudine": 10.495053
    }, {
        "id": "43",
        "id_regione": "11",
        "codice_citta_metropolitana": null,
        "nome": "Macerata",
        "sigla_automobilistica": "MC",
        "latitudine": 43.245932,
        "longitudine": 13.266348
    }, {
        "id": "20",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Mantova",
        "sigla_automobilistica": "MN",
        "latitudine": 45.156417,
        "longitudine": 10.791375
    }, {
        "id": "45",
        "id_regione": "9",
        "codice_citta_metropolitana": null,
        "nome": "Massa-Carrara",
        "sigla_automobilistica": "MS",
        "latitudine": 44.079325,
        "longitudine": 10.097677
    }, {
        "id": "77",
        "id_regione": "17",
        "codice_citta_metropolitana": null,
        "nome": "Matera",
        "sigla_automobilistica": "MT",
        "latitudine": 40.66635,
        "longitudine": 16.604364
    }, {
        "id": "106",
        "id_regione": "20",
        "codice_citta_metropolitana": null,
        "nome": "Medio Campidano",
        "sigla_automobilistica": "VS",
        "latitudine": 39.531739,
        "longitudine": 8.704075
    }, {
        "id": "83",
        "id_regione": "19",
        "codice_citta_metropolitana": null,
        "nome": "Messina",
        "sigla_automobilistica": "ME",
        "latitudine": 38.06324,
        "longitudine": 14.985618
    }, {
        "id": "15",
        "id_regione": "3",
        "codice_citta_metropolitana": "215",
        "nome": "Milano",
        "sigla_automobilistica": "MI",
        "latitudine": 45.458626,
        "longitudine": 9.181873
    }, {
        "id": "36",
        "id_regione": "8",
        "codice_citta_metropolitana": null,
        "nome": "Modena",
        "sigla_automobilistica": "MO",
        "latitudine": 44.55138,
        "longitudine": 10.918048
    }, {
        "id": "108",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Monza e della Brianza",
        "sigla_automobilistica": "MB",
        "latitudine": 45.623599,
        "longitudine": 9.258802
    }, {
        "id": "63",
        "id_regione": "15",
        "codice_citta_metropolitana": "263",
        "nome": "Napoli",
        "sigla_automobilistica": "NA",
        "latitudine": 40.901975,
        "longitudine": 14.332644
    }, {
        "id": "3",
        "id_regione": "1",
        "codice_citta_metropolitana": null,
        "nome": "Novara",
        "sigla_automobilistica": "NO",
        "latitudine": 45.548513,
        "longitudine": 8.515079
    }, {
        "id": "91",
        "id_regione": "20",
        "codice_citta_metropolitana": null,
        "nome": "Nuoro",
        "sigla_automobilistica": "NU",
        "latitudine": 40.32869,
        "longitudine": 9.456155
    }, {
        "id": "105",
        "id_regione": "20",
        "codice_citta_metropolitana": null,
        "nome": "Ogliastra",
        "sigla_automobilistica": "OG",
        "latitudine": 39.841054,
        "longitudine": 9.456155
    }, {
        "id": "104",
        "id_regione": "20",
        "codice_citta_metropolitana": null,
        "nome": "Olbia-Tempio",
        "sigla_automobilistica": "OT",
        "latitudine": 40.826838,
        "longitudine": 9.278558
    }, {
        "id": "95",
        "id_regione": "20",
        "codice_citta_metropolitana": null,
        "nome": "Oristano",
        "sigla_automobilistica": "OR",
        "latitudine": 40.059907,
        "longitudine": 8.748117
    }, {
        "id": "28",
        "id_regione": "5",
        "codice_citta_metropolitana": null,
        "nome": "Padova",
        "sigla_automobilistica": "PD",
        "latitudine": 45.366186,
        "longitudine": 11.820914
    }, {
        "id": "82",
        "id_regione": "19",
        "codice_citta_metropolitana": null,
        "nome": "Palermo",
        "sigla_automobilistica": "PA",
        "latitudine": 38.115621,
        "longitudine": 13.361318
    }, {
        "id": "34",
        "id_regione": "8",
        "codice_citta_metropolitana": null,
        "nome": "Parma",
        "sigla_automobilistica": "PR",
        "latitudine": 44.801532,
        "longitudine": 10.327935
    }, {
        "id": "18",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Pavia",
        "sigla_automobilistica": "PV",
        "latitudine": 45.321817,
        "longitudine": 8.846624
    }, {
        "id": "54",
        "id_regione": "10",
        "codice_citta_metropolitana": null,
        "nome": "Perugia",
        "sigla_automobilistica": "PG",
        "latitudine": 42.938004,
        "longitudine": 12.621621
    }, {
        "id": "41",
        "id_regione": "11",
        "codice_citta_metropolitana": null,
        "nome": "Pesaro e Urbino",
        "sigla_automobilistica": "PU",
        "latitudine": 43.613012,
        "longitudine": 12.713512
    }, {
        "id": "68",
        "id_regione": "13",
        "codice_citta_metropolitana": null,
        "nome": "Pescara",
        "sigla_automobilistica": "PE",
        "latitudine": 42.357066,
        "longitudine": 13.960809
    }, {
        "id": "33",
        "id_regione": "8",
        "codice_citta_metropolitana": null,
        "nome": "Piacenza",
        "sigla_automobilistica": "PC",
        "latitudine": 44.826311,
        "longitudine": 9.529145
    }, {
        "id": "50",
        "id_regione": "9",
        "codice_citta_metropolitana": null,
        "nome": "Pisa",
        "sigla_automobilistica": "PI",
        "latitudine": 43.722832,
        "longitudine": 10.401719
    }, {
        "id": "47",
        "id_regione": "9",
        "codice_citta_metropolitana": null,
        "nome": "Pistoia",
        "sigla_automobilistica": "PT",
        "latitudine": 43.954373,
        "longitudine": 10.89031
    }, {
        "id": "93",
        "id_regione": "6",
        "codice_citta_metropolitana": null,
        "nome": "Pordenone",
        "sigla_automobilistica": "PN",
        "latitudine": 46.037886,
        "longitudine": 12.710835
    }, {
        "id": "76",
        "id_regione": "17",
        "codice_citta_metropolitana": null,
        "nome": "Potenza",
        "sigla_automobilistica": "PZ",
        "latitudine": 40.418219,
        "longitudine": 15.876004
    }, {
        "id": "100",
        "id_regione": "9",
        "codice_citta_metropolitana": null,
        "nome": "Prato",
        "sigla_automobilistica": "PO",
        "latitudine": 44.04539,
        "longitudine": 11.116445
    }, {
        "id": "88",
        "id_regione": "19",
        "codice_citta_metropolitana": null,
        "nome": "Ragusa",
        "sigla_automobilistica": "RG",
        "latitudine": 36.930622,
        "longitudine": 14.705431
    }, {
        "id": "39",
        "id_regione": "8",
        "codice_citta_metropolitana": null,
        "nome": "Ravenna",
        "sigla_automobilistica": "RA",
        "latitudine": 44.418444,
        "longitudine": 12.2036
    }, {
        "id": "80",
        "id_regione": "18",
        "codice_citta_metropolitana": null,
        "nome": "Reggio di Calabria",
        "sigla_automobilistica": "RC",
        "latitudine": 38.111301,
        "longitudine": 15.647291
    }, {
        "id": "35",
        "id_regione": "8",
        "codice_citta_metropolitana": null,
        "nome": "Reggio nell'Emilia",
        "sigla_automobilistica": "RE",
        "latitudine": 44.585658,
        "longitudine": 10.556474
    }, {
        "id": "57",
        "id_regione": "12",
        "codice_citta_metropolitana": null,
        "nome": "Rieti",
        "sigla_automobilistica": "RI",
        "latitudine": 42.367441,
        "longitudine": 12.89751
    }, {
        "id": "99",
        "id_regione": "8",
        "codice_citta_metropolitana": null,
        "nome": "Rimini",
        "sigla_automobilistica": "RN",
        "latitudine": 43.967605,
        "longitudine": 12.575703
    }, {
        "id": "58",
        "id_regione": "12",
        "codice_citta_metropolitana": "258",
        "nome": "Roma",
        "sigla_automobilistica": "RM",
        "latitudine": 41.872411,
        "longitudine": 12.480225
    }, {
        "id": "29",
        "id_regione": "5",
        "codice_citta_metropolitana": null,
        "nome": "Rovigo",
        "sigla_automobilistica": "RO",
        "latitudine": 45.024182,
        "longitudine": 11.823816
    }, {
        "id": "65",
        "id_regione": "15",
        "codice_citta_metropolitana": null,
        "nome": "Salerno",
        "sigla_automobilistica": "SA",
        "latitudine": 40.428783,
        "longitudine": 15.219481
    }, {
        "id": "90",
        "id_regione": "20",
        "codice_citta_metropolitana": null,
        "nome": "Sassari",
        "sigla_automobilistica": "SS",
        "latitudine": 40.796791,
        "longitudine": 8.575041
    }, {
        "id": "9",
        "id_regione": "7",
        "codice_citta_metropolitana": null,
        "nome": "Savona",
        "sigla_automobilistica": "SV",
        "latitudine": 44.2888,
        "longitudine": 8.265058
    }, {
        "id": "52",
        "id_regione": "9",
        "codice_citta_metropolitana": null,
        "nome": "Siena",
        "sigla_automobilistica": "SI",
        "latitudine": 43.293773,
        "longitudine": 11.433915
    }, {
        "id": "89",
        "id_regione": "19",
        "codice_citta_metropolitana": null,
        "nome": "Siracusa",
        "sigla_automobilistica": "SR",
        "latitudine": 37.075437,
        "longitudine": 15.286593
    }, {
        "id": "14",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Sondrio",
        "sigla_automobilistica": "SO",
        "latitudine": 46.172764,
        "longitudine": 9.799492
    }, {
        "id": "73",
        "id_regione": "16",
        "codice_citta_metropolitana": null,
        "nome": "Taranto",
        "sigla_automobilistica": "TA",
        "latitudine": 40.57409,
        "longitudine": 17.242998
    }, {
        "id": "67",
        "id_regione": "13",
        "codice_citta_metropolitana": null,
        "nome": "Teramo",
        "sigla_automobilistica": "TE",
        "latitudine": 42.589561,
        "longitudine": 13.636272
    }, {
        "id": "55",
        "id_regione": "10",
        "codice_citta_metropolitana": null,
        "nome": "Terni",
        "sigla_automobilistica": "TR",
        "latitudine": 42.563453,
        "longitudine": 12.529803
    }, {
        "id": "1",
        "id_regione": "1",
        "codice_citta_metropolitana": "201",
        "nome": "Torino",
        "sigla_automobilistica": "TO",
        "latitudine": 45.063299,
        "longitudine": 7.669289
    }, {
        "id": "81",
        "id_regione": "19",
        "codice_citta_metropolitana": null,
        "nome": "Trapani",
        "sigla_automobilistica": "TP",
        "latitudine": 37.87774,
        "longitudine": 12.713512
    }, {
        "id": "22",
        "id_regione": "4",
        "codice_citta_metropolitana": null,
        "nome": "Trento",
        "sigla_automobilistica": "TN",
        "latitudine": 46.0512,
        "longitudine": 11.117539
    }, {
        "id": "26",
        "id_regione": "5",
        "codice_citta_metropolitana": null,
        "nome": "Treviso",
        "sigla_automobilistica": "TV",
        "latitudine": 45.666852,
        "longitudine": 12.243062
    }, {
        "id": "32",
        "id_regione": "6",
        "codice_citta_metropolitana": null,
        "nome": "Trieste",
        "sigla_automobilistica": "TS",
        "latitudine": 45.689482,
        "longitudine": 13.783307
    }, {
        "id": "30",
        "id_regione": "6",
        "codice_citta_metropolitana": null,
        "nome": "Udine",
        "sigla_automobilistica": "UD",
        "latitudine": 46.140797,
        "longitudine": 13.16629
    }, {
        "id": "7",
        "id_regione": "2",
        "codice_citta_metropolitana": null,
        "nome": "Valle d'Aosta/Vallée d'Aoste",
        "sigla_automobilistica": "AO",
        "latitudine": 45.738888,
        "longitudine": 7.426187
    }, {
        "id": "12",
        "id_regione": "3",
        "codice_citta_metropolitana": null,
        "nome": "Varese",
        "sigla_automobilistica": "VA",
        "latitudine": 45.799026,
        "longitudine": 8.730095
    }, {
        "id": "27",
        "id_regione": "5",
        "codice_citta_metropolitana": "227",
        "nome": "Venezia",
        "sigla_automobilistica": "VE",
        "latitudine": 45.493048,
        "longitudine": 12.4177
    }, {
        "id": "103",
        "id_regione": "1",
        "codice_citta_metropolitana": null,
        "nome": "Verbano-Cusio-Ossola",
        "sigla_automobilistica": "VB",
        "latitudine": 46.139969,
        "longitudine": 8.272465
    }, {
        "id": "2",
        "id_regione": "1",
        "codice_citta_metropolitana": null,
        "nome": "Vercelli",
        "sigla_automobilistica": "VC",
        "latitudine": 45.32022,
        "longitudine": 8.418508
    }, {
        "id": "23",
        "id_regione": "5",
        "codice_citta_metropolitana": null,
        "nome": "Verona",
        "sigla_automobilistica": "VR",
        "latitudine": 45.44185,
        "longitudine": 11.073532
    }, {
        "id": "102",
        "id_regione": "18",
        "codice_citta_metropolitana": null,
        "nome": "Vibo Valentia",
        "sigla_automobilistica": "VV",
        "latitudine": 38.637857,
        "longitudine": 16.205148
    }, {
        "id": "24",
        "id_regione": "5",
        "codice_citta_metropolitana": null,
        "nome": "Vicenza",
        "sigla_automobilistica": "VI",
        "latitudine": 45.545479,
        "longitudine": 11.535421
    }, {
        "id": "56",
        "id_regione": "12",
        "codice_citta_metropolitana": null,
        "nome": "Viterbo",
        "sigla_automobilistica": "VT",
        "latitudine": 42.420677,
        "longitudine": 12.107669
    }];


function pager(source, query, options) {
    function fsort(o) {
        return (o[query.sortField] || '').toLowerCase();
    }

    function fsort2(field) {
        return o => (o[field] || '').toLowerCase();
    }

    query = query || {};
    const result = { items: [] };

    var partial = source;
    var fx = query.findExpr || '';
    if (fx.length) {
        var fo = query.findOpts || 'ig';
        var re = new RegExp(fx, fo);
        partial = partial.filter(o => options.finder(o, re));
        result.findExpr = fx;
        result.findOpts = fo;
    }

    if (query.sortField && query.sortDir) {
        var funcs = [], dirs = [];
        if (_.isArray(query.sortField)) {
            for (var i = 0; i < query.sortField.length; i++) {
                funcs.push(fsort2(query.sortField[i]));
                dirs.push(query.sortDir[i]);
            }
        }
        else {
            funcs.push(fsort2(query.sortField));
            dirs.push(query.sortDir);
        }
        partial = _.orderBy(partial, funcs, dirs);
        //partial = _.orderBy(partial, [fsort], [query.sortDir]);
        result.sortField = query.sortField;
        result.sortDir = query.sortDir;
    }

    result.count = partial.length;
    if (query.pageSize != null && +query.pageSize > 1) {
        var index = query.pageIndex != null ? +query.pageIndex : 0;
        if (query.selected) {
            for (var i = 0; i < partial.length; i++) {
                if (options.selector(query.selected)(partial[i])) {
                    index = Math.floor(i / query.pageSize);
                    break;
                }
            }
        }

        var maxPages = Math.max(1, Math.ceil(partial.length / query.pageSize));
        index = Math.max(0, Math.min(index, maxPages - 1));
        result.pageIndex = index;
        result.pageCount = maxPages;
        for (var i = index * query.pageSize, n = 0; i < partial.length && n < +query.pageSize; i++ , n++) {
            result.items.push(partial[i]);
        }
    }
    else {
        result.items = partial;
    }
    return result;
}



/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});


router.get('/regioni', function (req, res) {
    var subset = regioni.map(r => {
        var rr = { id: r.id, nome: r.nome };
        var cc = citta.filter(c => c.id_regione === r.id).map(c => ({ id: c.id, nome: c.nome, sigla: c.sigla_automobilistica }));
        rr.citta = _.orderBy(cc, ['nome']);
        return rr;
    });

    var options = {};
    options.finder = function (item, re) {
        if (re.test(item.nome)) return true;
    }

    options.selector = function (id) {
        return o => o.id === id;
    }

    var result = pager(subset, req.query, options);

    res.json(result);
});


router.get('/citta', function (req, res) {
    var subset = citta.map(c => {
        var cc = _.clone(c);
        for (var i = 0; i < regioni.length; i++) {
            if (cc.id_regione == regioni[i].id) {
                cc.regione = regioni[i].nome;
                break;
            }
        }
        return cc;
    });

    var options = {};
    options.finder = function (item, re) {
        if (re.test(item.nome)) return true;
        if (re.test(item.regione)) return true;
    }

    options.selector = function (id) {
        return o => o.id === id;
    }

    var result = pager(subset, req.query, options);

    setTimeout(function () {
        res.json(result);
    }, 1000);
});

module.exports = router;