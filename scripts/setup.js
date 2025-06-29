const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 币安Alpha积分跟踪系统 - 安装向导');
console.log('=====================================\n');

// 检查 .env.local 文件
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('📝 创建环境变量文件...');
    
    const envContent = `# 币安API配置（必需）
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_SECRET_KEY=your_binance_secret_key_here

# 数据库配置
DATABASE_URL="file:./dev.db"
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local 文件已创建');
    console.log('⚠️  请编辑 .env.local 文件，填入你的币安API密钥\n');
    return false;
  } else {
    console.log('✅ .env.local 文件已存在\n');
    return true;
  }
}

// 初始化数据库
function initDatabase() {
  try {
    console.log('🗄️  初始化数据库...');
    
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma客户端生成完成');
    
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ 数据库初始化完成\n');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    return false;
  }
}

// 测试API连接
function testApiConnection() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  跳过API测试 - 请先配置环境变量\n');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('your_binance_api_key_here')) {
    console.log('⚠️  跳过API测试 - 请先配置真实的API密钥\n');
    return false;
  }
  
  console.log('🔗 API连接测试将在项目启动后进行\n');
  return true;
}

// 显示下一步操作
function showNextSteps() {
  console.log('🎉 安装完成！下一步操作：');
  console.log('================================');
  console.log('1. 配置币安API密钥：');
  console.log('   编辑 .env.local 文件，填入真实的API密钥');
  console.log('');
  console.log('2. 启动开发服务器：');
  console.log('   npm run dev');
  console.log('');
  console.log('3. 测试数据同步：');
  console.log('   curl -X POST http://localhost:3000/api/sync-alpha');
  console.log('');
  console.log('4. 启动定时任务：');
  console.log('   node scripts/sync-cron.js');
  console.log('');
  console.log('📖 详细文档请查看 README.md');
}

// 主安装流程
async function main() {
  try {
    const hasEnv = checkEnvFile();
    const dbSuccess = initDatabase();
    
    if (dbSuccess) {
      testApiConnection();
      showNextSteps();
    } else {
      console.log('❌ 安装未完成，请检查错误信息并重试');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 安装过程出错:', error.message);
    process.exit(1);
  }
}

// 运行安装
if (require.main === module) {
  main();
} 