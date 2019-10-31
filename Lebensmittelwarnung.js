
/*
   (c)2019 by SBorg 
   V0.0.8 - 31.10.2019 + Meldungen für mehrere Bundesländer möglich
   V0.0.7 - 03.10.2019 ~ mehrere Filter möglich
   V0.0.6 - 02.09.2019 ~ Wochentage und Monate auf dt. Datumsformat gepatcht
                       + Produktart als Datenpunkt
                       ~ Datum neu formatiert (Sekunden entfernt und "Uhr" hinzugefügt)
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
   
   known issues: keine

*/

//START User-Einstellungen ***********************************************************************************************
const debug    = false;                                  //debuggen [true/false]?
const Anzahl   = 5;                                      //wie viele Warnungen sollen gelesen werden?
const BuLand   = true;                                   //zeige Bundesländer an [true/false]?
const DP       = 'javascript.0.VIS.Lebensmittelwarnung'; //Datenpunkt
var   FILTER   = ['false'];                              //ausfiltern bestimmter Suchbegriffe (auch RegEx) oder 'false' für keinen Filter
var   LAENDER  = [7];                                    /*Warnung für welches Bundesland/-länder; kommasepariert
                                                          1=Baden-Württemberg, 2=Bayern, 3=Berlin, 4=Brandenburg, 5=Bremen, 
                                                          6=Hamburg, 7=Hessen, 8=Mecklenburg-Vorpommern, 9=Niedersachsen, 
                                                          10=Nordrhein-Westfalen, 11=Rheinland-Pfalz, 12=Saarland, 13=Sachsen, 
                                                          14=Sachsen-Anhalt, 15=Schleswig-Holstein, 16=Thüringen oder 0=alle */
const Zeitplan = "3 */8 * * *";                          /* wann soll die Abfrage stattfinden (Minuten Stunde * * *)
   die Minuten sollten auf eine "krumme" Zeit gesetzt werden, damit nicht jeder zur selben Zeit eine Anfrage an den
   Webserver von Lebensmittelwarnung.de schickt und diesen ggf. überlastet... 
   Hier: alle 8 Stunden UND 3 Minuten = 8:03 Uhr, 16:03 Uhr und 0:03 Uhr
   siehe auch cron-Syntax z.B. unter https://de.wikipedia.org/wiki/Cron */
//END User-Einstellungen *************************************************************************************************



//ab hier gibt es nix mehr zu ändern :)
//firstStart?
if (!isState(DP, false)) { createDP(); }

//globale Nicht-User-Variablen
const URL      = 'https://www.lebensmittelwarnung.de/bvl-lmw-de/opensaga/feed/alle/alle_bundeslaender.rss'
let Laender    = ['alle','Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern',
                  'Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt', 'Schleswig-Holstein','Thüringen'];

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
        var i=0, Treffer, HitBuL, Beschreibung, Bild, Produktart;
        if (debug === true) {console.log(feed.title);}
 
        feed.items.forEach(function(entry) {
            if (debug === true) {console.log(entry.title + ': ' + entry.link + ' ' + entry.description + ' ' + entry.pubDate);}
            if (i<Anzahl) {
                
               //Filter Bundesländer
               HitBuL=false;
               for(let anzBuLand=0; anzBuLand<LAENDER.length; anzBuLand++) { 
                  if (entry.description[0].indexOf(Laender[LAENDER[anzBuLand]], entry.description[0].lastIndexOf('<b>Betroffene Länder:</b>')) != -1) { HitBuL=true; }
               }
               if (HitBuL === true || LAENDER[0] == 0) { 
               
                //Suchfilter auf Beschreibung anwenden
                Treffer=0;
                for(let anzFilter=0; anzFilter<FILTER.length; anzFilter++) { 
                    if (entry.description[0].search(FILTER[anzFilter]) == -1) { Treffer++; } 
                }
                if (Treffer==FILTER.length || FILTER[0] == "false") {
                    //Bundesländer anzeigen?
                    if (BuLand === true) { Beschreibung = entry.description[0] } else { Beschreibung = entry.description[0].substring(0, entry.description[0].lastIndexOf('<b>Betroffene Länder:</b>')); }
                    //prüfen ob Bild vorhanden ist und ggf. parsen
                    if (Beschreibung.search('<img src="http') != -1) {
                        Bild = Beschreibung.substring(0, Beschreibung.indexOf('<br/>')+5);
                        Beschreibung = Beschreibung.replace(Bild, ''); 
                        Bild = Bild.substring(Bild.indexOf('"')+1, Bild.lastIndexOf('"'));
                        Bild = Bild.substring(0, Bild.indexOf('"'));
                    } else {Bild = '';}

                    //Datum auf dt. Wochentage patchen
                    let WT = entry.pubDate.substring(0, 3);
                    switch (WT) {
                        case "Mon":
                            entry.pubDate = entry.pubDate.replace('Mon', 'Mo');
                            break;
                        case "Tue":
                            entry.pubDate = entry.pubDate.replace('Tue', 'Di');
                            break;    
                        case "Wed":
                            entry.pubDate = entry.pubDate.replace('Wed', 'Mi');
                            break;
                        case "Thu":
                            entry.pubDate = entry.pubDate.replace('Thu', 'Do');
                            break;
                        case "Fri":
                            entry.pubDate = entry.pubDate.replace('Fri', 'Fr');
                            break;
                        case "Sat":
                            entry.pubDate = entry.pubDate.replace('Sat', 'Sa');
                            break;
                        case "Sun":
                            entry.pubDate = entry.pubDate.replace('Sun', 'So');
                            break;    
                        default:
                            console.log('Fehler beim Datum parsen...: '+WT);
                    }

                    //Monate auf dt. Format patchen
                    if (entry.pubDate.search('Mar')) {entry.pubDate = entry.pubDate.replace('Mar', 'März');}
                    if (entry.pubDate.search('May')) {entry.pubDate = entry.pubDate.replace('May', 'Mai');}
                    if (entry.pubDate.search('Oct')) {entry.pubDate = entry.pubDate.replace('Oct', 'Okt');}
                    if (entry.pubDate.search('Dec')) {entry.pubDate = entry.pubDate.replace('Dec', 'Dez');}

                    //Produktart filtern
                    Produktart = Beschreibung.substring(Beschreibung.indexOf('<b>Typ:</b>'));
                    Produktart = Produktart.substring(12, Produktart.indexOf('<br/>'));

                    setState(DP+'.Nummer_'+i+'.Titel', entry.title);
                    setState(DP+'.Nummer_'+i+'.Link', entry.link);
                    setState(DP+'.Nummer_'+i+'.Datum', entry.pubDate.substring(0, entry.pubDate.lastIndexOf(':'))+' Uhr');
                    setState(DP+'.Nummer_'+i+'.Beschreibung', Beschreibung);
                    setState(DP+'.Nummer_'+i+'.Produktbild', Bild);
                    setState(DP+'.Nummer_'+i+'.Produktart', Produktart);
                    i++;
                } // end Filter Produkte
               } //end Filter Bundesländer
            } // end Anzahl
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
        createState(DP+'.Nummer_'+i+'.Produktart', '', { name: "Produktart zur Warnung",
                                                    type: "string",
                                                    role: "state"
                                                 });
    }
    await Sleep(5000);
}
