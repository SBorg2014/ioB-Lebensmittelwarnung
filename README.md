<h1>ioBroker-Lebensmittelwarnung</h1>

***Dieses Javascript benötigt das NPM-Modul 'rss-parser'***

### Info ###
Damit ist es möglich einen RSS-Feed von Lebensmittelwarnung.de auszulesen und entsprechende Datenpunkte im 
ioBroker anlegen zu lassen.


### ToDo ###
- Listenansicht


### Installation ###
Zuerst, falls es auf dem System noch nicht installiert ist, den benötigten RSS-Parser installieren. Ein Terminal
öffnen und 
```
cd /opt/iobroker
npm install --save rss-parser
```
ausführen (ggf. den Pfad der ioBroker-Installation anpassen).
Nun im ioB ein neues Javascript anlegen und den Inhalt von Lebensmittelwarnung.js hineinkopieren.
Danach Konfiguration des Skripts vornehmen (Auszug der User-Einstellungen aus dem Skript):
```
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
```

   
### Konfiguration ###
Per Parameter direkt im Javascript.<br>
Hinweis zum Filter: dieser unterstützt auch RegEx<br>
Mehrere Filter müssen jeweils mit einem Komma getrennt werden.<br>
`'false'` = keinerlei Filter<br>
`'Flasche'` = einfacher Wortfilter; filtert nur Warnungen mit Wort "Flasche" heraus<br>
`/vegan.*/ig` = RegEx (keine ''!); filtert alles, egal ob Groß-/Kleinschreibung, was mit "vegan" anfängt und mit x-beliebigen 
Zeichen weiter geht: Vegan, vegan, veganes, veganer...
1. Wir wollen alles was irgendwie mit "vegan" anfängt filtern, egal in welcher Schreibweise
2. Wir wollen alles was "bio" heißt filtern, egal in welcher Schreibweise
3. Wir wollen alles was genau "Plastik" heißt filtern

Der passende Filter würde dann so lauten: `var Filter = [/vegan.*/ig, /bio/ig, 'Plastik'];`<br>
Hier sei auch auf die Dokumentation von RegEx verwiesen.<br>
Bundesländer: z.B. für *Hessen* und *Berlin* `var   LAENDER  = [3,7];`<br>


### Update von einer Vorgängerversion ###
Skript vorher anhalten. __Alle__ Datenpunkte unter dem gewählten Datenpunkt löschen (im Beispiel also den 
"Mülleimer" in den ioB-Objekten bei `javascript.0.VIS.Lebensmittelwarnung` betätigen). Skript kpl. ersetzen (ggf. 
vorher den START/END User-Einstellungen Block sichern, dann braucht man nicht alles neu konfigurieren, aber kontrollieren 
ob die Syntax noch stimmt bzw. neue Einträge hinzu gekommen oder weggefallen sind!). Skript wieder starten. 


### Beispiel-Widget ###
<img src="https://github.com/SBorg2014/ioB-Lebensmittelwarnung/blob/master/Bilder/Lebensmittelwarnung.png" alt="Widgetbild">
Dateiinhalt von Beispiel-Widget.txt 1:1 per "Import Widget" in die View einfügen.


### Allgemeines ###
__Filter:__ was hier angegeben wird erscheint *nicht* als Treffer, sondern wird verworfen.<br>
__Anzahl=5:__ bedeutet, es werden solange Meldungen gelesen, bis die eingestellte Anzahl von 5 erreicht wird. 
Jüngste zuerst (LIFO).<br>


## Versionen ##
**V0.0.8 - 31.10.2019**
``` 
    + Meldungen für mehrere Bundesländer möglich
```

**V0.0.7 - 03.10.2019**
``` 
    ~ mehrere Filter möglich
```

**V0.0.6 - 02.09.2019**
```
    ~ Wochentage und Monate auf dt. Datumsformat gepatcht
    + Produktart als Datenpunkt
    ~ Datum neu formatiert (Sekunden entfernt und "Uhr" hinzugefügt)
```
	
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
