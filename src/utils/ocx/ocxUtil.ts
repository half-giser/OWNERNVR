/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-03 11:57:44
 * @Description: OCX公共模块
 */

// 测试环境
export const ClientPluVerDebug = '2,4,5,1280'
export const P2PClientPluVerDebug = '2,4,5,1280'

// Windows插件
export const ClientPluVer = '2,4,5,1982'
export const ClientPort = 13853
export const ClientPluMimeType = 'application/np-webclient_vpplugin_v5-plugin'
export const ClientPluDownLoadPath = '/OCX/WebClient_VPPlugin_v5.exe'
export const ClientPluClassId = '43a273a7-dc9e-418e-bb78-34bd54175199'

// Windows P2P V5插件支持P2P 1.0和2.0，WebClient_VPPlugin_v1_P2P2.exe废弃
export const P2PClientPluVer = '2,4,5,1982'
export const P2PLoginPluVer = '1,0,0,3'
export const P2PClientPort = 12853
export const P2PClientPluMimeType = 'application/np-webclient_vpplugin_v5_p2p-plugin'
export const P2PLoginPluginDownLoadPath = 'OCX/WebClient_p2p_conn_Plugin.exe'
export const P2PClientPluDownLoadPath = 'OCX/WebClient_VPPlugin_v5_P2P.exe'
export const P2PClientPluClassId = '6334c1eb-5f19-430a-a41b-d7b4bbe65177'

// MAC插件
// export const ClientPluVer_MAC = '4,0,0,8'
// export const ClientPluMimeType_MAC = 'application/x-webclient_vpplugin_v4'
// export const ClientPluDownLoadPath_MAC = 'OCX/WebClient_VPPlugin_v4.pkg'

// MAC插件 P2P 插件
// export const P2PClientPluVer_MAC = '4,0,0,8'
// export const P2PClientPluMimeType_MAC = 'application/x-webclient_vpplugin_v4_p2p'
// export const P2PClientPluDownLoadPath_MAC = 'OCX/WebClient_VPPlugin_v4_p2p.pkg'

// 插件初始化翻译条目
export const OCX_Plugin_Load_Lang: Record<string, Record<string, string>> = {
    //English (United States)
    '0x0409': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "The plugin is not installed, please click <a href='%1'>Here</a> to download and install. Before installation, please close your browser.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'The plugin is not installed, please click <a href=\'%1\'>Here</a> to download and install. Before installation, please close your browser.<br/>If you have installed plugin, please check if the plugin is disabled at "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI Support is currently disabled. Please follow the instructions below to enable it:<ul><li>1.Input \"chrome://flags/#enable-npapi\" into address bar;</li><li>2.Click 'Enable' under the 'Enable Npapi';</li><li>3.Close the Chrome browser completely;</li><li>4.Reopen the Chrome and navigate to the system, the plugin is available.</li></ul>Or the plugin is not installed, please click <a href='%1'>Here</a> to download and install. Before installation, please close your browser.",
        IDCS_PLUGIN_VERSION_UPDATE: "The Plugin is not updated, please click <a href='%1'>Here</a> to download and update.",
        // IDCS_IE_VERSION_WARNING: 'Your IE browser version is not supported. Please use IE10 or later version of it.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Your Firefox browser version is not supported. Please use Firefox53 or later version of it.',
        // IDCS_OPERA_VERSION_WARNING: 'Your Opera browser version not supported. Please use Opera44 or later version of it.',
        // IDCS_OTHER_VERSION_WARNING: 'Your browser does not support this plug-in. Please use the following browsers: ie10-11, Firefox 53 or later, chrome 57 or later, Safari 11 or later, opera 44 or later, edge16 or later.',
        // IDCS_CHROME_VERSION_WARNING: 'Your Chrome browser version is not supported, please use Chrome57 or later version of it.',
        // IDCS_SAFARI_VERSION_WARNING: 'Your Safari browser version is not supported, please use Safari11 or later version of it.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Your Safari browser version is not supported, please use Safari10 or older version of it.',
        // IDCS_EDGE_VERSION_WARNING: 'Your version of edge browser is too low. Please use edge16 or above',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: 'Fail to login. Reason: device is offline.',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Fail to login. Reason: username or password is wrong.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Failed to log in. Reason: The user is locked.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Fail to login. Reason: The user has no permission.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Unknown error! Error code:',
    },
    //Chinese (PRC)
    '0x0804': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "插件没有安装，请点击<a href='%1'>这里</a>下载并安装插件。安装时请关闭浏览器！",
        // IDCS_NO_PLUGIN_FOR_MAC: '插件没有安装，请点击<a href=\'%1\'>这里</a>下载并安装插件。 安装时请关闭浏览器！<br/>如果您已安装了插件，请在"Safari->偏好设置->安全性"检查插件是否被禁用。',
        // IDCS_NPAPI_NOT_SUPPORT: 'NPAPI插件已禁用，请进行如下设置来启用：<ul><li>1.在地址栏输入"chrome://flags/#enable-npapi"；</li><li>2.点击"启用NPAPI"下的启用按钮；</li><li>3.关闭所有Chrome；</li><li>4.重新打开Chrome并访问本系统，插件即可使用。</li></ul>或者插件没有安装，请点击<a href=\'%1\'>这里</a>下载并安装插件。 安装时请关闭浏览器！',
        IDCS_PLUGIN_VERSION_UPDATE: "插件有更新，请点击<a href='%1'>这里</a>下载并更新插件。",
        // IDCS_IE_VERSION_WARNING: '您的IE浏览器版本太低，请使用IE10或以上版本的浏览器。',
        // IDCS_FIREFOX_VERSION_WARNING: '您的Firefox浏览器版本太低，请使用Firefox53或以上版本的浏览器。',
        // IDCS_OPERA_VERSION_WARNING: '您的Opera浏览器版本太低，请使用Opera44或以上版本的浏览器。',
        // IDCS_OTHER_VERSION_WARNING: '您的浏览器不支持此插件，请使用以下浏览器：IE10-11，Firefox53或更高版本，Chrome57或更高版本，Safari11或更高版本，Opera44或更高版本， Edge16或更高版本。',
        // IDCS_CHROME_VERSION_WARNING: '您的Chrome浏览器版本太低，请使用Chrome57或以上版本的浏览器',
        // IDCS_SAFARI_VERSION_WARNING: '您的Safari浏览器版本太低，请使用Safari11或以上版本的浏览器',
        // IDCS_SAFARI_VERSION_FOR_P2P: '您的Safari浏览器版本太新，请使用Safari10或以下版本的浏览器',
        // IDCS_EDGE_VERSION_WARNING: '您的Edge浏览器版本太低，请使用Edge16或以上版本的浏览器',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '登录失败，原因：设备不在线。',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: '登录失败，原因：用户名或者密码错误。',
        // IDCS_LOGIN_FAIL_USER_LOCKED: '登录失败，原因：用户未启用。',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: '登录失败，原因：没有远程登录权限。',
        // IDCS_UNKNOWN_ERROR_CODE: '未知错误! 错误代码：',
    },
    //Chinese(Taiwan Region)
    '0x0404': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "外掛程式沒有安裝，請按一下<a href='%1'>這裡</a>下載並安裝外掛程式。安裝時請關閉瀏覽器！",
        // IDCS_NO_PLUGIN_FOR_MAC: '外掛程式沒有安裝，請按一下<a href=\'%1\'>這裡</a>下載並安裝外掛程式。安裝時請關閉瀏覽器！<br/>如果您已安裝了外掛程式，請在"Safari->偏好設定->安全性"檢查外掛程式是否被禁用。',
        // IDCS_NPAPI_NOT_SUPPORT: 'NPAPI外掛程式已禁用，請進行如下設定來啟用：<ul><li>1.在位址欄輸入"chrome://flags/#enable-npapi"；</li><li>2.按一下"啟用NPAPI"下的啟用按鈕；</li><li>3.關閉所有Chrome；</li><li>4.重新打開Chrome並存取本系統，外掛程式即可使用。</li></ul>或者外掛程式沒有安裝，請按一下<a href=\'%1\'>此處</a>下載並安裝外掛程式。安裝時請關閉瀏覽器！',
        IDCS_PLUGIN_VERSION_UPDATE: "外掛程式沒有更新，請按一下<a href='%1'>這裡</a>下載並更新外掛程式。",
        // IDCS_IE_VERSION_WARNING: '您的IE瀏覽器版本太低，請使用IE10或以上版本的瀏覽器。',
        // IDCS_FIREFOX_VERSION_WARNING: '您的Firefox瀏覽器版本太低，請使用Firefox53或以上版本的瀏覽器。',
        // IDCS_OPERA_VERSION_WARNING: '您的Opera瀏覽器版本太低，請使用Opera44或以上版本的瀏覽器。',
        // IDCS_OTHER_VERSION_WARNING: '您的瀏覽器不支持此插件，請使用以下瀏覽器：IE10-11，Firefox53或更高版本，Chrome57或更高版本，Safari11或更高版本，Opera44或更高版本，Edge16或更高版本。',
        // IDCS_CHROME_VERSION_WARNING: '您的Chrome瀏覽器版本太低，請使用Chrome57或以上版本的瀏覽器',
        // IDCS_SAFARI_VERSION_WARNING: '您的Safari瀏覽器版本太低，請使用Safari11或以上版本的瀏覽器',
        // IDCS_SAFARI_VERSION_FOR_P2P: '您的Safari瀏覽器版本太新，請使用Safari10或以下版本的瀏覽器',
        // IDCS_EDGE_VERSION_WARNING: '您的Edge瀏覽器版本太低，請使用Edge16或以上版本的瀏覽器',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '登錄失敗，原因：設備不在線。',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: '登入失败，原因：使用者不存在或密碼錯誤。',
        // IDCS_LOGIN_FAIL_USER_LOCKED: '登入失败，原因：使用者被鎖定。',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: '登入失败，原因：使用者沒有遠端登入權限。',
        // IDCS_UNKNOWN_ERROR_CODE: '未知錯誤 ! 錯誤代碼：',
    },
    //Croatian
    '0x041a': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Plugin nije instaliran, kliknite <a href='%1'>Here</a> za preuzimanje i instalaciju. Prije instalacije, zatvorite pretraživač.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Plugin nije instaliran, kliknite <a href=\'%1\'>Here</a> za preuzimanje i instalaciju.Prije instalacije zatvorite pretraživač.<br/>Ako ste instalirali plugin, provjerite dali je onemogućen u "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI podrška je trenutno onemogućena. slijedite upute niže kako bi ju omogućili: <ul><li>1.Unesite \"chrome://flags/#enable-npapi\" u adresnu traku;</li><li>2.Kliknite 'Omogućiti' pod 'Omogućiti NPAPI';</li><li>3.U potpunosti zatvorite Chrome prezraživač;</li><li>4.Ponovno otvorite Chrome i upravljajte sustavom, plugin je dostupan.</li></ul>Ili plugin nije instaliran, kliknite <a href='%1'>ovdje</a> za preuzimanje i instalaciju. Prije instalacije, zatvorite pretraživač.",
        IDCS_PLUGIN_VERSION_UPDATE: "Plugin nije aktualiziran, kliknite <a href='%1'>Here</a> za preuzimanje i instalaciju.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Vaša verzija Safari pretraživača nije podrška, molim vas koristite Safari10 ili stariju verziju njega.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Neuspješna prijava. Razlog: neispravno korisničko ime ili zaporka.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Neuspješna prijava. Razlog: korisnik je zaključan',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Neuspješna prijava. Razlog: korisnik nema ovlasti.',
        // IDCS_UNKNOWN_ERROR_CODE: '',
    },
    //Czech
    '0x0405': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Není nainstalován plugin, klikněte <a href='%1'>ZDE</a> pro stažení a nainstalování. Před instalací uzavřete prohlížeč.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Není nainstalován plugin, klikněte <a href=\'%1\'>ZDE</a> pro stažení a nainstalování.  Před instalací pluginu je nutné nejprve zavřít prohlížeč.<br/>Pokud máte plugin již nainstalován, tak prosím zkontrolujte zda není zakázán v nastavení zabezpečení  "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI podpora je zakázána. Postupujte následovně: <ul><li>1.Zadejte  \"chrome://flags/#enable-npapi\"  do adresy;</li><li>2.Klikněte 'Povolit' v položce 'Povolit Npapi';</li><li>3.Zavřeteprohlíže Chrome;</li><li>4.Znovu otevřete prohlížeč Chrome a přihlaště se na zařízení.</li></ul>Pokud není plugin nainstalován, klikěnte <a href='%1'>ZDE</a> pro stažení a instalaci. Před instalací uzavřete prohlížeč.",
        IDCS_PLUGIN_VERSION_UPDATE: "Plugin není aktualizován, klikněte prosím na <a href='%1'>ZDE</a> ke stažení a instalaci.",
        // IDCS_IE_VERSION_WARNING: 'Verze prohlížeče IE není podporována. Použijte prosím IE10 nebo novější verzi.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Verze prohlížeče Firefox není podporována. Použijte prosím Firefox53 nebo novější verzi.',
        // IDCS_OPERA_VERSION_WARNING: 'Verze prohlížeče Opera není podporována. Použijte prosím Opera44 nebo novější verzi.',
        // IDCS_OTHER_VERSION_WARNING: 'Váš prohlížeč tento plugin nepodporuje, použijte prosím následující prohlížeč: IE10-11, Firefox53 nebo novější, Chrome57 nebo novější, Opera44 nebo novější, Edge16 nebo později.',
        // IDCS_CHROME_VERSION_WARNING: 'Verze prohlížeče Chrome není podporována, použijte prosím Chrome57 nebo novější verzi prohlížeče.',
        // IDCS_SAFARI_VERSION_WARNING: 'Verze prohlížeče Safari není podporována, použijte prosím Safari11 nebo novější verzi prohlížeče.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Verze prohlížeče Safari není podporována, použijte prosím Safari10 nebo starší verzi prohlížeče.',
        // IDCS_EDGE_VERSION_WARNING: 'Vaše verze prohlížeče hran je příliš nízká. Použijte prosím edge16 nebo výše',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: 'Nepodařilo se přihlásit. Důvod: zařízení je offline.',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Přihlášení selhalo. Důvod: Špatné uživatelské jméno nebo heslo.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Přihlášení selhalo. Důvod: Účet je uzamčen.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Přihlášení selhalo. Důvod: Uživatel nemá práva.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Neznámá chyba! Kód chyby:',
    },
    //Farsi
    '0x0429': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "کليک کنيد. قبل از نصب, لطفا مرورگر خود را ببنديد </a> اينجا <a href='%1'> نصب نشده است, لطفا براي دانلود و نصب plugin",
        // IDCS_NO_PLUGIN_FOR_MAC: 'را بررسي کنيد "Safari->Preferences->Security" غير فعال است لطفا plugin را نصب شده داريد, در صورتي که plugin<br/> کليک کنيد. قبل از نصب, لطفا مرورگر خود را ببنديد.اگر شما </a> اينجا <a href=\'%1\'> نصب نشده است, لطفا براي دانلود و نصب plugin',
        // IDCS_NPAPI_NOT_SUPPORT: 'کليک کنيد. قبل از نصب, لطفا مرورگر خود را ببنديد <a href=\'%1\'> اينجا </a > نصب نشده است, لطفا براي دانلود و نصب  plugin يا  </li></ul> .در دسترس است plugin ,دوباره کروم را باز کنيد و سيستم را هدايت کنيد  . </li><li> 1;در حال حاضر غير فعال است.لطفا براي فعال سازي آن دستورالعمل زير را دنبال کنيد NPAPI پشتيباني. </li><li>2 ; را در آدرس بار وارد کنيد "chrome://flags/#enable-npapi" .</li><li>3 ; کليک کنيد Npapi بر روي فعال سازيدر زير فعال سازي .</li><li>4 ;مرورگر کروم را به طور کامل ببنديد .<ul>',
        IDCS_PLUGIN_VERSION_UPDATE: "کليک کنيد. قبل از نصب,دوصلۀ هشدار داده نشده </a> اينجا <a href='%1'> نصب نشده است, لطفا براي دانلود و نصب plugin",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'نسخه بررسی سافاری شما پشتیبانی نیست، لطفا از سافاری۱۰ یا نسخه قدیمی آن استفاده کنید.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'ورود ناموفق . دلیل: نام کاربری یا رمز عبور اشتباه است.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'ورود ناموفق . دلیل : کاربر قفل شده است.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'ورود ناموفق . دلیل : کاربر بدون اجازه.',
        // IDCS_UNKNOWN_ERROR_CODE: 'خطای ناشناخته! کد خطا:',
    },
    //German(Standard)
    '0x0407': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: '',
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "Das Plugin wurde nicht aktualisiert, bitte klicken Sie <a href='%1'>Hier</a> zum Herunterladen und Installieren.",
        // IDCS_IE_VERSION_WARNING: 'Ihre IE-Browserversion wird nicht unterstützt. Bitte verwenden Sie IE10 oder eine neuere Version davon.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Ihre Firefox-Browserversion wird nicht unterstützt. Bitte verwenden Sie Firefox53 oder eine neuere Version davon.',
        // IDCS_OPERA_VERSION_WARNING: 'Ihre Opera Browserversion wird nicht unterstützt. Bitte verwenden Sie Opera44 oder eine neuere Version davon.',
        // IDCS_OTHER_VERSION_WARNING: 'Ihr Browser unterstützt dieses Plugin nicht, bitte verwenden Sie folgenden Browser: IE10-11, Firefox53 oder höher, Chrome57 oder höher, Opera44 oder höher, Edge16 oder später.',
        // IDCS_CHROME_VERSION_WARNING: 'Ihre Chrome-Browserversion wird nicht unterstützt, verwenden Sie bitte Chrome57 oder eine neuere Version davon.',
        // IDCS_SAFARI_VERSION_WARNING: 'Ihre Safari-Browserversion wird nicht unterstützt. Bitte verwenden Sie Safari11 oder eine neuere Version.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Ihre Safari Browserversion wird nicht unterstützt. Bitte verwenden Sie Safari10 oder eine ältere Version.',
        // IDCS_EDGE_VERSION_WARNING: 'Ihre Version des Edge-Browsers ist zu niedrig. Bitte verwenden Sie edge16 oder höher',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Anmelden fehlgeschlagen: Grund: Falscher/s Benutzername oder Passwort.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Anmelden fehlgeschlagen: Grund: Der Benutzer ist gesperrt.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Anmelden fehlgeschlagen: Grund: Der Benutzer ist nicht berechtigt.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Unbekannter Fehler! Fehlercode:',
    },
    //Greek
    '0x0408': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Το πρόσθετο δεν έχει εγκατασταθεί, κάνετε click <a href='%1'>εδώ</a> για μεταφόρτωση και εγκατάσταση. Πριν την εγκατάσταση κλείστε το φυλλομετρητή.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Το πρόσθετο δεν έχει εγκατασταθεί, κάνετε click <a href=\'%1\'>εδώ</a> για μεταφόρτωση και εγκατάσταση. Πριν την εγκατάσταση κλείστε το φυλλομετρητή<br/>Αν έχετε εγκαταστήσει το πρόσθετο,ελέγξτε αν έχει απενεργοποιηθεί στο μενού "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI υποστήριξη είναι απενεργοποιημένη. Ακολουθείστε τις οδηγίες για να την ενεργοποιήσετε:<ul><li>1.Input \"chrome://flags/#enable-npapi\" στη γραμμή διευθύνσεων;</li><li>2.Επιλέξτε 'Enable' στο μενού 'Enable Npapi';</li><li>3.Κλείστε τον Chrome;</li><li>4. Ανοίτε πάλι τον Chrome και μεταβείτε στο system, αν το πρόσθετο είναι διαθέσιμο.</li></ul>Αν το πρόσθετο δεν έχει εγκατασταθεί, επιλέξτε <a href='%1'>Εδώ</a>για μεταφόρτωση και εγκατάσταση. Πριν την εγκατάσταση κλείστε το φυλλομετρητή.",
        IDCS_PLUGIN_VERSION_UPDATE: "Το πρόσθετο δεν έχει ενημερωθεί, παρακαλώ κάντε κλικ στο <a href='%1'>Εδώ</a> για να κατεβάσετε και να εγκαταστήσετε.",
        // IDCS_IE_VERSION_WARNING: 'Η έκδοση του προγράμματος περιήγησης δεν υποστηρίζεται. Παρακαλούμε χρησιμοποιήστε την IE10 ή νεότερη έκδοση του.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Η έκδοση του προγράμματος περιήγησης δεν υποστηρίζεται. Παρακαλώ χρησιμοποιήστε την Firefox53 ή νεότερη έκδοση του.',
        // IDCS_OPERA_VERSION_WARNING: 'Η έκδοση του προγράμματος περιήγησης Opera δεν υποστηρίζεται. Παρακαλώ χρησιμοποιήστε την Opera44 ή νεότερη έκδοση του.',
        // IDCS_OTHER_VERSION_WARNING: 'Το πρόγραμμα περιήγησης σας δεν υποστηρίζει αυτό το πρόσθετο, παρακαλούμε χρησιμοποιήστε το ακόλουθο πρόγραμμα περιήγησης: ή νεότερο, ή νεότερο, ή Opera44 ή νεότερο, Εντζέ16 ή αργότερα.',
        // IDCS_CHROME_VERSION_WARNING: 'Η έκδοση του προγράμματος περιήγησης δεν υποστηρίζεται, παρακαλούμε χρησιμοποιήστε το ή νεότερη έκδοση του.',
        // IDCS_SAFARI_VERSION_WARNING: 'Η έκδοση του προγράμματος περιήγησης δεν υποστηρίζεται, παρακαλούμε χρησιμοποιήστε τη Safari11 ή νεότερη έκδοση του.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Η έκδοση του προγράμματος περιήγησης δεν υποστηρίζεται, παρακαλούμε χρησιμοποιήστε το ή παλαιότερη έκδοση του.',
        // IDCS_EDGE_VERSION_WARNING: 'Η έκδοση του προγράμματος περιήγησης ακρών είναι πολύ χαμηλή. Παρακαλούμε χρησιμοποιήστε το edge16 ή παραπάνω',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Αποτυχία σύνδεσης. Αιτία: Λάθος Χρήστης ή κωδικός.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Αποτυχία σύνδεσης. Αιτία: Ο χρήστης είναι κλειδωμένος.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Αποτυχία σύνδεσης. Αιτία: Ο χρήστης δεν έχει πρόσβαση.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Άγνωστο σφάλμα! Κωδικός Σφάλματος:',
    },
    //Hebrew
    '0x040d': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "תוסף הוידאו לא זמין. אנא לחץ <a href='%1'> כאן </a> בכדי להוריד את התוסף ולהתקינו. לפני תחילת ההתקנה יש לסגור את דפדפן האינטרנט",
        // IDCS_NO_PLUGIN_FOR_MAC: "תוסף הוידאו לא זמין. אנא לחץ <a href='%1'> כאן </a> בכדי להוריד את התוסף ולהתקינו. לפני תחילת ההתקנה יש לסגור את דפדפן האינטרנט. אם כבר התקנת את הדפדפן, אנא ודא שהוא פעיל ברשימת התוספים של דפדפן האינטרנט שלך.",
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "התוספת אינה מעודכנת, בבקשה לחץ על <a href='% 1'>כאן</a> כדי להוריד ולהתקין.",
        // IDCS_IE_VERSION_WARNING: 'הגרסה של הדפדף IE שלך לא תומכת. בבקשה השתמש בגרסה IE10 או בגרסה מאוחרת יותר.',
        // IDCS_FIREFOX_VERSION_WARNING: 'הגרסה שלך של דופקת Firefox לא תומכת. בבקשה השתמש בגרסה Firefox53 או אחר כך.',
        // IDCS_OPERA_VERSION_WARNING: 'הגרסה שלך של מעגל האופרה לא תומכת. אנא השתמש בגרסה אופר26 או בגרסה מאוחרת יותר.',
        // IDCS_OTHER_VERSION_WARNING: 'הדחוף שלך לא תומך בתוספת זו. אנא השתמש בדחופים הבאים: ie10- 11, Firefox 53 או מאוחר יותר, chrome 57 או מאוחר יותר, Safari 11 או מאוחר יותר, אופרה 44 או מאוחר יותר, edge16 או מאוחר יותר.',
        // IDCS_CHROME_VERSION_WARNING: 'הגרסה שלך של דופקת כרום לא תומכת, אנא השתמש בגרסה Chrome57 או אחר כך.',
        // IDCS_SAFARI_VERSION_WARNING: 'הגרסה שלך של סאפארי לא תומכת, אנא תשתמש בסאפארי11 או בגרסה מאוחרת יותר.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'הגרסה שלך של סאפארי לא תומכת, אנא השתמש בגרסה סאפארי 10 או בגרסה מבוגרת יותר.',
        // IDCS_EDGE_VERSION_WARNING: 'הגרסה שלך של דפאוזר הקצה נמוכה מדי. אנא השתמש בedge16 או מעל',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: 'ההתחברות נכשלה. ההתקן לא זמין',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'כניסה נכשלה. שם המשתמש או הסיסמא אינם נכונים',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'כניסה נכשלה: החשבון נעול',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'כניסה נכשלה. למשתמש אין הרשאה',
        // IDCS_UNKNOWN_ERROR_CODE: 'שגיאה לא ידועה. קוד שגיאה:',
    },
    //Hungarian
    '0x040e': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "A beépülő modul nincs telepítve. Kattintson <a href='%1'> ide </a> a letöltéshez. ",
        // IDCS_NO_PLUGIN_FOR_MAC: "A beépülő modul nincs telepítve. Kattintson <a href='%1'> ide </a> a letöltéshez. Telepítés előtt zárja be a böngészőt!",
        // IDCS_NPAPI_NOT_SUPPORT: "A beépülő modult töltse le <a href='%1'> innen </a>. Zárja be a böngészőt a beépülő modul telepítése előtt.",
        IDCS_PLUGIN_VERSION_UPDATE: "A bővítmény nem frissült, a letöltéshez és telepítéshez kattintson a <a href='%1'> ide </a> gombra.",
        // IDCS_IE_VERSION_WARNING: 'Az IE böngésző verziója nem támogatott. Kérjük, használja az IE10 vagy újabb verzióját.',
        // IDCS_FIREFOX_VERSION_WARNING: 'A Firefox böngésző verziója nem támogatott. Kérjük, használja a Firefox53 vagy újabb verzióját.',
        // IDCS_OPERA_VERSION_WARNING: 'Az Opera böngésző verziója nem támogatott. Kérjük, használja az Opera44 vagy újabb verzióját.',
        // IDCS_OTHER_VERSION_WARNING: 'A böngészője nem támogatja ezt a beépülő modult, használja a következő böngészőket: ie10-11, Firefox 53 vagy újabb, Chrome 57 vagy újabb, Safari 11 vagy újabb, opera 44 vagy újabb, edge16 vagy újabb.',
        // IDCS_CHROME_VERSION_WARNING: 'A Chrome böngésző verziója nem támogatott, kérjük használja a Chrome57 vagy újabb verzióját.',
        // IDCS_SAFARI_VERSION_WARNING: 'A Safari böngésző verziója nem támogatott, kérjük használja a Safari11 vagy újabb verzióját.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'A Safari böngésző verziója nem támogatott, kérjük használja a Safari10 vagy annak régebbi verzióját.',
        // IDCS_EDGE_VERSION_WARNING: 'Az edge böngésző verziója túl alacsony. Kérjük, használja az edge16 vagy újabb verzióját',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Bejelentkezés sikertelen. A felhasználó vagy a jelszó helytelen.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Bejelentkezés sikertelen. A felhasználót kizárták.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Bejelentkezés sikertelen. A felhasználónak nincs jogosultsága.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Ismeretlen hiba! Hibakód:',
    },
    //Italian(Standard)
    '0x0410': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Il plugin non è installato, cliccate <a href='%1'> qui </a> per scaricare e installare. Prima dell'installazione, si prega di chiudere il browser.",
        // IDCS_NO_PLUGIN_FOR_MAC: "Il plugin non è installato, cliccate <a href='%1'> qui </a> per scaricare e installare. Prima dell'installazione, si prega di chiudere il browser. <br/> Se è stato installato, si prega di verificare se il plugin è disabilitato \"Safari->Preferences->Security\".",
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI supporto è attualmente disabilitata. Si prega di seguire le istruzioni qui di seguito per attivarlo:<ul><li>1.Inserire \"chrome://flags/#enable-npapi\" nella barra degli indirizzi;</li><li>2.Click 'Abilita' sotto la 'Abilita NPAPI'; </li><li>3.Chiudere il browser Chrome;</li><li>4. Riaprire Chrome e navigare nel sistema, il plugin è ora disponibile.</li></ul> O se il plugin non è installato, fai clic <a href='%1'>qui</a> per scaricare e installare. Prima dell'installazione, si prega di chiudere il browser.",
        IDCS_PLUGIN_VERSION_UPDATE: "Il plugin non è aggiornato, fare clic su <a href='%1'>Qui</a> per scaricare e installare.",
        // IDCS_IE_VERSION_WARNING: 'La versione del browser IE non è supportata. Si prega di utilizzare IE10 o versione successiva di esso.',
        // IDCS_FIREFOX_VERSION_WARNING: 'La versione del browser Firefox non è supportata. Si prega di utilizzare Firefox53 o versione successiva di esso.',
        // IDCS_OPERA_VERSION_WARNING: 'La versione del browser Opera non è supportata. Si prega di utilizzare Opera44 o versione successiva di esso.',
        // IDCS_OTHER_VERSION_WARNING: 'Utilizzare i seguenti browser: ie10-11, Firefox 53 o versioni successive, chrome 57 o versioni successive, Safari 11 o versioni successive, opera 44 o versioni successive, edge16 o versioni successive.',
        // IDCS_CHROME_VERSION_WARNING: 'La versione del browser Chrome non è supportata, utilizza Chrome57 o versioni successive.',
        // IDCS_SAFARI_VERSION_WARNING: 'La versione del browser Safari non è supportata, utilizza Safari11 o versioni successive.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'La versione del browser Safari non è supportata, utilizza Safari10 o versioni precedenti.',
        // IDCS_EDGE_VERSION_WARNING: 'La versione del browser edge è troppo bassa. Si prega di utilizzare edge16 o superiore',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Log in fallito. Motivo: username o password sbagliata.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Log in fallito. Motivo: utente bloccato.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Log in fallito. Motivo: utente non autorizzato.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Errore sconosciuto! Codice errore:',
    },
    //Macedonian
    '0x042f': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Не е инсталиран plugin , кликнете на <a href='%1'>Овде</a> за да го симнете и инсталирате. Пред инсталирање треба да го исклучите пребарувачот.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Не е инсталиран plugin , кликнете на <a href=\'%1\'>Овде</a> за да го симнете и инсталирате. Пред инсталацијата треба да го исклучите вашиот пребарувач. <br/>Ако имате инсталиран plugin,проверете дали тој е оневозможен во "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI Подршката во моментот е Исклучена. Следете ги инструкциите за да ја Вклучитеt:<ul><li>1.Внесете \"chrome://flags/#enable-npapi\" во полето за адреса;</li><li>2.Кликни 'Enable' во 'Enable Npapi';</li><li>3.Исклучете го Chrome пребарувачот;</li><li>4.Повторно отворете го Chrome и веднаш приклучете се на системот доколку имате инсталиран plugin.</li></ul> Или кликнете <a href='%1'>Овде</a> за да го симнете и инсталирате. Пред инсталирање треба да го исклучите пребарувачот.",
        IDCS_PLUGIN_VERSION_UPDATE: "Приклучокот не е ажуриран, кликнете на <a href='% 1'>Овде</a> за да се симнат и инсталираат.",
        // IDCS_IE_VERSION_WARNING: 'Вашата верзија на IE прелистувач не е поддржана. Please use IE10 or later version of it.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Вашата верзија на Firefox прелистувач не е поддржана. Ве молам користете Firefox53 или подоцна верзија од него.',
        // IDCS_OPERA_VERSION_WARNING: 'Вашата верзија на прелистувачот за опера не е поддржана. Ве молам користете ја опера26 или подоцна верзија на неа.',
        // IDCS_OTHER_VERSION_WARNING: 'Вашиот прелистувач не го поддржува овој приклучок. Ве молиме користете ги следните прелистувачи: ie10- 11, Firefox 53 или подоцна, chrome 57 или подоцна, Safari 11 или подоцна, опера 44 или подоцна, edge 16 или подоцна.',
        // IDCS_CHROME_VERSION_WARNING: 'Вашата верзија на Chrome прелистувач не е поддржана, ве молам користете ја Chrome57 или подоцна.',
        // IDCS_SAFARI_VERSION_WARNING: 'Вашата верзија на прелистувачот на Safari не е поддржана, ве молам користете ја Safari11 или подоцна.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Вашата верзија на прелистувачот на Safari не е поддржана, ве молам користете ја Safari10 или постарата верзија на неа.',
        // IDCS_EDGE_VERSION_WARNING: 'Вашата верзија на прелистувачот е премногу ниска. Ве молам користете edge 16 или над',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Неуспешно логирање. Причина: Погрешно корисничко име или лозинка',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Failed to log in. Reason: Неуспешно логирање. Причина: Корисникот е заклучен',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Неуспешно логирање. Причина: Корисникот нема пристап.',
        // IDCS_UNKNOWN_ERROR_CODE: '',
    },
    //Polish
    '0x0415': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Wtyczka nie jest zainstalowana, kliknij <a href='%1'> Here </a>, aby pobrać i zainstalować. Przed instalacją należy zamknąć przeglądarkę.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Plugin nie jest zainstalowany, kliknij <a href=\'%1\'> Here </a>, aby pobrać i zainstalować. Przed instalacją należy zamknąć przeglądarkę. <br/> Jeśli masz zainstalowaną wtyczkę, sprawdź, czy wtyczka jest wyłączona w "Safari-> Preferences-> Security".',
        // IDCS_NPAPI_NOT_SUPPORT: 'Wsparcie NPAPI jest obecnie wyłączone. Aby go włączyć, wykonaj poniższe instrukcje: <ul> <li> 1.Input "chrome: // flags / # enable-npapi" w pasku adresu; </li> <li> 2.Kliknij przycisk "Enable" Włącz Npapi \'; </li> <li> 3. Zamknij przeglądarkę Chrome; </li> <li> 4. Ponownie opuść Chrome i przejdź do systemu, plugin jest dostępny. </Li> </ul> Lub wtyczka nie jest zainstalowana, kliknij <a href=\'%1\'> Here </a>, aby pobrać i zainstalować. Przed instalacją należy zamknąć przeglądarkę.',
        IDCS_PLUGIN_VERSION_UPDATE: "Wtyczka nie jest aktualizowana, kliknij <a href='%1'>Tutaj</a> aby pobrać i zainstalować.",
        // IDCS_IE_VERSION_WARNING: 'Wersja przeglądarki IE nie jest obsługiwana. Proszę użyć IE10 lub nowszej wersji.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Wersja przeglądarki Firefox nie jest obsługiwana. Proszę użyć Firefox53 lub nowszej wersji.',
        // IDCS_OPERA_VERSION_WARNING: 'Wersja przeglądarki Opera nie jest obsługiwana. Proszę użyć Opera44 lub nowszej wersji.',
        // IDCS_OTHER_VERSION_WARNING: 'Używaj następujących przeglądarek: ie10-11, Firefox 53 lub nowszy, chrome 57 lub nowszy, Safari 11 lub nowszy, opera 44 lub nowszy, edge16 lub nowszy.',
        // IDCS_CHROME_VERSION_WARNING: 'Wersja przeglądarki Chrome nie jest obsługiwana, proszę użyć Chrome57 lub nowszej wersji.',
        // IDCS_SAFARI_VERSION_WARNING: 'Wersja przeglądarki Safari nie jest obsługiwana, proszę użyć Safari11 lub nowszej wersji.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Wersja przeglądarki Safari nie jest obsługiwana, proszę użyć Safari10 lub jej starszej wersji.',
        // IDCS_EDGE_VERSION_WARNING: 'Twoja wersja przeglądarki krawędziowej jest zbyt niska. Proszę użyć edge16 lub powyżej',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Logowanie nie powidło się. Powód: Podany uzytkownik lub hasło są nieprawidłowe.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Logowanie nie powiodło się. Powód: Konto zostało zablokowane.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Logowanie nie powiodło się. Powód: użytkownik nie posiada odpowiednich uprawnień do korzystania z tych zasobów!',
        // IDCS_UNKNOWN_ERROR_CODE: 'Nieznany błąd! Kod błędu:',
    },
    //Portuguese(Standard)
    '0x0816': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "O plugin não está instalado, por favor clique <a href='%1'>aqui</a> para baixa e instalar. Antes da instalação por favor feche o seu browser.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'O plugin não está instalado, por favor clique <a href=\'%1\'>aqui</a> para baixar e instalar. Antes da instalação por favor feche o seu browser.<br/>Se você possui o plugin, por favor veja se o plugin está desabilitado em "Safari->Preferências->Segurança".',
        // IDCS_NPAPI_NOT_SUPPORT: "O suporte NPAPI está atualmente desabilitado. Por favor siga as instruções abaixo para habilitá-lo:<ul><li>1.Insira \"chrome://flags/#enable-npapi\" na barra de endereços;</li><li>2.Clique em 'Habilitar' e abaixo 'Habilitar Npapi';</li><li>3.Feche o Chrome completamente;</li><li>4.Abra o Chrome e navegue no sistema, o plugin está habilitado.</li></ul>Ou o plugin não está instalado, por favor clique <a href='%1'>aqui</a> para baixar e instalar. Antes de instalar, por favor feche o seu browser.",
        IDCS_PLUGIN_VERSION_UPDATE: "O Plugin não está atualizado, clique em <a href='%1'>Aqui</a> para baixar e instalar.",
        // IDCS_IE_VERSION_WARNING: 'A versão do navegador IE não é suportada. Por favor, use o IE10 ou versão posterior dele.',
        // IDCS_FIREFOX_VERSION_WARNING: 'A versão do navegador Firefox não é suportada. Por favor, use Firefox53 ou versão posterior dele.',
        // IDCS_OPERA_VERSION_WARNING: 'A versão do navegador Opera não é suportada. Por favor, use Opera44 ou versão posterior dele.',
        // IDCS_OTHER_VERSION_WARNING: 'Por favor, utilize os seguintes navegadores: ie10-11, Firefox 53 ou posterior, chrome 57 ou posterior, Safari 11 ou posterior, opera 44 ou posterior, edge16 ou posterior.',
        // IDCS_CHROME_VERSION_WARNING: 'A versão do navegador Chrome não é suportada, use o Chrome57 ou a versão posterior dele.',
        // IDCS_SAFARI_VERSION_WARNING: 'A versão do navegador Safari não é suportada, utilize o Safari11 ou uma versão posterior.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'A versão do navegador Safari não é suportada, utilize o Safari10 ou a versão mais antiga dele.',
        // IDCS_EDGE_VERSION_WARNING: 'Sua versão do edge browser é muito baixa. Por favor, use edge16 ou superior',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: 'Falha no login. Motivo: dispositivo offline.',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Falha ao logar. Motivo: Usuário ou Senha incorreta.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Falha ao logar. Motivo: Usuário bloqueado.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Falha ao logar. Motivo: Usuário não possui permissão.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Erro desconhecido! Código de erro:',
    },
    //Romanian
    '0x0418': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Plugin neinstalat, apasati pe <a href='%1'>Here</a> sa descarcati si sa instalati. Before installation, please close your browser.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Plugin neinstalat, apasati <a href=\'%1\'>Here</a> pt descarcare si instalare inchideti browser  <br/>If you have installed plugin, please check if the plugin is disabled at "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI Support dezactivat. urmati instr. pt. activare <ul><li>1.Input \"chrome://flags/#enable-npapi\" into address bar;</li><li>2.Click 'Enable' under the 'Enable Npapi';</li><li>3.Close the Chrome browser completely;</li><li>4.Reopen the Chrome and navigate to the system, the plugin is available.</li></ul>Or the plugin is not installed, please click <a href='%1'>Here</a> to download and install. Before installation, please close your browser.",
        IDCS_PLUGIN_VERSION_UPDATE: "Plugin nu este actualizat, vă rugăm să faceți clic pe <a href='%1'>Aici</a> pentru a descărca și instala.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Versiunea browserului Safari nu este acceptată, vă rugăm să utilizați Safari10 sau versiunea mai veche a acestuia.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Logare esuata.Motiv:Nume utilizator si parola gresite.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Logare esuata.Motiv:utilizator blocat.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Logare esuata.Motiv:lipsa permisiuni.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Eroare necunoscuta! Cod eroare:',
    },
    //Russian
    '0x0419': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Плагин не установлен,нажимите <a href='%1'>сюда</a> , чтобы скачать и установить. Перед установкой закройте браузер.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Плагин не установлен, пожалуйста нажмите <a href=\'%1\'>Сюда</a>, чтобы скачать и установить. Перед установкой закройте браузер.<br/>Если вы уже установили плагин, проверите "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: 'NPAPI не поддерживается. Для настройки:<ul><li> 1. напишите "chrome://flags/#enable-npapi"；</li><li>2.Нажмите “Enable NPAPI”；</li><li>3.Закройте все Chrome；</li><li>4.Заново откройте Chrome и войдите в систему.</li></ul>Если плагин не установлен, нажмите <a href=\'%1\'>сюда</a>, чтобы скачать и установить。 Перед установкой закройте браузер.',
        IDCS_PLUGIN_VERSION_UPDATE: "модуль не обновлён,нажимите <a href='%1'>сюда</a> , чтобы скачать и установить. ",
        // IDCS_IE_VERSION_WARNING: 'версия вашего просмотра IE не поддерживается. Пожалуйста, используйте IE10 или выше.',
        // IDCS_FIREFOX_VERSION_WARNING: 'версия браузера Firefox не поддерживается. Пожалуйста, используйте Firefox53 или более высокую версию.',
        // IDCS_OPERA_VERSION_WARNING: 'версия браузера Opera не поддерживается. Используйте Opera44 или выше.',
        // IDCS_OTHER_VERSION_WARNING: 'Этот модуль не поддерживается вашим браузером. Используйте следующие версии: IE10 - 11, Firefox53 или выше, Chrome57 или выше, Safari11 или выше, Opera44 или выше, Edge16 или выше.',
        // IDCS_CHROME_VERSION_WARNING: 'версия вашего обозревателя Chrome не поддерживается, используйте Chrome57 или выше.',
        // IDCS_SAFARI_VERSION_WARNING: 'версия браузера Safari не поддерживается, используйте Safari11 или выше.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Не поддерживайте версию браузера Safari. Используйте Safari10 или более ранние версии.',
        // IDCS_EDGE_VERSION_WARNING: 'версия браузера Edge слишком низкая, используйте Edge16 или выше',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: 'недостунный вход, причина:оборудование оффлайн',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Вход в систему не удался: неправильные имя пользователя или пароль.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Вход в систему не удался: пользователь заблокирован.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Вход в систему не удался: у пользователя нет прав.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Неизвестная ошибка! Код ошибки:',
    },
    //Slovak
    '0x041b': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: '',
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "Plugin nie je aktualizovaný, prosím kliknite na <a href='% 1'>Tu</a> na stiahnutie a inštaláciu.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Váš prehliadač Safari nie je podporovaný, prosím používajte Safari10 alebo jeho staršiu verziu.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Prihlásenie zlyhalo. Dôvod: Užívateľské meno alebo heslo je nesprávne.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Prihlásenie zlyhalo. Dôvod: Užívateľ je zablokovaný.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Prihlásenie zlyhalo. Dôvod: Užívateľ nemá oprávnenie.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Neznáma chyba! Kód chyby:',
    },
    //Slovenian
    '0x0424': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Dodatek ni inštaliran, klikni na <a href='%1'>Here</a> za prevzem in inštalacijo. Pred inštalacijo zaprite brskalnik.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Dodatek ni inštaliran, klikni na <a href=\'%1\'>Here</a> za prevzem in inštalacijo. Pred inštalacijo zaprite brskalnik. <br/> Če ste inštalirali dodatek, preverite, če je dodatek onemogočen v  "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI podpora je trenutno onemogočena. Sledite navodilom spodaj za omogočanje:  <ul><li>1.Input \"chrome://flags/#enable-npapi\" into address bar;</li><li>2.Click 'Enable' under the 'Enable Npapi';</li><li>3.Close the Chrome browser completely;</li><li>4.Reopen the Chrome and navigate to the system, the plugin is available.</li></ul>Or the plugin is not installed, please click <a href='%1'>Here</a> za prevzem in inštalacijo. Pred inštalacijo zaprite brskalnik.",
        IDCS_PLUGIN_VERSION_UPDATE: "Vstavek ni posodobljen, prosimo kliknite <a href='%1'>Tukaj</a> za prenos in namestitev.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Različica brskalnika Safari ni podprta, uporabite Safari10 ali starejšo različico brskalnika.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Napaka pri prijavi. Razlog je napačno up. ime ali geslo.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Napaka pri prijavi. Razlog je zaklenjen uporabnik.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Napaka pri prijavi. Razlog je v tem, da uporabnik nima pravic.',
        // IDCS_UNKNOWN_ERROR_CODE: '',
    },
    //Spanish(Mexican)
    '0x080a': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: '',
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "El plugin no ha sido actualizado. Haga clic aquí para descargar <a href='%1'>y</a> actualizar el plugin",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Su versión del navegador Safari no está soportada, use Safari 10 o antes.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'ERROR AL INICIAR SESIÓN EN LA RAZÓN: NOMBRE DE USUARIO O LA CONTRASEÑA ES INCORRECTA',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'NO SE HA PODIDO INICIAR LA SESIÓN MOTIVO: EL USUARIO ESTÁ BLOQUEADO',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'ERROR AL INICIAR SESIÓN: MOTIVO: EL USUARIO NO TIENE PERMISO',
        // IDCS_UNKNOWN_ERROR_CODE: '¡ERROR DESCONOCIDO! CÓDIGO DE ERROR:',
    },
    //Spanish(Spain - Modern Sort)
    '0x0c0a': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Si el plugin no está instalado, haga clic <a href='%1'> aquí </a> para descargar e instalar. Antes de la instalación, por favor, cierre su navegador.",
        // IDCS_NO_PLUGIN_FOR_MAC: "El plugin no está instalado, haga clic <a href='%1'> aquí </A> para descargar e instalar. Antes de la instalación, por favor cierre su navegador. <br/> Si usted tiene el plug-in, por favor ver si el plugin está deshabilitado en Safari-> Preferencias> Seguridad.",
        // IDCS_NPAPI_NOT_SUPPORT: "El NPAPI soporte no está activa en este momento. Por favor, siga las siguientes instrucciones a fin de que: <ul> <li> 1.Ingrese chrome: // banderas / # enable-NPAPI  en la barra de direcciones </li> <li> 2. Haga clic 'activar' y en 'habilitar NPAPI'; </li> <li> 3.Cierre Chrome por completo;. </li> <li> 4. Abrir Chrome y navegar por el sistema, el plugin está habilitado </li> </ul> O el plugin no está instalado, por favor haga clic <a href='%1'> aquí </a> para descargar e instalar. Antes de la instalación, por favor, cierre su navegador.",
        IDCS_PLUGIN_VERSION_UPDATE: "El plugin no ha sido actualizado, haga clic <a href='%1'> aquí </a> para descargar e instalar. ",
        // IDCS_IE_VERSION_WARNING: 'Su versión del navegador IE no está soportada. Use ie10 o más tarde.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Su versión del navegador Firefox no está soportada. Por favor, use Firefox 34 o más tarde.',
        // IDCS_OPERA_VERSION_WARNING: 'Su versión del navegador de ópera no está soportada. Por favor, use opera 26 o más tarde.',
        // IDCS_OTHER_VERSION_WARNING: 'Su navegador no soporta este plug - in. Utilice los siguientes navegadores: ie10 - 11, Firefox 53 o más tarde, Chrome 57 o más tarde, Safari 11 o más tarde, opera 44 o más tarde, Edge 16 o más tarde.',
        // IDCS_CHROME_VERSION_WARNING: 'Su versión del navegador Chrome no está soportada, por favor use Chrome 57 o más tarde.',
        // IDCS_SAFARI_VERSION_WARNING: 'Su versión del navegador Safari no está soportada, use Safari 11 o más tarde.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Su versión del navegador Safari no está soportada, use Safari 10 o antes.',
        // IDCS_EDGE_VERSION_WARNING: 'Su versión del navegador Edge es demasiado baja, por favor use el navegador Edge 16 o superior',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: 'Falló de iniciar sección. Motivo: El dispositivo no está en línea.',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Error de inicio de sesión. Motivo: Usuario o contraseña incorrecto.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Error de inicio de sesión. Motivo: El usuario esta bloqueado.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Error de inicio de sesión. Motivo: El usuario no tiene permisos.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Error desconocido! Código de error:',
    },
    //Thai
    '0x041e': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: '',
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "ปลั๊กอินมีการปรับปรุง, กรุณาคลิก<a href='%1'>ที่นี่</a>เพื่อดาวน์โหลดและปรับปรุงปลั๊กอิน",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'รุ่นเบราว์เซอร์ซาฟารีของคุณไม่รองรับกรุณาใช้ซาฟารีหรือรุ่นก่อนหน้า',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'ล็อกอินล้มเหลวเพราะ:ชื่อหรือรหัสผ่านผิด',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'ล็อกอินล้มเหลวเพราะ:ชื่อผู้ใช้นีี้ถูกล็อค',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'ล็อกอินล้มเหลวเพราะ:ชื่อผู้ใช้นี้ไม่มีสิทธิ์',
        // IDCS_UNKNOWN_ERROR_CODE: 'ข้อผิดพลาดที่ไม่รู้จัก! รหัสผิดพลาด:',
    },
    //Turkish
    '0x041f': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Eklenti kurulu değil, lütfen <a href='%1'>burayı</a> tıklayın ve kurun, kurulumdan önce lütfen tarayıcınızı kapatın",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Eklenti kurulu değil, lütfen <a href=\'%1\'>burayı</a> tıklayın ve kurun, kurulumdan önce lütfen tarayıcınızı kapatın.<br/> eklentiyi kurduysanız, lütfen eklentinin "Safari->Preferences->Security" bölümünden aktif olduğundan emin olun',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "Plaginin güncellenmedi, lütfen <a href='%1'>Burada indirmek ve kurulmak için </a> tıklayın.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Safari tarayıcı sürümünüz desteklenmiyor. Lütfen Safari10 ya da eski sürümünü kullanın.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Giriş başarısız. Nedeni: Kullanıcı adı veya şifre yalnış.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Giriş başarısız. Nedeni: kullanıcı kilitli.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Giriş başarısız. Nedeni: kullanıcı yetkisiz.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Bilinmeyen hata! Hata kodu:',
    },
    //Korean(Korea)
    '0x0412': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "플러그인이 설치되어 있지 않습니다, 여기를 <a href='%1'>클릭</a> 하여 다운로드 후 설치 하세요. 설치 전 모든 창을 닫으세요.",
        // IDCS_NO_PLUGIN_FOR_MAC: '플러그인이 설치되어 있지 않습니다, 여기를 <a href=\'%1\'>클릭</a> 하여 다운로드 후 설치 하세요. 설치 전 모든 창을 닫으세요.<br/>만약 플러그인이 설치되어 있다면, "Safari->Preferences->Security" 에서 플러그인이 비 활성화 되어 있는지 확인하세요.',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI 가 현재 비 활성화 되어 있습니다. 다음과 설명에 따라 활성화 하십시오:<ul><li>1.주소창에 \"chrome://flags/#enable-npapi\" 입력하세요;</li><li>2.'Enable Npapi'아래에 있는'Enable'을 클릭하세요;</li><li>3.창을 닫으세요;</li><li>4.창을 다시 실행 후 시스템창을 여세요, 플러그인이 이용 가능합니다.</li></ul>만약 플러그인이 설치되어 있지 않다면, 여기를 <a href='%1'>클릭</a> 하여 다운로드후 설치 하세요, 설치 전 모든 창을 닫으세요.",
        IDCS_PLUGIN_VERSION_UPDATE: "플러그인이 업데이트되지 않았습니다, 여기를 <a href='%1'>클릭</a> 하여 다운로드 후 설치 하세요. 설치 전 모든 창을 닫으세요.",
        // IDCS_IE_VERSION_WARNING: 'IE 브라우저 버전이 지원되지 않습니다.IE10 이상 을 사용하십시오.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Firefox 브라우저 버전이 지원되지 않습니다.Firefox53 이상 을 사용하십시오.',
        // IDCS_OPERA_VERSION_WARNING: 'Opera 브라우저 버전이 지원되지 않습니다.Opera44 이상 버전을 사용하십시오.',
        // IDCS_OTHER_VERSION_WARNING: '브라우저에서 이 플러그인을 지원하지 않습니다. IE10-11, Firefox53 이상, Chrome57 이상, Safari11 이상, Opera44 이상, Edge16 이상.',
        // IDCS_CHROME_VERSION_WARNING: 'Chrome 브라우저 버전이 지원되지 않습니다. Chrome 57 이상 버전을 사용하십시오.',
        // IDCS_SAFARI_VERSION_WARNING: 'Safari 브라우저 버전이 지원되지 않습니다. Safari 11 이상 버전을 사용하십시오.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Safari 브라우저 버전은 지원되지 않습니다. Safari 10 이상 버전을 사용하십시오.',
        // IDCS_EDGE_VERSION_WARNING: 'Edge 브라우저 버전이 너무 낮습니다. Edge 16 이상 브라우저를 사용하십시오.',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '로그인 실패. 장치가 오프라인입니다.',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: '사용자이름 또는 비밀번호가 틀려 로그인 할 수 없습니다.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: '로그인 할 수 없습니다. 사용자가 잠겨있습니다.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: '승인된 사용자가 아니므로 로그인 할 수 없습니다.',
        // IDCS_UNKNOWN_ERROR_CODE: '알려지지 않은 에러! 에러코드:',
    },
    //Vietnamese(Vietnam)
    '0x042a': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Không Plugin cho Windows. Nhấn <a href='%1'>vào đây </a> để cài đặt",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Không Plugin cho MAC. Nhấn <a href=\'%1\'>vào đây </a>  để cài đặt. Kiểm tra tắt bảo mật tại "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI Không hỗ trợ. Please follow the instructions below to enable it:<ul><li>1.Input \"chrome://flags/#enable-npapi\" into address bar;</li><li>2.Click 'Enable' under the 'Enable Npapi';</li><li>3.Close the Chrome browser completely;</li><li>4.Reopen the Chrome and navigate to the system, the plugin is available.</li></ul>Or the plugin is not installed, please click <a href='%1'>Here</a> to download and install. Before installation, please close your browser.",
        IDCS_PLUGIN_VERSION_UPDATE: "Bổ sung không cập nhật, Nhấn <a href='%1'>vào đây </a> để cài đặt",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Không hỗ trợ phiên bản duyệt Safari của em, xin dùng Safari10 hoặc phiên bản cũ của nó.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Đăng nhập thất bại. Nguyên nhân: Người dùng và mật khẩu bị sai.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Đăng nhập thất bại. Nguyên nhân: Người dùng bị khóa',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Đăng nhập thất bại. Nguyên nhân: Người dùng không có quyền',
        // IDCS_UNKNOWN_ERROR_CODE: 'Lỗi không xác định! Mã lỗi:',
    },
    //French(Standard)
    '0x040c': {
        IDCS_NO_PLUGIN_FOR_WINDOWS:
            "Le plugin n'étant pas installé, veuillez cliquer sur <a href='%1'> ici </a> pour le téléchargement et l'installation. Avant de l'installation, veuillez fermer le navigateur!",
        // IDCS_NO_PLUGIN_FOR_MAC: "Le plugin n'étant pas installé, veuillez cliquer sur <a href='%1'> ici </a> pour le téléchargement et l'installation. Avant de l'installation, veuillez fermer le navigateur! <br/> Si vous avez installé le plugin, merci de vérifier si le plugin est désactivé sur \"Safari->Préférences->Sécurité\".",
        // IDCS_NPAPI_NOT_SUPPORT: 'Le plugin NPAPI est désactivé.Veuillez le réactiver par les opérations suivantes: <ul><li>1. Taper "chrome://flags/#enable-npapi" dans la barre d\'adresse;/li><li>2.Cliquer sur "Activer" sous "Activer NPAPI"; </li><li>3. Fermer le navigateur Chrome complètement; </li><li>4.Rouvrier le navigateur Chrome et accéder au système. Le plugin devient ainsi utilisable. </li></ul> Ou bien le plugin n\'étant pas installé, veuillez cliquer sur <a href=\'%1\'> ici </a> pour le téléchargement et l\'installation. Avant de l\'installation, veuillez fermer le navigateur!',
        IDCS_PLUGIN_VERSION_UPDATE: "Le plugin n'a pas été mis à jour, veuillez cliquer sur <a href='%1'> ici </a> pour le téléchargement et l'installation.",
        // IDCS_IE_VERSION_WARNING: "Votre version de navigateur Ie n'est pas prise en charge. Utilisez IE10 ou plus tard.",
        // IDCS_FIREFOX_VERSION_WARNING: "Votre version de navigateur Firefox n'est pas prise en charge. Utilisez Firefox 53 ou plus tard.",
        // IDCS_OPERA_VERSION_WARNING: "Votre version du navigateur Opera n'est pas prise en charge. Utilisez Opera 44 ou plus tard.",
        // IDCS_OTHER_VERSION_WARNING: "Ce plugin n'est pas pris en charge par votre navigateur, utilisez les navigateurs suivants: IE10 - 11, Firefox 53 ou plus tard, chrome57 ou plus tard, Safari 11 ou plus tard, opera44 ou plus tard, edge16 ou plus tard.",
        // IDCS_CHROME_VERSION_WARNING: "Votre version de navigateur Chrome n'est pas prise en charge, veuillez utiliser Chrome 57 ou plus tard.",
        // IDCS_SAFARI_VERSION_WARNING: "Votre navigateur safari n'est pas pris en charge. Utilisez Safari 11 ou plus tard.",
        // IDCS_SAFARI_VERSION_FOR_P2P: "Votre version de navigateur safari n'est pas prise en charge, utilisez Safari 10 ou plus tôt.",
        // IDCS_EDGE_VERSION_WARNING: 'Votre navigateur Edge est trop bas. Veuillez utiliser Edge 16 ou plus',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Echec identification. Mauvais utilisateur et/ou mot de passe.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: "Echec identification. L'utilisateur est vérouillé.",
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: "Echec identification. L'utilisateur n'a pas de permission.",
        // IDCS_UNKNOWN_ERROR_CODE: 'Erreur inconnue! Code Erreur:',
    },
    //Dutch(Standard)
    '0x0013': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: '',
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "De plugin is niet bijgewerkt, klik op <a href='%1'>Hier</a> om te downloaden en te installeren.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Uw Safari browserversie wordt niet ondersteund, gebruik Safari10 of oudere versie ervan.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Login mislukt. Reden: foutieve gebruikernaam of paswoord ongeldig.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Login mislukt. Reden: de gebruiker is geblokkeerd.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Login mislukt. Reden: de gebruiker heeft geen toelating.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Onbekende fout! Fout code:',
    },
    //Japanese(Japan)
    '0x0411': {
        IDCS_NO_PLUGIN_FOR_WINDOWS:
            "このプラグインはインストールされていません。 <a href='%1'>こちら</a>をクリックし、ダウンロードとインストールを行って下さい。 インストールする前に、ブラウザを閉じてください。",
        // IDCS_NO_PLUGIN_FOR_MAC: 'このプラグインはインストールされていません。 <a href=\'%1\'>こちら</a> をクリックしてダウンロードとインストールを行って下さい。インストール前にブラウザを閉じてください。<br/>プラグインをインストールする場合は、 "サファリ->優先->セキュリティ"でプラグインが無効かどうか確認して下さい。',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPIサポートは現在無効です。有効にするために、以下の説明へ進んでください。:<ul><li>1. \"chrome://flags/#enable-npapi\" をアドレスバーに入力;</li><li>2. 'Enable Npapi'下の'有効'をクリック;</li><li>3.クロームブラウザを全部閉じる;</li><li>4.クロームを再開し、システムを操作してプラグインが利用可能になります。< /li></ul>プラグインがインストールされていない場合は、<a href='%1'>こちら</a>をクリックし、ダウンロードとインストールを行って下さい。インストール前にブラウザを閉じてください。",
        IDCS_PLUGIN_VERSION_UPDATE: "プラグインが更新されません。 <a href='%1'>こちら</a>をクリックし、ダウンロードとインストールを行って下さい。 インストールする前に、ブラウザを閉じてください。",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'あなたのSafariブラウザのバージョンは、Safari 10またはそれの古いバージョンを使用してくださいサポートされていません。',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'ログインエラー。ユーザー名かパスワードが間違っています。',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'ログインエラー。ユーザーがロックされています。',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'ログインエラー。ユーザー権限がありません。',
        // IDCS_UNKNOWN_ERROR_CODE: '不明なエラー! エラーコード:',
    },
    //Indonesian(Indonesia)
    '0x0421': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: '',
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "Plugin tidak diperbarui, silakan klik <a href='% 1'>Di sini</a> untuk mengunduh dan memasang.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Versi pelayar Safari Anda tidak didukung, silakan gunakan versi Safari10 atau lebih tua dari itu.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: '',
        // IDCS_LOGIN_FAIL_USER_LOCKED: '',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: '',
        // IDCS_UNKNOWN_ERROR_CODE: '',
    },
    //Bulgarian(Bulgaria)
    '0x0402': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Добавката не е инсталирана. Моля кликнете <a href='%1'>тук</a> за да я свалите и инсталирате. Преди инсталацията, моля затворете браузъра.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Добавката не е инсталирана. Моля кликнете <a href=\'%1\'>тук</a> за да я свалите и инсталирате. Преди инсталацията, моля затворете браузъра. Ако сте инсталирали добавката, моля проверете дали не е забранена в "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "Поддръжката на NPAPI е забранена. Моля следвайте следните инструкции за да я разрешите: <ul><li>1. Въведете \"chrome://flags/#enable-npapi\" в адресното поле;</li><li>2. Кликнете 'Разреши' в 'Разреши Npapi';</li><li>3.Затворете изцяло браузера;</li><li>4. Отворете го отново и отидете към системата. Добавката е налична.</li></ul> Или ако добавката не е инсталирана, моля кликнете <a href='%1'>тук</a> за да я свалите и инсталирате. Преди инсталацията, моля затворете браузъра.",
        IDCS_PLUGIN_VERSION_UPDATE: "Приставката не е обновена. Моля кликнете <a href='%1'>тук</a> за да я свалите и инсталирате. Преди инсталацията, моля затворете браузъра.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Версията на вашия браузър не се поддържа, моля използвайте или по-стара версия на него.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Неуспешно вписване. Причина: Грешно потребителско име или парола.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Неуспешно вписване. Причина: Потребителят е заключен.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Неуспешно вписване. Причина: Потребителя няма права.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Неизвестна грешка! Код на грешката:',
    },
    //Serbian
    '0x0c1a': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Priključak nije instaliran, molim kliknite <a href='%1'>Here</a> za preuzimanje i instalaciju. pre instalacije, molim zatvorite svoj pretraživač.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Priključak nije instaliran, molim kliknite <a href=\'%1\'>Here</a> za preuzimanje i instalaciju. Pre instalacije, molim zatvorite svoj pretraživač.<br/>Ako ste instalirali priključak, molim proverite da li je priključak onemogućen u "Safari->Preferences->Security".',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPI Podrška je trenuitno onemogućena. Molim pratite instrukcije ispod da bi ga omogućili::<ul><li>1.Input \"chrome://flags/#enable-npapi\" u adres bar;;</li><li>2.Kliknite 'Enable'  u 'Enable Npapi';</li><li>3.Zatvorite Chrome pretraživač kompletno;</li><li>4. Otvorite ponovo Chrome i idite u System, priključak je dostupan..</li></ul>Ili priklju;ak nije instaliran, molim kliknite <a href='%1'>Here</a> za preuzimanje i instalaciju. Pre instalacije, molim zatvorite svoj pretraživač.",
        IDCS_PLUGIN_VERSION_UPDATE: "Додатак се не ажурира, molim kliknite <a href='%1'>Here</a> za preuzimanje i instalaciju. pre instalacije, molim zatvorite svoj pretraživač.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Vaša verzija Safari pretraživača nije podrška, molim vas koristite Safari10 ili stariju verziju.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Prijava nije uspela. Razlog: korisničko ime ili lozinka nisu ispravni',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'prijava nije uspela. Razlog: Korisnik je zaključan',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Neuspela prijava. Razlog: Korisnik nema dozvolu',
        // IDCS_UNKNOWN_ERROR_CODE: 'Nepoznata greška! Šifra greške:',
    },
    //Kazakh(Kazakhstan)
    '0x043f': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: '',
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: '',
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: '',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: '',
        // IDCS_LOGIN_FAIL_USER_LOCKED: '',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: '',
        // IDCS_UNKNOWN_ERROR_CODE: '',
    },
    //Arabic(Egypt)
    '0x0c01': {
        // "IDCS_NO_PLUGIN_FOR_WINDOWS": "THE PLUGIN IS NOT INSTALLED, PLEASE CLICK <A HREF=\"لم يتم تثبيت المكون الإضافي، يرجى النقر <a href='%1'> هنا </a> للتنزيل والتثبيت. قبل التثبيت، يرجى إغلاق المتصفح.",
        IDCS_NO_PLUGIN_FOR_WINDOWS: "لم يتم تثبيت المكون الإضافي، يرجى النقر<a href='%1'> هنا </a> للتنزيل والتثبيت. قبل التثبيت، يرجى إغلاق المتصفح.",
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "يتم تثبيت المكون الإضافي، يرجى النقر<a href='%1'> هنا </a> للتنزيل والتثبيت. قبل التثبيت، يرجى إغلاق المتصفح.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'نسخة من متصفح سفاري غير معتمد ، يرجى استخدام سفاري 10 أو في وقت سابق .',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'فشل تسجيل الدخول السبب: اسم المستخدم أو كلمة المرور خاطئة.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'فشل تسجيل الدخول السبب: تم تأمين المستخدم.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'أخفق تسجيل الدخول السبب: ليس لدى المستخدم إذن.',
        // IDCS_UNKNOWN_ERROR_CODE: 'خطأ غير معروف رمز الخطأ:',
    },
    //Afrikaans
    '0x0436': {
        IDCS_NO_PLUGIN_FOR_WINDOWS:
            "Sagteware is nie geinstalleer nie, kliek asb op die volgende skakel <a href='%1'>Here</a> om sagteware af te laai en te installeer. Maak asb alle webtuistes toe voor installasie.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Die sagteware is nie geinstalleer, kliek asb op die volgende skakel (  <a href=\'%1\'>Here</a>)om die sagteware af te laai en te installeer, maak asb  seker alle webtuistes toe voor installasie, Wanneer u die sagteware geinstalleer het, maak asb seker dat dat die sagteware ge deaktifeer is by ("Safari->Preferences->Security")',
        // IDCS_NPAPI_NOT_SUPPORT: 'NPAPI ondersteuning is tans af geskakel, Volg asb die onderstaande instuksies om dit te aktifeer :<ul><li> 1.Inset "chrome://flags/#enable-npapi" by webadres opsie. 2. Kliek op "aktiveer" onder die "aktiveer" npapi. 3. Maak die \'Chrome\' webtuiste heeltemal toe. 4. Heropen die \'Chrome\' Webtuiste en navigeer na die stelsel sagteware, maak seker die sagteware is beskikbaar, of die sagteware is nie geinstalleer. Kliek asb op die volgende skakel <a href=\'%1\'>Here</a>) om sagteware af te laai en te installeer. Maak asb seker om alle webtuistes toe te maak voor installasie.',
        IDCS_PLUGIN_VERSION_UPDATE:
            "Die inprop module is nie opgedateer nie, kliek asb op die volgende skakel <a href='%1'>Here</a> om sagteware af te laai en te installeer. Maak asb alle webtuistes toe voor installasie.",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Your Safari browser version is not supported, please use Safari10 or older version of it.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: 'Nie in staat om aan te teken rede: toestel is van lyn af',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Onsuksesvol om in te teken. Rede: Wagwoord of verbruikers naam is verkeerd.',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Onsuksesvol om in te teken. Rede: Die verbruiker is geblok.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Onsuksesvol om in te teken. Rede: Die verbruiker het nie toegangsmag nie.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Onbekende fout! Fout kode:',
    },
    //Lithuanian(Lithuania)
    '0x0427': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Įskiepas neįdiegtas, pasirinkite <a href='%1'>Here</a>",
        // IDCS_NO_PLUGIN_FOR_MAC: "Įskiepas neįdiegtas, pasirinkite <a href='%1'>Here</a>",
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "Įskiepis nėra atnaujintas, pasirinkite <a href='%1'>Here</a>",
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Jūsų Safari naršyklės versija nepatvirtinama, prašome naudoti Safari10 arba senesnę versiją.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: 'Nepavyko prisijungti. Neteisingas vartotojas arba slaptažodis',
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Nepavyko prisijungti. Ribotas vartotojas',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: 'Nepavyko prisijungti. Šis vartotojas neturi prieigos.',
        // IDCS_UNKNOWN_ERROR_CODE: 'Nežinoma klaida',
    },
    //Lao(Lao P.D.R.)
    '0x0454': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: '',
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: '',
        // IDCS_IE_VERSION_WARNING: '',
        // IDCS_FIREFOX_VERSION_WARNING: '',
        // IDCS_OPERA_VERSION_WARNING: '',
        // IDCS_OTHER_VERSION_WARNING: '',
        // IDCS_CHROME_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_WARNING: '',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Your Safari browser version is not supported, please use Safari10 or older version of it.',
        // IDCS_EDGE_VERSION_WARNING: '',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: '',
        // IDCS_LOGIN_FAIL_USER_LOCKED: '',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: '',
        // IDCS_UNKNOWN_ERROR_CODE: '',
    },
    //Norwegian (Bokmal, Norway)
    '0x0414': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: '',
        // IDCS_NO_PLUGIN_FOR_MAC: '',
        // IDCS_NPAPI_NOT_SUPPORT: '',
        IDCS_PLUGIN_VERSION_UPDATE: "Pluginen er ikke oppdatert, vennligst trykk <en href='%1'>Her</a> for å laste ned og installere.",
        // IDCS_IE_VERSION_WARNING: 'IE-browser-versjonen din er ikke støttet. Bruk IE10 eller senere versjon av det.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Firefox-browser-versjonen din er ikke støttet. Bruk Firefox53 eller senere versjon av det.',
        // IDCS_OPERA_VERSION_WARNING: 'Your Opera browser version not supported.  Bruk Opera44 eller senere versjon av det.',
        // IDCS_OTHER_VERSION_WARNING: 'Bruk følgende browser: ie10-11, Firefox 53 eller senere, krom 57 eller senere, Safari 11 eller senere, opera 44 eller senere, edge16 eller senere.',
        // IDCS_CHROME_VERSION_WARNING: 'Chrome Browser-versjonen din er ikke støttet. Bruk Chrome57 eller senere versjon av den.',
        // IDCS_SAFARI_VERSION_WARNING: 'Safari-browser-versjonen din er ikke støttet. Bruk Safari11 eller senere versjon av den.',
        // IDCS_SAFARI_VERSION_FOR_P2P: 'Safari-browser-versjonen din er ikke støttet. Bruk Safari10 eller eldre versjon av den.',
        // IDCS_EDGE_VERSION_WARNING: 'Din versjon av kantbrowser er for lav.',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: '',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: '',
        // IDCS_LOGIN_FAIL_USER_LOCKED: '',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: '',
        // IDCS_UNKNOWN_ERROR_CODE: '',
    },
    // Uzbekistan
    '0x0413': {
        IDCS_NO_PLUGIN_FOR_WINDOWS: "Plagin o‘rnatilmagan. Uni yuklab olish va o‘rnatish uchun quyidagini bosing <a href='%1'>Here</a>. O‘rnatishdan oldin brauzerni yoping.",
        // IDCS_NO_PLUGIN_FOR_MAC: 'Plagin o‘rnatilmagan. Uni yuklab olish va o‘rnatish uchun quyidagini bosing <a href=\'%1\'>here</a>. O‘rnatishdan oldin brauzerni yoping. .<br/> Agar sizda o‘rnatilgan plagin bo‘lsa, uni "Safari->Preferences->Security ("Safari->Sozlamalar->Xavfsizlik") bo‘limiga ulanganligini tekshirib ko‘ring.',
        // IDCS_NPAPI_NOT_SUPPORT: "NPAPIni qo‘llab-quvvatlashi hozirda o‘chirilgan. Uni yoqish uchun quyidagi ko‘rsatmalarga amal qiling:<ul><li>1. Manzil satriga \"chrome://flags/#enable-npapi\"ni kiriting; </li><li> 2.'Enable Npapi' ostidagi “Enable” tugmachasini bosing; </li><li>3. Chrome brauzerini to‘liq yoping; </li><li> 4. Chrome-ni qayta oching va tizimga o‘ting, plagin mavjud. </li></ul>Yoki plagin o‘rnatilmagan bo‘lsa, uni yuklab olish va o‘rnatish uchun <a href='%1'>Here</a>ni bosing. O‘rnatishdan oldin brauzerni yoping",
        IDCS_PLUGIN_VERSION_UPDATE: "Plugin yangilanadi, iltimos, bu erda <a href='%1'>bosing</a> plug-ni yuklab olish va yangilash uchun.",
        // IDCS_IE_VERSION_WARNING: 'Sizning ie brauzeringiz versiyasi juda past, iltimos, IE10 yoki brauzer versiyalaridan foydalaning.',
        // IDCS_FIREFOX_VERSION_WARNING: 'Firefox brauzeringiz versiyasi juda past, iltimos Firefox53 yoki brauzerning yuqoridagi versiyasidan foydalaning.',
        // IDCS_OPERA_VERSION_WARNING: 'Sizning opera brauzeringiz versiyasi juda past, iltimos, badarachi-larni yoki brauzerlarning yuqori versiyalaridan foydalaning.',
        // IDCS_OTHER_VERSION_WARNING: "Sizning brauzeringiz ushbu plaginni qo'llab-quvvatlamaydi, quyidagi brauzerlardan foydalaning: IE10-11, Firefox53 yoki undan yuqori versiyalardan foydalaning, Safari57 yoki undan yuqori versiyalar, Opera44 yoki undan yuqori versiyalar, EFS44 yoki undan yuqori versiyalar.",
        // IDCS_CHROME_VERSION_WARNING: 'Chrome brauzeringiz versiyasi juda past, Chrome 57 yoki undan yuqori versiyasidan foydalaning',
        // IDCS_SAFARI_VERSION_WARNING: "Safari brauzeringiz versiyasi qo'llab-quvvatlanmaydi, iltimos, Safari11 yoki undan yuqori versiyasidan foydalaning.",
        // IDCS_SAFARI_VERSION_FOR_P2P: "Sizning Safari brauzeringiz versiyasi qo'llab-quvvatlanmaydi, iltimos, Safari10 yoki ilgari versiyalardan foydalaning.",
        // IDCS_EDGE_VERSION_WARNING: 'Sizning chekka brauzeringiz versiyasi juda past. Iltimos, chekka yoki undan yuqori versiyalardan foydalaning',
        // IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE: 'Tizimga kirishda xatolik yuz berdi. Qurilmaga ulanish muvaffaqiyatsiz tugadi',
        // IDCS_LOGIN_FAIL_REASON_U_P_ERROR: "Kirish muvaffaqiyatsiz tugadi. Sababi: foydalanuvchi nomi yoki parol noto'g'ri.",
        // IDCS_LOGIN_FAIL_USER_LOCKED: 'Kirish muvaffaqiyatsiz tugadi. Sababi: foydalanuvchi qulflangan.',
        // IDCS_LOGIN_FAIL_USER_LIMITED_TELNET: "Kirish muvaffaqiyatsiz tugadi. Sababi: Foydalanuvchiga ruxsat yo'q.",
        // IDCS_UNKNOWN_ERROR_CODE: "Noma'lum xato! Xato kodi:",
    },
}

// AI事件类型映射（AI事件中插件绘制需要使用此类型）
export const OCX_AI_EVENT_TYPE_NULL = 0
export const OCX_AI_EVENT_TYPE_MOTION = 1 // 移动侦测区域
export const OCX_AI_EVENT_TYPE_OSD_TIME = 2 // 画osd位置
export const OCX_AI_EVENT_TYPE_VIDEO_BLOCK = 3 // 画视频遮挡区域
export const OCX_AI_EVENT_TYPE_WATCH_DETECTION = 4 // 画物品看护
export const OCX_AI_EVENT_TYPE_PEA_DETECTION = 5 // 画区域入侵
export const OCX_AI_EVENT_TYPE_TRIPWIRE_LINE = 6 // 越界侦测
export const OCX_AI_EVENT_TYPE_LOGO = 7 // 画Logo位置
export const OCX_AI_EVENT_TYPE_WATER_MASK = 8 // 画水印
export const OCX_AI_EVENT_TYPE_VFD_BLOCK = 9 // 画人脸识别区域
export const OCX_AI_EVENT_TYPE_CDD_BLOCK = 10 // 画人群密度区域
export const OCX_AI_EVENT_TYPE_CPC_BLOCK = 11 // 画人数统计区域
export const OCX_AI_EVENT_TYPE_POSRGB_SET = 12 //pos颜色配置界面
export const OCX_AI_EVENT_TYPE_VSD = 13 //视频结构化
export const OCX_AI_EVENT_TYPE_PLATE_DETECTION = 14 // 车牌侦测

// export const TIMESLIDER_PLUGIN = 'TimeSlider'
// export const VIDEO_PLUGIN = 'VideoPlugin'

// 设备P2P访问方式
export const P2P_ACCESS_TYPE_SMALL_PLUGIN = 'p2pSmallPlugin' // 区分由P2P登录页跳转小插件查询版本号后再进行跳转登录
export const P2P_ACCESS_TYPE_LARGE_PLUGIN = 'p2pLargePlugin' // 区分由P2P登录页直接进行跳转大插件登录
export const P2P_ACCESS_TYPE_USERNAME_LOGIN = 'UserName' // 设备P2P访问方式为：用户名+密码+SN
export const P2P_ACCESS_TYPE_AUTHCODE_LOGIN = 'AuthCode' // 设备P2P访问方式为：授权码+SN

export const OCX_Plugin_Notice_Map = {
    IDCS_PLUGIN_VERSION_UPDATE: {
        warning: false,
        downloadUrl: true,
    },
    IDCS_NO_PLUGIN_FOR_WINDOWS: {
        warning: false,
        downloadUrl: true,
    },
    // IDCS_NO_PLUGIN_FOR_MAC: {
    //     warning: false,
    //     downloadUrl: true,
    // },
    // IDCS_NPAPI_NOT_SUPPORT: {
    //     warning: true,
    //     downloadUrl: false,
    // },
    // IDCS_IE_VERSION_WARNING: {
    //     warning: true,
    //     downloadUrl: true,
    // },
    // IDCS_CHROME_VERSION_WARNING: {
    //     warning: true,
    //     downloadUrl: false,
    // },
    // IDCS_FIREFOX_VERSION_WARNING: {
    //     warning: true,
    //     downloadUrl: false,
    // },
    // IDCS_OPERA_VERSION_WARNING: {
    //     warning: true,
    //     downloadUrl: false,
    // },
    // IDCS_SAFARI_VERSION_WARNING: {
    //     warning: true,
    //     downloadUrl: false,
    // },
    // IDCS_EDGE_VERSION_WARNING: {
    //     warning: true,
    //     downloadUrl: false,
    // },
    // IDCS_OTHER_VERSION_WARNING: {
    //     warning: true,
    //     downloadUrl: false,
    // },
    // IDCS_SAFARI_VERSION_FOR_P2P: {
    //     warning: true,
    //     downloadUrl: false,
    // },
}

export const getPluginPath = () => {
    let _ClientPluDownLoadPath = ClientPluDownLoadPath
    let _P2PClientPluDownLoadPath = P2PClientPluDownLoadPath
    // let _ClientPluDownLoadPath_MAC = ClientPluDownLoadPath_MAC
    // let _P2PClientPluDownLoadPath_MAC = P2PClientPluDownLoadPath_MAC
    let _P2PClientPluVer = P2PClientPluVer
    let _ClientPluVer = ClientPluVer

    if (import.meta.env.DEV) {
        _P2PClientPluVer = P2PClientPluVerDebug
        _ClientPluVer = ClientPluVerDebug
    }

    if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
        _ClientPluDownLoadPath = '/OCX/Speco_Technologies_v5.exe'
        _P2PClientPluDownLoadPath = 'OCX/Speco_Technologies_v5_p2p.exe'
        // _ClientPluDownLoadPath_MAC = 'OCX/Speco_Technologies_v4.pkg'
        // _P2PClientPluDownLoadPath_MAC = 'OCX/Speco_Technologies_v4_p2p.pkg'
    }

    return {
        ClientPluDownLoadPath: _ClientPluDownLoadPath,
        P2PClientPluDownLoadPath: _P2PClientPluDownLoadPath,
        // ClientPluDownLoadPath_MAC: _ClientPluDownLoadPath_MAC,
        // P2PClientPluDownLoadPath_MAC: _P2PClientPluDownLoadPath_MAC,
        // P2PClientPluMimeType_MAC,
        // P2PClientPluVer_MAC,
        P2PClientPluVer: _P2PClientPluVer,
        ClientPluVer: _ClientPluVer,
    }
}
