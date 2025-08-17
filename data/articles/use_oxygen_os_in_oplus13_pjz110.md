# 碎记·让你的国行OnePlus 13用上OxygenOS吧！

## 前言

mzw最近换了船新设备：OnePlus 13国行版，抛弃了此前那台已经服役好久的iPhone 8（

既然到手安卓（而且还是一加！），那当然不创是不可能的！到手前就已经抱着XDAForums一通乱查了（（

更换Oxygen OS的原因是mzw打死不会用Color OS那个丑得逆天的设计的！！！Oxygen OS倒还合我心意（虽然被db说是Color OS换皮但是我不在乎（x），反正没广告&设计比Color OS好）

当然也是喜闻乐见地被创似了好多回（倒地

被创似的情况会在 <##后记> 中记载

本文部分地方略有离题，主要目的还是记录一下自己的折腾经历

## 准备工作

1. 一台正常的OnePlus 13国行版
2. 电脑（当然我估计安卓配termux也能用，别自己调试自己就行）（由于mzw的系统是Arch Linux，因此只会描述Arch下的方案（））
3. 能正常使用的`adb`, `fastboot`
4. 会一点计算机知识（比如会用终端，知道绝对路径是什么，文件扩展名在哪里，知道在哪里找可执行文件，知道怎么找GitHub资源等等）
5. 访问某些神奇网络资源的条件（比如Telegram，GitHub，XDAForums，SourceForge等）
6. 阅读英语的能力
7. 功能健全的脑子
8. 不会乱抖的一双手.bb

## 警告

本文仅表述一种可能的方案，并且不对可能对手机造成的任何损害（包括但不限于变砖等）负责。使用者风险自负

刷机有风险，请备份好所有的重要数据，并做好要去官方售后救手机的心理准备

本文所述从Color OS 15转到Oxygen OS 15的方法必须root且需要支持magisk模块的root方案，否则你将会面临包括但不限于以下的问题：

1. 使用中国大陆电话卡完全无信号
2. OTA之后Bootloop

## 下载并准备所需资源

下载以下所指向的国行版专用的Oxygen OS 831/832（本文只记载831版本，更高/其他地区的版本（840以上）请自行查看参考链接）这些线刷包：

* 全球版（GLO）: <https://sourceforge.net/projects/oneplus13flashers/files/Oneplus%2013/Super%20Flashers/Global/Super%20Flasher%20Global%20831.zip/download>
* 欧洲版（EU）: <https://sourceforge.net/projects/oneplus13flashers/files/Oneplus%2013/Super%20Flashers/EU/Super%20Flasher%20EU%20831.zip/download>
* 印度版（IN）: <https://roms.danielspringer.at/download.php?file=Files%2FOneplus+13%2FSuper+Flashers%2FIN%2FSuperHybrid+Flasher+IN+840.zip&download=true>

然后需要下载修补过的dtbo（通用）：<https://xdaforums.com/attachments/patched_oos_831_dtbo-img.6235925/?hash=216b8c4abc1b4c43aec310af5b3c6651>

> 警告：不下载并刷入修补过的dtbo将导致bootloop
>
> 刷入参考链接中的840及以上版本可以无视本警告，因为修补过的dtbo已经包含在那里面了

> 警告：禁止回锁BL，即使你宁可不OTA也不怕中国大陆电话卡没有信号，因为修补过的dtbo是未签名的，系统将会拒绝启动并bootloop（惨痛的教训）

> 实测通过本方法是可以实现降级的，所以不必担心自己原系统比831高的情况下不能用这个方法

由于我只刷了GLO版，因此本文所述方案只记录GLO版的折腾过程，其他版本请自行参照解决

下载完毕后解压zip，然后把下载的dtbo文件重命名为`dtbo.img`，并放入zip解压出来的`OOS_FILES_HERE`文件夹中（会弹出替换，你可以选择直接替换，也可以选择备份文件夹里面的dtbo之后再替换）

## 开始刷机

> 警告：这些步骤会清除你的所有数据，请提前做好重要数据的备份，并做好可能变砖要润去售后的准备

打开OnePlus的系统设置 -> 关于本机 -> 版本信息，一直点击版本号直到提示“处于开发者模式”

然后回到设置的首页，进入 系统与功能 -> 开发者选项，打开`OEM解锁`和`USB调试`（如果OEM解锁那个选项是灰色的，重启再看应该就能选择了）

然后使用USB线（建议原厂线）连接电脑，打开终端看看`adb devices`有没有对应手机的输出（手机弹出授权窗口就点允许）

Windows下上面这一步有问题的话估计是没有安装一加手机的adb驱动，请自行寻找官网安装

接下来，在终端输入命令`adb reboot bootloader`并回车，手机应重启到Bootloader

然后在终端输入`fastboot devices`看看有没有对应手机的输出，有的话下一步

然后解锁BL！终端输入`fastboot flashing unlock`，手机应自动重启并清除一切数据，接着重复开发者模式那步一直到`fastboot devices`那一步即可

再接下来，就正式进入刷机环节了！

Windows用户请使用刷机包内自带的`Regional_Flasher.bat`进行刷机

Linux用户（我仅测试了Arch Linux）请使用下面的脚本（记得保存为文件并放置在和`Regional_Flasher.bat`同一目录并`chmod +x`哦）

```Shell
# Regional_Flasher.sh
#!/bin/env bash

fastboot --set-active=a
fastboot flash boot OOS_FILES_HERE/boot.img
fastboot flash dtbo OOS_FILES_HERE/dtbo.img
fastboot flash init_boot OOS_FILES_HERE/init_boot.img
fastboot flash modem OOS_FILES_HERE/modem.img
fastboot flash recovery OOS_FILES_HERE/recovery.img
fastboot flash vbmeta OOS_FILES_HERE/vbmeta.img
fastboot flash vbmeta_system OOS_FILES_HERE/vbmeta_system.img
fastboot flash vbmeta_vendor OOS_FILES_HERE/vbmeta_vendor.img
fastboot flash vendor_boot OOS_FILES_HERE/vendor_boot.img
fastboot reboot fastboot

# 定义分区列表
partitions="my_bigball my_carrier my_engineering my_heytap my_manifest my_product my_region my_stock odm product system system_dlkm system_ext vendor vendor_dlkm my_company my_preload"

# 检查 super.img 是否存在，若不存在则删除、创建并刷入逻辑分区
if [ ! -f "super.img" ]; then
    for partition in $partitions; do
        fastboot delete-logical-partition "${partition}_a"
        fastboot delete-logical-partition "${partition}_b"
        fastboot delete-logical-partition "${partition}_a-cow"
        fastboot delete-logical-partition "${partition}_b-cow"
        fastboot create-logical-partition "${partition}_a" 1
        fastboot create-logical-partition "${partition}_b" 1
        fastboot flash "$partition" "OOS_FILES_HERE/${partition}.img"
    done
else
    echo "super.img found. Logical partition flashes skipped..."
fi

# 如果 super.img 没有被刷入，在这里退出但保持窗口打开
if [ ! -f "super.img" ]; then
    read -p "Do you want to wipe data? (y/n): " wipe_choice

    if [ "$wipe_choice" = "n" ] || [ "$wipe_choice" = "N" ]; then
        echo "*********************** NO NEED TO WIPE DATA ****************************"
        echo "***** Flashing complete. Hit any key to reboot the phone to Android *****"
        read -n 1 -s -r -p "Press any key to continue..."
        fastboot reboot
        exit 0
    elif [ "$wipe_choice" = "y" ] || [ "$wipe_choice" = "Y" ]; then
        echo "****************** FLASHING COMPLETE *****************"
        echo "Wipe data by tapping Format Data on the screen, enter the code, and press format data."
        echo "Phone will automatically reboot into Android after wipe is done."
        read -n 1 -s -r -p "Press any key to continue..."
        exit 0
    fi
fi

# 询问用户是否准备 root
echo "Are you going to root your OP13?"
read -p "Press Y to prepare for root or N to not prepare: " root_choice

if [ "$root_choice" = "n" ] || [ "$root_choice" = "N" ]; then
    echo "***** Flashing COS oplusstanvbk and GLO COS my_region *****"
    fastboot flash oplusstanvbk "COS_FILES_HERE/oplusstanvbk.img"
    fastboot flash my_region "COS_FILES_HERE/my_region.img"
else
    echo "***** No signal files flashed *****"
    echo "***** After rooting, you must flash @greg44f's module to get signal back *****"
fi

# 询问是否从 ColorOS 刷机或想要擦除数据
echo "Are you flashing from ColorOS or Want to WIPE DATA?? (y/n)"
read -n 1 -s -r wipe_data_choice

# 检查用户输入
if [ "$wipe_data_choice" = "n" ] || [ "$wipe_data_choice" = "N" ]; then
    echo ""
    echo "*********************** NO NEED TO WIPE DATA ****************************"
    echo "***** Flashing complete. Hit any key to reboot the phone to Android *****"
    read -n 1 -s -r -p "Press any key to continue..."
    fastboot reboot
elif [ "$wipe_data_choice" = "y" ] || [ "$wipe_data_choice" = "Y" ]; then
    echo ""
    echo "****************** FLASHING COMPLETE *****************"
    echo "Wipe data by tapping Format Data on the screen, enter the code, and press format data."
    echo "Phone will automatically reboot into Android after wipe is done."
fi

```

脚本通过Kimi-K2 + Roo Code从bat转换而来，有部分代码可能有漏洞/执行逻辑错误，欢迎指出（

当某个瞬间（对应`fastboot reboot fastboot`）的时候，你会看到手机重启并进入了fastbootd模式，只需要用音量键选中简体中文（或者你喜欢的语言）并按开关机键进行确认，然后等待直到脚本运行完毕，选中手机上的清除数据，输入安全码（照着手机的提示做就是），等数据清除完毕后手机就会自动重启到我们刷入的Oxygen OS啦！

是否准备root那里应该只能写`y`（问就是那个zip包压根没有`COS_FILES_HERE`这个文件夹）

脚本执行需要一点时间，保持耐心等待完成即可

刷完开机之后手机里的中国大陆电话卡没有信号（但是能识别出来）是正常现象，在下面的步骤中我们会进行修复（所以下面的步骤应该在有wifi网络/手机能通过某种方式获得网络连接的情况下进行）

另外记得关闭系统的自动更新功能，下面的步骤中我们会处理OTA更新

## Root

### Magisk

安装magisk应用（建议在F-Droid或者GitHub Release进行安装）

从电脑上的zip解压出来的`OOS_FILES_HERE`文件夹中找到`init_boot.img`并传输到手机

选择安装 -> 修补文件 -> 传入`init_boot.img` -> 把得到的文件传回电脑 -> 按照上面打开开发者设置和USB调试的步骤来一次 -> `adb reboot bootloader` -> `fastboot flash init_boot ${刚刚你传回电脑的img文件的绝对路径}` -> `fastboot reboot`

然后手机会重启，打开magisk，你的root应该就好了

### KernelSU（及其变体）

有两个版本可选，请自行选择：

* XDA上的大佬[epicmann24](https://xdaforums.com/m/epicmann24.12171003/)编译的内核：<https://xdaforums.com/t/kernel-open-beta-epicmann24s-sm8750-kernel-sukisu-ksun-susfs.4719831/> （开源地址：<https://github.com/epicmann24/android_kernel_common_oneplus_sm8750>）
* 酷安上的大佬BrokeStar编译的内核：<https://www.brokestar.top:5244/%E6%9C%AC%E5%9C%B0/%E6%90%9E%E6%9C%BA/%E5%86%85%E6%A0%B8/%E4%B8%80%E5%8A%A0/13> （开源地址：<https://github.com/brokestar233/android_kernel_common_oneplus_sm8750/tree/v7>）

请自行选择，由于我不使用KSU及其变体，因此我不能给出任何意见（

### APatch

我目前在使用这个root方案

在手机上安装APatch应用

> 警告：目前APatch的GitHub Release最新stable版疑似存在丢失超级用户权限应用列表与排除应用列表的问题，建议使用<https://t.me/APatch_CI/231>的版本（也即版本>=11115），或是直接使用官方仓库中GitHub Actions构建出的最新版本

然后，为了更好地隐藏Root，我们需要下载两个kpm（内核模块）并传输到手机：

* NoHello: <https://t.me/apatch_discuss/298387>
* CherishPeekaboo: <https://t.me/apatch_discuss/286194>

接下来就开始愉快地安装APatch吧！

首先，在电脑上那个zip解压出来的`OOS_FILES_HERE`这个文件夹里面找到`boot.img`并传输到手机

选择安装（右上角最靠左边那个图案） -> 选择要修补的启动映像文件 -> 选择刚刚传输到手机的`boot.img` -> 选择那两个kpm -> 输入你喜欢的超级密钥（其实就是密码） -> 安装 -> 然后你会得到一个img文件，传回电脑 -> 按照上面打开开发者设置和USB调试的步骤来一次 -> `adb reboot bootloader` -> `fastboot flash boot ${刚刚你传回电脑的img文件的绝对路径}` -> `fastboot reboot`

然后手机会重启，打开手机上的APatch，输入刚刚你写的超级密钥，再点击安装系统补丁，你的root应该就好了！

### 需要/建议/按需刷入的模块（APatch叫系统模块）

~~仙 之 人 兮 列 如 麻~~（雾

里面的很多模块都需要Zygisk功能，请注意

* 修复信号模块：<https://github.com/K58/fix-signal-oneplus13/releases>，这个模块对于防止OTA Bootloop和修复中国大陆电话卡的信号很关键
* 启用OnePlus 13外版专属的Wi-Fi 7 (6GHz)功能：<https://github.com/AndroPlus-org/magisk-module-wifi7/releases>
* 关闭Widevine的OEMCrypto：<https://github.com/hzy132/liboemcryptodisabler/releases>，这个模块可以帮助你在OnePlus 13上面看Netflix, Disney+, Amazon Prime Video等等国外的流媒体软件 (Only SD Res)
* Tricky Store：<https://github.com/5ec1cff/TrickyStore/releases>，过Google Play Integrity Check用
* Tricky Store Addon：<https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases>，用于通过WebUI配置TrickyStore，依赖TrickyStore
* PIF-NEXT：<https://github.com/EricInacio01/PlayIntegrityFix-NEXT/releases>，过Google Play Integrity Check用，依赖TrickyStore（不先安装TrickyStore就装不了，安装前请确保你的手机打开了代理并且能正常访问Android Developer Site）
* Fingerprint Pay（按需）（安装QQ和微信的版本即可）：<https://github.com/eritpchy/FingerprintPay/releases>，用于强行启用微信和QQ的指纹支付功能（请详细查阅该项目的README以获取更多说明）（其他的所有支付软件实测均支持Oxygen OS的指纹，因此不必安装，减少风险）
* Zygisk Next（建议在Magisk上使用）：<https://github.com/Dr-TSNG/ZygiskNext/releases>，提供Zygisk功能（使用后请不要打开Magisk自带的Zygisk功能）
* Shamiko（建议在Magisk上使用）：<https://github.com/LSPosed/LSPosed.github.io/releases>，隐藏Root
* ReZygisk（建议在APatch上使用）：<https://github.com/PerformanC/ReZygisk/releases>，提供Zygisk功能
* Treat Wheel（建议在APatch上使用）：<https://t.me/ThePedr002/4>，隐藏Root
* Nohello\_compat（建议在APatch上使用）：<https://t.me/BlankAssistance/142/62675>，隐藏Root

我是Android新手，如有不对/欠缺考虑的地方希望大佬指出QwQ

（按需）安装完这些模块之后，重启手机，你应该就能看到自己的中国大陆电话卡信号回来了！

### 隐藏Root&一些坑点

#### Magisk

在Magisk的排除列表手动选择所有国内软件&会检测Root的软件（比如支付软件等），然后在Zygisk Next的页面中（如果你安装了TrickyStoreAddon模块，应该能在Launcher上看见一个KSUWebUI的软件，打开就能看见Zygisk Next的页面了），选择遵守排除列表，这样应该就能实现较为不错的Root隐藏了

唯一的例外是数字人民币，那么怎么pass数字人民币的Root检测呢？

先杀掉数字人民币的后台进程

Termux用户请`sudo -i`，adb用户请`su root`，然后：

```Shell
echo "r=0" > /data/user/0/cn.gov.pbc.dcep/envc.push
chattr +i /data/user/0/cn.gov.pbc.dcep/envc.push
```

如果你的数字人民币是安装在炼妖壶的壶中界或是安卓的多用户模式中的其他用户里面，请将`/data/user/0/`中的`0`替换为那个用户的id（壶中界的id是`10`）

重新打开数字人民币，Root检测就能顺利通过了！

#### APatch

APatch在安装了推荐的内核模块和系统模块之后应该不会被检测到（我自己实测是除了`Holmes`和`Memory Detector`这两个Root检测软件），对于绝大多数应用来说够用了

但是，从Magisk转投APatch的需要注意，APatch是不会主动暴露`su`的，所以必须手动在软件中授予超级用户权限！

并且APatch不能像Magisk那样分进程进行授权，只能整个应用整个应用地授权

还有，APatch的排除列表功能藏在了超级用户菜单里面，点击对应的应用（别点开关就行）就可以看见`排除修改`选项啦！（虽然我是压根没用这个功能……因为APatch安装这些隐藏模块之后对于向支付应用等等隐藏Root而言已经完全足够了

## 过Play Integrity Check

确保你的手机能正常访问Android Developer Site

在模块/系统模块界面找到PIF-NEXT，点执行，按照手机上log的提示（纯英文）操作（keybox.xml应该是必须替换的，idk why）

完毕后找到Tricky Store，点打开，右上角可以换语言，下方的菜单中点击`全选`（或者对应的英文，下同） -> `取消选择非必要应用` -> `设置有效密钥` -> `设置安全补丁` -> `获取安全补丁日期` -> 左下角log提示通过就点`保存`，不通过请排查你的网络/代理情况 -> 点击位于屏幕下方的`保存`，然后退出设置页面

重启手机，去Google Play下载Intergrity Checker，确保能正常访问Google的情况下点击CHECK，一段时间后检查完成，应该是三个全部是绿色的✅，这个时候，Play Integrity Check就完成了！

## 刷入OrangeFox

如果想要安装F-Droid的特权扩展，那么它应该是必须的？

> 警告：OnePlus 13目前尚未出现官方版的OrangeFox，此处介绍的是非官方版的OrangeFox Recovery，请自行决定是否使用，风险自负

从<https://github.com/koaaN/android_device_oplus_13-orangefox/releases>下载最新版的OrangeFox Build

### 使用ADB刷入

1. `adb reboot bootloader`
2. `fastboot flash recovery ${你下载的img文件路径}`
3. `fastboot reboot`

### 使用其他软件（如Scene）刷入

自行将下载的img文件刷入到Recovery分区即可

## OTA

不要使用官方的系统升级功能

有两种下载OTA更新的方式：

1. 在Google Play中下载Oxygen Updater（有广告）（似乎需要Root），它会自动识别你的系统并自行寻找可用更新。你可以在设置中切换下载全量包/incremental包/Beta版本（目前为Android 16 Developer通道），下载结果放置在Internal Storage/内部共享存储空间初始目录里面
2. 在<https://xdaforums.com/t/rom-ota-repository-of-oxygenos-coloros-full-otas-oxygenos-15-0-0-850-coloros-15-0-0-850.4718692/>中下载对应的全量包

下载完成后，打开系统的官方更新界面，点击右上角三个点，找到本地安装，选择刚刚下载的安装包（如果选不中Oxygen Updater下载的文件，请将它移动到Download目录再选择），然后开始更新

如果提示“更新失败，请重试”，并且你确认你下载的包是完整的，那么打开飞行模式，在系统设置中找到`软件更新`应用，点击进去清除数据，然后保持飞行模式再次打开系统更新界面，再次选择本地安装，应该就能开始更新了

更新完毕后请不要重启，打开Magisk/APatch（KSU及其变体用户请自行寻找方案……因为我不用），点击安装按钮，选择\`修补另一槽位内核（用于OTA之后），然后一路执行下去，接着**不要**重启

然后打开模块/系统模块界面，找到`Fixes for OnePlus 13`/上面所说的`修复信号模块`，点击`Action`/`执行`，它就会自动修补OTA之后的dtbo

然后回到系统更新界面，点击重启。重启完毕后，OTA应该就顺利完成了！

## 已知问题

### 一加钱包APP无法使用

虽然有<https://github.com/geniucker-dev/WalletFix4OOS>这种解决方案，但是我发现仍然无法使用，相关情况请查阅<https://github.com/geniucker-dev/WalletFix4OOS/issues/6>

db也给了我另一个方案：直接用Magisk模块伪装机型成PJZ110（国行版）（因为按照本教程刷入了Oxygen OS之后的机型会改变成对应的外版），虽然是能正常进入部分WalletFix4OOS模块进不去的地方，但是仍然是什么东西都不能正常使用……并且会导致一打开钱包一加账户就在后台疯狂耗电（似乎是因为不成功的轮询请求？）

### 微信和QQ的指纹支付功能无法使用

原因未知，猜测是因为Oxygen OS没过也不太可能会去做tx家的指纹支付安全性验证

目前用Fingerprint Pay模块可以**近似**解决（建议打开这个模块的Biometrics功能，更接近这两个软件的原生指纹支付体验）

云闪付、支付宝等软件的指纹支付功能实测不需要模块也正常

### 部分AI功能无法正常使用

有部分AI功能在你正确地设置了代理之后是可以使用的

但是，在我升级到840版本之后，我发现840新增的记忆仓AI功能即使在设置了代理之后也是无法使用的（存疑，也有可能是我不停折腾把840配坏了），还有一些侧边栏提供的AI功能也不能使用

现在我重新回到了831版本，开着代理的情况下目前Oxygen OS提供的所有AI功能正常

另外既然用了Oxygen OS就要有不能用国区Color OS那花样繁多的AI功能的觉悟（虽然我也不馋它的AI功能，Gemini的功能不比它们都好用吗）

### 840版本打开部分应用时异常耗电

目前我实测出现此问题的应用有Hiddify（46.47%）和炼妖壶（26.51%）

Ray也和我说了类似的问题，并且同样发现831版本没有这个问题。因此我们认为这是840版本的系统问题，写在这里仅为提醒与警告

### 840版本无法安装SunOS(Nameless)等类原生

根据db提供的信息，840版本的系统分区似乎有一定的变动，导致SunOS无法安装

需要安装类原生/未来有意愿刷类原生的用户请保持831及以下版本

## 后记

通过以上这些步骤，你就拥有了一台能正常使用的运行Oxygen OS的OnePlus 13了！

那么现在来记录一下相对比较完整的mzw的折腾过程吧（x

拿到一加13的时候当天晚上我就开始准备刷Nameless了，结果Root发现没有705版本的包，找不到`init_boot.img`，不备份字库刷实在是危险，然后我发现XDA上面有840版本的全量包，于是下载了下来并开始系统更新到840版本……于是直接掉进了上面所述的坑

之后db查阅资料之后告诉我840刷不了类原生，于是我们开始讨论怎么降级。打算用Color OS官方的系统更新（本地安装功能）降级，结果Color OS告诉我解锁了BL的情况下禁止本地更新？？于是……

**我直接回锁了BL，完全忘记了我Root的`init_boot.img`都没丢……**

好嘛于是砖了。还好过几天我就去肇庆了，在肇庆的官方售后店里工程师帮我救了回来，并且在我的要求下他帮我刷了Color OS 831版本，谢谢这位好心的工程师！

然后我去安装Oxygen OS 831，发现好像还挺好看的（（

接下来安装Magisk并尝试隐藏Root，结果很多都过不了……最后还是感谢猫猫帮我找到了正解！（见上文）

然后我自己继续Nameless的刷入，这次刷入Nameless那堆img镜像一路顺利，直到我开始`adb sideload`……现在我也记不清具体的报错了，总之sideload连1%都没跑完就直接`kDownloadError`了（感觉我怎么老是跟`adb sideload`过不去，之前给Mi Max 2刷Lineage OS的时候也是一到`adb sideload`就失败）

最后烦了不要类原生了，直接刷回了Oxygen OS 831然后OTA成840并且发现相当舒服于是不想动了（x

然而Ray向我推荐了APatch，之后由于卸载了Magisk模块导致信号丢失等等一堆事情（当然刷完APatch并且启用信号修复模块之后又好了），后来不知道怎么PIF-NEXT的过Play Integrity Check又掉了，变成了三个❌

> 此处特别警告一下，部分PIF的教程里面有说过不了的话就先强行停止Play服务，然后系统设置里面清除Play服务的数据。这样做除了让你的Google Play再也登陆不上谷歌账号，时不时就会弹出`Google Play屡次停止运行`和一打开Google Play搜索就会直接闪退之外一点用没有！

最后随着我重刷Oxygen OS 831一切都好了（）

现在也在用Oxygen OS 831！（（

## 特别感谢

dabao1955，db不辞辛劳地帮了我很多很多的忙，指导我刷SunOS、折腾APatch和折腾一加钱包，也告诉了我很多的Android好用的软件！super thx db！

Ray，Ray向我推荐了APatch Root方案！还给了我很多隐藏Root的模块，这下不用为Root检测烦恼啦！

猫猫，猫猫帮我解决了用Magisk的时候shamiko过不了检测的问题！（其实就是打开Enforce强制遵守排除列表（x））

非常感谢香子兰群的朋友们&我的频道订户！愿意看我折腾过程中的疯狂灌氵（x

最后非常感谢愿意看这篇长篇大论的朋友们！

## 参考链接

1. [XDA Forums - OnePlus 13](https://xdaforums.com/f/oneplus-13.12893/)
2. [XDA Forums - \[How To Guide\] \[PJZ110\]\[13 Aug\] ColorOS to OxygenOS \[IN .850\]\[GLO,EU .840\]\[NA .832\]](https://xdaforums.com/t/pjz110-13-aug-coloros-to-oxygenos-in-850-glo-eu-840-na-832.4707431/)
3. [XDA Forums - \[General\] \[ROM\]\[OTA\] Repository of OxygenOS & ColorOS FULL OTA's \[OxygenOS 15.0.0.850\]\[ColorOS 15.0.0.850\]](https://xdaforums.com/t/rom-ota-repository-of-oxygenos-coloros-full-otas-oxygenos-15-0-0-850-coloros-15-0-0-850.4718692/)
4. [GitHub - eritpchy/FingerprintPay](https://github.com/eritpchy/FingerprintPay/)
5. [Jeffreys' Blog - 关于手机root后如何欢快使用数字人民币app](https://blog.s13est.com/2023/09/%E5%85%B3%E4%BA%8E%E6%89%8B%E6%9C%BAroot%E5%90%8E%E5%A6%82%E4%BD%95%E6%AC%A2%E5%BF%AB%E4%BD%BF%E7%94%A8%E6%95%B0%E5%AD%97%E4%BA%BA%E6%B0%91%E5%B8%81app/)
6. [Bilibili - 使用Magisk Delta获取小米(MIUI14)root权限](https://www.bilibili.com/opus/813374125027360848)
7. [GitHub - yashaswee-exe/AndroidGuides - Fix integrity and root detection](https://github.com/yashaswee-exe/AndroidGuides/wiki/Fix-integrity-and-root-detection)
8. [XDA Forums - \[Development\] \[Recovery\]\[Unofficial\]\[1.0.3\] OrangeFox Recovery R11.3](https://xdaforums.com/t/recovery-unofficial-1-0-3-orangefox-recovery-r11-3.4751927/)
9. [GitHub - koaaN/android\_device\_oplus\_13-orangefox](https://github.com/koaaN/android_device_oplus_13-orangefox/)
10. [GitHub - geniucker-dev/WalletFix4OOS](https://github.com/geniucker-dev/WalletFix4OOS)
11. [Nameless CLO - Download - OnePlus 13](https://www.nameless.wiki/getting-started/downloads/oneplus/dodge)
12. [Nameless CLO - Flash Instrutions - OnePlus 13](https://www.nameless.wiki/getting-started/flash-instructions/oneplus/dodge)
