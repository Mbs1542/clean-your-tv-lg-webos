# Clean Your TV — 사용자 안내

> 미공개 후보 1.4.1: Root OTA 호환성, 업데이트 표시, 펌웨어 API 접근 및 Windows 패키지/콘솔 수정입니다. TV 검증과 서명된 업데이트/롤백은 아직 완료되지 않았으며, 공개 다운로드가 아닙니다. [1.4.1](../RELEASE-1.4.1.md).

[문서](../README.md) · [문제 신고](../FEEDBACK.md)

이 안내서는 공개된 **[1.4.0](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/tag/v1.4.0)** 기준입니다. C3 승인은 기록된 전원, Home, 포커스, 비활성 상태 유지 및 수동 롤백 시험에 한정됩니다. 다른 TV, eARC 오디오와 실제 Android 기기는 확인되지 않았습니다. 설치 성공만으로 호환성을 입증할 수 없습니다. [시험 범위(영어)](../RELEASE-1.4.0-ACCEPTANCE.md).

## 에디션 선택

No-root와 Root는 서로 다른 TV 환경에 맞는 동등한 선택지입니다. LG Developer Mode를 사용하면 No-root를, 기존 root SSH 접근 권한이 있으면 Root를 선택하세요. 호환성과 테스트 범위는 각 버전마다 다릅니다.

- **No-root:** LG Developer Mode와 Key Server를 켜세요. TV에 표시된 암호 문구를 입력하고 별도로 표시되는 페어링 요청을 TV에서 승인하세요. Developer Mode를 계속 활성화해야 합니다. 세션이 만료되면 설치한 앱이 삭제될 수 있습니다. 베타 자동 갱신을 켰더라도 공식 타이머를 확인하세요. Helper의 상태 감시에는 로컬 네트워크가 필요합니다.
- **Root:** 기존 root SSH 접근 권한이 필요합니다. 설치 프로그램은 TV를 루팅하지 않습니다. 이미 루팅한 TV에는 Developer Mode를 켜지 마세요. root 접근 및 복구 서비스를 유지하세요.

## 설치 전 준비

TV를 켜고 컴퓨터와 같은 신뢰할 수 있는 로컬 네트워크에 연결하세요. 설치 후에는 컴퓨터를 꺼도 됩니다. 호환성은 모델, 펌웨어, 리모컨에 따라 다릅니다. Root는 실제 기기 검증이 남아 있습니다.

No-root Helper에는 TV Node.js **0.12.2+**가 필요합니다. Root에는 Node.js **8+**와 정상 작동하는 Python **3.9+**가 필요합니다. 필요하면 설치 프로그램이 검증된 전용 Python을 다운로드하며, 초기 준비에는 **320 MiB** 여유 공간이 필요합니다. 시스템 Python을 교체하지 않습니다. 복구에 쓰이는 런타임은 보관하세요. [Python 안내(영어)](../OPTIONAL-PYTHON.md). Developer Mode 자동 갱신은 **Beta이며 기본적으로 꺼져 있습니다**. root 없는 TV의 실제 갱신은 확인되지 않았으므로 공식 타이머를 계속 확인하세요.

### Developer Mode 설정 (No-root)

Developer Mode를 사용하면 root 없이 TV에 CYTV 앱을 설치할 수 있습니다.

1. TV에서 LG Apps를 열고 Developer Mode를 검색하여 설치하세요.
2. Developer Mode를 열고 LG Developer 계정으로 로그인하세요. 계정이 없으면 webostv.developer.lge.com에서 만드세요.
3. Dev Mode Status를 켜세요. TV가 재시작되면 Developer Mode를 다시 여세요.
4. Key Server를 켜고 Developer Mode를 열어 두세요. 표시된 IP Address를 CYTV의 TV 주소로 입력하세요.
5. TV의 Developer Mode에 표시된 6자리 Passphrase를 입력하세요. 대소문자를 구분하세요.

LG 계정 비밀번호가 아닌 TV 화면의 코드를 사용하세요. 코드가 보이지 않으면 Key Server를 켜세요.

페어링은 별도 단계입니다. TV에서 요청하면 리모컨으로 CYTV를 승인하세요.

타이머가 끝나기 전에 Developer Mode를 열고 TV가 인터넷에 연결된 상태에서 EXTEND를 누르세요. 만료되면 LG가 이 앱들을 삭제할 수 있습니다.

## 설치와 언어 선택

- **Windows x64:** `cytv-windows-x64-desktop.zip`을 다운로드하고 파일 탐색기에서 **모두 추출**을 선택한 다음 `cytv-desktop/cytv-desktop.exe`를 여세요. `_internal` 폴더를 옆에 그대로 두세요. Windows 게시자 서명은 구성되어 있지 않습니다. 별도 콘솔은 `cytv-windows-x64.exe`입니다. 아래 PowerShell 명령은 이름을 `cytv.exe`로 바꾸고 `.\cytv.exe`로 실행하세요.
- **macOS 13 이상:** Apple Silicon은 `cytv-macos-arm64.zip`, Intel은 `cytv-macos-x64.zip`을 푸세요. `cytv.app`을 응용 프로그램 폴더로 옮겨 열고 로컬 네트워크 접근을 허용하세요. 신뢰할 수 있는 다운로드가 차단되면 개인정보 보호 및 보안 → 확인 없이 열기를 사용하세요. Gatekeeper를 끄지 마세요. 구형 시스템 검증은 완료되지 않았습니다.
- **Linux x64:** Ubuntu 22.04 이상, Debian 12 이상 또는 Mint 21 이상에서 `cytv-linux-x64.deb`를 그래픽 패키지 관리자로 설치하고 앱 메뉴에서 Clean Your TV를 여세요. 라이브러리 설치에 인터넷이 필요할 수 있습니다. Linux ARM 패키지는 없습니다. 독립 실행 파일 `cytv-linux-x64`는 CLI입니다. 그래픽 앱은 `.deb`를 사용하세요.

[Android 설치 프로그램(영어)](../../android/README.md): 오른쪽 위에서 언어를 선택하세요. 앱을 삭제하거나 데이터를 지우지 말고 업데이트하세요. Android 7 / WebView 108은 최소 요구사항이며 검증된 휴대전화 구성이 아닙니다. 승인은 Android 15 ARM64 / WebView 124 에뮬레이터에서 이루어졌습니다. 실제 휴대전화와 실제 TV 연결 복구는 확인되지 않았습니다.

데스크톱 설치 마법사는 처음에 시스템 언어를 사용하고 직접 선택한 언어를 저장합니다. TV에서는 **설정 → 언어**에서 언어를 고르거나 시스템 언어를 따르는 자동 옵션을 선택하세요. 설치 프로그램과 TV의 언어 설정은 별개입니다. 지원 코드는 [언어 목록](../LANGUAGES.md)을 참조하세요.

macOS/Linux에서 별도로 받은 CLI는 압축을 푼 폴더에서 실행하세요.

```sh
chmod +x cytv
./cytv --language ko install
```

TV를 선택하거나 IP를 입력하고 에디션과 설치 요약을 확인하세요. 새로운 SSH 신원은 신뢰할 수 있는 네트워크의 본인 TV인 경우에만 승인하세요. 저장된 키가 바뀌면 접근이 차단됩니다. Root는 복구 기능을 준비한 뒤 시험 기간이나 유지 확인 없이 Home을 바로 활성화합니다. 방향키, OK, Home, 뒤로/취소, 음량, 대기 모드 복귀와 전원을 완전히 껐다 켜는 동작을 확인하세요.

## 사용과 복구

방향키로 선택하고 OK로 실행합니다. OK를 길게 눌러 순서를 바꿉니다. 뒤로를 짧게 누르면 앱의 탐색과 종료 확인이 유지됩니다. Home 제어가 활성화되면 짧은 Home으로 런처를 엽니다. 뒤로를 1.2초 동안 누르면 LG Home이 한 번 열립니다. Home 제어 스위치와 설정은 바뀌지 않습니다.

**2초 안에 Home을 세 번 짧게 누르세요.** 매번 버튼을 놓아야 합니다. 설정을 지우지 않고 LG Home으로 복귀하며 Home 제어를 중지합니다. No-root Helper 0.6.13 이하에서는 대신 Home을 약 2초 동안 누릅니다. Home 길게 누르기는 Root의 비상 복구 동작이 아닙니다.

No-root: Home 제어를 다시 시작하려면 Home Helper를 열고 Helper 시작을 선택한 다음 확인하세요. 저장된 Home 화면 선택은 유지됩니다. Root는 Home 설정에서 **Home 변경**을 켜서 재개하세요. **LG Home 열기**는 Home의 연결 대상을 바꾸지 않고 LG Home을 한 번 엽니다. LG Home을 계속 사용할 기본 대상으로 복원하려면 **Home 변경**을 끄거나 `cytv restore`를 실행하세요. 두 제어 프로그램을 동시에 실행하지 마세요. 문제가 반복되면 LG Home을 유지하세요.

```sh
./cytv --language ko status
./cytv --language ko doctor --report
./cytv --language ko restore
./cytv --language ko uninstall
```

작업이 중단되면 재시도 전에 `status`를 실행하고 로그를 보관하세요. `restore`는 앱을 삭제하지 않고 LG Home을 복구합니다. `uninstall`은 복구 후 제거합니다. Root 복구 데이터는 의도적으로 남습니다. 재설치를 강제하려고 삭제하지 마세요. 진단 보고서는 공유 전에 검토하고 키나 프로필 폴더는 공개하지 마세요.

## 업데이트와 제거

연결 후 cytv는 설치 버전 → 포함 버전을 표시하고 최초 설치, 재설치, 이전 버전 설치를 구분합니다. 확인 전에 요약을 읽으세요. `--yes`를 사용해도 호환성 검사는 유지됩니다. 작동하는 패키지와 설정의 비공개 복사본을 보관하세요. 컴퓨터에서 패키지를 바꾸기 전 No-root Helper를 중지하고, 먼저 제거하지 마세요. 실행 중인 Root에 IPK 하나만 덮어쓰지 말고 cytv의 정해진 절차를 사용하세요. 데스크톱 앱 제거는 TV 앱을 제거하지 않습니다.

Home 설정 → 소프트웨어 업데이트에서 제시된 버전을 확인한 뒤 승인하세요. TV에서 업데이트와 롤백을 하려면 No-root 에디션도 **root, Homebrew Channel**과 미리 준비한 호환 업데이트 구성요소가 필요합니다. root가 없으면 컴퓨터를 사용하세요. 전체 시스템 업데이트 준비는 별도로 명시적으로 실행합니다. [업데이트(영어)](../UPDATES.md). 복구 화면에서 저장된 롤백 버전을 확인하세요. 롤백하면 이후 설정 변경이 사라질 수 있습니다.

**기존 1.3.0 설치:** 허용 파일 목록이 바뀌어 기존 System Updater로는 1.4.0을 적용할 수 없습니다. 교체 전에 중단되었다면 기록을 보관하고 멈추세요. 상태를 지우거나 무작정 재시도하지 마세요. 확인 절차를 거친 복구와 새로운 1.4.0 설치로 이전하세요. 앱만 업데이트하면 보존된 Root 드라이버는 교체되지 않습니다. 다음 OTA 수정은 **아직 공개되지 않았습니다**. [이전과 복구(영어)](../UPDATES.md#one-time-computer-preparation).

Root HDMI 소리 복구는 실험적이며 **기본적으로 꺼져 있습니다**. 필요할 때만 켜세요. 정상적인 소리를 끊을 수 있으며 eARC 호환성이 확인된 것은 아닙니다. [소리 복구(영어)](../development/ROOT-AUDIO-RECOVERY.md). 별도 **Homebrew CYTV Installer는 아직 출시되지 않았습니다**. 공개된 컴퓨터 또는 Android 설치 프로그램을 사용하세요.

미출시 후보 전용: 이전 Root 디렉터리의 쓰기 권한 때문에 펌웨어 API 접근이 거부되면 `cytv enable-firmware-access --edition root --repair-package-permissions` 명령이 신뢰할 수 있는 비공개 패키지 기록으로 현재 파일을 검증한 뒤 Root 소유 경로의 그룹 및 기타 사용자 쓰기 권한만 제거합니다. 알 수 없거나 변경된 파일이 있으면 중단합니다. 프로필, Home 선택 및 펌웨어 차단 설정은 유지됩니다. [세부 정보(영어)](../LG-FIRMWARE-UPDATES.md#explicit-package-permission-repair-candidate).

미공개 후보 버전 전용: `cytv recover-system-rollback --edition root`는 검증된 Root 롤백에서 모든 패키지 설치가 끝났지만 런처 준비 시간이 초과된 경우에만 사용합니다. 실제 런처의 준비 신호가 필요하며 설치 결과가 불명확하면 거부합니다. 패키지, 고정된 코드·키, 실패 증거와 명시적으로 끈 Home 제어 상태를 보존합니다. 제한된 시도를 비공개 기록으로 남깁니다. 일반 재시도는 기한을 연장하지 않습니다. 이전 120초 기한이 지난 뒤 승인된 준비 신호나 불명확한 설치 결과가 없을 때만 `--new-recovery-attempt`가 이전 기록 전체를 UUID/해시로 보관하고 명시적으로 새 시도를 시작합니다. 완료된 복구는 다시 시작하지 않으며 자동 반복 시도는 없습니다. [절차와 제한 사항(영어)](../RECOVERY.md#root-system-rollback-readiness-candidate).

미공개 1.4.1 후보 전용: TV에서 Root 업데이트를 하려면 System Updater 1.1.1이 필요합니다. TV OTA 전에 `cytv replace-system-updater --edition root`로 1.1.0을 명시적으로 교체하세요. System Updater만 교체하며 Root/Root Updater 앱, 전체 프로필과 Home 선택은 보존하고 이전 상태는 보관합니다. 불명확하거나 미완료된 작업이 있으면 중단합니다. 이 요구 사항은 No-root 피드에는 적용되지 않습니다. [교체 절차(영어)](../RECOVERY.md#replace-the-root-system-updater-candidate).

## 도움말과 자세한 안내

실패나 중단 후에는 상태를 확인하고 해당 시도의 진단 보고서를 저장하세요. 안내 복구는 삭제와 재설치를 각각 확인합니다. 결과가 불확실하면 멈추고 비공개 로그와 복구 파일을 보관하세요. 재시도를 강제하려고 삭제하지 마세요. [복구(영어)](../RECOVERY.md). 도움을 요청할 때 모델, 펌웨어, 에디션, 설치 프로그램 버전, 실패 단계, 예상 및 실제 동작을 적고 보고서의 비밀 정보를 제거한 뒤 공유하세요.

[문서](../README.md) · [문제 신고](../FEEDBACK.md)

<!-- Anchors retained for links to earlier guide headings. -->
<a id="root용-선택적-python-런타임"></a>
<a id="하드웨어-검증-범위"></a>
<a id="120의-lg-펌웨어-차단"></a>
<a id="130의-새-기능-데스크톱-복구-안내"></a>
<a id="130의-새-기능--12"></a>
<a id="미출시-후보-homebrew를-통한-root-설치"></a>
<a id="미출시-후보-hdmi-사운드-복원-root"></a>
