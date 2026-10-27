# Clean Your TV — instrukcja użytkownika

[Dokumentacja](../README.md) · [Zgłoś problem](../FEEDBACK.md)

Poradnik opisuje opublikowaną wersję **[1.4.0](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/tag/v1.4.0)**. Akceptacja C3 obejmuje zapisane testy zasilania, Home, fokusu, zachowania stanu wyłączenia i ręcznego cofnięcia wersji. Inne telewizory, dźwięk eARC i fizyczne urządzenia Android pozostają niezweryfikowane; udana instalacja nie dowodzi zgodności. [Zakres testów (angielski)](../RELEASE-1.4.0-ACCEPTANCE.md).

## Wybierz edycję

No-root i Root to równorzędne opcje dla różnych konfiguracji telewizora. Wybierz No-root dla LG Developer Mode lub Root, jeśli masz już dostęp root przez SSH. Zgodność i zakres wykonanych testów są określane osobno dla każdej wersji.

- **No-root:** włącz LG Developer Mode i Key Server. Wpisz hasło wyświetlane na telewizorze i zaakceptuj na nim osobne żądanie parowania. Developer Mode musi pozostać aktywny: wygaśnięcie sesji może usunąć tak zainstalowane aplikacje. Sprawdzaj oficjalny licznik także przy włączonym odnawianiu Beta. Monitorowanie Helper wymaga sieci lokalnej.
- **Root:** potrzebny jest istniejący dostęp root przez SSH. Instalator nie uzyskuje uprawnień root. Nie włączaj Developer Mode na telewizorze z istniejącym rootem. Zachowaj dostęp root i usługi odzyskiwania.

## Wymagania

Włącz telewizor i połącz go z tą samą zaufaną siecią lokalną co komputer. Później komputer może być wyłączony. Zgodność zależy od modelu, oprogramowania i pilota; Root ma nieukończone testy sprzętowe.

No-root Helper wymaga Node.js **0.12.2+** na TV. Root wymaga Node.js **8+** i działającego Pythona **3.9+**. W razie potrzeby instalator pobierze zweryfikowanego prywatnego Pythona; początkowe przygotowanie wymaga **320 MiB** wolnego miejsca. Nie zastępuje Pythona systemowego. Zachowaj środowiska potrzebne do odzyskiwania. [Python (angielski)](../OPTIONAL-PYTHON.md). Odnawianie Developer Mode to **Beta, domyślnie wyłączona**; rzeczywiste odnawianie bez roota nie zostało potwierdzone. Nadal sprawdzaj oficjalny licznik.

### Konfiguracja Developer Mode (No-root)

Developer Mode pozwala CYTV instalować aplikacje na TV bez roota.

1. Na TV otwórz LG Apps, wyszukaj Developer Mode i zainstaluj aplikację.
2. Otwórz Developer Mode i zaloguj się na konto LG Developer. W razie potrzeby utwórz konto na webostv.developer.lge.com.
3. Włącz Dev Mode Status. TV uruchomi się ponownie. Następnie otwórz ponownie Developer Mode.
4. Włącz Key Server i pozostaw Developer Mode otwarty. Wpisz widoczny IP Address jako adres TV w CYTV.
5. Wpisz Passphrase: sześć znaków widocznych w Developer Mode na TV. Zachowaj wielkość liter.

Użyj kodu z TV, a nie hasła konta LG. Jeśli kodu nie widać, włącz Key Server.

Parowanie to osobny krok: gdy TV zapyta, zatwierdź CYTV pilotem.

Utrzymuj Developer Mode aktywny: przed końcem odliczania otwórz aplikację i naciśnij EXTEND, gdy TV ma internet. Po wygaśnięciu LG może usunąć te aplikacje.

## Instalacja i język

- **Windows x64:** pobierz `cytv-windows-x64-desktop.zip`, wybierz **Wyodrębnij wszystkie** w Eksploratorze i otwórz `cytv-desktop/cytv-desktop.exe`. Zachowaj obok folder `_internal`. Podpis wydawcy Windows nie jest skonfigurowany. Osobna konsola to `cytv-windows-x64.exe`; zmień nazwę na `cytv.exe` i użyj `.\cytv.exe` w PowerShell dla poniższych poleceń.
- **macOS 13+:** rozpakuj `cytv-macos-arm64.zip` dla Apple Silicon lub `cytv-macos-x64.zip` dla Intela. Przenieś `cytv.app` do Aplikacji i otwórz; zezwól na dostęp do sieci lokalnej. Jeśli zaufany plik zostanie zablokowany, użyj Prywatność i ochrona → Otwórz mimo to; nie wyłączaj Gatekeepera. Zgodność ze starszymi systemami nie jest w pełni potwierdzona.
- **Linux x64:** na Ubuntu 22.04+, Debianie 12+ lub Mint 21+ zainstaluj `cytv-linux-x64.deb` przez graficzny menedżer pakietów i otwórz Clean Your TV z menu. Pobranie bibliotek może wymagać Internetu. Nie ma pakietu Linux ARM. Samodzielny plik `cytv-linux-x64` to CLI; aplikacja graficzna jest w pakiecie `.deb`.

[Instalator Android (angielski)](../../android/README.md): wybierz język w prawym górnym rogu. Aktualizuj bez odinstalowania i czyszczenia danych. Android 7 / WebView 108 to minimum, a nie sprawdzony telefon; testy akceptacyjne używały emulatora Android 15 ARM64 / WebView 124. Fizyczne telefony i odzyskiwanie z połączeniem do prawdziwego TV pozostają niezweryfikowane.

Kreator początkowo używa języka systemu i zapamiętuje wybrany język. Na telewizorze otwórz **Ustawienia → Język** i wybierz język lub automatyczny wybór według systemu. Preferencje instalatora i telewizora są niezależne. Kody zawiera [spis języków](../LANGUAGES.md).

Dla osobno pobranej CLI na macOS/Linux, w rozpakowanym katalogu:

```sh
chmod +x cytv
./cytv --language pl install
```

Wybierz telewizor lub podaj IP, wybierz edycję i sprawdź podsumowanie. Nową tożsamość SSH zatwierdzaj tylko dla własnego telewizora w zaufanej sieci; zmieniony zapisany klucz blokuje dostęp. Root przygotowuje odzyskiwanie i od razu aktywuje Home, bez okresu próbnego ani potwierdzenia zachowania ustawień. Sprawdź strzałki, OK, Home, Wstecz/Anuluj, głośność, czuwanie i uruchomienie po całkowitym odłączeniu zasilania.

## Obsługa i odzyskiwanie

Strzałki wybierają, OK otwiera; przytrzymaj OK, aby zmienić kolejność. Krótkie Wstecz zachowuje nawigację aplikacji i jej potwierdzenie wyjścia. Home otwiera ekran Clean Your TV, gdy sterowanie jest aktywne. Przytrzymaj Wstecz przez 1,2 sekundy, aby jednorazowo otworzyć LG Home. Przełącznik sterowania Home i ustawienia pozostają bez zmian.

**Naciśnij Home trzy razy w ciągu dwóch sekund**, puszczając przycisk po każdym naciśnięciu. Przywraca to LG Home i zatrzymuje sterowanie bez usuwania preferencji. W No-root Helper do wersji 0.6.13 włącznie zamiast tego przytrzymaj Home około dwóch sekund. Przytrzymanie Home nie jest gestem awaryjnym Root.

No-root: Aby wznowić sterowanie Home, otwórz Home Helper, wybierz Uruchom Helper i potwierdź. Zapisany wybór ekranu Home zostaje zachowany. Root: włącz **Zmień Home** w ustawieniach Home, aby wznowić. **Otwórz LG Home** otwiera LG Home jednorazowo bez zmiany celu przycisku Home. Aby przywrócić LG Home jako stały cel, wyłącz **Zmień Home** lub uruchom `cytv restore`. Nie uruchamiaj obu kontrolerów jednocześnie. Przy powtarzającym się błędzie pozostań przy LG Home.

```sh
./cytv --language pl status
./cytv --language pl doctor --report
./cytv --language pl restore
./cytv --language pl uninstall
```

Po przerwaniu operacji najpierw uruchom `status` i zachowaj dzienniki. `restore` przywraca LG Home bez usuwania aplikacji; `uninstall` przywraca je przed usunięciem. Dane odzyskiwania Root pozostają celowo: nie kasuj ich, by wymusić ponowną instalację. Sprawdź raporty przed udostępnieniem; nie publikuj kluczy ani katalogów profili.

## Aktualizacja i usuwanie

Po połączeniu cytv pokazuje wersję zainstalowaną → dołączoną i rozróżnia pierwszą instalację, ponowną instalację i cofnięcie wersji. Sprawdź podsumowanie przed potwierdzeniem; `--yes` nie omija kontroli zgodności. Zachowaj działające pakiety i prywatne kopie ustawień. Przed wymianą pakietów z komputera zatrzymaj No-root Helper; nie odinstalowuj wcześniej aplikacji. Nie zastępuj działającego Root pojedynczym IPK: użyj odpowiedniej procedury cytv. Usunięcie aplikacji komputerowej nie usuwa aplikacji z TV.

Otwórz ustawienia Home → Aktualizacje oprogramowania i sprawdź wersje przed potwierdzeniem. Aktualizacje i cofanie wersji na TV wymagają **roota, Homebrew Channel** i przygotowanej zgodnej infrastruktury aktualizacji, również dla edycji No-root. Bez roota użyj komputera. Przygotowanie pełnych aktualizacji systemu to osobna świadoma czynność: [aktualizacje (angielski)](../UPDATES.md). Odzyskiwanie pokazuje zapisaną wersję; cofnięcie może utracić późniejsze zmiany ustawień.

**Istniejąca instalacja 1.3.0:** pierwotny System Updater nie może zastosować 1.4.0 z powodu zmiany listy dozwolonych plików. Jeśli próba zatrzymała się przed wymianą, zachowaj dziennik i przerwij; nie kasuj stanu i nie ponawiaj w ciemno. Przejdź przez sprawdzane odzyskiwanie i nową instalację 1.4.0; aktualizacja samej aplikacji nie zastępuje zachowanych sterowników Root. Następna poprawka OTA **nie została opublikowana**. [Migracja i odzyskiwanie (angielski)](../UPDATES.md#one-time-computer-preparation).

Odzyskiwanie dźwięku HDMI w Root jest eksperymentalne i **domyślnie wyłączone**; włączaj tylko w razie potrzeby. Może przerwać poprawny dźwięk i nie dowodzi zgodności eARC. [Odzyskiwanie dźwięku (angielski)](../development/ROOT-AUDIO-RECOVERY.md). Osobny **CYTV Installer dla Homebrew nie jest jeszcze wydany**; użyj opublikowanego instalatora komputerowego lub Android.

## Pomoc i dalsze instrukcje

Po błędzie lub przerwaniu sprawdź stan i zapisz raport diagnostyczny tej próby. Prowadzone odzyskiwanie prosi oddzielnie o zgodę na usunięcie i ponowną instalację. Przy niepewnym wyniku przerwij i zachowaj prywatne logi, dzienniki oraz pliki odzyskiwania; nigdy nie usuwaj ich, aby wymusić ponowienie. [Odzyskiwanie (angielski)](../RECOVERY.md). Prosząc o pomoc podaj model, firmware, edycję, wersję instalatora, nieudany krok oraz oczekiwane/rzeczywiste zachowanie; przed udostępnieniem przejrzyj raport i usuń sekrety.

[Dokumentacja](../README.md) · [Zgłoś problem](../FEEDBACK.md)

<!-- Anchors retained for links to earlier guide headings. -->
<a id="opcjonalny-python-dla-root"></a>
<a id="testy-sprzętowe-i-ograniczenia"></a>
<a id="blokada-oprogramowania-lg-w-120"></a>
<a id="nowości-w-130-odzyskiwanie-w-instalatorze-komputerowym"></a>
<a id="nowości-w-130--12"></a>
<a id="nieopublikowany-kandydat-instalacja-root-przez-homebrew"></a>
<a id="nieopublikowany-kandydat-odzyskiwanie-dźwięku-hdmi-root"></a>
