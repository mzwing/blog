# 安装ArchLinux+DDE

## 安装ArchLinux

### 对于看不懂英文的

那似乎只有按照[官方教程](https://wiki.archlinux.org/title/Installation_guide_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))直接开敲了嘛……

### 能看懂英文的

有一个无脑安装办法：

```bash
arch-install
```

然后直接对着提示输入就行了。

想手敲代码的可以直接参考上面。

### 安装所需软件包

#### 按官方教程来的

建议先参考[此教程](https://opentuna.cn/help/archlinux)去换个源，当然你也可以选择相信arch默认源的速度（反正广东这边不咋地）。

然后为新系统安装nano（vim也可以，但我不会，所以后面都以nano为例）。

```bash
pacstrap -S nano
```

#### 用arch-install的

同样建议换源，但arch-install会提示你要不要换源并且还准备好了中国地区的一整套源（就很贴心）。

arch-install会在安装中有提示，在那里输入nano就行了。

### 几个小坑点：

*   arch-install安装时建议直接选精简版（不安装任何桌面环境，因为我以前就试过plasma将dde整炸的情况）

*   arch-install安装内核时建议直接选默认选项，不然开机时很可能会出现桌面环境炸没+ping出现Tamporery Failure的情况（原因未知，似乎因为DDE直接依赖了最新版本的内核）

*   一定一定一定要新建用户！不然DDE会拒绝登录，同时建议将这个用户添加到wheel组（可以sudo）（同样，arch-install会有提示）

*   按官方教程来的建议查看教程文末链接，不然连不上网（亲身经历）（全程有线网络连接当我没说）

## 安装DDE

此处假定是以非root用户登录的，同时请按顺序执行。

```bash
sudo pacman -Syu # 先同步软件源列表（顺手更了个新）
sudo pacman -S deepin deepin-extra # 安装DDE
sudo systemctl enable lightdm # 开机自启DDE登陆界面
```

## （坑点）修复DDE无限循环登录问题

参考了很多教程，最后发现是因为DDE与lightdm是分离的，DDE主环境并不知道用户已经登录（然而当初在Manjaro上并没有发现这个问题）。

解决办法是用.xinitrc在登陆后自动启动DDE（此处假定使用X11桌面环境，同时在非root用户下执行）。

```bash
nano ~/.xinitrc
```

然后输入以下内容（其实很简单）：

```xinitrc
exec startdde
```

然后Ctrl+X并按提示即可退出并保存。

## Enjoy！

```bash
sudo su # 切换至root用户
reboot # 重启
```

重启就完成安装了！（至少我的是这样）

（记得把安装介质弹掉）
