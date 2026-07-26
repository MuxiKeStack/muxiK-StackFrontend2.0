const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const { stdin, stdout } = require('process');
const { createInterface } = require('readline/promises');

let fetchFn = global.fetch;
if (!fetchFn) {
  try {
    fetchFn = (...args) => require('node-fetch')(...args);
  } catch (err) {
    console.error('本地 node 版本需18+或自行安装 node-fetch！');
    process.exit(1);
  }
} else {
  fetchFn = fetch;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`命令退出，退出码: ${code}`))
    );
    child.on('error', reject);
  });
}

async function promptAuth() {
  try {
    const rl = createInterface({ input: stdin, output: stdout });
    const username = (await rl.question('BasicAuth 用户名：')).trim();
    const password = (await rl.question('BasicAuth 密码：')).trim();
    rl.close();
    return { username, password };
  } catch (err) {
    console.error('输入过程出错：', err.message);
    if (rl) {
      rl.close();
    }
    process.exit(1);
  }
}

async function fetchSwagger(url, auth) {
  try {
    const headers = auth
      ? {
          Authorization: `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`,
        }
      : {};
    const res = await fetchFn(url, { method: 'GET', headers });
    if (res.status === 401 && !auth) {
      const newAuth = await promptAuth();
      return await fetchSwagger(url, newAuth);
    }
    if (!res.ok) throw new Error(`请求失败 ${res.status}`);
    return await res.text();
  } catch (err) {
    throw new Error(`请求 ${url} 失败: ${err.message}`);
  }
}

async function generateTypes({ yamlPath, dtsPath }) {
  try {
    await runCommand('yarn', ['openapi-typescript', yamlPath, '-o', dtsPath]);
    console.log('类型定义生成完毕！');
  } catch (err) {
    throw new Error('类型定义生成失败：' + err.message);
  }

  try {
    await runCommand('yarn', ['prettier']);
    console.log('格式化完成！');
  } catch (err) {
    console.warn('格式化失败：', err.message);
  }
}

(async () => {
  const swaggerUrls = ['https://v3.ccnubox.muxixyz.com/api/v1/swag'];

  const results = [];
  for (const url of swaggerUrls) {
    try {
      const text = await fetchSwagger(url);
      results.push({ url, text });
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  const yamlPath = './src/common/api/openapi.yaml';
  try {
    const combined = results.map((r) => `# Source: ${r.url}\n${r.text}`).join('\n\n');
    writeFileSync(yamlPath, combined);
    console.log('openapi.yaml 写入完成');
  } catch (err) {
    console.error('写文件失败：', err.message);
    process.exit(1);
  }

  await generateTypes({ yamlPath, dtsPath: './src/common/api/schema.d.ts' });
})();
