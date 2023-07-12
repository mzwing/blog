# Windows下用v2A+3proxy+CloudflareSpeedTest加速海外cdn

## 前言

[CloudflareSpeedTest](https://github.com/XIU2/cloudflareSpeedTest)是我很早就star了的项目（虽然说我是starbot（x）），但我最近才重新注意到它。

我认为这个项目相当不错，然而我拒绝装插件实现（x）（cfst对分流的建议是用switch-omega插件）于是，经过一番折腾，我用我用惯的RoutingA进行了分流。这样，所有遵循系统代理设置的应用就都能享受加速了。

## 正文

首先当然是……安装cfst了

然后……安装3proxy（[cfst给出来的懒人版](https://pan.lanzouf.com/b074km92f)（密码`xiu2`），[3proxy官方版本](https://github.com/z3APA3A/3proxy/releases/)）（最好用cfst给出来的3proxy包安装，当然你也可以自行对比这两个的不同并使用3proxy官方版本，下文中提到的但是你在官方版本找不到的东西在cfst给出来的懒人版里面都有）

> 提一句，scoop里面有cfst和3proxy官方版本，但是得自己添加社区源

直接抄下面的[参考教程](#参考教程)吧，懒得写了（

那么就装完cfst和3proxy了（

记得运行cfst_3proxy.bat，这会自动进行cloudflare cdn测速并自动替换3proxy.cfg中的IP并重启3proxy服务。

打开v2A面板，创建一个节点。类型http，地址`127.0.0.1`（当然你可以根据你的真实情况更改），端口2088（在3proxy.cfg换了的话自行修改），点击确定。新建分组，名称随意（此处叫`speedcdn`），然后选择刚创好的节点。

进RoutingA，将`default:`后面改成`speedcdn`（你的分组名）。并新起一行加入一句`ip(geoip: private)->direct`。

> 实测在RoutingA中直接改`default`而且不加后面那句会导致v2A面板无法加载，idk why（

完成。

## 进阶玩法

其实cfst还能测cloudfront与gcore（貌似这样jsdelivr就有就了？（）），但我不想玩了，暂时不写。想玩可以参考下面这两份Discusssions：

[Gcore CDN测速](https://github.com/XIU2/CloudflareSpeedTest/discussions/303)

[AWS Cloudfront CDN测速](https://github.com/XIU2/CloudflareSpeedTest/discussions/304)

## 后记

（其实说实话，用Linux iptables多好啊）

（虽然说感觉sing-box比v2更香啊（x），但是Nekoray实在是过于简陋……自己写一个罢！（立flag）

## 参考教程

[cfst官方教程](https://github.com/XIU2/CloudflareSpeedTest/discussions/71)
