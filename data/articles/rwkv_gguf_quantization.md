# 碎记·RWKV的邪典量化（llama.cpp only）

## 环境准备喵

我水，就硬水（x

也不想细说了，直接上代码更有效（

```sh
#!/usr/bin/sh

llama_cpp_version="b4519"

user="mzwing"

# Create necessary folders
mkdir -p /home/$user/AI/repo/
mkdir -p /home/$user/AI/runner/
mkdir -p /home/$user/AI/model/

# Install llama.cpp repo
cd /home/$user/AI/repo/
git clone https://github.com/ggerganov/llama.cpp.git --depth 1
rye init llama_cpp
cd ./llama_cpp/
rye add numpy sentencepiece transformers gguf protobuf torch

# Install llama.cpp binary
cd /home/$user/AI/runner/
mkdir -p ./llama.cpp/
cd ./llama.cpp/
aria2c -c -x16 "https://github.com/MZWNET/actions/releases/download/llama_cpp-$llama_cpp_version/llama-$llama_cpp_version-bin-linux-avx2-intel-mkl-x64.zip"
unzip "llama-$llama_cpp_version-bin-linux-avx2-intel-mkl-x64.zip"
rm -rf "llama-$llama_cpp_version-bin-linux-avx2-intel-mkl-x64.zip"
aria2c -c -x16 https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8/raw/b2869d80f5c16fd7082594248e80144677736635/calibration_datav3.txt

# Install Huggingface CLI
cd /home/$user/AI/repo/
rye init huggingface_cli
cd ./huggingface_cli/
rye add huggingface_hub[hf_transfer]

# Install RWKV related environment
cd /home/$user/AI/repo/
rye init rwkv
cd ./rwkv/
rye add torch numpy

# Back to home
cd /home/$user/
```

什么？为什么要用`$user`？下文揭晓（（（

到这里各位应该已经对我的石山代码有了心理预期了，别急，下面更石（x

简单说一下吧，之所以不直接在`llama.cpp`中执行`rye init`是因为`llama.cpp`官方用的是`poetry`，然而创出天际的mzw怎么可能乖乖遵循官方建议呢（x），所以直接新建了一个目录，继续用我的`rye`去！（x

用`venv`安装HF CLI是因为`rye install huggingface_hub[hf_transfer]`是不会出现`huggingface-cli`这个command的（恼，屑`rye`

## 然后……差点就没有然后了

接下来遇到的问题堪称重量级……搜索了很久也找不到怎么把RWKV转换成Huggingface Format或是直接从pth转换为gguf。明明RWKV官方和Transformers一块推出过一个转换脚本，结果这脚本居然运行不了（也是服了，什么草台班子）。这下算是陷入困境了，找了大概两三天，都快放弃了。

甚至一度想过让Deepseek写一个，然而显然Deepseek并不清楚RWKV6的结构，搁那一通乱写，遂作罢。

最后实在忍不住了！跑去btaskel大佬那里发了个[Discussion](https://huggingface.co/btaskel/RWKV6-3B-Chn-UnlimitedRP-mini-chat-GGUF/discussions/1)（用工地英语和人家交流（x）），自己也尝试了一些别的解决方案，最后才终于找到了最优解……Thanks btakel佬 very much!

用到的脚本大概长这样：

```python
# convert_rwkv6_to_hf.py
# Original code from <https://rwkv.cn/llamacpp#appendix-code>
# Edited by mzwing<mzwing@mzwing.eu.org>
# Convert the model for the pytoch_model.bin
import sys
import torch

if len(sys.argv) != 3:
    print(f"Convert RWKV6.0 pth (non-huggingface) checkpoint to Huggingface format")
    print("Usage: python convert_rwkv6_to_hf.py SOURCE_MODEL TARGET_MODEL")
    exit()

SOURCE_MODEL = sys.argv[1]
TARGET_MODEL = sys.argv[2]

# delete target model
import os

if os.path.exists(TARGET_MODEL):
    os.remove(TARGET_MODEL)

model = torch.load(SOURCE_MODEL, mmap=True, map_location="cpu")

# Rename all the keys, to include "rwkv."
new_model = {}
for key in model.keys():

    # If the keys start with "blocks"
    if key.startswith("blocks."):
        new_key = "rwkv." + key
        # Replace .att. with .attention.
        new_key = new_key.replace(".att.", ".attention.")
        # Replace .ffn. with .feed_forward.
        new_key = new_key.replace(".ffn.", ".feed_forward.")
        # Replace `0.ln0.` with `0.pre_ln.`
        new_key = new_key.replace("0.ln0.", "0.pre_ln.")
    else:
        # No rename needed
        new_key = key

        # Rename `emb.weight` to `rwkv.embeddings.weight`
        if key == "emb.weight":
            new_key = "rwkv.embeddings.weight"

        # Rename the `ln_out.x` to `rwkv.ln_out.x
        if key.startswith("ln_out."):
            new_key = "rwkv." + key

    print("Renaming key:", key, "--to-->", new_key)
    new_model[new_key] = model[key]

# Save the new model
print("Saving the new model to:", TARGET_MODEL)
torch.save(new_model, TARGET_MODEL)

```

```sh
#!/usr/bin/sh

author="Seikaijyu"
model="RWKV6-7B-v3-porn-chat"
suffix=""
size="7B"

user="mzwing"

# Create necessary folders
mkdir -p /home/$user/AI/model/$model$suffix-original/
mkdir -p /home/$user/AI/model/$model$suffix/

# Download the original model
aria2c -c -x16 "https://huggingface.co/$author/$model/resolve/main/$model$suffix.pth?download=true" -d /home/$user/AI/model/$model$suffix-original/ -o $model$suffix.pth

# Download RWKV6 config file
GIT_LFS_SKIP_SMUDGE=1 git clone https://huggingface.co/RWKV/v6-Finch-$size-HF /home/$user/AI/model/$model$suffix/
rm -rf /home/$user/AI/model/$model$suffix/*.bin
rm -rf /home/$user/AI/model/$model$suffix/*.safetensors

# Convert the original model to HF format
source /home/$user/AI/repo/rwkv/.venv/bin/activate
python /home/$user/convert_rwkv6_to_hf.py /home/$user/AI/model/$model$suffix-original/$model$suffix.pth /home/$user/AI/model/$model$suffix/pytorch_model.bin

# Clean up
rm -rf /home/$user/AI/model/$model$suffix-original/
```

`author`和`model`是用来控制要量化的模型的，`suffix`则是用来控制像[Seikaijyu/RWKV6-7B-v3-porn-chat](https://huggingface.co/Seikaijyu/RWKV6-7B-v3-porn-chat)下的`RWKV6-7B-v3-porn-chat-pro.pth`那种一个仓库下面放一些变体的情况。

`size`对应的是你要转换的模型的参数量，比如`1B6`之类（确切地说是基底模型的，然而一般而言偏差都不会太大的啦（x

链接那里自己改改罢，我石山不想碰（x

此处邪典可以说是点满了……我真的万万想不到居然这么玩，直接clone原模型的config下来然后替换`pytorch_model.bin`就完成了HF格式化……

另外记得即使是RWKV v6 world系列模型也请使用RWKV普通模型的HF config，否则下面的`llama.cpp`转换会失败！会告诉你缺少`vocab`。（疑似是RWKV v6 llama.cpp PR实现的时候并没有考虑world模型，结果最后一看world也能用，行吧那就这样了，于是就出现了这么个诡异情况……）

## 终于可以`convert_hf_to_gguf.py`启动了……

```sh
# Convert the model into gguf F16 format
mkdir -p /home/$user/AI/model/$model$suffix-GGUF/
source /home/$user/AI/repo/llama_cpp/.venv/bin/activate
cd /home/$user/AI/repo/llama.cpp/
python ./convert_hf_to_gguf.py --outtype f16 --outfile /home/$user/AI/model/$model$suffix-GGUF/$model$suffix.F16.gguf /home/$user/AI/model/$model$suffix/

# Clean up
rm -rf /home/$user/AI/model/$model$suffix/

# Back to home
cd /home/$user/
```

这里不用我多说了罢（x）就标准的`llama.cpp`转换流程（（（

## 量化，启动

做了一个小脚本自动量化（问就是懒）

```sh
#!/usr/bin/sh

model="RWKV6-7B-v3-porn-chat"
suffix=""
HF_TOKEN="xxx"

user="mzwing"

cd /home/$user/AI/runner/llama.cpp/

# Login
source /home/$user/AI/repo/huggingface_cli/.venv/bin/activate
huggingface-cli login --token $HF_TOKEN

# Upload F16 model
HF_HUB_ENABLE_HF_TRANSFER=1 huggingface-cli upload --repo-type model --commit-message "GGUF model commit (made with llama.cpp $llama_cpp_version)" "$model$suffix-GGUF" "/home/$user/AI/model/$model$suffix-GGUF/$model$suffix.F16.gguf"

# generate imatrix
echo -e "Generating imatrix ...\n"
./llama-imatrix -m "/home/$user/AI/model/$model$suffix-GGUF/$model$suffix.F16.gguf" -f ./calibration_datav3.txt -o "/home/$user/AI/model/$model$suffix-GGUF/$model$suffix.imatrix"
HF_HUB_ENABLE_HF_TRANSFER=1 huggingface-cli upload --repo-type model --commit-message "GGUF model commit (made with llama.cpp $llama_cpp_version)" "$model$suffix-GGUF" "/home/$user/AI/model/$model$suffix-GGUF/$model$suffix.imatrix"

# quantize
params=( "Q8_0" "Q6_K" "Q5_K_M" "Q5_K_S" "Q5_1" "Q5_0" "Q4_K_M" "Q4_K_S" "Q4_1" "Q4_0" "Q3_K_L" "Q3_K_M" "Q3_K_S" "Q2_K_S" "Q2_K" "IQ4_XS" "IQ4_NL" "IQ3_XS" "IQ3_M" "IQ3_S" "IQ3_XXS" "IQ2_M" "IQ2_S" "IQ2_XS" "IQ2_XXS" "IQ1_M" "IQ1_S" "TQ2_0" "TQ1_0" )
for param in "${params[@]}"; do
    echo -e "Converting to $param ...\n"
    ./llama-quantize --imatrix "/home/$user/AI/model/$model$suffix-GGUF/$model$suffix.imatrix" "/home/$user/AI/model/$model$suffix-GGUF/$model$suffix.F16.gguf" "/home/$user/AI/model/$model$suffix-GGUF/$model$suffix.$param.gguf" $param $(nproc)
    HF_HUB_ENABLE_HF_TRANSFER=1 huggingface-cli upload --repo-type model --commit-message "GGUF model commit (made with llama.cpp $llama_cpp_version)" "$model$suffix-GGUF" "/home/$user/AI/model/$model$suffix-GGUF/$model$suffix.$param.gguf"
    rm -rf "/home/$user/AI/model/$model$suffix-GGUF/$model$suffix.$param.gguf"
done

# Clean up
rm -rf /home/$user/AI/model/$model$suffix-GGUF/

# Back to home
cd /home/$user/
```

为什么要login呢？下一节谈（x

imatrix那里折腾了我好久（忘记RTFM导致的），我此前就是因为没搞明白imatrix才暂时退坑AI量化的。我此前以为[环境准备](#环境准备喵)那里下载的`calibration_datav3.txt`能直接给`llama-quantize`用，而且我一直以为只有`I-Quants`才会用到`imatrix`（谁让这玩意首字母都是I呢（强行解释（难视）））。这次算是被好好上了一课了：`imatrix`是用来校准量化差的`重要性矩阵`（`Importance Matrix`），除了`F16`/`F32`/`BF16`之外的量化都能从中受益（提高质量）。可以参考：[Qwen Docs中关于llama.cpp量化的描述](https://qwen.readthedocs.io/zh-cn/stable/quantization/llama.cpp.html#quantizing-the-gguf-with-importance-matrix)（然而我在写这篇文章的时候才发现这个好东西，悲）。

此处的代码中我跟随[bartowski](https://huggingface.co/bartowski)（AI量化真佬）的规范，用了他的`calibration_datav3.txt`数据集（真·万金油）进行`imatrix`生成。

另外提一嘴，个人认为只要生成`imatrix`用的数据集涵盖的方面够全、够长，就可以实现重要性矩阵的作用。当然更贴近AI训练数据的校准数据集当然是更好的，但是直接用万金油效果其实也大差不差（因为又不是给人看的，直接保存token，那无论LLM输出了什么逆天回答，最终校准也应该是差不多的。灵感来源：Hackergame 2023小型大语言模型星球的官方题解。当然我的想法没有任何数据支撑，欢迎各位大佬指出我的错误（））

此处我还量化了`T-Quants`，然而根据我搜索`llama.cpp`的GitHub repo得到的资料，`T-Quants`仍然处于早期阶段，暂时对`llama.cpp`的`master`分支而言，`T-Quants`对于带AVX2加速的CPU有很好的加速作用，其他则表现一般；对GPU的支持则仍然处于未合并的PR阶段。

## 白嫖的下场

然而众所周知，mzwing一贯热爱白嫖，所以这次量化是在Huggingface Space上运行的（用的code-server），结果不出意外的出意外了：量化到一半space自动重启了……导致我此前辛辛苦苦完成的量化，咚咚咚

为此我给上面的`llama_cpp_quantize.sh`加上了每完成一步就自动上传结果，并且写出了个`resume_quantization.sh`（靠石山打败石山（乱雾））。

~~（什么？让我放弃白嫖？不可能的.webp）~~

目前的估计是如果在Huggingface Space中自定义Dockerfile且长时间高占用CPU（我量化的时候直接给`llama-quantize`设置`$(nproc)`了（心虚））的话，space就会自动重启，导致保存在非持久性存储的进度丢失。暂时的话配合着`resume_quantization.sh`也能用。由于过于石山且大家都能猜到怎么写的，就不放出来了（（（

实验成果：

- <https://huggingface.co/mzwing/RWKV6-3B-Chn-UnlimitedRP-mini-chat-GGUF>
- <https://huggingface.co/mzwing/RWKV6-7B-v3-porn-chat-GGUF>
- <https://huggingface.co/mzwing/RWKV6-7B-v3-porn-chat-pro-GGUF>

## 惯例的挖坑

总算可以填掉[环境准备](#环境准备喵)那里挖的坑力！（x

目前打算做一个名为`autoggufy`的项目实现自动量化+自动恢复量化进度，然而AI写的`v(-1)`（什么neta v0（x）并不能达到我想要的效果，我又没有那么多时间自己写（悲）

## 你以为这就结束了？（x

没想到吧，我还能水！.jpg（x

在[第二部分](#然后差点就没有然后了)搜索的时候意外发现了[BBuf/RWKV-World-HF-Tokenizer](https://github.com/BBuf/RWKV-World-HF-Tokenizer)，本来是打算搜不到别的办法的话就用这个有点草台班子的py小脚本将rwkv6转换为HF Format算了（详见其`README.md`），还好btaskel大佬给我提供了一个相对完美的方案（

然而，这个仓库里面有一个妙妙脚本！

```python
# convert_rwkv5_to_6.py
# Original code from <https://github.com/BBuf/RWKV-World-HF-Tokenizer/blob/main/scripts/convert5to6.py>
import sys
import math
import torch
from collections import OrderedDict
import re

if len(sys.argv) != 3:
    print(f"Converts RWKV5.2 pth (non-huggingface) checkpoint to RWKV6.0")
    print("Usage: python convert5to6.py in_file out_file")
    exit()

model_path = sys.argv[1]

print("Loading file...")
state_dict = torch.load(model_path, map_location='cpu')

def convert_state_dict(state_dict):
    n_layer = 0
    n_embd = 0
    dim_att = 0

    state_dict_keys = list(state_dict.keys())
    for name in state_dict_keys:
        weight = state_dict.pop(name)

        # convert time_decay from (self.n_head, self.head_size) to (1,1,args.dim_att)
        if '.att.time_decay' in name:
            weight = weight.view(1,1,weight.size(0)*weight.size(1))
            n_embd = dim_att = weight.size(-1) 
        # convert time_mix_k, v, r, g into time_maa for both TimeMix and FFN
        if '.time_mix_' in name:
            name = name[:-5] + 'maa_' + name[-1:]
            weight = 1.0 - weight

        if name.startswith('blocks.'):
            layer_id_match = re.search(r"blocks\.(\d+)\.att", name)
            if layer_id_match is not None:
                n_layer = max(n_layer, int(layer_id_match.group(1)) + 1)

        state_dict[name] = weight

    # add in new params not in 5.2
    for layer_id in range(n_layer):
        layer_name = f'blocks.{layer_id}.att'

        ratio_0_to_1 = layer_id / (n_layer - 1)  # 0 to 1
        ratio_1_to_almost0 = 1.0 - (layer_id / n_layer)  # 1 to ~0
        ddd = torch.ones(1, 1, n_embd)
        for i in range(n_embd):
            ddd[0, 0, i] = i / n_embd

        state_dict[layer_name + '.time_maa_x'] = (1.0 - torch.pow(ddd, ratio_1_to_almost0))
        state_dict[layer_name + '.time_maa_w'] = (1.0 - torch.pow(ddd, ratio_1_to_almost0))

        TIME_MIX_EXTRA_DIM = 32 # generate TIME_MIX for w,k,v,r,g
        state_dict[layer_name + '.time_maa_w1'] = (torch.zeros(n_embd, TIME_MIX_EXTRA_DIM*5).uniform_(-1e-4, 1e-4))
        state_dict[layer_name + '.time_maa_w2'] = (torch.zeros(5, TIME_MIX_EXTRA_DIM, n_embd).uniform_(-1e-4, 1e-4))

        TIME_DECAY_EXTRA_DIM = 64
        state_dict[layer_name + '.time_decay_w1'] = (torch.zeros(n_embd, TIME_DECAY_EXTRA_DIM).uniform_(-1e-4, 1e-4))
        state_dict[layer_name + '.time_decay_w2'] = (torch.zeros(TIME_DECAY_EXTRA_DIM, dim_att).uniform_(-1e-4, 1e-4))

    print(f"n_layer: {n_layer}\nn_embd: {n_embd}")

    return state_dict

state_dict = convert_state_dict(state_dict)

torch.save(state_dict,sys.argv[2])
print("DONE. File written.")
```

```sh
# Download the original model
aria2c -c -x16 "https://huggingface.co/$author/$model/resolve/main/$model$suffix.pth?download=true" -d /home/$user/AI/model/$model$suffix-original/ -o $model$suffix-5.pth

# Convert RWKV5 to RWKV6
source /home/$user/AI/repo/rwkv/.venv/bin/activate
python /home/$user/convert_rwkv5_to_6.py /home/$user/AI/model/$model$suffix-original/$model$suffix-5.pth /home/$user/AI/model/$model$suffix-original/$model$suffix.pth
rm -rf /home/$user/AI/model/$model$suffix-original/$model$suffix-5.pth
```

神奇……居然能将RWKV 5.2转换为RWKV 6.0……

于是果断开始实验，结果还被我干成功了？[实验成果](https://huggingface.co/mzwing/RWKV-5.2-3B-NSFW-Role-16k-GGUF)

## 后记

总之这就是RWKV的诡异量化方式了……也算是做个备忘吧。现在高三了还搞这些也是顶了不少的压力。

另外本文我刚开始是打算让Deepseek代劳的，结果~~不出意外的出意外了~~（VSCode的自动补全如是说道（x））Deepseek与我的文风差距过大，不得已决定自己动手完成这篇文章，也算是对~~年更博主~~的一个交代吧（

本文出现的代码与文章遵循同样的开源协议（引用的代码部分则遵循其代码库的开源协议）。

谢谢你看到这里（
