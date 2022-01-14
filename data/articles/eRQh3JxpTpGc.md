# LiteBlog的开发设想  

## 名称  

LiteBlog  

## 构思  

- PWA的支持（最近我才发现PWA和Service Worker的能力强得离谱，直接把SPA路由的问题搞定了）

- 使用Web Components（前身即是Google Chrome大名鼎鼎的HTML Import），将插件、markdown、XML全部当成组件去渲染（从Dev Tools看起来，比自己解析文档再插入节点好得多）。或许这也是个语义化的好办法？  

- 直接使用RSS来读取文章信息并在首页输出（虽然有点怪，但直接实现了RSS的支持）  

- XML大概会用Web Components的形式（就是Templete标签打头的那种），虽然看起来很像Vue文件，但这是Web Components的原生语法！）  

## 其他的乱想  

个人认为其实这个框架不应该只局限于Blog这样的一个小圈子，它应该可以发挥更大的作用……比如说Docs、Dashboard什么的都可以用这一套来搞定（话说我是不是太自恋了？）