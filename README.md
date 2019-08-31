<h1>ioBroker-Lebensmittelwarnung</h1>

***Dieses Javascript benötigt das NPM-Modul 'rss-parser'***

### Info ###
Damit ist es möglich einen RSS-Feed von Lebensmittelwarnung.de auszulesen und entsprechende Datenpunkte im 
ioBroker anlegen zu lassen.

<br>
### ToDo ###
- besseres Datenpunktmanagment
- beliebig viele filter ermöglichen

<br>
### Installation ###
Zuerst, falls es auf dem System noch nicht installiert ist, den benötigten RSS-Parser installieren. Ein Terminal
öffnen und 
```
cd /opt/ioBroker
npm install --save rss-parser
```
ausführen (ggf. den Pfad der ioBroker-Installation anpassen).
Nun im ioB ein neues Javascript anlegen und den Inhalt von Lebensmittelwarnung.js hineinkopieren.
Konfiguration des Skripts vornehmen:
```
//START User-Einstellungen ***********************************************************************************************
const debug    = false;                                  //debuggen [true/false]?
const Anzahl   = 5;                                      //wie viele Warnungen sollen gelesen werden?
const BuLand   = true;                                   //zeige Bundesländer an [true/false]?
const DP       = 'javascript.0.VIS.Lebensmittelwarnung'; //Datenpunkt
const URL      = 'https://www.lebensmittelwarnung.de/bvl-lmw-de/opensaga/feed/alle/hessen.rss'; //URL des RSS-Feeds
var   FILTER   = 'false';                                //ausfiltern bestimmter Suchbegriffe oder 'false' für keinen Filter
const Zeitplan = "3 */12 * * *";                         /* wann soll die Abfrage stattfinden (Minuten Stunde * * *)
   die Minuten sollten auf eine "krumme" Zeit gesetzt werden, damit nicht jeder zur selben Zeit eine Anfrage an den
   Webserver von Lebensmittelwarnung.de schickt und diesen ggf. überlastet... 
   Hier: alle 12 Stunden UND 3 Minuten = 12:03 Uhr und 0:03 Uhr
   siehe auch cron-Syntax z.B. unter https://de.wikipedia.org/wiki/Cron */
//END User-Einstellungen *************************************************************************************************
```

<br>   
### Konfiguration ###
Per Parameter direkt im Javascript.<br>
Hinweis zum Filter: dieser unterstützt auch RegEx<br>
`'false'` = keinerlei Filter<br>
`'Flasche'` = einfacher Wortfilter; filtert nur Warnungen mit Wort "Flasche" heraus<br>
`/vegan.*/ig` = RegEx (keine ''!); filtert alles, egal ob Groß-/Kleinschreibung, was mit "vegan" anfängt und mit x-beliebigen 
Zeichen weiter geht: Vegan, vegan, veganes, veganer...

<br>
### Update von einer Vorgängerversion ###
Skript vorher anhalten. __Alle__ Datenpunkte unter dem gewählten Datenpunkt löschen (im Beispiel also den 
"Mülleimer" in den ioB-Objekten bei `javascript.0.VIS.Lebensmittelwarnung` betätigen). Skript kpl. ersetzen (ggf. 
vorher den START/END User-Einstellungen Block sichern, dann braucht man nicht neu confen, aber kontrollieren ob 
die Syntax noch stimmt bzw. neue Einträge hinzu gekommen oder weggefallen sind!). Skript wieder starten. 

<br>
### Beispiel-Widget ###
<img src="https://github.com/SBorg2014/ioB-Lebensmittelwarnung/blob/master/Bilder/Lebensmittelwarnung.png" alt="Widgetbild" />
Code 1:1 per "Import Widget" in die View einfügen.

<br>
## Versionen ##
**V0.0.5 - 31.08.2019**
```
    ~ Bilder als eigener Datenpunkt ausgelagert
```

**V0.0.4 - 29.08.2019**
```
    + Fehlermanagement Webserver
    + Datenpunkt für "neue Warnung" / true bei neuer Warnung
    + filtern eines Suchbegriffes
```

**V0.0.3 - switch to Beta (28.08.2019)**
```
    ~ Datum formatiert
    + betroffene Bundesländer anzeigen? 
    ~ Fehler beim ersten Start des Skripts behoben
```

**V0.0.2 - zweite Alpha (27.08.2019)**
```
    + Titel, Datum und Link hinzugefügt
```
    
**V0.0.1 - erste Alpha (26.08.2019)**
```
    + Grundfunktion
```

<br><br><br>
## License ##
The MIT License (MIT)

Copyright (c) 2019 SBorg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.