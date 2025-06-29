const cron = require('node-cron');
const fetch = require('node-fetch');

// 定时任务配置
const SYNC_SCHEDULE = '0 9,21 * * *'; // 每天9点和21点执行
const API_ENDPOINT = 'http://localhost:3000/api/sync-alpha';

async function syncAlphaData() {
  try {
    console.log(`[${new Date().toISOString()}] 开始执行Alpha数据同步...`);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`[${new Date().toISOString()}] 同步成功:`, result.data);
      
      // 输出关键指标
      console.log(`- 新增交易: ${result.data.newTrades} 条`);
      console.log(`- 更新统计: ${result.data.updatedStats} 天`);
      console.log(`- 最新Alpha积分: ${result.data.latestAlphaPoints}`);
      
    } else {
      console.error(`[${new Date().toISOString()}] 同步失败:`, result.error);
    }
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 同步异常:`, error.message);
  }
}

// 启动定时任务
function startCronJob() {
  console.log('启动Alpha数据同步定时任务...');
  console.log(`计划: ${SYNC_SCHEDULE} (每天9点和21点)`);
  
  // 设置定时任务
  cron.schedule(SYNC_SCHEDULE, () => {
    syncAlphaData();
  }, {
    scheduled: true,
    timezone: "Asia/Shanghai"
  });
  
  // 立即执行一次
  console.log('立即执行一次数据同步...');
  syncAlphaData();
  
  console.log('定时任务已启动，按 Ctrl+C 停止');
}

// 如果直接运行此脚本
if (require.main === module) {
  startCronJob();
  
  // 优雅退出处理
  process.on('SIGINT', () => {
    console.log('\n正在停止定时任务...');
    process.exit(0);
  });
}

module.exports = {
  startCronJob,
  syncAlphaData
}; 