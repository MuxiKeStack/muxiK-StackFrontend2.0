<div align="center">
  <img width="130" src="https://github.com/MuxiKeStack/muxiK-StackFrontend2.0/blob/main/src/common/assets/img/login/Icon.png" alt="muxiK-StackFrontend2.0 logo">
  <h1 align="center">muxiK-StackFrontend2.0</h1>
  <h3>木犀课栈微信小程序</h3>
  <a href="https://github.com/MuxiKeStack/muxiK-StackFrontend2.0"><strong>探索项目文档 »</strong></a>
  <br />
  <br />

![license](https://img.shields.io/github/license/MuxiKeStack/muxiK-StackFrontend2.0)
![language](https://img.shields.io/github/languages/top/MuxiKeStack/muxiK-StackFrontend2.0)
![last](https://img.shields.io/github/last-commit/MuxiKeStack/muxiK-StackFrontend2.0)

<a href="#" target="_blank">在线体验</a>
·
<a href="https://github.com/MuxiKeStack/muxiK-StackFrontend2.0/issues">报告Bug</a>
·
<a href="https://github.com/MuxiKeStack/muxiK-StackFrontend2.0/issues">提出新特性</a>

</div>

## 项目简介

木犀课栈前端，基于 **Taro 4 + React 18** 的微信小程序。业务数据通过 **Zustand store** 统一管理，页面不直接调用 REST API。

**技术栈：** Taro 4.0.6 · React 18 · Zustand · TypeScript · Sass · Tailwind（weapp-tw）· Yarn 4

## 本地开发

### 环境要求

- Node.js 18+
- 微信开发者工具（打开编译产物目录 `dist/`）

### 常用命令

```bash
git clone https://github.com/MuxiKeStack/muxiK-StackFrontend2.0.git
cd muxiK-StackFrontend2.0
yarn
yarn dev:weapp      # 监听编译，产物输出到 dist/
yarn build:weapp    # 生产构建
yarn lint           # ESLint
yarn prettier       # 格式化
```

### 微信开发者工具

1. `project.config.json` 中 `miniprogramRoot` 指向 **`dist/`**
2. 终端先跑 `yarn dev:weapp` 或 `yarn build:weapp`，再在开发者工具中打开项目根目录
3. 若出现页面路径找不到、组件 `wx://not-found` 等异常，先清缓存再重建：

```bash
rm -rf dist node_modules/.cache .swc
yarn build:weapp
```

开发者工具内：**清缓存 → 全部清除 → 重新编译**。

## 目录结构

```
src/
├── pages/                 # 主包页面（Tab、高频链路）
│   ├── main/              # 广场
│   ├── guide/             # 手册
│   ├── profile/           # 我的（Tab 壳）
│   ├── myclass/           # 我的课程（Tab「+」入口）
│   ├── classInfo/         # 课程详情
│   ├── notification/      # 消息
│   ├── research/          # 搜索
│   └── login/
├── subpackages/           # 分包（方案 B：按业务域组织）
│   ├── profile/           # 个人中心低频：收藏、评课历史、编辑资料
│   ├── feedback/          # 意见反馈
│   └── course/            # 评课 / 问答
├── common/                # 组件、请求、工具、常量
│   └── constants/routes.ts  # 分包页面跳转路径
├── store/                 # Zustand 数据层
└── app.config.ts          # 主包 / 分包注册
```

### 分包说明

| 分包                   | 页面                                                  | 说明           |
| ---------------------- | ----------------------------------------------------- | -------------- |
| **主包**               | login、四个 Tab、myclass、classInfo、research         | 冷启动必载     |
| `subpackages/profile`  | myCollection、evaluationHistory、editUser             | 从「我的」进入 |
| `subpackages/feedback` | main、writefeedback、history、detail                  | 意见反馈全流程 |
| `subpackages/course`   | evaluate、evaluateInfo、questionInfo、publishQuestion | 评课与问答     |

新增分包页面时：

1. 在 `src/subpackages/<域>/pages/` 下建页面
2. 在 `src/app.config.ts` 的 `subpackages` 中注册
3. 在 `src/common/constants/routes.ts` 补充路径，跳转统一使用 `ROUTES`

## 数据层约定

- **API 只在 store 里调用**，页面通过 store 的 `load` / action 读写数据
- **加载策略**（`src/store/types.ts`）：
  - `cache-first`：有缓存先用，没有再请求
  - `network-first`：先请求，失败用旧缓存兜底（如 FAQ）
  - `network-only`：只请求、不读缓存（登录、提交等写操作）
- 工具函数 `loadData` / `sourceLabel` 见 `src/store/loadUtils.ts`
- store 统一从 `src/store/index.ts` 导出

## CI

GitHub Actions 工作流见 `.github/workflows/ci.yml`：

| Job               | 内容                                                     |
| ----------------- | -------------------------------------------------------- |
| **Lint & Format** | Prettier check、ESLint                                   |
| **Build**         | `yarn build:weapp`，成功时上传 `dist/` 产物（保留 7 天） |

触发：`push` 到 `main`、任意 `pull_request`、手动 `workflow_dispatch`。

## 提交规范

- 🎉 init：项目初始化
- ✨ feat：新增功能（feature）
- 🐞 fix：修复 bug
- 📃 docs：文档修改
- 🌈 style：代码样式修改，不影响原代码逻辑
- ✅ test：测试相关的改动
- 🔨 refactor：代码重构
- 🔧 chore：建制过程或辅助工具的变动

## 授权

上述文件皆以 MIT 许可授权。

> 详细之授权请参考 [LICENSE](LICENSE) 文件

## 内部文档

项目进度和未来计划请参考 [飞书文档](https://muxi.feishu.cn/docx/Q1PwdIMH0opWwRxG8WccgeClnck?from=from_copylink)
