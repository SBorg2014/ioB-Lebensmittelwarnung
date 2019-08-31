
/* 
   (c)2019 by SBorg 
   V0.0.5 - 31.08.2019 ~ Bilder als eigener Datenpunkt ausgelagert
   V0.0.4 - 29.08.2019 + Fehlermanagement Webserver
                       + Datenpunkt für "neue Warnung" / true bei neuer Warnung
                       + filtern eines Suchbegriffes (minimal)
   V0.0.3 - 28.08.2019 ~ Datum formatiert
                       + betroffene Bundesländer anzeigen? 
                       ~ Fehler beim ersten Start des Skripts behoben
   V0.0.2 - 27.08.2019 + Titel, Datum und Link  
   V0.0.1 - 26.08.2019   erste Alpha

   holt die Warnungen von Lebensmittelwarnung.de aus deren RSS-Feed
   benötigt 'rss-parser': cd /opt/iobroker && npm install --save rss-parser

      ToDo: - besseres Datenpunktmanagment
            - beliebig viele filter ermöglichen
   
   known issues: keine

*/

//START User-Einstellungen ***********************************************************************************************
const debug    = false;                                  //debuggen [true/false]?
const Anzahl   = 5;                                      //wie viele Warnungen sollen gelesen werden?
const BuLand   = true;                                   //zeige Bundesländer an [true/false]?
const DP       = 'javascript.0.VIS.Lebensmittelwarnung'; //Datenpunkt
const URL      = 'https://www.lebensmittelwarnung.de/bvl-lmw-de/opensaga/feed/alle/hessen.rss'; //URL des RSS-Feeds
var   FILTER   = 'false';                                //ausfiltern bestimmter Suchbegriffe (auch RegEx) oder 'false' für keinen Filter
const Zeitplan = "3 */12 * * *";                         /* wann soll die Abfrage stattfinden (Minuten Stunde * * *)
   die Minuten sollten auf eine "krumme" Zeit gesetzt werden, damit nicht jeder zur selben Zeit eine Anfrage an den
   Webserver von Lebensmittelwarnung.de schickt und diesen ggf. überlastet... 
   Hier: alle 12 Stunden UND 3 Minuten = 12:03 Uhr und 0:03 Uhr
   siehe auch cron-Syntax z.B. unter https://de.wikipedia.org/wiki/Cron */
//END User-Einstellungen *************************************************************************************************



//ab hier gibt es nix mehr zu ändern :)
//firstStart?
if (!isState(DP, false)) { createDP(); }

//Daten beim Start des Scripts abrufen
polldata();
console.log('Hole Daten...');

//neue Warnung?
on({id: DP+".Nummer_0.Datum", change: "ne"}, function (obj) {
  console.log('Neue Warnmeldung vorhanden...');
  setTimeout(function() { setState(DP+".neue_Warnung", 'true'); }, 3000);
});

//scheduler
schedule(Zeitplan, polldata);

function polldata() {
 let Parser = require('rss-parser');
 let parser = new Parser({
    xml2js: { emptyTag: '--EMPTY--', },
    maxRedirects: 50,
    timeout: 60000,
    customFields: { item: [['description','description', {keepArray: true}],] }
 });

 (async () => {
 
  try {
        let feed = await parser.parseURL(URL);
        var i=0, Beschreibung, Bild;
        if (debug === true) {console.log(feed.title);}
 
        feed.items.forEach(function(entry) {
            if (debug === true) {console.log(entry.title + ': ' + entry.link + ' ' + entry.description + ' ' + entry.pubDate);}
            if (i<Anzahl) {
                
                //Suchfilter auf Beschreibung anwenden
                if (entry.description[0].search(FILTER) == -1) {
                    //Bundesländer anzeigen?
                    if (BuLand === true) { Beschreibung = entry.description[0] } else { Beschreibung = entry.description[0].substring(0, entry.description[0].lastIndexOf('<b>Betroffene Länder:</b>')); }
                    //prüfen ob Bild vorhanden ist und ggf. parsen
                    if (Beschreibung.search('<img src="http') != -1) {
                        Bild = Beschreibung.substring(0, Beschreibung.indexOf('<br/>')+5);
                        Beschreibung = Beschreibung.replace(Bild, ''); 
                        Bild = Bild.substring(Bild.indexOf('"')+1, Bild.lastIndexOf('"'));
                        Bild = Bild.substring(0, Bild.indexOf('"'));
                    } else {Bild = '';}
                    setState(DP+'.Nummer_'+i+'.Titel', entry.title);
                    setState(DP+'.Nummer_'+i+'.Link', entry.link);
                    setState(DP+'.Nummer_'+i+'.Datum', entry.pubDate.substring(0, entry.pubDate.length-6));
                    setState(DP+'.Nummer_'+i+'.Beschreibung', Beschreibung);
                    setState(DP+'.Nummer_'+i+'.Produktbild', Bild);
                    i++;
                }
            }
        })
        console.log('Daten aktualisiert...');
    } catch (e) {
        console.warn('Fehler beim Datenabruf...');
        return;
        }
   })(); //end async
} //end func

/*
  Checks if a a given state or part of state is existing.
  This is a workaround, as getObject() or getState() throw warnings in the log.
  Set strict to true if the state shall match exactly. If it is false, it will add a wildcard * to the end.
  See: https://forum.iobroker.net/topic/11354/
  @param {string}    strStatePath     Input string of state, like 'javas-cript.0.switches.Osram.Bedroom'
  @param {boolean}   [strict=false]   Optional: if true, it will work strict, if false, it will add a wildcard * to the end of the string
  @return {boolean}                   true if state exists, false if not
 */

function isState(strStatePath, strict) {

    let mSelector;
    if (strict) {
        mSelector = $('state[id=' + strStatePath + '$]');
    } else {
        mSelector = $('state[id=' + strStatePath + ']');
    }

    if (mSelector.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Pause einlegen
function Sleep(milliseconds) {
 return new Promise(resolve => setTimeout(resolve, milliseconds));
}

//Datenpunkte anlegen
async function createDP() {
    console.log(DP + ' existiert nicht... Lege Datenpunkte an...');
    createState(DP, '', { name: 'Warnungen von Lebensmittelwarnung.de' });
    createState(DP+'.neue_Warnung', '', { name: "neue Warnung vorhanden", type: "string", role: "state" });
    for(var i=0; i<Anzahl; i++) { 
        createState(DP+'.Nummer_'+i, '', { name: 'Warnung Nummer #'+i }); 
        createState(DP+'.Nummer_'+i+'.Beschreibung', '', { name: "HTML-Text der Warnung",
                                                            type: "string",
                                                            role: "state"
                                                         }); 
        createState(DP+'.Nummer_'+i+'.Titel', '', { name: "Titel der Warnung",
                                                    type: "string",
                                                    role: "state"
                                                 });
        createState(DP+'.Nummer_'+i+'.Link', '', { name: "Link zur Meldung",
                                                    type: "string",
                                                    role: "state"
                                                 });
        createState(DP+'.Nummer_'+i+'.Datum', '', { name: "Datum der Meldung",
                                                    type: "string",
                                                    role: "state"
                                                 });
        createState(DP+'.Nummer_'+i+'.Produktbild', '', { name: "Produktbild zur Warnung",
                                                    type: "string",
                                                    role: "state"
                                                 });
    }
    await Sleep(5000);
}
