# NixOS探索（一）：前置知识

NixOS这个神奇的Linux发行版，我虽早有耳闻，却直到最近才成功完成了“能够正常使用”这一阶段，属实是被它折磨得死去活来。

## 关于NixOS安装镜像的选择

NixOS的stable版本*并不是*滚动发行的，但你可以通过修改channel快速滚动更新，而unstable则默认为滚动发行。

*然而*，NixOS下载页面并没有unstable的下载！因此你只能通过更换channel用stable安装镜像安装unstable.

NixOS*并不只能*t通过安装镜像安装。社区提供了一个程序[nix-infect](https://github.com/elitak/nixos-infect)，可以直接将绝大多数的云服务器平台直接替换成NixOS。官方的Nix程序也可以在另一块分区上安装NixOS（不过我没测试过）。对于可以使用网络引导的用户，[netboot.xyz](https://netboot.xyz)也提供了从网络启动的选项。

> 注意：根据sci提供的信息，nix-infect在openvz平台上并不可用，请使用[nixos-openvz](https://github.com/zhaofengli/nixos-openvz)。

如果选择使用安装镜像安装且从中国大陆地区安装，*强烈推荐*使用桌面镜像（可选Gnome与KDE），这样能用图形化界面，firefox和pxy（真实目的（x）），且后续安装会从安装镜像的cache里面直接取文件（当然您如果是pxy大佬可以忽略）。

## 需要掌握的nix语法

其实也不多，能读懂英文就行。官方的配置中有大量的英文注释，不怕你看不懂（x）。

> 提前说一句，这个语言入门很简单，想进阶是真的难

nix的赋值与es6差不多，都是`let xxx = "xxx";`。

对象比较奇怪，不是`{ xxx: "xxx" }`，而是`{ xxx = "xxx"; };`j例如：

```nix
let a.b.c = 1;
# output: 
a = { b = { c = 1; }; };
```

