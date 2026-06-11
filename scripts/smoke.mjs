// 端到端冒烟测试：上传截图 → 填写文案 → 截预览图 → 逐尺寸导出并校验像素
import { chromium } from 'playwright-core'
import { mkdirSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const OUT = resolve(ROOT, '.smoke')
mkdirSync(OUT, { recursive: true })

const screenshots = readdirSync(ROOT)
  .filter((f) => f.endsWith('.png') && f.startsWith('微信图片'))
  .map((f) => resolve(ROOT, f))
if (screenshots.length === 0) throw new Error('未找到测试截图')

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto('http://localhost:5173')
await page.waitForSelector('text=拖拽或点击上传 iPhone 截图')

// 上传全部测试截图
await page.locator('input[type=file]').last().setInputFiles(screenshots)
await page.waitForSelector('canvas')
await page.waitForTimeout(500)

// 填写文案、切换背景预设
await page.fill('input[placeholder^="标题"]', '一键连接，畅享全球网络')
await page.fill('input[placeholder^="副标题"]', '规则 / 全局 / 直连，随心切换')
await page.locator('button[title="深海蓝"]').click()
await page.locator('button:has-text("将背景与外壳应用到全部")').click()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/ui.png` })

// 逐尺寸导出并校验
const sizes = ['1242x2688', '1284x2778', '1290x2796', '1320x2868']
for (const id of sizes) {
  await page.selectOption('select >> nth=0', id)
  await page.waitForTimeout(200)
  const downloadPromise = page.waitForEvent('download')
  await page.locator('button:has-text("导出当前")').click()
  const download = await downloadPromise
  const path = `${OUT}/${await download.suggestedFilename()}`
  await download.saveAs(path)
  const info = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path]).toString()
  const w = info.match(/pixelWidth: (\d+)/)[1]
  const h = info.match(/pixelHeight: (\d+)/)[1]
  const ok = `${w}x${h}` === id
  console.log(`${ok ? 'PASS' : 'FAIL'} 导出 ${id} → 实际 ${w}x${h} (${path.split('/').pop()})`)
  if (!ok) process.exitCode = 1
}

// 多图 zip 导出
const zipPromise = page.waitForEvent('download')
await page.locator('button:has-text("导出全部")').click()
const zip = await zipPromise
await zip.saveAs(`${OUT}/all.zip`)
const list = execFileSync('unzip', ['-l', `${OUT}/all.zip`]).toString()
const fileCount = (list.match(/\.png/g) || []).length
console.log(`${fileCount === screenshots.length ? 'PASS' : 'FAIL'} zip 内含 ${fileCount}/${screenshots.length} 张图`)
if (fileCount !== screenshots.length) process.exitCode = 1

if (errors.length) {
  console.log('FAIL 控制台错误:', errors)
  process.exitCode = 1
} else {
  console.log('PASS 无控制台错误')
}
await browser.close()
