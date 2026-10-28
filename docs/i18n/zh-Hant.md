# Clean Your TV — 使用者指南

> 未發佈候選版 1.4.1：修正 Root OTA 相容性、更新提示、韌體 API 存取及 Windows 套件/主控台問題。電視驗收及簽章升級/回復版本仍待驗證；這不是已發佈的下載。 [1.4.1](../RELEASE-1.4.1.md).

[文件導覽](../README.md) · [回報問題](../FEEDBACK.md)

本指南適用於已發佈的 **[1.4.0](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/tag/v1.4.0)**。C3 驗收僅涵蓋已記錄的電源、Home、焦點、保持關閉狀態及手動回復版本測試。其他電視、eARC 音訊和實體 Android 裝置仍未驗證；安裝成功不代表相容。[測試範圍（英文）](../RELEASE-1.4.0-ACCEPTANCE.md)。

## 選擇版本

No-root 和 Root 是適用於不同電視組態的同等選項。使用 LG 開發者模式請選擇 No-root；已有 root SSH 訪問請選擇 Root。兩種版本的兼容性與測試範圍分別記錄。

- **No-root：**啟用 LG Developer Mode 和 Key Server，輸入電視顯示的口令，並單獨接受電視配對請求。開發者模式必須保持有效；過期可能移除側載應用。即使啟用 Beta 自動續期，也要留意官方計時器。Helper 監控需要本地網路。
- **Root：**必須已有 root SSH 訪問權限。安裝程式不會為電視獲取 root。已取得 root 的電視不要啟用開發者模式。請保留 root 訪問和恢復服務。

## 安裝之前

安裝期間保持電視開機，將電腦與電視連線到同一個可信本地網路。完成後無需電腦持續開機。兼容性取決於型號、固件和遙控器；Root 仍有待完成的實機檢查。

No-root Helper 需要電視 Node.js **0.12.2+**。Root 需要 Node.js **8+** 及可用的 Python **3.9+**。如有需要，安裝程式會下載經驗證的專用 Python；首次準備需要 **320 MiB** 可用空間。它不會取代系統 Python。請保留復原功能引用的執行環境。[Python 說明（英文）](../OPTIONAL-PYTHON.md)。Developer Mode 自動續期為 **Beta，預設關閉**；無 root 電視上的實際續期尚未確認，請繼續檢查官方計時器。

### 設定 Developer Mode（No-root）

Developer Mode 讓 CYTV 可以在沒有 root 的電視上安裝應用程式。

1. 在電視上開啟 LG Apps，搜尋並安裝 Developer Mode。
2. 開啟 Developer Mode 並登入 LG Developer 帳號。如需註冊，請前往 webostv.developer.lge.com。
3. 開啟 Dev Mode Status。電視將重新啟動，之後請再次開啟 Developer Mode。
4. 開啟 Key Server 並保持 Developer Mode 開啟。將其中的 IP Address 填入 CYTV 的電視位址欄。
5. 輸入電視上 Developer Mode 顯示的六位 Passphrase，注意區分大小寫。

請使用電視上的代碼，而非 LG 帳號密碼。如未顯示代碼，請開啟 Key Server。

配對是獨立步驟：電視提示時，請用遙控器允許 CYTV 連線。

請保持 Developer Mode 有效：計時結束前開啟它，並在電視連網時按 EXTEND。過期後 LG 可能會刪除這些應用程式。

## 安裝與選擇語言

- **Windows x64：**下載 `cytv-windows-x64-desktop.zip`，在資源管理器中選擇“全部解壓縮”，然後打開 `cytv-desktop/cytv-desktop.exe`。保留旁邊的 `_internal` 資料夾。尚未組態 Windows 發佈者簽名。獨立主控台為 `cytv-windows-x64.exe`；將其重命名為 `cytv.exe`，在 PowerShell 中用 `.\cytv.exe` 替換下方指令的 `./cytv`。
- **macOS 13+：**解壓 `cytv-macos-arm64.zip`（Apple Silicon）或 `cytv-macos-x64.zip`（Intel），將 `cytv.app` 移到“應用程式”後打開。允許本地網路訪問。若被阻止，僅對可信項目下載使用“隱私與安全性 → 仍要打開”；不要禁用 Gatekeeper。舊系統尚未驗收。
- **Linux x64：**在 Ubuntu 22.04+、Debian 12+ 或 Mint 21+ 中，用圖形軟體包安裝程式打開 `cytv-linux-x64.deb`，安裝後從應用菜單啟動 Clean Your TV。桌面庫可能需要聯網下載。不含 Linux ARM。獨立 `cytv-linux-x64` 為 CLI；圖形界面請使用 `.deb`。

[Android 安裝程式（英文）](../../android/README.md)：在右上角選擇語言。更新時不要解除安裝或清除資料。Android 7 / WebView 108 是最低需求，並非已驗證的手機設定；驗收使用 Android 15 ARM64 / WebView 124 模擬器。實體手機及真實手機到電視的復原流程仍未驗證。

桌面精靈會自動選擇系統語言，也可手動選擇並儲存。電視端在**設定 → 語言**中選擇，或使用系統/自動選項。安裝程式與電視偏好各自獨立。完整代碼見[語言索引](../LANGUAGES.md)。

單獨下載的 macOS/Linux CLI，請在解壓目錄打開終端：

```sh
chmod +x cytv
./cytv --language zh-Hant install
```

選擇電視（或輸入 IP）、版本，然後檢查摘要。僅在可信網路上為自己的電視接受首次 SSH 信任；儲存的密鑰發生改變時將阻止訪問。Root 憑據與開發者模式口令不同。Root 會安裝恢復功能並立即啟用 Home，無試用或 Keep 步驟。請在自己的電視上檢查方向鍵、OK、Home、返回/取消、音量、待機/喚醒和冷啟動。

## 日常使用與恢復

方向鍵選擇圖塊，OK 打開，按住 OK 調整順序。短按返回保留應用本身的導航和退出確認。啟用 Home 控制時，短按 Home 打開 Clean Your TV。按住返回 1.2 秒會臨時打開 LG Home 一次，不改變 Home 控制開關和設定。

**兩秒內按 Home 三次，每次都鬆開**，即可返回 LG Home 並停止 Home 控制，偏好設定保留。No-root Helper 0.6.13 及更早版本改為按住 Home 約兩秒；按住 Home 不是 Root 的緊急退出方式。

No-root: 要重新啟動 Home 控制，請開啟 Home Helper，選擇啟動 Helper 並確認。已儲存的主畫面選擇會保留。 Root：在 Home 設定中啟用 **Change Home** 恢復。**Open LG Home** 只打開 LG Home 一次，不更改路由。要持續使用 LG Home，請關閉 **Change Home** 或執行 `cytv restore`。不要同時執行兩種控制器。若故障重復出現，請保持 LG Home 啟用。

```sh
./cytv --language zh-Hant status
./cytv --language zh-Hant doctor --report
./cytv --language zh-Hant restore
./cytv --language zh-Hant uninstall
```

中斷後重試前先執行 `status`，保留日誌和恢復檔案。`restore` 返回 LG Home 而不移除應用；`uninstall` 先恢復再移除。Root 恢復狀態會特意保留，切勿刪除它來強行重新安裝。分享報告前請檢查內容，不要公開密鑰或組態資料夾。

僅適用於尚未發佈的候選版本，兩個版本均支援：開啟 **Home 設定 → 欄數**，選擇 1–8 欄，或選擇 **跟隨主題** 使用主題的值（Classic 預設為 5 欄）。手動選擇的欄數優先於主題。主題選擇和透過 URL 安裝主題尚未提供。

## 更新與移除

保留已知可用的安裝套件和私有設定備份。電腦輔助替換 No-root 安裝套件時，先停止 Helper，然後直接更新；解除安裝可能清除設定。移除桌面應用不會移除電視應用。不要用獨立 IPK 替換正在執行的 Root 環境；請使用 cytv 的明確恢復/重新安裝流程。

開啟 Home 設定 → 軟體更新，確認前檢查提供的版本。即使使用 No-root 版本，在電視上更新和回復版本也需要 **root、Homebrew Channel** 以及事先準備好的配套更新基礎設施。無 root 電視請用電腦安裝程式。完整系統更新的準備是單獨明確執行的操作，請參閱[更新（英文）](../UPDATES.md)。復原介面顯示儲存的回復版本；回復可能遺失之後的設定變更。

**現有 1.3.0 安裝：**由於允許的檔案清單改變，原有 System Updater 無法套用 1.4.0。如果嘗試在替換前停止，請保留記錄並停止操作；不要清除狀態或盲目重試。遷移需經過檢查的復原流程和全新 1.4.0 設定；只更新應用程式不會取代保留的 Root 驅動程式。下一次 OTA 修正**尚未發佈**。[遷移與復原（英文）](../UPDATES.md#one-time-computer-preparation)。

Root HDMI 聲音復原是實驗功能，**預設關閉**，僅在需要時自行啟用。它可能中斷正常音訊，並不證明 eARC 相容性。[聲音復原（英文）](../development/ROOT-AUDIO-RECOVERY.md)。獨立的 **Homebrew CYTV Installer 尚未發佈**；請使用已發佈的電腦或 Android 安裝程式。

僅限未發布候選版：若舊 Root 目錄的可寫入權限導致韌體 API 存取遭拒，可明確執行 `cytv enable-firmware-access --edition root --repair-package-permissions`。指令會先以可信的私人套件記錄驗證目前檔案，再僅移除 Root 自有路徑的群組及其他使用者寫入權限。遇到未知或已修改檔案便停止；保留個人設定、Home 選擇和韌體封鎖設定。[修復詳情（英文）](../LG-FIRMWARE-UPDATES.md#explicit-package-permission-repair-candidate)。

## 說明與詳細指引

操作失敗或中斷後，先檢查狀態並儲存該次嘗試的診斷報告。引導復原會分別確認移除和重新安裝。結果不確定時請停止，保留私人記錄及復原檔案；切勿刪除它們來強制重試。請參閱[復原（英文）](../RECOVERY.md)。求助時請提供型號、韌體、版本類別、安裝程式版本、失敗步驟及預期/實際表現；分享前檢查報告並刪除機密資訊。

[文件導覽](../README.md) · [回報問題](../FEEDBACK.md)

<!-- Anchors retained for links to earlier guide headings. -->
<a id="v110-起的可選-root-python"></a>
<a id="120-的-lg-固件更新阻止功能"></a>
<a id="130-新增功能"></a>
<a id="130-新增功能--12"></a>
<a id="未發佈候選版透過-homebrew-設定-root"></a>
<a id="未發佈候選版本hdmi-聲音恢復root"></a>
