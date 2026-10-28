# Clean Your TV — guia de uso

> Candidato 1.4.1 não publicado: compatibilidade OTA Root, disponibilidade de atualizações, acesso à API de firmware e correções de pacotes/console Windows. A atualização assinada e a reversão normal foram registradas no escopo limitado ao C3; as compilações finais e a publicação continuam pendentes; não é um download publicado. [1.4.1](../RELEASE-1.4.1.md).

[Documentação](../README.md) · [Relatar um problema](../FEEDBACK.md)

Este guia descreve a versão publicada **[1.4.0](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/tag/v1.4.0)**. A aceitação no C3 abrange os testes registrados de energia, Home, foco, estado desligado e reversão manual. Outras TVs, áudio eARC e dispositivos Android físicos continuam sem verificação; instalar com sucesso não comprova compatibilidade. [Escopo testado (inglês)](../RELEASE-1.4.0-ACCEPTANCE.md).

## Escolher a edição

No-root e Root são opções equivalentes para diferentes configurações da TV. Escolha No-root para LG Developer Mode ou Root se já tiver acesso root por SSH. A compatibilidade e os testes realizados são específicos de cada edição.

- **No-root:** ative LG Developer Mode e Key Server. Digite a frase de acesso exibida na TV e aceite nela o pedido separado de pareamento. Developer Mode deve continuar ativo: a expiração pode remover aplicativos instalados por esse método. Confira o cronômetro oficial mesmo com a renovação Beta ativada. O monitoramento do Helper depende da rede local.
- **Root:** é necessário acesso SSH root já existente. O instalador não faz root. Não ative Developer Mode em uma TV que já tenha root. Mantenha o acesso root e os serviços de recuperação disponíveis.

## Requisitos

Ligue a TV e conecte os dois dispositivos à mesma rede local confiável. Depois, o computador pode ficar desligado. A compatibilidade depende do modelo, firmware e controle remoto; Root ainda tem testes em hardware pendentes.

No-root Helper precisa de Node.js **0.12.2+** na TV. Root precisa de Node.js **8+** e Python **3.9+** funcional. Se necessário, o instalador baixa um Python privado verificado; a preparação inicial precisa de **320 MiB** livres. Ele não substitui o Python do sistema. Preserve os ambientes usados na recuperação. [Python (inglês)](../OPTIONAL-PYTHON.md). A renovação do Developer Mode é **Beta, desativada por padrão**; a renovação real sem root não está confirmada. Continue conferindo o cronômetro oficial.

### Configurar Developer Mode (No-root)

Developer Mode permite ao CYTV instalar apps em uma TV sem root.

1. Na TV, abra LG Apps, procure Developer Mode e instale o app.
2. Abra Developer Mode e entre com sua conta LG Developer. Se necessário, crie uma conta em webostv.developer.lge.com.
3. Ative Dev Mode Status. A TV reiniciará. Depois, abra Developer Mode novamente.
4. Ative Key Server e deixe Developer Mode aberto. Use o IP Address exibido como endereço da TV no CYTV.
5. Digite a Passphrase: os seis caracteres exibidos no Developer Mode da TV. Respeite maiúsculas e minúsculas.

Use o código da TV, não a senha da sua conta LG. Se o código não aparecer, ative Key Server.

O pareamento é uma etapa separada: quando a TV pedir, autorize o CYTV com o controle remoto.

Mantenha Developer Mode ativo: antes de o tempo acabar, abra o app e pressione EXTEND com a TV conectada à Internet. Se expirar, a LG pode remover esses apps.

## Instalação e idioma

- **Windows x64:** baixe `cytv-windows-x64-desktop.zip`, escolha **Extrair tudo** no Explorador de Arquivos e abra `cytv-desktop/cytv-desktop.exe`. Mantenha a pasta `_internal` ao lado. A assinatura de editor do Windows não está configurada. O console separado é `cytv-windows-x64.exe`; renomeie para `cytv.exe` e use `.\cytv.exe` no PowerShell para os comandos abaixo.
- **macOS 13+:** extraia `cytv-macos-arm64.zip` para Apple Silicon ou `cytv-macos-x64.zip` para Intel; mova `cytv.app` para Aplicativos e abra. Permita acesso à rede local. Se uma cópia confiável for bloqueada, use Privacidade e Segurança → Abrir Mesmo Assim; não desative o Gatekeeper. A compatibilidade com sistemas antigos não foi confirmada.
- **Linux x64:** no Ubuntu 22.04+, Debian 12+ ou Mint 21+, instale `cytv-linux-x64.deb` com o gerenciador gráfico de pacotes e abra Clean Your TV pelo menu. Pode ser necessário acesso à Internet para bibliotecas. Não há pacote Linux ARM. O executável independente `cytv-linux-x64` é a CLI; use o `.deb` para o app gráfico.

[Instalador Android (inglês)](../../android/README.md): escolha o idioma no canto superior direito. Atualize sem desinstalar nem apagar dados. Android 7 / WebView 108 é o mínimo, não um telefone verificado; a aceitação usou emulador Android 15 ARM64 / WebView 124. Telefones físicos e recuperação conectada a uma TV real continuam sem verificação.

O assistente usa inicialmente o idioma do sistema e salva sua escolha explícita. Na TV, abra **Configurações → Idioma** e escolha um idioma ou a opção automática do sistema. As preferências da TV e do instalador são independentes. Veja os códigos no [índice de idiomas](../LANGUAGES.md).

Para a CLI baixada separadamente no macOS/Linux, na pasta extraída:

```sh
chmod +x cytv
./cytv --language pt-BR install
```

Escolha a TV ou informe o IP, selecione a edição e confira o resumo. Confirme uma nova identidade SSH apenas para sua TV em uma rede confiável; uma chave salva que mudou bloqueia o acesso. Root prepara a recuperação e ativa Home imediatamente, sem período de teste nem etapa de confirmação para manter. Teste setas, OK, Home, Voltar/Cancelar, volume, espera e inicialização a frio.

## Uso e recuperação

Setas selecionam; OK abre; segure OK para reorganizar. Um toque em Voltar mantém a navegação e a confirmação de saída do aplicativo. Home abre o lançador com o controle ativo. Segure Voltar por 1,2 segundos para abrir LG Home uma vez. O interruptor de controle do Home e suas configurações não mudam.

**Pressione Home três vezes em dois segundos**, soltando entre os toques. Isso restaura LG Home e interrompe o controle sem apagar preferências. No No-root Helper até a versão 0.6.13, segure Home por cerca de dois segundos. Segurar Home não é o gesto de emergência do Root.

No-root: Para reiniciar o controle de Home, abra Home Helper, escolha Iniciar Helper e confirme. Sua tela Home escolhida será mantida. Root: ative **Alterar Home** nas configurações do Home para retomar. **Abrir LG Home** abre LG Home uma vez sem mudar o destino de Home. Para restaurar LG Home como destino permanente, desative **Alterar Home** ou execute `cytv restore`. Nunca execute os dois controladores juntos. Se a falha voltar, mantenha LG Home ativo.

```sh
./cytv --language pt-BR status
./cytv --language pt-BR doctor --report
./cytv --language pt-BR restore
./cytv --language pt-BR uninstall
```

Após uma interrupção, execute primeiro `status` e preserve os registros. `restore` restaura LG Home sem remover aplicativos; `uninstall` restaura antes de remover. Os dados de recuperação Root são mantidos de propósito: não os apague para forçar a reinstalação. Revise relatórios antes de compartilhar; não publique chaves nem pastas de perfis.

## Atualização e remoção

Após conectar, cytv mostra versão instalada → incluída e diferencia primeira instalação, reinstalação e retorno a uma versão anterior. Confira o resumo antes de confirmar; `--yes` mantém as verificações de compatibilidade. Guarde pacotes funcionais e cópias privadas das configurações. Ao atualizar pelo computador, pare o No-root Helper antes de substituir os pacotes; não desinstale primeiro. Não instale uma IPK isolada sobre Root ativo: use o procedimento adequado do cytv. Remover o aplicativo do computador não remove os aplicativos da TV.

Abra configurações do Home → Atualizações de software e revise as versões antes de confirmar. Atualização e reversão na TV exigem **root, Homebrew Channel** e infraestrutura de atualização compatível já preparada, mesmo na edição No-root. Sem root, use o computador. Preparar atualizações completas é uma ação explícita separada: [atualizações (inglês)](../UPDATES.md). Recuperação mostra a versão salva; a reversão pode perder alterações posteriores nas configurações.

**Instalação 1.3.0 existente:** o System Updater original não consegue aplicar 1.4.0 porque mudou a lista de arquivos permitidos. Se a tentativa parou antes da substituição, preserve o registro e pare; não apague o estado nem repita às cegas. Migre por recuperação verificada e nova instalação 1.4.0; atualizar só o app não substitui os drivers Root preservados. A próxima correção OTA **ainda não foi publicada**. [Migração e recuperação (inglês)](../UPDATES.md#one-time-computer-preparation).

A recuperação de som HDMI do Root é experimental e **desativada por padrão**; ative somente se precisar. Ela pode interromper áudio saudável e não comprova compatibilidade eARC. [Recuperação de som (inglês)](../development/ROOT-AUDIO-RECOVERY.md). O **CYTV Installer do Homebrew continua sem publicação**; use o instalador publicado para computador ou Android.

Somente candidato não publicado: se o acesso à API de firmware falhar por diretórios Root antigos graváveis, `cytv enable-firmware-access --edition root --repair-package-permissions` verifica o pacote atual com dados privados confiáveis e remove a escrita de grupo/outros apenas nos caminhos próprios do Root. Arquivos desconhecidos ou alterados interrompem o reparo. Perfil, escolha de Home e bloqueio de firmware são preservados; [detalhes (inglês)](../LG-FIRMWARE-UPDATES.md#explicit-package-permission-repair-candidate).

Somente no candidato não publicado: `cytv recover-system-rollback --edition root` trata uma reversão Root verificada em que todos os instaladores terminaram, mas o prazo de prontidão do launcher expirou. Exige o sinal real do launcher e recusa resultados de instalação desconhecidos. Preserva pacotes, código e chaves fixados, evidências de falha e a desativação explícita do controle Home. Um registro privado documenta a tentativa limitada. Repetir normalmente não estende o prazo. Só após os 120 segundos expirarem, sem sinal de prontidão aceito nem resultado de instalação desconhecido, `--new-recovery-attempt` arquiva todo o registro anterior por UUID/hash e abre explicitamente outra tentativa. A recuperação concluída permanece idempotente; não há tentativas automáticas. [Procedimento e limites (inglês)](../RECOVERY.md#root-system-rollback-readiness-candidate).

Somente candidato 1.4.1 não publicado: atualizações Root na TV exigem System Updater 1.1.1. Antes do OTA, substitua explicitamente 1.1.0 com `cytv replace-system-updater --edition root`. Apenas o System Updater muda; apps Root/Root Updater, perfil completo e escolha de Home são preservados, e o estado anterior é arquivado. Operações desconhecidas ou incompletas bloqueiam a substituição. O requisito não bloqueia feeds No-root. [Procedimento (inglês)](../RECOVERY.md#replace-the-root-system-updater-candidate).

## Ajuda e outras instruções

Após falha ou interrupção, confira o estado e salve o relatório de diagnóstico daquela tentativa. A recuperação guiada pede confirmações separadas para remoção e reinstalação. Se o resultado for incerto, pare e preserve registros privados e arquivos de recuperação; nunca os apague para forçar outra tentativa. [Recuperação (inglês)](../RECOVERY.md). Para pedir ajuda, informe modelo, firmware, edição, versão do instalador, etapa com falha e resultado esperado/real; revise e remova segredos do relatório antes de compartilhar.

[Documentação](../README.md) · [Relatar um problema](../FEEDBACK.md)

<!-- Anchors retained for links to earlier guide headings. -->
<a id="python-opcional-para-root"></a>
<a id="testes-em-hardware-e-limites"></a>
<a id="bloqueio-de-firmware-lg-no-120"></a>
<a id="novidades-da-130-recuperação-guiada-no-computador"></a>
<a id="novidades-da-130--12"></a>
<a id="candidato-não-publicado-instalar-root-pelo-homebrew"></a>
<a id="candidato-não-publicado-recuperação-de-som-hdmi-root"></a>
