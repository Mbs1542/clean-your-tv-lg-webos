# Clean Your TV — guida all’uso

> Candidato 1.4.1 non pubblicato: compatibilità OTA Root, disponibilità aggiornamenti, accesso API firmware e correzioni pacchetti/console Windows. Accettazione TV e aggiornamento/ripristino firmati restano da verificare; non è un download pubblicato. [1.4.1](../RELEASE-1.4.1.md).

[Documentazione](../README.md) · [Segnalare un problema](../FEEDBACK.md)

Questa guida descrive la versione pubblicata **[1.4.0](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/tag/v1.4.0)**. L’accettazione C3 copre le prove registrate di alimentazione, Home, focus, stato disattivato e ripristino manuale della versione precedente. Altri TV, audio eARC e dispositivi Android fisici restano non verificati; l’installazione riuscita non dimostra compatibilità. [Ambito verificato (inglese)](../RELEASE-1.4.0-ACCEPTANCE.md).

## Scegliere l’edizione

No-root e Root sono opzioni equivalenti per diverse configurazioni della TV. Scegli No-root per LG Developer Mode oppure Root se disponi già di accesso root tramite SSH. Compatibilità e verifiche eseguite sono specifiche di ogni edizione.

- **No-root:** attiva LG Developer Mode e Key Server. Inserisci la frase di accesso mostrata sul televisore e accetta sullo schermo la richiesta separata di abbinamento. Developer Mode deve restare attivo: alla scadenza le app installate in questo modo possono essere rimosse. Controlla il timer ufficiale anche con rinnovo Beta attivo. Il monitoraggio di Helper richiede la rete locale.
- **Root:** serve un accesso SSH root già disponibile. L’installer non ottiene i privilegi root. Non attivare Developer Mode su una configurazione già dotata di root. Mantieni disponibili accesso root e servizi di ripristino.

## Prerequisiti

Accendi il televisore e collegalo alla stessa rete locale affidabile del computer. Dopo l’installazione il computer può restare spento. La compatibilità dipende da modello, firmware e telecomando; Root ha ancora verifiche hardware da completare.

No-root Helper richiede Node.js **0.12.2+** sul TV. Root richiede Node.js **8+** e Python **3.9+** funzionante. Se necessario, l’installer scarica un Python privato verificato; la preparazione iniziale richiede **320 MiB** liberi. Non sostituisce Python di sistema. Conserva gli ambienti usati dal recupero. [Python (inglese)](../OPTIONAL-PYTHON.md). Il rinnovo Developer Mode è **Beta, disattivato per impostazione predefinita**; il rinnovo reale senza root non è confermato. Controlla ancora il timer ufficiale.

### Configurare Developer Mode (No-root)

Developer Mode permette a CYTV di installare app su una TV senza root.

1. Sulla TV, apri LG Apps, cerca Developer Mode e installalo.
2. Apri Developer Mode e accedi con il tuo account LG Developer. Se necessario, crea un account su webostv.developer.lge.com.
3. Attiva Dev Mode Status. La TV si riavvia. Poi apri di nuovo Developer Mode.
4. Attiva Key Server e lascia Developer Mode aperto. Inserisci il suo IP Address come indirizzo della TV in CYTV.
5. Inserisci la Passphrase: i sei caratteri mostrati in Developer Mode sulla TV. Rispetta maiuscole e minuscole.

Usa il codice della TV, non la password del tuo account LG. Se il codice non appare, attiva Key Server.

L’associazione è un passaggio separato: quando la TV lo chiede, autorizza CYTV con il telecomando.

Mantieni Developer Mode attivo: prima che scada il timer, aprilo e premi EXTEND con la TV connessa a Internet. Alla scadenza, LG può rimuovere queste app.

## Installazione e lingua

- **Windows x64:** scarica `cytv-windows-x64-desktop.zip`, scegli **Estrai tutto** in Esplora file e apri `cytv-desktop/cytv-desktop.exe`. Mantieni la cartella `_internal` accanto al file. La firma dell’editore Windows non è configurata. La console separata è `cytv-windows-x64.exe`; rinominala in `cytv.exe` e usa `.\cytv.exe` in PowerShell per i comandi seguenti.
- **macOS 13+:** estrai `cytv-macos-arm64.zip` per Apple Silicon oppure `cytv-macos-x64.zip` per Intel, sposta `cytv.app` in Applicazioni e aprila. Consenti l’accesso alla rete locale. Se un download affidabile viene bloccato, usa Privacy e sicurezza → Apri comunque; non disattivare Gatekeeper. La verifica sui sistemi meno recenti non è conclusa.
- **Linux x64:** su Ubuntu 22.04+, Debian 12+ o Mint 21+, installa `cytv-linux-x64.deb` con il gestore grafico dei pacchetti e apri Clean Your TV dal menu. Le librerie possono richiedere Internet. Linux ARM non è incluso. L’eseguibile autonomo `cytv-linux-x64` è la CLI; usa il `.deb` per l’app grafica.

[Installer Android (inglese)](../../android/README.md): scegli la lingua in alto a destra. Aggiorna senza disinstallare o cancellare dati. Android 7 / WebView 108 è il minimo, non una configurazione telefonica verificata; l’accettazione usa un emulatore Android 15 ARM64 / WebView 124. Telefoni fisici e recupero con TV reale restano non verificati.

L’assistente usa inizialmente la lingua del sistema e salva una scelta esplicita. Sul televisore, apri **Impostazioni → Lingua** e scegli una lingua oppure l’opzione automatica del sistema. Le preferenze del televisore e dell’installer sono separate. I codici sono nell’[indice delle lingue](../LANGUAGES.md).

Per la CLI scaricata separatamente su macOS/Linux, dalla cartella estratta:

```sh
chmod +x cytv
./cytv --language it install
```

Scegli il televisore o inserisci l’IP, seleziona l’edizione e controlla il riepilogo. Accetta una nuova identità SSH solo per il tuo televisore su una rete affidabile; una chiave salvata cambiata blocca l’accesso. Root prepara il ripristino e attiva subito Home, senza prova temporanea né passaggio per confermare il mantenimento. Verifica frecce, OK, Home, Indietro/Annulla, volume, standby e avvio a freddo.

## Uso e ripristino

Le frecce selezionano, OK apre; tieni premuto OK per riordinare. Un breve Indietro conserva navigazione e conferma di uscita dell’app. Home apre il launcher quando il controllo è attivo. Tieni premuto Indietro per 1,2 secondi per aprire LG Home una volta. L’interruttore del controllo Home e le impostazioni restano invariati.

**Premi Home tre volte entro due secondi**, rilasciandolo tra le pressioni. Ripristina LG Home e interrompe il controllo senza cancellare le preferenze. Con No-root Helper fino alla 0.6.13 inclusa, tieni invece premuto Home per circa due secondi. La pressione prolungata di Home non è il gesto di emergenza di Root.

No-root: Per riavviare il controllo Home, apri Home Helper, scegli Avvia Helper e conferma. La tua scelta della schermata Home viene mantenuta. Root: attiva **Cambia Home** nelle impostazioni Home per riprendere. **Apri LG Home** apre LG Home una volta senza cambiare la destinazione di Home. Per ripristinare LG Home come destinazione permanente, disattiva **Cambia Home** o esegui `cytv restore`. Non eseguire entrambi i controllori insieme. Se il problema ricompare, lascia attivo LG Home.

```sh
./cytv --language it status
./cytv --language it doctor --report
./cytv --language it restore
./cytv --language it uninstall
```

Dopo un’interruzione, esegui prima `status` e conserva i registri. `restore` ripristina LG Home senza rimuovere app; `uninstall` lo ripristina prima della rimozione. I dati di ripristino Root restano intenzionalmente: non cancellarli per forzare una reinstallazione. Controlla i rapporti prima di condividerli; non pubblicare chiavi o cartelle dei profili.

Solo nella versione candidata non ancora pubblicata, in entrambe le edizioni: apri **Impostazioni di Home → Aspetto → Colonne** e scegli da 1 a 8 colonne, oppure **Secondo il tema** per usarne il valore (Classic: 5). Un numero esplicito ha la precedenza sul tema. I temi con disposizione fissa nascondono l’opzione Colonne e usano il valore dell’autore. La scelta salvata viene ripristinata passando a un tema che supporta questa impostazione. Nell’anteprima candidata Glasshouse, le app formano una sola fila orizzontale ciclica: Sinistra/Destra scorre, Su apre le scorciatoie e Giù torna alla stessa app. Nell’anteprima Glasshouse puoi scorrere anche con la rotella o il touchpad; Home non si muove dietro una finestra aperta.

Nelle anteprime dei temi della versione candidata non pubblicata con barra laterale opzionale, Su/Giù seleziona una voce del menu, Destra passa alle app e Sinistra dalla prima colonna delle app torna al menu.

## Aggiornamenti e rimozione

Dopo la connessione, cytv mostra versione installata → inclusa e distingue prima installazione, reinstallazione e downgrade. Controlla il riepilogo prima della conferma; `--yes` non rende sicuro un passaggio incompatibile. Conserva pacchetti funzionanti e copie private delle impostazioni. Per gli aggiornamenti dal computer ferma No-root Helper prima di sostituire i pacchetti; non disinstallare prima. Non sovrascrivere un ambiente Root attivo con una sola IPK: usa il percorso previsto da cytv. Rimuovere l’app desktop non rimuove le app TV.

Apri impostazioni Home → Aggiornamenti software e verifica le versioni prima di confermare. Aggiornamento e rollback sul TV richiedono **root, Homebrew Channel** e infrastruttura di aggiornamento compatibile già preparata, anche per No-root. Senza root usa il computer. Preparare gli aggiornamenti completi è un’azione esplicita separata: [aggiornamenti (inglese)](../UPDATES.md). Recupero mostra la versione salvata; il rollback può perdere modifiche successive alle impostazioni.

**Installazione 1.3.0 esistente:** il System Updater originale non può applicare 1.4.0 perché è cambiato l’elenco dei file consentiti. Se il tentativo si ferma prima della sostituzione, conserva il registro e fermati; non cancellare lo stato né ripetere alla cieca. Usa il recupero verificato e una nuova installazione 1.4.0; aggiornare solo l’app non sostituisce i driver Root conservati. La prossima correzione OTA **non è pubblicata**. [Migrazione e recupero (inglese)](../UPDATES.md#one-time-computer-preparation).

Il recupero audio HDMI Root è sperimentale e **disattivato per impostazione predefinita**; abilitalo solo se serve. Può interrompere audio funzionante e non dimostra compatibilità eARC. [Recupero audio (inglese)](../development/ROOT-AUDIO-RECOVERY.md). Il **CYTV Installer Homebrew non è ancora pubblicato**; usa l’installer pubblicato per computer o Android.

Solo candidato non pubblicato: se vecchie directory Root scrivibili impediscono l’accesso all’API del firmware, `cytv enable-firmware-access --edition root --repair-package-permissions` verifica il pacchetto corrente con dati privati attendibili e rimuove la scrittura per gruppo/altri solo dai percorsi propri di Root. File sconosciuti o modificati fermano la riparazione. Profilo, scelta Home e blocco firmware restano invariati; [dettagli (inglese)](../LG-FIRMWARE-UPDATES.md#explicit-package-permission-repair-candidate).

## Aiuto e altre istruzioni

Dopo un errore o un’interruzione, controlla lo stato e salva il rapporto diagnostico di quel tentativo. Il recupero guidato chiede conferme separate per rimozione e reinstallazione. Se il risultato è incerto, fermati e conserva registri privati e file di recupero; non eliminarli mai per forzare un tentativo. [Recupero (inglese)](../RECOVERY.md). Per assistenza indica modello, firmware, edizione, versione dell’installer, passaggio fallito e risultato atteso/effettivo; verifica e rimuovi i segreti dal rapporto prima di condividerlo.

[Documentazione](../README.md) · [Segnalare un problema](../FEEDBACK.md)

<!-- Anchors retained for links to earlier guide headings. -->
<a id="requisiti"></a>
<a id="python-opzionale-per-root"></a>
<a id="verifiche-hardware-e-limiti"></a>
<a id="blocco-firmware-lg-in-120"></a>
<a id="novità-della-130-ripristino-guidato-dal-computer"></a>
<a id="novità-della-130--12"></a>
<a id="candidato-non-pubblicato-installazione-root-tramite-homebrew"></a>
<a id="candidato-non-pubblicato-ripristino-audio-hdmi-root"></a>


## Temi: candidato in sviluppo

Nel candidato compatibile: **Impostazioni → Aspetto → Temi**. **Classic** e **Alpine** sono integrati e non richiedono il download del tema; Classic resta predefinito. **Channel** è esterno, dallo showcase. Durante una prova nella galleria: Scegli il tema e **Mantieni tema** entro **20 secondi**. **Ripristina**, Back o la scadenza ripristinano il precedente. Una prova interrotta avvia nuovamente Home con Classic. I temi integrati e scaricati scelti nell’elenco installato vengono applicati e salvati subito, senza timer. Vale anche per quelli ricevuti dal computer o installati tramite URL. Solo Prova tema nella galleria avvia una prova di 20 secondi, anche per versioni già scaricate.

Aprire la galleria o scegliere Aggiorna verifica gli aggiornamenti revisionati nel repository principale senza aggiornare Home o ricaricare la pagina. Le nuove voci arrivano dopo la normale integrazione; un candidato non integrato può mostrare il catalogo incluso. Offline o in caso di errore si usano voci e anteprime incluse. I temi integrati corrispondono alla versione installata di Home. Apri un’anteprima, poi **Prova tema** per i temi integrati o **Scarica tema** per Channel (serve internet). Dopo il download, prova e scegli **Mantieni tema** entro **20 secondi**. I temi installati funzionano offline. **Aggiungi tramite URL** resta disponibile per i link fissati.

Per un tema non pubblicato, apri l’anteprima autore sul computer e scegli **Invia alla TV**, poi **Ricevi dal computer** sulla TV. Entrambi devono essere sulla stessa rete domestica fidata: HTTP usa la porta TCP fissa **8879**, da consentire nel firewall del computer. Inserisci il suo indirizzo IPv4 privato e il PIN di sei cifre. Lascia aperta la condivisione; la sessione scade dopo **10 minuti**. L’indirizzo viene ricordato, il PIN no. Non occorre pubblicare su GitHub.

I pacchetti pubblicati potrebbero non avere ancora questi comandi. I test nel browser non provano la compatibilità TV. [Guida completa](../THEMES.md).

## Categorie delle impostazioni (candidato non pubblicato)

Entrambe le edizioni mostrano le categorie a sinistra e le impostazioni a destra: schermata Home, Aspetto (temi e colonne), Lingua, Aggiornamenti software e Avanzate. No-root aggiunge Developer Mode; Root include il firmware LG negli aggiornamenti e l’audio HDMI in Avanzate. Su/Giù naviga nella colonna, Destra entra nelle impostazioni e Sinistra torna alle categorie. Indietro torna prima alle categorie, poi chiude le impostazioni. Tab raggiunge anche il pulsante per tornare a Home.

Un punto giallo su Aggiornamenti software e sul pulsante interno indica un aggiornamento disponibile. Entrambi scompaiono quando una verifica riuscita conferma che non ci sono aggiornamenti; in caso di errore resta l’ultimo stato confermato.
