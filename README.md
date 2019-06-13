# Product configuration

Progetto di Avanzato Thomas e Castellano Astrid

## Il progetto

- Ci è stato chiesto di implementare un configuratore 3D per la visualizzazione di un modello tridimensionale con diversi materiali, in modo più realistico possibile. Si desidera che l'aspetto grafico di questo software ricordi un vero sito di e-commerce.
- Lo shading può essere implementato "a mano" oppure si possono usare i materiali già forniti da Three.js, a patto di trovare quale funzione BRDF utilizzano, e riscriverla in modo formale (non algoritmico).

## Pre-requisiti

- Saper utilizzare Three.js, importare modelli 3D, creare materiali.
- Conoscere i concetti base di shading con textures e mappatura UV, le diverse mappe per lo shading (normal, AO, diffusive, specular, roughness, displacement...).
- Conoscenza di base su illuminazione di prodotto.
- Saper creare interfacce grafiche per il web (html, css, js...).

## Goals 

- Creare un configuratore per applicare materiali realistici ad un oggetto 3D. Possibilmente materiali plausibili per il tipo di oggetto rappresentato (non auto di legno, sedie di carta ecc...).
- Creare un'interfaccia intuitiva che permetta di applicare i vari materiali in modo semplice e chiaro.
- Dare l'aspetto di un e-commerce professionale.

## Starting code

- Per l'implementazione del progetto non è stato fornito alcun codice di partenza, abbiamo comunque a disposizione gli esempi del corso che coprono la quasi totalità degli argomenti.

## Steps 

1. Clonato il progetto di partenza della repository del docente.
2. Progettazione dell'interfaccia e degli spazi designati alle varie attività nella pagina.
3. Ricerca di un modello 3D da utilizzare
4. Ricerca di materiali.
5. Ricerca su illuminazione di prodotto.
6. Costruzione della pagina con importazione del modello (momentaneamente senza materiali).
7. Implementazione dinamica di rotazione del modello (con limitazioni su asse x, non ruota su z, possiede dell'inerzia).
8. Aggiunta delle luci e posizionmento in modo coerente con il tipo di modello, in modo da illuminarlo il più uniformemente possibile.
9. Creazione dei materiali utilizzando le textures PBR ottenute dal sito [cc0 textures](<http://www.cc0textures.com>) e [MeshStandardMaterial](<http://www.inf.u-szeged.hu/~tanacs/threejs/docs/#api/en/materials/MeshStandardMaterial>).
10. Creazione del meccanismo di cambio dei materiali.
11. Rifintura dell'interfaccia grafica, aggiunta di funzionalità extra (scattare una foto e poterla salvare, centrare la geometria e visualizzazione in AR).
12. Individuazione della BRDF utilizzata nel codice sorgente di Three.js e riscrittura della stessa in forma matematica.


## Modello 3D

Abbiamo utilizzato un modello 3D di una sedia disegnata da [Moroso](<https://moroso.it>) e gentilmente ceduta per uso accademico (si prega quindi di non scaricare ed utilizzare in nessun modo il modello).
Dettagli del modello:
- N vertici
- ...


## Luci

Le luci, di tipo spotlight, sono state posizionate nel seguente modo:
![disposizione luci](screenshots/luci.png)
ed hanno le seguenti proprietà:
- ...


## Materiali

Per questo progetto è stato usato il materiale [MeshStandardMaterial](<http://www.inf.u-szeged.hu/~tanacs/threejs/docs/#api/en/materials/MeshStandardMaterial>) di Three.js, di cui riportiamo la funzione BRDF, sia in forma matematica che algoritmica presente nel codice sorgente.
Formalmente:
![BRDF](screenshots/BRDF.png)
Nel codice:
![algoritmo BRDF](screenshots/algoritmo_brdf.jpg)

Le textures utilizzate per i vari materiali (per comodità solo le componenti diffusive).

Tessuti

<img src="textures/fabric01/diff.jpg" width="150" height="150" alt="fabric01"/><!--
--><img src="textures/fabric02/diff.jpg" width="150" height="150" alt="fabric02"/><!--
--><img src="textures/fabric03/diff.jpg" width="150" height="150" alt="fabric03"/><!--
--><img src="textures/fabric04/diff.jpg" width="150" height="150" alt="fabric04"/><!--
--><img src="textures/fabric05/diff.jpg" width="150" height="150" alt="fabric05"/>

Pelli

<img src="textures/leather01/diff.jpg" width="150" height="150" alt="leather01"/><!--
--><img src="textures/leather02/diff.jpg" width="150" height="150" alt="leather02"/>

Metalli

<img src="textures/metal01/diff.jpg" width="150" height="150" alt="metal01"/><!--
--><img src="textures/metal02/diff.jpg" width="150" height="150" alt="metal02"/><!--
--><img src="textures/metal03/diff.jpg" width="150" height="150" alt="metal03"/>

Legni

<img src="textures/wood01/diff.jpg" width="150" height="150" alt="wood01"/><!--
--><img src="textures/wood02/diff.jpg" width="150" height="150" alt="wood02"/>


## Applicazione dei materiali

Abbiamo reso possibile applicare diversi materiali a diverse parti della sedia:
- 5 tessuti e 2 tipi di pelle per la seduta.
- 3 metalli e 2 tipi di legno per braccioli e basamento, tra loro indipendenti.

Alcune combinazioni:

![Chair_0](screenshots/Chair_0.jpg)

![Chair_1](screenshots/Chair_1.jpg)

![Chair_2](screenshots/Chair_2.jpg)

![Chair_3](screenshots/Chair_3.jpg)

![Chair_4](screenshots/Chair_4.jpg)

![Chair_5](screenshots/Chair_5.jpg)


## Interfaccia

L'interfaccia grafica è molto essenziale e prevede il canvas per il rendering di Three.js a schermo pieno, con un menù laterale a scomparsa in cui è possibile selezionare i materiali ed eventualmente procedere con l'acquisto.

<img src="screenshots/Configure.JPG" alt="configure" />

<img src="screenshots/Order.JPG" alt="order" />


## Funzionalità extra

Per arricchire l'esperienza dell'utente sono state aggiunte 3 funzionalità extra non richieste:
- Possibilità di riportare il modello e la vista nella posizione originale con un bottone apposito, ad esempio dopo essersi avvicinati o aver ruotato il modello.
- Possibilità di poter scattare una foto alla configurazione attuale e poterla salvare sul dispositivo.
- Possibilità di vedere il modello in AR tramite webcam o fotocamera, dopo aver scaricato l'apposito marker.

Snapshot

![snapshot](screenshots/Snapshot.JPG)

Augmented reality

![AR1](screenshots/AR1.JPG)

![AR2](screenshots/AR2.JPG)

## Tecnologie utilizzate
- HTML per la creazione della pagina, dei canvas per il rendering e la reltà aumentata.
- CSS per gli stili grafici (senza librerie o framework).
- Javascript per le funzionalità come ascoltatori di eventi, creazione di elementi dinamici nel DOM, possibilità di scaricare il frame "fotografato".
- Three.js per la parte 3D.
- JsARToolkit per il tracking del marker nella realtà aumentata.