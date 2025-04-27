# 1. 准备工作

## 1.1 开发环境
建议 Node 20.13.0+, npm 10.5.0+

## 1.2 VSCode
建议使用**VSCode**，并安装以下Extensions：

- Vue - Official
- EsLint
- koroFileHeader
- Prettier - Code formatter
- Prettier ESLint
- Stylelint

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
    "Author":"Your Name （Your Email）", /* 更改为您的名字 */
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

## 1.3 安装依赖
首先，设置NPM私有镜像：
```bash
npm run mirror:set
```

然后，安装依赖：
```bash
npm install
```

并初始化husky：
```bash
npm run prepare
```

## 1.4 开发调试

可在 **config/.env.dev** 中更改测试设备IP和更改HTTP/HTTPS调试模式
```
VITE_APP_IP=10.20.50.13
VITE_APP_HTTPS=false
```

可在 **config/.env** 中更改测试的UI
```
VITE_UI_TYPE=UI1-A
```

然后，在Terminal中运行
```bash
npm run dev
```

即可在浏览器中进行调试
```bash
http://localhost:9000
```

# 2. 浏览器兼容性

目前暂定的兼容的浏览器版本的基准为：

- chrome ≥ 105
- edge ≥ 105
- firefox ≥ 121
- safari ≥ 15.4

由于不需要对IE进行兼容，建议大家使用es6+语法和现代CSS布局进行开发.

但是，为了确保系统的可用性，如果不清楚某个JS API和CSS属性是否已兼容上述的浏览器版本，建议自行先在 [caniuse](https://caniuse.com/) 中查询兼容性.

# 3. 规范

## 3.1 代码整体规范
- 换行符必须为**LF**
- Tab Space必须为4个空格

## 3.2 组件命名规范

- 组件都使用大驼峰命名，如**AlarmStatus.vue**
- 公共组件的前缀必须为**Base**，如**BaseNumberInput.vue**
- 弹窗组件的后缀必须为**Pop**，如**ChangePasswordPop.vue**
- 页面内的版块组件的后缀必须为**Panel**，如**CddPanel.vue**
- 列表里面的列表项组件的后缀必须为**Item**，如**IntelFaceBaseItem.vue**
- 工具栏组件的后缀必须为**ToolBar**，如**ChannelToolBar.vue**
- 页面组件的命名必须避免出现前缀**Base**、后缀**Pop**、**Panel**、**Item**、**ToolBar**等

## 3.3 JS/TS规范
1. TS类名使用大驼峰，而且，每个功能版块的类名都有一个固定的前缀。
每个功能版块的类型在**src/types/apiType/**中声明
```typescript
export class ChannelPtzSmartTrackDto extends TableRowStatus {
    chlId = ''
    chlName = ''
    autoBackSwitch = false
    autoBackTime = 0
    ptzControlMode = 'manual'
}
```
>
2. 所有的文件都必须包含文件注释，它可以使用**koroFileHeader**生成
```html
<!--
 * @Author: USERNAME username@tvt.net.cn
 * @Date: 2024-06-04 16:08:10
 * @Description: 条形图组件
-->
```
>
3. 函数
- 建议使用const函数表达式，替代function
- 除了数据类型使用class声明外，建议使用const函数表达式，替代class，这样可以更方便地使用Vue Composition API
```typescript
const todo = () => {}
```
>
4. 如何不是必要，Typescript不要使用any类型
```typescript
/** 尽量不要这样 */
const value = (type: any) => {
  // TODO
}
```
>
5. 自动导入。大部分的公共组件、公共模块和公共类都支持自动导入，因此不需要手动地声明类型。
支持自动导入的组件、模块、类型请自行查阅**vite.config.ts**文件里的配置
```typescript
/** 以下这样的import声明可省略 */
import { getFileNameFromPath } from '@/utils/tools'
```
>
6. 所有的业务组件都使用Scoped CSS，避免命名污染
``` html
<style lang="scss" scoped>
    // todo
</style>
```

## 3.4 样式需和模版、逻辑解耦
1. 如果不是必要，所有的静态样式都在scss中声明，避免在template中声明. template中建议只可声明css类或css变量.
```html
<!-- 禁止 × -->
<Comp style="position: absolute;" />
<!-- 允许 √ -->
<Comp :style="{ width: getWidth() }" />
<Comp :style="{ '--form-input-width': '340px' }" />
<Comp :class="{ active: isActive }" />
```
>
2. 如果不是必要，不要在JS中计算/改变界面样式，建议使用现代CSS实现相关的能力。
例如，1.4.x会监听resize事件来动态计算设置表格的高度，2.2中通过CSS Flexbox来实现这种能力.
```typescript
/** 1.4.x  */
window.addEventListener('resize', function () {
    $('#todo').height(document.body.clientHeight - 50px))
}
```
```scss
/** 2.2 */
#todo {
    height: calc(100vh - 50px);
}
```

## 3.5 布局规范
2.2版本在布局上存在一些优化，包括：
#### 1. 表单
- 系统中基本所有的配置表单都垂直居中、标题样式统一居中、提交按钮位置统一、间距统一，所有的配置表单的label宽度和输入框宽度基本统一。
- 系统中基本所有的配置表单都显示间隔条纹。
#### 2. 表格
- 所有表格都显示间隔条纹、表格列弹性布局撑开。
- 除了展开表格外，所有表格都显示边框。
#### 3. 弹窗
- 所有弹窗内间距统一，确定/取消按钮统一放在右下角。
>
**src/views/UI_PUBLIC/publicStyle/common.scss** 定义了一些公共的样式类，在项目开发过程中，尽量使用这样公共CSS类进行布局.

## 3.6 XML字符串规范
#### 1. XML格式化
代码中的XML字符串必须是格式化的XML格式，需要体现XML标签的层级，并使用标签函数**rawXml**包裹。
```typescript
// 1.4.x的写法（不允许）
var a = '<content>'
a += '<name length="' + length + '>' + name + '</name>'
a += '<list>'
$.each(list, function(index, item) {
    a += '<item><index>' + item + '</index></item>'
})
a += '</list></content>'

// 2.x的写法
const a = rawXml`
    <content>
        <name length="${length}">${name}</name>
        <list>
            ${
                list.map((item) => rawXml`
                    <item>
                        <index>${item.index}</index>
                    </item>
                `).join('')
            }
        </list>
    </content>
`
```
#### 2. XML字符串压缩
项目打包时，编译程序会自动识别标签函数**rawXml**，并对包裹的字符串进行压缩
```typescript
// 压缩前
const todo = rawXml`
    <content>
        <name length="${length}">${name}</name>
    </content>
`
// 压缩后（打包时自动压缩）
const todo = rawXml`<content><name length="${length}">${name}</name></content>`
```
#### 3. XML格式校验
- 标签函数**rawXml**会对模版字符串里的变量进行类型校验，用来一定程度避免语法错误.
- 此外，在开发环境中，下发协议都会检查XML格式，如果格式错误，会在控制台抛出**ParseError**错误，方便大家调试，定位错误。

## 3.7 Eslint / Stylelint / Prettier 自动保存
项目配置了eslint、stylelint、prettier相关的VSCode插件，都可在保存时自动格式化.

# 4. 日期与时间

2.2统一使用**dayjs**库进行日期处理，这是为了和**elementPlus**组件库更好地交互使用. 因此在使用上和1.4.X有所不一样。

同时，2.2在日期处理上也有其他的一些优化，会和1.4.x有所差异。

## 4.1 日期与时间格式化使用上的差异
#### 1. 日期时间格式
使用dayjs的日期时间格式
```typescript
/* 1.4.x 的写法 */
var FORMAT = 'yyyy-MM-dd HH:mm:ss tt'

/** 2.2 的写法 */
const FORMAT = 'YYYY-MM-DD HH:mm:ss A'
```
#### 2. 日期格式化方式
```typescript
/* 1.4.x */
new Date().format('yyyy/MM/dd')

/** 2.2 */
formatDate(new Date(), 'YYYY/MM/DD')
```

## 4.2 日期与时间格式化规范
1. 2.2版本Web端和设备端都统一，**系统中所有显示的日期/时间都必须是系统配置的时间格式**，包括日期选择器、时间选择器等所有用户看得见的时间，都必须和系统所配置的时间格式一致。
>
2. **区分日期显示格式和日期传输格式**
- **日期显示格式**：即显示在界面中的格式，由用户配置的日历（如公历/波斯历）、日期时间格式（如12小时制/24小时制）决定
>
- **日期传输格式**：即组件之间、Web端和设备端之间传输、运算所使用的时间格式. 必须是**YYYY-MM-DD HH:mm:ss**、**YYYY-MM-DD**或**时间戳**
>
- **整个系统之中，日期传输格式和日期显示格式的转换是单向的，只可以出现日期传输格式转换成日期显示格式的情况，不可以逆向将日期显示格式转换为日期传输格式.**
也就是说，不允许将DD/MM/YYYY转换为YYYY-MM-DD，或波斯历转换为公历。
>
3. **useDateTimeStore()**
在1.4.x，某个页面里面需要用到系统的时间格式时，都会单独请求queryTimeCfg
在2.2中，页面里面不需要单独请求queryTimeCfg，因为每次路由切换都会重新请求一遍。如果需要在组件里面获取系统时间格式，通过**useDateTimeStore()** 来获取

4. 2.2版本Web端和设备端统一，**所有出现星期的地方，星期的起始第一天均为星期日**.

# 5. 雪碧图

和1.4.x不一样，2.2会将png图片都合成一张大的雪碧图，然后使用vue组件/SCSS @include形式引入雪碧图。
和1.4.x对比，我们不需要关心每张小雪碧图的具体坐标。

## 5.1 使用组件引入雪碧图
```html
<BaseImgSprite
    file="bkSpeed"
    :index="0"
    :hover-index="1"
    :chunk="4"
/>
```
file即为原图的文件名。
雪碧图组件其他属性的定义详见**src/components/sprite/BaseImgSprite.vue**

此外，如果是四状态的雪碧图按钮（包含normal、hover、active、disabled状态的雪碧图），也支持shorthand写法引入雪碧图：
```html
<BaseImgSpriteBtn file="bkSpeed" />
```

## 5.2 使用SCSS引入雪碧图
```scss
@use '@/components/sprite/sprites' as *;
@use '@/scss/mixin' as *;

.bkSpeed {
    @include sprite($img-bkSpeed, 0, 4);
}
```

注意：
1. 建议使用组件形式引入雪碧图
2. 我们不需要关心每张雪碧图具体的坐标
3. 如果项目要添加新图片，**图片的命名需要符合CSS类的命名规则**，如**ZoomState_1.5.png**是不允许的。

# 6. ElementPlus和公共组件

本项目使用了ElementPlus组件库，但由于ElementPlus组件库的部分控件没有办法支撑我们的需求，所以这部分控件会自己开发，或基于ElementPlus二次开发.

## 6.1 哪些ElementPlus组件可直接使用
这里列出哪些ElementPlus组件可以直接在业务组件上使用，哪些需要使用我们单独开发或二次封装的组件：

| 组件类型 | 是否可以直接使用ElementPlus组件 | 组件 | 说明 |
| ---- | :----: | ---- | ---- |
| 表单 | ✅ | el-form | |
| 表格 | ✅ | el-table | |
| 文本输入框 | ✅ | el-input | |
| 富文本输入框 | ✅ | el-input | |
| 密码输入框 | ❌ | BasePasswordInput | 为了全局禁止复制粘贴、默认显示小眼睛 |
| 数字输入框 | ❌ | BaseNumberInput | 由于el-input-number存在各种缺陷 |
| 滑动控件 | ❌ | BaseSliderInput | 由于el-input-number存在缺陷 |
| 日期选择器 | ❌ | BaseDatePicker | 由于不支持波斯日历 |
| 时间选择器 | ❌ | BaseTimePicker | 为了全局显示系统时间日期格式 |
| 对话框 | ✅ | el-dialog | |
| 消息框 | ❌ | openMessageBox | 为了全局设置默认值、默认样式 |
| 加载中 | ❌ | openLoading/closeLoading | 为了全局设置默认值、默认样式 |
| 穿梭框 | ✅ | el-transfer | |
| 复选框 | ✅ | el-checkbox | |
| 单选框 | ✅ | el-radio/el-radio-button | |
| 按钮| ✅ | el-button | |
| 进度条 | ✅ | el-progress | |
| 选择框 | ✅ | el-select-v2 | 注意：使用el-select-v2而不是el-select，因为el-select-v2的性能更佳 |
| 页码器 | ❌ | BasePagination | 由于样式和原来差异太大 |
| Tab页签 | ✅ | el-tab-pane | |

## 6.2 ElementPlus组件的默认值
为了使部分属性不要在每个ElementPlus组件中重复声明，在 **src/plugin/elementPlus.ts** 中改写了部分ElementPlus组件的默认值

## 6.3 表单校验
表单校验我们使用了ElementPlus的表单控件，其校验方式详见ElementPlus的文档
但是，由于ElementPlus的表单实现逐行校验比较麻烦，因此对表单的引用进行了一个小改变，其他不变。
```typescript
// elementPlus文档里的使用方式
const formRef = ref<FormInstance>()
formRef.value.validate((valid) => {
    // TODO
})

// 本项目中的使用方式
const formRef = useFormRef()
formRef.value.validate((valid) => {
    // TODO
})
```
## 6.4 表单、表格行数据变化的监听
#### 1. 表单变化
项目中，我们可能需要监听表单数据是否发生变化，然后取消提交按钮的禁用状态，在用户提交后，重新把按钮置灰。监听表单变化可使用**useWatchEditData**这个模块
```typescript
const watchEdit = useWatchEditData(formData)
watchEdit.listen() // 初始化数据后开启侦听
watchEdit.update() // 提交数据后重置侦听
```
#### 2. 表格行变化
项目中，我们可能需要监听表格行数据变化，然后取消提交按钮的禁用状态，并在下发时只下发发生了变化的行，提交后更新表格行状态，并把按钮重新置灰。监听表格行变化可使用**useWatchEditRows**
```typescript
// 1.4.x 写法
$('#grid').wbGrid({
    data: {
        // ...
    },
    callback: {
        cellValueChanged: function (gridId, rowIndex, rowData) {
            $("#btnApply").attr("disabled", false).removeClass("disabled");
        }
    }
});
var rowDatas = $("#grid").wbGrid("getRowDatas");
$("#grid").wbGrid("clearRowEditedStatus");
$("#btnApply").attr("disabled", true).addClass("disabled");

// 2.x 写法
const editRows = useWatchEditRows<AlarmOutDto>()
tableData.value.forEach((row) => editRows.listen(row)) // 初始化数据后开启侦听
const rowDatas = editRows.toArray() // 获取变化行
rowDatas.forEach((row) => editRows.remove(row)) // 提交数据后重置侦听
```

## 6.5 鼠标悬浮的title提示
由于ElementPlus组件没有提供property直接设置表单label、表格header等的title attribute，如果要实现title attribute，就需要在每个表单label、表格header中通过slot的形式来实现，可能会导致代码冗余，因此这里实现了一个vue指令来达成这样的效果
```html
<!-- slot写法（可能过于冗余） -->
<el-form>
    <el-form-item>
        <template #label>
            <span :title="Tranlate('IDCS_NAME')">{{ Tranlate('IDCS_NAME') }}</span>
        </template>
        <el-input>
    </el-form-item>
    <el-form-item>
        <template #label>
            <span :title="Tranlate('IDCS_PASSWORD')">{{ Tranlate('IDCS_PASSWORD') }}</span>
        </template>
        <BasePasswordInput>
    </el-form-item>
</el-form>
<!-- v-title写法（比较简洁） -->
<el-form v-title>
    <el-form-item :label="Tranlate('IDCS_NAME')">
        <el-input>
    </el-form-item>
    <el-form-item :label="Tranlate('IDCS_PASSWORD')">
        <BasePasswordInput>
    </el-form-item>
</el-form>

<!-- slot写法（可能过于冗余） -->
<el-table :data="data">
    <el-table-column prop="name">
        <template #header>
            <span :title="Tranlate('IDCS_NAME')">{{ Tranlate('IDCS_NAME') }}</span>
        </template>
    </el-table-column>
    <el-table-column prop="password">
        <template #header>
            <span :title="Tranlate('IDCS_PASSWORD')">{{ Tranlate('IDCS_PASSWORD') }}</span>
        </template>
    </el-table-column>
</el-table>
<!-- v-title写法（比较简洁） -->
<el-table 
    v-title
    :data="data"
>
    <el-table-column 
        prop="name" 
        :label="Tranlate('IDCS_NAME')"
    />
    <el-table-column 
        prop="password" 
        :label="Tranlate('IDCS_PASSWORD')" 
    />
</el-table>
```

## 6.6 公共组件补充说明
1. **消息框**使用**openMessageBox**
```typescript
// 1.4.X写法
Dialog.ShowMessage({
    type: "y/n",
    title: LangCtrl._L_("IDCS_INFO_TIP"),
    msg: LangCtrl._L_("IDCS_VIDEO_FORMAT_EDIT_AFTER_EXIT_WIZARD_REBOOT"),
    zIndex: 103,
    callBack: function (result) {}
})

// 2.2写法
openMessageBox({
    type: 'question',
    message: Translate('IDCS_REBOOTING'),
}).then(() => {
    // confirm
}).catch(() => {
    // cancel
})

openMessageBox({
    type: 'info',
    title: Translate('IDCS_INFO_TIP'),
    message: Translate('IDCS_NO_AUTH')
})
// 这种消息框可以简写为==>
openMessageBox(Translate('IDCS_NO_AUTH'))
```
>
2. **加载组件**使用**openLoading**和**closeLoading**
```typescript

// 1.4.X写法
Loading.Show()

// 2.2写法
openLoading()

openLoading(LoadingTarget.FullScreen, Translate('IDCS_TEST_HOLD_ON'))
```
>
3. **排程选择组件**统一使用**BaseScheduleSelector**
2.2 Web端和设备端统一，所有排程管理都放在选择器选项里面，选择器外不会有单独的排程按钮
>
4. **src/components**还封装了很多业务上可能需要的基础组件，如：**IP地址输入框**、**电子邮箱掩码输入框**、**日期切换按钮组件**、**联动穿梭框**等等。业务开发遇到相关需求时尽量使用已有的组件。

# 7. 多UI

## 7.1 多UI方案
- 多UI方案大致和1.4.X一致，中性版本的组件放在UI_PUBLIC目录下，各UI目录下只包含差异化的组件
>
- 每个组件分为.vue和.v.ts两部分，.vue包含模版和样式，.v.ts为逻辑部分.
```html
<!-- Todo.vue -->
<template>
    <Comp />
</template>

<script src="./Todo.v.ts" />

<style lang="scss" scoped>
</style>
```
```typescript
// Todo..v.ts
export default defineComponent({
    setup() {
        return {}
    }
})
```
>
- 客制UI可以只产生自己的vue文件，并且引用UI_PUBLIC目录下的v.ts文件

## 7.2 UI主题色
- 每个UI目录下的**publicStyle/global.scss**定义该UI的主题色。和1.4.X不同的是，global.scss定义的是CSS变量，然后再自行在需要用到的地方引用这些变量。
>
- Canvas组件（如条形图组件、排程组件、时间轴组件）的UI主题色也是在**publicStyle/global.scss**里面定义。
>

## 7.3 UI条件编译
- 如果在项目中需要判断UI，使用环境变量**import.meta.env.VITE_UI_TYPE**进行判断，在项目打包时，如果打包的UI不符合条件，这部分代码将会被消除.
```typescript
// 1.4.X 使用全局变量 其他UI也会把这部分代码打包
if (appInfo.uiName == "UI1-E") {
    // todo
}

// 2.2 使用环境变量 只有UI1-E会把这部分代码打包
if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
    // todo
}
```
>
- 和1.4.x不一样，1.4.x有些客制UI组件可能和中性的差异很少，但还是会在客制UI目录上创建一个几乎一样的组件，然后只修改了里面差异的部分。
为了维护上的方便，避免修改了中性版本却忘记修改客制UI版本的情况，这种小差异都会合并到中性的UI组件里，然后通过环境变量来区分。

```html
<!-- 1.4.x UI-Public 和 UI1-E 仅翻译不一样，却有两个html文件 -->

<!-- UI-Public/view/NetCfg/upnp.html -->
...
<input id="btnRefresh" type="button" lc="value" lk="IDCS_REFRESH" class="cfgBtn" />

<!-- UI1-E/view/NetCfg/upnp.html -->
...
<input id="btnRefresh" type="button" lc="value" lk="IDCS_TEST" class="cfgBtn" />
```
```typescript
// 2.x 这个翻译差异合并到同一个文件，通过环境变量判断

// UI_PUBLIC/page/net/UPnP.v.ts
const pageData = ref({
    btnName: import.meta.env.VITE_UI_TYPE === 'UI1-E' ? Translate('IDCS_TEST') : Translate('IDCS_REFRESH')
})
```
>
- 另外，远期也有计划将Web端中的UI类型判断减少/消除，这需要和设备端确认具体方案.

# 8. 路由与路由权限

## 8.1 多UI路由配置方案
项目中公共的路由配置在**src/router/featureConfig/featureTree**里面
然后，每个客制UI目录下面也有一个**router**目录，我们会在这个目录下面处理客制路由和公共路由的合并（增/删/改），然后返回的是这个客制UI的全量路由
```typescript
// UI1-B因为和中性路由结构完全一致，直接export中性的路由
import routes from '@/router/featureConfig/featureTree'
export default routes

// UI2-A和中性路由样本库的访问路径不一样，所以进行了增/删/改动作
import routes from '@/router/featureConfig/featureTree'
import { merge } from 'lodash-es'
export default merge(routes, {
    root: {
        meta: {},
        children: {
            config: {
                meta: {},
                children: {
                    aiAndEvent: {
                        meta: {
                            groups: {
                                database: {
                                    ...
                                },
                            },
                        },
                        children: {
                            faceFeatureLibrary: {
                                path: 'faceFeature',
                                component: 'intelligentAnalysis/IntelFaceDB.vue',
                                ...
                            },
                        },
                    },
                }
            },
            intelligentAnalysis: {
                ...
                children: {
                    sampleDataBase: {
                        meta: {
                            remove: true,
                        },
                    },
                },
            },
        }
    }
})
```

## 8.2 路由权限

在1.4.X中，路由权限的配置可能比较混乱，分散在Route.js、ConfigFrame.js、每个功能版块的CfgFrame.js里面

2.2进行了统一，所有路由权限路由的权限（包括是否需要token、用户访问权限、能力集是否支持、通道能力是否支持）都在路由功能树上配置

```typescript
interface FeatureItem {
    ...
    meta: {
        /** 能力集是否支持回调，这里会传入设备能力集 **/
        hasCap?: (systemCaps: ReturnType<typeof useCababilityStore>) => boolean
        /** 是否需要token，true：不需要， undefined/false：需要 */
        noToken?: boolean
        /** 权限代号, 此值会传入useUserSessionStore.hasAuth()判断菜单可用/禁用状态. 如果undefined/空字符串，则为白名单，不受权限控制 */
        auth?: string
    },
    /** 路由独享守卫 */
    beforeEnter?: RouteRecordRaw['beforeEnter']
}
```
#### 1. 是否需要token
也就是不需要登录就可以访问的路由，如登录页、授权码登录页等等。
```typescript
{
    path: '/login',
    component: 'Login.vue',
    meta: {
        noToken: true,
    },
}
```
#### 2. 用户访问权限
也就是配置了用户权限的页面。外在表现是，如果用户没有该路由权限，菜单置灰、禁止点击。
```typescript
{
    path: 'management',
    component: 'disk/DiskManagement.vue',
    meta: {
        ...
        // 如果没有diskMgr权限，菜单置灰
        auth: 'diskMgr',
    },
}
```
#### 3. 设备能力集是否支持
外在表现是，如果系统能力集不支持，该菜单会被隐藏，同时用户也没法通过URL访问该页面
```typescript
{
    path: 'offline',
    component: 'aiAndEvent/IpcOffline.vue',
    meta: {
        ...
        // 如果ipChlMaxCount===0，菜单隐藏
        hasCap(systemCaps) {
            return !!systemCaps.ipChlMaxCount
        },
    },
}
```
#### 4. 通道能力是否支持
通过路由守卫实现。外在表现是，菜单处于显示且可点击状态，点击后，如果不支持，就弹出提示框，无法进入页面
```typescript
{
    path: 'faceRecognition',
    component: 'aiAndEvent/FaceRecognition.vue',
    meta: {
        ...
    },
    async beforeEnter(to, from, next) {
        const { Translate } = useLangStore()
        const flag = await checkChlListCaps('faceRecognition')
        if (flag) {
            next()
        } else {
            openMessageBox(Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_FACE_RECOGNITION')))
            if (from.fullPath === to.fullPath) {
                next('/live')
            } else {
                next(from)
            }
        }
    },
}
```

注意：除了不需要token的路由外，其他路由都是在获取了用户权限、设备能力集后异步生成的

# 9. XML报文解析

1.4.x使用jQuery内置的方法来解析、查询XML字符串
>
2.x使用XPath来解析、查询XML字符串
它们语法上有差异，可以在[MDN](https://developer.mozilla.org/zh-CN/docs/Web/XML/XPath)上自行学习了解

```typescript
// 1.4.x 语法
Communication.Request({
    url: "queryUser",
    data: sendXml
}).done(function (result) {
    if ($.trim($("response>status", result).text()) == "success") {
        var userName = $.trim($("response>content>userName", result).text())
        var authGroup = $.trim($("response>content>authGroup", result).attr("id"))
    }
});

// 2.x 语法
const result = await queryUser(sendXml)
const $ = queryXml(result)
if ($('status').text() === 'success') {
    const userName = $('content/userName').text()
    const authGroup = $('content/authGroup').attr('id')
}
```

#### 扩展语法：

- **text()、attr()** 返回的字符串，如果XML标签不存在，也会返回空字符串
```typescript
<content>
    <name type="surname">username</name>
</content>

$('content/name').text() // => 'username'
$('content/age').text() // => ''
if ($('content/age').length) { // 判断该标签是否存在
    const age = $('content/age').text()
}
$('content/name').attr('type') // => 'surname'
```
>
- **num()** 可把innerText/attribute的值转换为数字
```typescript
<content>
    <index id="2">3</index>
</content>

$('content/index').text().num() // => 3
$('content/index').attr('id').num() // => 2
```
>
- **bool()** 可把innerText/attribute的值转换为数字
```typescript
<content>
    <switch enabled="true">false</switch>
</content>

$('content/switch').text().bool() // => false
$('content/switch').attr('enabled').bool() // => true
```

# 10. 播放器

## 10.1 播放器使用

和1.4.X不同，2.2中播放器封装成Vue组件，如果支持OCX，组件区域直接显示OCX画面，否则显示H5画面

```typescript
// 1.4.x
var player = new TVTPlayer({
    el: '#divRecOCX',
    type: 'record',
    split: 1,
    enablePos: supportPOS,
    ontime: function (winIndex, data, timestamp) {
        // todo
    },
})
player.play()

if (isSupportH5) {
    tvtPlayer = new TVTPlayer({
        el: "#popLiveOCX",
        split: 1,
        ontime: function (winIndex, data, timestamp) {
            // todo
        },
    })
    tvtPlayer.play({
        ...
    })
} else {
    if (!Plugin.IsSupportH5() && !Plugin.IsInstallPlugin()) {
        setPluginNotice($(".tvt_dialog_content"));
        return;
    }
    if (!Plugin.IsSupportH5() && !Plugin.IsPluginAvailable()) {
        $.webSession('showPluginNoResponse', 'true');
        Plugin.ShowPluginNoResponse();
    }
    browserMoveEventObj = Plugin.AddPluginMoveEvent("popLiveOCX")
    var sendXML = OCX_XML_SetPluginModel("ReadOnly", "Live");
    Plugin.GetVideoPlugin().ExecuteCmd(sendXML, sendXML.length);
    Plugin.DisplayOCX(true);
    Plugin.SetPluginSize("popLiveOCX", Plugin.GetVideoPlugin());
    $(window).resize(winSize);
    Plugin.RetryStartChlView(chlId, chlName)
}

// 2.x
<BaseVideoPlayer
    ref="playerRef"
    @ready="ready"
    @time="onTime"
/>

const playerRef = ref<PlayerInstance>()

// 播放器准备就绪时回调，所有对H5播放器和OCX播放器的操作都需要在ready之后进行
const ready = () => {
    if (playerRef.value?.mode === 'ocx') {
        const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
        playerRef.value.plugin.ExecuteCmd(sendXML)
        playerRef.value.plugin.RetryStartChlView(chlId, chlName)
    }

    if (playerRef.value?.mode === 'h5') {
        playerRef.value.player.play({
            ...
        })
        return
    }
}

const onTime = (winIndex, data, timestamp) => {
    // todo
}
```

## 10.2 播放器使用上的简化

#### 1. 不需要在业务组件里面手动判断IsPluginAvailable()，因为这部分逻辑已经封装在播放器组件里面

```typescript
// 1.4.x
if (!Plugin.IsSupportH5() && !Plugin.IsPluginAvailable()) {
    $.webSession('showPluginNoResponse', 'true');
    Plugin.ShowPluginNoResponse();
}

// 2.2
// REMOVED!
```

#### 2. 不需要在业务组件里面手动判断IsInstallPlugin()，因为这部分逻辑已经封装在播放器组件里面
在1.4.X，如果未安装/插件版本过旧，需要手动指定提示安装/升级的遮罩层显示在哪里
在2.2版本，**提示安装/升级的遮罩层会自动显示，不需要手动指定位置**

```typescript
// 1.4.x
if (!Plugin.IsSupportH5() && !Plugin.IsInstallPlugin()) {
    setPluginNotice($(".tvt_dialog_content"));
    return;
}

// 2.2
// REMOVED!
```

#### 3. 业务组件初始化之后，不需要手动地执行DisplayOCX(true)、SetPluginSize()，因为这部分逻辑已经封装在播放器组件里面

```typescript
// 1.4.x
function init(dialog) {
    if (!Plugin.IsSupportH5()) {
        Plugin.DisplayOCX(true);
        Plugin.SetPluginSize("popLiveOCX", Plugin.GetVideoPlugin());
    }
}

// 2.2
// REMOVED!
```

#### 4. 一般情况下，不需要在业务组件里手动地监听插件的移动和大小变化，也不需要在业务组件销毁时移除监听，因为这部分逻辑已经封装在OCX模块里面
- 不需要手动监听window resize来执行SetPluginSize()
- 不需要手动地监听AddPluginMoveEvent()

```typescript
// 1.4.x
$(window).resize(doResize);
function doResize() {
    if (!isSupportH5) {
        Plugin.SetPluginSize("divsmartTrackOCX", Plugin.GetVideoPlugin());
    }
}
browserMoveEventObj = Plugin.AddPluginMoveEvent("divCruiseOCX")

$(window).off('resize', doResize)
Plugin.CloseCurPlugin("divCruiseOCX", browserMoveEventObj);

// 2.2
// REMOVED!
```
>
注意：2.2版本OCX插件只在以下条件下会主动更新OCX的大小和位置
- window触发scroll事件
- window触发resize事件
- OCX占位层的大小发生变化（ResizeObserver）
- OCX在el-dialog对话框里，且el-dialog发生移动

#### 5. 一般情况下，**OCX占位层被遮挡、或者业务组件被销毁时候，不需要在业务组件里面手动地显示/隐藏插件**，因为这部分逻辑已经封装在OCX模块里面

```typescript
// 1.4.13
Plugin.DisplayOCX(true, context);
Plugin.DisplayOCX(false, context);

// 2.2
// REMOVED
```

注意：
2.2版本只在以下条件下实现OCX插件的自动隐藏/显示：
- el-dialog打开时，隐藏；关闭后，重新显示
- el-popover遮挡OCX占位符时，隐藏；关闭后，重新显示
- el-overlay打开时，隐藏；关闭后，重新显示
- openLoading()时，隐藏；closeLoading()后，重新显示
- openMessageBox()时，隐藏；关闭消息框后，重新显示
- OCX占位层被隐藏时，隐藏；重新显示时，重新显示
- 业务组件被销毁时

OCX插件在以下条件下不会自动隐藏/显示：
- 在业务组件mounted后加载的el-dialog、el-popover、el-overlay组件（异步组件）
- el-select-v2的下拉选择列表
- 其他自定义的组件，却遮挡了OCX占位符

#### 6. 业务组件被销毁时，不需要手动销毁H5播放器，因为这部分逻辑已经封装在播放器组件里面
```typescript
// 1.4.13
if (isSupportH5) {
    tvtPlayer && tvtPlayer.destroy();
}

// 2.2
// REMOVED
```

#### 7.侦听OCX返回报文的方式和之前不同，因此销毁组件时不需要手动移除侦听器。
```typescript
// 1.4.13
if (!isSupportH5) {
    VideoPluginNotify.notify.addListener(LiveNotify2Js);
}
function LiveNotify2Js($xmlDoc, strXMLFormat) {
    var $xmlNote = $("statenotify[type='CddParam']", $xmlDoc);
    if ($("statenotify[type='CddParam']", $xmlDoc) > 0) {
        var info = $("statenotify>item", $xmlDoc)
    }
}
if (!isSupportH5) {
    VideoPluginNotify.notify.removeListener(LiveNotify2Js);
}

// 2.2
<BaseVideoPlayer @message="onMessage" />

const onMessage = ($: XMLQuery, stateType: string) => {
    if (stateType === 'CddParam') {
        const info = $('statenotify/item')
    }
}
```

注意：2.2会在播放器组件触发onBeforeUnmount()或onBeforeDeactivated()时移除侦听

## 10.3 OCX插件的两种使用方式

OCX插件有两种使用方式：

- 第一种，就是上面所讲述的，通过BaseVideoPlayer引入

```typescript
<BaseVideoPlayer
    ref="playerRef"
    @ready="ready"
    @message="onMessage"
/>

const playerRef = ref<PlayerInstance>()

// 播放器准备就绪时回调，所有对H5播放器和OCX播放器的操作都需要在ready之后进行
const ready = () => {
    if (playerRef.value?.mode === 'ocx') {
        // todo
    }
}

const onMessage = ($: XMLQuery, stateType: string) => {
    if (stateType === 'UploadIPCAudioBase64') {
        const $item = queryXml($('statenotify')[0].element)
        // todo
    }
}
```
>
- 第二种，如果业务组件内需要和OCX通信，但不需要在页面上显示播放器的话，可以通过usePlugin引入
```typescript
const plugin = usePlugin({
    onMessage: ($, stateType) => {
        if (stateType === 'UploadIPCAudioBase64') {
            const $item = queryXml($('statenotify')[0].element)
            // todo
        }
    }
})
```
>
和第一种方式一样，这种方式同样不需要：
（1）不需要手动地判断IsInstallPlugin()，不需要手动打开提示升级/安装的遮罩层
（2）不需要手动移除OCX返回报文侦听器

## 10.4 只有一个现场预览页和一个回放页
1.4.x的现场预览和回放分别分为live、liveWasm以及rec、recWasm两个页面，然后根据是否支持插件/WASM来决定路由到哪个页面
>
在2.2中，live、liveWasm合并为同一个现场预览页Live.vue，rec、recWasm也合并为同一个回放页Playback.vue，这样维护起来会更方便

# 11. 整体目录结构
```sh
├─ config # 环境变量
├─ public # 静态文件
│  ├── workers # worker/wasm文件
├─ scripts # 打包/编译脚本
├─ sprite # 图片素材
├─ src
│  ├── api # API
│  ├── components # 公共组件
│  ├── directives # vue指令
│  ├── hooks # vue hooks
│  ├── plugin # vue 插件
│  ├── router # 路由
│  ├── scss # 公共scss函数/mixins
│  ├── stores # pinia公共存储
│  ├── types # ts类型定义
│  ├── utils # 公共类库
│  ├── views # 视图（多UI）
│  │  ├── components
│  │  ├── page
│  │  ├── publicStyle
│  ├── App.vue
│  ├── main.ts
├─ vite.config.ts
```

