
/* 
   (c)2019 by SBorg 
   V0.0.3 - 28.08.2019 ~ Datum formatiert
                       + betroffene Bundesländer anzeigen? 
                       ~ Fehler beim ersten Start des Skripts behoben
   V0.0.2 - 27.08.2019 + Titel, Datum und Link  
   V0.0.1 - 26.08.2019   erste Alpha

   holt die Warnungen von Lebensmittelwarnung.de aus deren RSS-Feed
   benötigt 'rss-parser': cd /opt/iobroker && npm install --save rss-parser

      ToDo: - besseres Datenpunktmanagment
            - Datenpunkt für "neue Warnung"
            - try/catch für Fehler (bspw. Webserver nicht erreichbar)
            - filtern ermöglichen
   
   known issues: keine

*/

//START User-Einstellungen ***********************************************************************************************
const debug  = false;                                  //debuggen [true/false]?
const Anzahl = 5;                                      //wie viele Warnungen sollen gelesen werden?
const BuLand = true;                                   //zeige Bundesländer an [true/false]?
const DP     = 'javascript.0.VIS.Lebensmittelwarnung'; //Datenpunkt
const URL    = 'https://www.lebensmittelwarnung.de/bvl-lmw-de/opensaga/feed/alle/hessen.rss'; //URL des RSS-Feeds
/* wann soll die Abfrage stattfinden (Minuten Stunde * * *)
   die Minuten sollten auf eine "krumme" Zeit gesetzt werden, damit nicht jeder zur selben Zeit eine Anfrage an den
   Webserver von Lebensmittelwarnung.de schickt und diesen ggf. überlastet... */
schedule("3 */12 * * *", polldata);
//END User-Einstellungen *************************************************************************************************


//ab hier gibt es nix mehr zu ändern :)
//firstStart?
if (!isState(DP, false)) { createDP(); }

//Daten beim Start des Scripts abrufen
polldata();
console.log('Hole Daten...');

function polldata() {
 let Parser = require('rss-parser');
 let parser = new Parser({
    xml2js: { emptyTag: '--EMPTY--', },
    maxRedirects: 50,
    timeout: 60000,
    customFields: { item: [['description','description', {keepArray: true}],] }
 });

 (async () => {
 
  let feed = await parser.parseURL(URL);
  var i=0, Beschreibung;
  if (debug === true) {console.log(feed.title);}
 
  feed.items.forEach(function(entry) {
    if (debug === true) {console.log(entry.title + ': ' + entry.link + ' ' + entry.description + ' ' + entry.pubDate);}
    if (i<Anzahl) {
        //Bundesländer anzeigen?
        if (BuLand === true) { Beschreibung = entry.description[0] } else { Beschreibung = entry.description[0].substring(0, entry.description[0].lastIndexOf('<b>Betroffene Länder:</b>')); }
        setState(DP+'.Nummer_'+i+'.Titel', entry.title);
        setState(DP+'.Nummer_'+i+'.Link', entry.link);
        setState(DP+'.Nummer_'+i+'.Datum', entry.pubDate.substring(0, entry.pubDate.length-6));
        setState(DP+'.Nummer_'+i+'.Beschreibung', Beschreibung);
    }
    i++;
  })
  console.log('Daten aktualisiert...');
 })();
}

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
    }
    await Sleep(5000);
}