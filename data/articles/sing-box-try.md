# sing-box尝鲜

## 前言

按[官方文档](https://sing-box.sagernet.org/zh/)所述，sing-box是一款通用代理平台（说的真的好谦虚（））。这应该是我在这方面的软件中见过最强大的了。

我最早关注它是在3月30日。在翻了一下[@SagerNet](https://github.com/SagerNet)这个组织的项目以后，我发现了官方写的[v2box](https://github.com/SagerNet/v2box)项目。当时我欣喜若狂，以为可以直接与我的v2A兼容了。然而最后我发现它基本上只是实现了转换功能（即将v2/x的配置转换成sing-box的配置，以及将dat格式的规则文件转换为sing-box所用的maxmind db文件），而且居然不支持websocket的节点，遂抛弃之。

接下来我又找到了一个项目：[Nekoray](https://github.com/Matsuridayo/nekoray)（猫猫射线（雾））。打开界面看了一下，Qt写的界面，嘛，说实话，不怎么样（前端人特有的对UI的极度挑剔（x））。然而，当我用了一下以后，我发现……

我！不！会！用！（全恼

大抵是在v2A待久了罢，已经变成v2A的形状力（悲）。以及，我发现它的分组功能也明显没有v2A好用，urltest功能是废的（更新：原因找到了，是Windows 7的加密DNS支持不行），启动后网络也是直接爆炸（恼）（更新：sing-box系列在Windows 7上接近于无法使用，建议转向[clash meta](https://docs.metacubex.one)）

于是，只有一条路可以走了！那就是——手写配置！

第一次自己写配置，参考了很多人的文章，也踩了很多很多雷。在此对[官方文档](https://sing-box.sagernet.org/zh/)表示衷心感谢，也感谢[荒岛博客](https://lala.im)给出了很多sing-box的示例配置文件让我得以学习。

> 若无特别说明，所示配置文件均只在Windows 11下测试通过

## 小坑点

想用cf家DNS的请先看看自己能否访问<https://1.1.1.1>，看看是不是cf家的网站，不是就别傻乎乎的往那儿撞了，改用`https://1.0.0.1/dns-query`或者`h3://1.0.0.1/dns-query`罢。

以及，Windows 7上基本就不要想着用sing-box了，wireguard、socks入站（包括mixed）、tun system模式、DoH实测无法在Windows 7上使用，tun gvisor模式倒是可以，不知为何。

sing-box的DNS请求连接似乎可以很长，导致在大量DNS请求出错时会吃光所有CPU资源，因此**请确保您的DNS配置可用**！

sing-box在网络连接不稳定的情况下tun模块似乎会大量拒绝直连请求，解决办法为设置一个系统代理，不知为何。

sing-box 1.3版本以后DoQ疑似存在问题，会导致所有DoQ请求失败，请使用DoH3代替DoQ。

## 配置

这里只展示我的配置，应该可以覆盖绝大多数的应用场景了，至于更多配置，请自行查阅[官方文档](https://sing-box.sagernet.org/zh/)，里面说的很明白了。

如果你有过书写clash meta配置文件的经历，那么应该可以很快上手sing-box配置文件（题外话：貌似clash meta很多配置写法都是抄的sing-box哎（x））

### 日志

```json
"log": {
  "level": "info",
  "timestamp": true
}
```

### DNS

```json
"dns": {
  "servers": [
    {
      "tag": "cloudflare",
      "address": "h3://1.0.0.1/dns-query",
      "detour": "direct"
    },
    {
      "tag": "dnspod",
      "address": "https://1.12.12.12/dns-query",
      "detour": "direct"
    },
    {
      "tag": "block",
      "address": "rcode://success"
    }
  ],
  "rules": [
    {
      "geosite": [
        "category-ads-all"
      ],
      "server": "block",
      "disable_cache": true
    },
    {
      "geosite": [
        "cn"
      ],
      "server": "dnspod"
    }
  ],
  "strategy": "prefer_ipv4"
}
```

这里要注意的是sing-box默认第一个DNS服务器为默认服务器，若没有命中规则则会走默认服务器，若默认服务器请求某域名失败则会取第二个DNS服务器继续请求，依此类推。

如果要使用系统服务器，address为`local`。

若要从路由器自动获得DNS服务器，使用`dhcp://auto`或`dhcp://${网卡名称}`。

> 注意：从release下载的程序中不包含dhcp模块，无法使用`dhcp://`。如需使用，请自行参考[官方教程](https://sing-box.sagernet.org/zh/installation/from-source/)进行构建。

### 入站

我推荐客户端入站用`mixed`+`tun`。

```json
"inbounds": [
  {
    "type": "mixed",
    "tag": "mixed-in",
    "listen": "127.0.0.1",
    "listen_port": 5353,
    "udp_fragment": true,
    "sniff": true,
    "set_system_proxy": true
  },
  {
    "type": "tun",
    "tag": "tun-in",
    "interface_name": "sing-box-tun",
    "inet4_address": "172.18.0.1/28",
    "inet6_address": "fdfe:dcbc:1515::1/126",
    "auto_route": true,
    "stack": "system",
    "sniff": true
  }
]
```

根据我的理解，tun的IPv4网卡IP可以随便写，保证开头为`172..`和第三位`0`就可以。`/`后不要随便动（因为我也不知道动了的后果，没学到家，会的大佬给我普及一下罢（）先谢谢了（））。

IPv6网卡则建议自己随机生成一个（虽然我也不知道在哪能生成（）），保证为私有IP段应该就可以。

（不过整个复制我的应该也没什么问题？（））

sniff是域名嗅探器模块，可以确保路由规则分流正确，建议打开。有关sing-box中sniff的介绍，请看[协议探测 - sing-box](https://sing-box.sagernet.org/zh/configuration/route/sniff/)。（虽然说这个介绍跟没介绍一个样，主要是看参数的）

tun中的`auto_route: true`是必须打开的，防止流量环回。但是必须与`route.auto_detect_interface`或`route.default_interface`或`outbound.bind_interface`一起用才能生效。

### 出站

```json
"outbounds": [
  {
    "type": "direct",
    "tag": "direct"
  },
  {
    "type": "block",
    "tag": "block"
  },
  {
    "type": "dns",
    "tag": "dns-out"
  },
  {
    "tag": "urltest",
    "type": "urltest",
    "outbounds": [
      "server1"
    ]
  },
  {
    "tag": "selector",
    "type": "selector",
    "default": "urltest",
    "outbounds": [
      "urltest",
      "server1"
    ]
  }
]
```

就大致展示一下urltest和selector分组的作用。

有clash订阅？可以使用[clash2singbox](https://github.com/xmdhs/clash2singbox)快速将你的clash订阅转换为sing-box格式（请注意：这个软件除了-url参数（-和--都可以）和-o参数外，其他所有功能都是废掉的。这个软件的模板功能指的是在编译时指定模板，而非编译后……这个软件基于官方的[@SagerNet/serenity](https://github.com/SagerNet/serenity)，但是官方的配置和i18n一言难尽……）

以及社区的fork[@qjebbs/sing-box](https://github.com/qjebbs/sing-box)有provider功能，但是我不推荐使用，看起来维护得不是特别即时，而且sing-box经常修复大量bug，所以建议还是用官方版。（看官方开发者[@nekohasekai](https://github.com/nekohasekai)的意思，大概是希望sing-box只是一个纯粹的代理平台，至于订阅什么的让其他软件搞去）

更详细的就自己看官方文档罢（）

### 实验性功能（clash api和部分v2ray api）

因为不用v2ray api（那玩意基本也就只有机场才会用到吧），所以就只展示clash api的了。

sing-box的clash api支持是兼容clash meta的，也就是说clash meta的面板（如Yacd）可以直接用于sing-box。

（这也是我在设计singA这个sing-box面板的时候迟迟拿不定设计主意的原因，毕竟sing-box的绝大部分功能都与clash相近，可是我又不喜欢clash面板的低自定义度，但让我彻底抛弃clash api这个这么好用的东西，我又舍不得）

```json
"experimental": {
  "clash_api": {
    "external_controller": "0.0.0.0:9090",
    "secret": "",
    "cache_file": "./resources/cache.db",
    "store_selected": true
  }
}
```

### 路由

```json
"route": {
  "geoip": {
    "download_url": "https://github.com/soffchen/sing-geoip/releases/latest/download/geoip.db",
    "path": "./resources/geoip.db"
  },
  "geosite": {
    "download_url": "https://github.com/soffchen/sing-geosite/releases/latest/download/geosite.db",
    "path": "./resources/geosite.db"
  },
  "rules": [
    {
      "protocol": "dns",
      "outbound": "dns-out"
    },
    {
      "geosite": "category-ads-all",
      "outbound": "block"
    },
    {
      "geosite": [
        "cn",
        "apple",
        "category-games@cn",
        "hoyoverse"
      ],
      "geoip": [
        "private",
        "cn"
      ],
      "domain": [
        "addons.mozilla.org"
      ],
      "domain_suffix": [
        "huggingface.co",
        "graph.microsoft.com"
      ],
      "outbound": "direct"
    },
  ],
  "final": "direct",
  "auto_detect_interface": true
}
```

`dns`那里是为了正常发出DNS请求（不然tun是没法进行正常DNS请求的）。

那个自定义的geosite.db和geoip.db下载链接是有LoyalSoldierSite和LoyalSoldierIP的拓展分类的，如果不需要可以直接删掉，官方的是与v2ray的dat保持一致的。

如果你自己有dat，你可以用[v2box](https://github.com/SagerNet/v2box)转换为db文件（然而sing-box并没有给出如何加载自定义规则文件的选项……目前唯一解法是将geoip.dat或geosite.dat继承下来再转换成db）。

`"auto_detect_interface": true`在用tun的时候建议打开（当然你也可以用[default_interface](https://sing-box.sagernet.org/zh/configuration/route/#default_interface)手动指定网卡，但是Windows的网卡显示和实际调用的名称一般都是对不上的（），而且优先级比`auto_detect_interface`低。但是如果你发现关掉sing-box之后可以正常联网，确定其他配置没有问题，而且Windows的网络和共享中心里面有一堆网卡，那大概率就是你的默认网卡是个虚拟机网卡了……这种时候要么手动指定网卡，要么调成正常优先级，自己搜索，此处不再赘述）

Android还有一个`override_android_vpn`选项，接受`boolean`值，功能为启用`auto_detect_interface`时接受Android VPN作为上游网卡。

## 检查&格式化

> 在这里我把`sing-box`加进了Path，没加进Path的话自己修改

运行`sing-box check -c "path/to/${配置文件名称}"`检查你的配置是否正确，不正确的话根据给出来的报错修改配置。

如果配置文件名称是`config.json`或`config.jsonc`，可以把`-c "path/to/${配置文件名称}"`写成`-C "path/to/"`。如果你的运行目录与配置文件目录一致，可以进一步写成`-D "path/to/"`，如果运行目录与配置文件目录不一致，那么可以写成`-D "path/to/your_directory" -c "path/to/${配置文件名称}"`。以下同理。

运行`sing-box format -c "path/to/${配置文件名称}" > "path/to/${配置文件名称}"`以格式化，指定值与默认值一致的将会被删除，wireguard reserved值也会变成缩写形式。注意后面那个配置文件名称最好不一致，因为如果终端编码不是UTF-8那么中文大概率乱码……

## 启动

以管理员身份运行`sing-box run -c "path/to/${配置文件名称}"`，就可以使用辣！

> tun模式用gvisor的话也许可以不使用管理员身份启动。  
> 可以用`-C`、`-D`这些参数。

Enjoy!

## 结尾flag

写个singA，类似于v2A的面板（看什么时候实现（））
