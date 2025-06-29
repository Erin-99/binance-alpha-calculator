# 币安Alpha积分跟踪系统

这是一个自动抓取币安交易数据并计算Alpha积分的系统。专门针对Alpha交易计划设计，只统计买入交易量的两倍作为积分。

## 功能特点

- ✅ 自动同步币安交易数据
- ✅ 计算Alpha积分（买入量 × 2）
- ✅ Alpha积分等级系统（1-20级）
- ✅ 本金交易次数计算器
- ✅ 每日数据统计和汇总
- ✅ 定时任务自动执行（每天2次）
- ✅ 简洁的数据展示界面
- ✅ 安全的API密钥管理

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma
- **定时任务**: node-cron
- **API**: 币安官方API

## 安装步骤

### 1. 克隆项目
\`\`\`bash
git clone <your-repo>
cd binance-alpha-tracker
\`\`\`

### 2. 安装依赖
\`\`\`bash
npm install
\`\`\`

### 3. 配置环境变量
创建 \`.env.local\` 文件：
\`\`\`env
# 币安API配置（必需）
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_SECRET_KEY=your_binance_secret_key_here

# 数据库配置
DATABASE_URL="file:./dev.db"
\`\`\`

### 4. 获取币安API密钥

1. 登录币安官网
2. 进入【个人中心】→【API管理】
3. 创建新的API Key
4. **重要设置**：
   - ✅ 启用"读取"权限
   - ❌ 关闭"交易"权限（安全考虑）
   - ❌ 关闭"提现"权限
   - 建议设置IP白名单

### 5. 初始化数据库
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 6. 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

## 使用方法

### 手动同步数据
访问：\`http://localhost:3000/api/sync-alpha\` (POST请求)

或使用curl：
\`\`\`bash
curl -X POST http://localhost:3000/api/sync-alpha
\`\`\`

### 启动定时任务
\`\`\`bash
node scripts/sync-cron.js
\`\`\`

定时任务将在每天09:00和21:00自动执行数据同步。

### 查看统计数据
访问：\`http://localhost:3000/api/sync-alpha\` (GET请求)

## Alpha积分计算规则

- **统计范围**: 只统计状态为 \`FILLED\` 的成功交易
- **计算公式**: \`Alpha积分 = 买入数量 × 2\`
- **交易方向**: 只计算 \`BUY\` 订单的数量
- **时间维度**: 按日汇总统计

### 示例
\`\`\`
日期: 2024-01-15
买入交易:
- BTC: 0.1 BTC
- ETH: 2.5 ETH
- USDT买入总量: 0.1 + 2.5 = 2.6

Alpha积分 = 2.6 × 2 = 5.2 分
\`\`\`

## Alpha积分等级系统

### 等级表

| 等级 | 所需交易金额 | 等级 | 所需交易金额 |
|------|-------------|------|-------------|
| 1级  | 2 USDT      | 11级 | 2,048 USDT  |
| 2级  | 4 USDT      | 12级 | 4,096 USDT  |
| 3级  | 8 USDT      | 13级 | 8,192 USDT  |
| 4级  | 16 USDT     | 14级 | 16,384 USDT |
| 5级  | 32 USDT     | 15级 | 32,768 USDT ⭐ |
| 6级  | 64 USDT     | 16级 | 65,536 USDT 🎯 |
| 7级  | 128 USDT    | 17级 | 131,072 USDT |
| 8级  | 256 USDT    | 18级 | 262,144 USDT |
| 9级  | 512 USDT    | 19级 | 524,288 USDT |
| 10级 | 1,024 USDT  | 20级 | 1,048,576 USDT |

### 计算公式
- **积分等级 = log₂(交易金额)**
- **所需金额 = 2^等级**

### 交易次数计算器

#### 快速测试
\`\`\`bash
# 查看测试案例和等级表
npm run calculate

# 交互式计算器
npm run calc
\`\`\`

#### 使用示例

**案例1: 本金100 USDT，目标10级**
\`\`\`
目标: 10级 (需要1,024 USDT)
本金: 100 USDT
交易次数: 11次 (1024 ÷ 100 = 10.24，向上取整)
预计时间: 6天 (每天2次交易)
\`\`\`

**案例2: 本金500 USDT，目标12级**
\`\`\`
目标: 12级 (需要4,096 USDT)  
本金: 500 USDT
交易次数: 9次 (4096 ÷ 500 = 8.19，向上取整)
预计时间: 5天 (每天2次交易)
\`\`\`

**案例3: 本金50 USDT，目标15级**
\`\`\`
目标: 15级 (需要32,768 USDT)
本金: 50 USDT  
交易次数: 656次
预计时间: 328天 (建议增加本金或降低目标等级)
\`\`\`

### 推荐策略

| 本金范围 | 推荐目标等级 | 预计时间 |
|----------|-------------|----------|
| 50-100 USDT | 5-7级 | 1-7天 |
| 100-500 USDT | 8-10级 | 3-15天 |
| 500-1000 USDT | 10-12级 | 5-20天 |
| 1000+ USDT | 12-15级 | 10-35天 |

## API接口

### POST /api/sync-alpha
同步最新交易数据并计算Alpha积分

**响应示例**:
\`\`\`json
{
  "success": true,
  "message": "数据同步成功",
  "data": {
    "newTrades": 15,
    "updatedStats": 3,
    "latestAlphaPoints": 120.5
  }
}
\`\`\`

### GET /api/sync-alpha
获取Alpha积分统计数据

**响应示例**:
\`\`\`json
{
  "success": true,
  "data": {
    "totalAlphaPoints": 1250.8,
    "dailyStats": [
      {
        "date": "2024-01-15",
        "alphaPoints": 120.5,
        "totalBuyQty": 60.25,
        "tradeCount": 8
      }
    ],
    "summary": {
      "totalTrades": 245,
      "totalBuyVolume": 625.4,
      "avgDailyAlpha": 41.69
    }
  }
}
\`\`\`

### POST /api/calculate-plan
计算交易计划和所需次数

**请求参数**:
\`\`\`json
{
  "principalAmount": 100,
  "targetLevel": 10,
  "currentTotalAmount": 0,
  "maxDays": 30
}
\`\`\`

**响应示例**:
\`\`\`json
{
  "success": true,
  "data": {
    "tradingPlan": {
      "targetLevel": 10,
      "requiredAmount": 1024,
      "principalAmount": 100,
      "requiredTrades": 11,
      "canAchieve": true,
      "suggestions": [
        "需要进行11次交易达到10级",
        "预计需要6天完成（每天2次交易）"
      ]
    },
    "currentLevelInfo": {
      "currentLevel": 0,
      "currentAmount": 0,
      "nextLevel": 1,
      "nextLevelAmount": 2,
      "progressPercentage": 0
    },
    "optimizedStrategy": {
      "strategy": "standard",
      "dailyTrades": 1,
      "tradeAmount": 100,
      "estimatedDays": 6,
      "feasible": true
    },
    "recommendedLevels": [5, 7, 8]
  }
}
\`\`\`

### GET /api/calculate-plan
获取积分等级表和使用说明

## 数据库结构

### Trade表
存储所有交易记录
\`\`\`sql
- orderId: 订单ID (唯一)
- symbol: 交易对
- side: 交易方向 (BUY/SELL)
- executedQty: 执行数量
- status: 订单状态
- time: 交易时间
\`\`\`

### AlphaStats表
存储每日Alpha积分统计
\`\`\`sql
- date: 日期 (唯一)
- totalBuyQty: 当日总买入量
- alphaPoints: Alpha积分
- tradeCount: 交易笔数
\`\`\`

## 部署建议

### 开发环境
- 使用SQLite数据库
- 本地运行定时任务

### 生产环境
- 使用PostgreSQL数据库
- 部署到Vercel + Railway/Supabase
- 使用Vercel Cron Jobs或外部定时任务

## 注意事项

1. **API限制**: 币安API有频率限制，建议每小时同步1-2次
2. **数据安全**: API密钥具有读取权限，请妥善保管
3. **历史数据**: 首次同步会获取最近30天的数据
4. **时区设置**: 定时任务使用Asia/Shanghai时区

## 故障排除

### 常见错误

**API连接失败**
- 检查API密钥是否正确
- 确认网络连接正常
- 验证IP白名单设置

**数据库错误**
- 运行 \`npx prisma db push\` 重新初始化
- 检查DATABASE_URL配置

**权限错误**
- 确保API Key开启了"读取"权限
- 检查币安账户状态

## 开发说明

项目采用模块化设计：
- \`lib/binance-client.ts\`: 币安API客户端
- \`lib/alpha-calculator.ts\`: Alpha积分计算逻辑
- \`app/api/sync-alpha/\`: API路由
- \`scripts/sync-cron.js\`: 定时任务脚本

## 联系方式

如有问题请提交Issue或联系开发者。 