# Diario

## 2019-05-07

- Creazione del gruppo su github e clonazione della repository del progetto.
- Analisi della traccia.

## 2019-05-08

- Ricerca modello 3D.
- Ricerca di materiali PBR su [cc0 textures](<https://cc0textures.com/>).
- Ricerca su utilizzo delle luci per illuminazione di prodotto.

## 2019-05-10

- Progettazione di gruppo dell'aspetto finale dell'applicativo.

## 2019-05-15

- Creazione pagina html base, script js con Three.js.
- Deciso il modello da utilizzare: sedia di design [Moroso](<https://moroso.it/>) gentilmente ceduta per scopo didattico.
- Importazione del modello 3D nella pagina (senza materiali).

## 2019-05-18

- Creazione meccanismo di rotazione dell'oggetto, tramite il mouse o input tattile.
- Creazione meccanismo di avvicinamento ed allontanamento della camera, tramite rotella del mouse o gesto tattile equivalente sul touchpad.

## 2019-05-23

- Limitazione nella rotazione del modello:
	- Non ruota su z.
	- Su x è limitato nell'intervallo [+5deg, +45deg].
	- Non ha limitazioni di movimento su y.

- Definizione della posizione della camera e rotazione del modello di default:
	- Camera: limitata nell'intervallo [+20, +50], di default è in +30.
	- Modello: la rotazione x di default è +20deg, così come la rotazione di default in y (questo per presentare il modello in una posizione più accattivante e dinamica).

## 2019-05-28

- Aggiunta delle luci; 3 luci spotlight e una ambientale molto tenue.
	- Luce 1: bianca, in ( 30, 80, 50 ). Luce che proviene dalle spalle, in alto e leggermente a destra.
	- Luce 2: bianca, in ( -10, 5, 50 ). Luce rasoterra, che proviene dalle spalle e da sinistra. Serve per illuminare il basamento della sedia.
	- Luce 3: bianca, in ( -40, 80, 50 ). Luce che proviene dall'alto, dalle spalle e molto a sinistra, si contrappone alla prima e permette di illuminare le ombre lasciate dalla stessa.


## 2019-06-03

- Strutturazione dei materiali: divisione in sottocartelle, rinomina, ridimensionamento da 2048x2048 a 1024x1024.
- Prove di applicazione dei materiali al modello, aggiustamenti delle quantità delle ripetizioni in base al tipo di texture e all'effetto voluto.

## 2019-06-06

- Aggiunta di funzionalità extra: bottone per centrare il modello da qualsiasi posizione lo si abbia portato.
- Ricerca di un modo per salvare il frame corrente.

## 2019-06-07

- Aggiunta di funzionalità extra: possibilità di scattare una foto al modello in configurazione e salvarla sul dispositivo.

## 2019-06-09

- Integrazione con un meccanismo di realtà aumentata (svolto in un altro corso) e adattamento dello stesso per funzionare con il nostro modello.
- Aggiunta di funzionalità extra: ora è possibile vedere la sedia in AR su uno specifico marker.

## 2019-06-10

- Aggiunta la possibilità di chiudere lo stream video per l'AR una volta aperto.
- Aggiunto meccanismo per scaricare il marker prima di utilizzare l'AR.

## 2019-06-12

- Analisi del codice sorgente di Three.js per individuare la BRDF utilizzata in MeshStandardMaterial.
- Individuati i vertex e fragment shaders utilizzati.
- Comprensione del codice presente nel fragment shader (dove più verosimilmente verrà utilizzata la BRDF).

## 2019-06-13

- Individuato il codice che definisce la BRDF.
- Riscrittura dello stesso in linguaggio matematico e non algoritmico.
- Inizio stesura della relazione
- Submit alla cartella di progetto su Github.

## 2019-06-14

- Proseguimento della relazione, generazione di immagini da utilizzare in essa (screenshots).
- Aggiunta dei files alla cartella madre del progetto (Github).

## 2019-06-15

- Ultimi ritocchi alla relazione.
