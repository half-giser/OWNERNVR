## 准备工作

#### 开发环境
建议 Node 20.13.0+, npm 10.5.0+

#### VSCode
建议使用**VSCode**，并安装以下Extensions：

**Vue - Official**
**EsLint**
**koroFileHeader**
**Prettier - Code formatter**
**Prettier ESLint**
**Stylelint**

在根目录中创建 **.vscode/settings.json**，添加以下配置：
```json
{
  "editor.formatOnSave": false,
  "eslint.useFlatConfig": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit",
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit",
    "source.fixAll.prettier": "explicit",
    "source.organizeImports": "never",
    "eslint.autoFixOnSave": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml"
  ],
  "fileheader.customMade": {
    "Description":"",
    "Author":"Your Name （Your Email）", // 更改为您的名字
    "Date":"Do not edit",
  },
  "fileheader.configObj": {
    "autoAdd": true,
  },
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false,
  "stylelint.validate": [
    "css",
    "less",
    "postcss",
    "scss",
    "sass",
    "vue",
    "html"
  ],
  "files.associations": {
    "*.json": "jsonc"
  },
}
```

## 安装

在Terminal中运行
```bash
npm install
```

## 开发调试

可在 **config/.env.dev** 中更改测试设备IP
```
VITE_APP_IP=0.0.0.0
```

可在 **config/.env** 中更改测试UI
```
VITE_UI_TYPE=UI1-A
```

在Terminal中运行
```bash
npm run dev
```

## 生产打包

##### 方法1. 在Terminal中运行
```bash
npm run generate bundle=UI1-A,UI2-A_IL03,UI1-E_USE44
```

bundle=后面跟随需要打包的{UI类型}_{客户}，多个包则使用英文逗号隔开. 如果没带客户后缀，则会打包中性客户版本. 打包结果在**dist**目录下

##### 方法2. 在Termial中运行
```bash
npm run generate manual
```

然后，根据提示，在Terminal中通过按键选择需要打包的UI，回车确认，即可开始打包. 打包结果在**dist**目录下：
```bash
? Choose UIs you need to package (Multi-select support) (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)
❯◯ UI1-A
 ◯ UI1-B
 ◯ UI1-C
 ◯ UI1-D
 ◯ UI1-E
 ◯ UI1-F
 ◯ UI1-G
```
