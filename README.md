<h1>ioBroker-Lebensmittelwarnung</h1>

***Dieses Javascript benötigt das NPM-Modul 'rss-parser'***

### Info
Damit ist es möglich einen RSS-Feed von Lebensmittelwarnung.de auszulesen und entsprechende Datenpunkte im 
ioBroker anlegen zu lassen.


### ToDo
- besseres Datenpunktmanagment
- Datenpunkt für "neue Warnung"
- Üerschrift, Link und Datum (formatieren) hinzufügen
- try/catch für Fehler (bspw. Webserver nicht erreichbar)

### Installation
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
//User-Einstellungen
const Anzahl = 5;                                      //wie viele Warnungen sollen gelesen werden?
const DP     = 'javascript.0.VIS.Lebensmittelwarnung'; //Datenpunkt
const debug  = false;                                  //debuggen [true/false]?
const URL    = 'https://www.lebensmittelwarnung.de/bvl-lmw-de/opensaga/feed/alle/hessen.rss'; //URL des RSS-Feeds
/* wann soll die Abfrage stattfinden (Minuten Stunde * * *)
   die Minuten sollten auf eine "krumme" Zeit gesetzt werden, damit nicht jeder zur selben Zeit eine Anfrage an den
   Webserver von Lebensmittelwarnung.de schickt und diesen ggf. überlastet... */
schedule("3 */12 * * *", polldata);
```
   
### Konfiguration
Per Parameter direkt im Javascript.

### Beispiel-Widget
<img src="https://github.com/SBorg2014/ioB-Lebensmittelwarnung/blob/master/Bilder/Lebensmittelwarnung.png" alt="Widgetbild">
Code 1:1 per *Import Widget* in die View einfügen.


## Versionen
    
**V0.0.1 - erste Alpha (26.08.2019)**
```
    + Grundfunktion
```

## License
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