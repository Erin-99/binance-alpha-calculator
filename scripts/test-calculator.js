// Alpha积分等级计算器测试脚本

// Alpha积分等级表
const ALPHA_LEVELS = [
  { level: 1, requiredAmount: 2 },
  { level: 2, requiredAmount: 4 },
  { level: 3, requiredAmount: 8 },
  { level: 4, requiredAmount: 16 },
  { level: 5, requiredAmount: 32 },
  { level: 6, requiredAmount: 64 },
  { level: 7, requiredAmount: 128 },
  { level: 8, requiredAmount: 256 },
  { level: 9, requiredAmount: 512 },
  { level: 10, requiredAmount: 1024 },
  { level: 11, requiredAmount: 2048 },
  { level: 12, requiredAmount: 4096 },
  { level: 13, requiredAmount: 8192 },
  { level: 14, requiredAmount: 16384 },
  { level: 15, requiredAmount: 32768 },
  { level: 16, requiredAmount: 65536 },
  { level: 17, requiredAmount: 131072 },
  { level: 18, requiredAmount: 262144 },
  { level: 19, requiredAmount: 524288 },
  { level: 20, requiredAmount: 1048576 }
];

class AlphaLevelCalculator {
  
  // 根据交易金额获取积分等级
  static getLevelByAmount(amount) {
    if (amount < 2) return 0;
    
    // 使用对数计算：level = log2(amount)
    const level = Math.floor(Math.log2(amount));
    return Math.min(level, 20); // 最高20级
  }

  // 根据积分等级获取所需交易金额
  static getAmountByLevel(level) {
    if (level < 1 || level > 20) return 0;
    return Math.pow(2, level);
  }

  // 计算达到目标积分等级所需的交易次数
  static calculateTradingPlan(principalAmount, targetLevel, currentTotalAmount = 0) {
    const requiredAmount = this.getAmountByLevel(targetLevel);
    const remainingAmount = Math.max(0, requiredAmount - currentTotalAmount);
    
    const suggestions = [];
    
    if (principalAmount <= 0) {
      return {
        targetLevel,
        requiredAmount,
        principalAmount,
        requiredTrades: 0,
        tradeAmount: 0,
        canAchieve: false,
        suggestions: ['请输入有效的本金金额']
      };
    }

    if (targetLevel < 1 || targetLevel > 20) {
      return {
        targetLevel,
        requiredAmount: 0,
        principalAmount,
        requiredTrades: 0,
        tradeAmount: 0,
        canAchieve: false,
        suggestions: ['目标等级必须在1-20之间']
      };
    }

    // 如果已经达到目标等级
    if (currentTotalAmount >= requiredAmount) {
      return {
        targetLevel,
        requiredAmount,
        principalAmount,
        requiredTrades: 0,
        tradeAmount: 0,
        canAchieve: true,
        suggestions: ['已达到目标等级！']
      };
    }

    // 计算所需交易次数（假设每次交易都是买入，用完整本金）
    const requiredTrades = Math.ceil(remainingAmount / principalAmount);
    const actualTradeAmount = Math.min(principalAmount, remainingAmount);

    // 检查是否可以达成
    const canAchieve = principalAmount > 0;

    // 提供建议
    if (canAchieve) {
      if (requiredTrades === 1) {
        suggestions.push(`只需要1次交易即可达到${targetLevel}级`);
      } else {
        suggestions.push(`需要进行${requiredTrades}次交易达到${targetLevel}级`);
      }
      
      if (requiredTrades > 100) {
        suggestions.push('交易次数较多，建议增加单次交易金额');
      } else if (requiredTrades > 50) {
        suggestions.push('交易次数偏多，可考虑适当增加本金');
      }

      // 计算时间预估（假设每天2次交易）
      const estimatedDays = Math.ceil(requiredTrades / 2);
      if (estimatedDays > 30) {
        suggestions.push(`预计需要${estimatedDays}天完成（每天2次交易）`);
      } else if (estimatedDays > 1) {
        suggestions.push(`预计需要${estimatedDays}天完成（每天2次交易）`);
      } else {
        suggestions.push('1天内即可完成');
      }
    }

    return {
      targetLevel,
      requiredAmount,
      principalAmount,
      requiredTrades,
      tradeAmount: actualTradeAmount,
      canAchieve,
      remainingAmount,
      suggestions
    };
  }
}

// 测试函数
function runTests() {
  console.log('🚀 Alpha积分等级计算器测试');
  console.log('================================\n');

  // 显示积分等级表
  console.log('📊 积分等级表:');
  console.log('等级 | 所需交易金额(USDT)');
  console.log('-----|------------------');
  ALPHA_LEVELS.forEach(level => {
    const highlight = level.level === 15 ? ' ⭐' : level.level === 16 ? ' 🎯' : '';
    console.log(`${level.level.toString().padStart(2)} 级 | ${level.requiredAmount.toLocaleString().padStart(10)}${highlight}`);
  });
  console.log('');

  // 测试案例
  const testCases = [
    { principal: 100, target: 10, current: 0 },
    { principal: 500, target: 12, current: 0 },
    { principal: 50, target: 8, current: 0 },
    { principal: 1000, target: 15, current: 0 },
    { principal: 200, target: 10, current: 500 }, // 已有部分积分
  ];

  console.log('🧮 测试案例:');
  console.log('');

  testCases.forEach((testCase, index) => {
    console.log(`测试 ${index + 1}: 本金${testCase.principal} USDT，目标${testCase.target}级${testCase.current > 0 ? `，当前已有${testCase.current} USDT交易量` : ''}`);
    console.log('----------------------------------------');
    
    const result = AlphaLevelCalculator.calculateTradingPlan(
      testCase.principal, 
      testCase.target, 
      testCase.current
    );
    
    if (result.canAchieve) {
      console.log(`✅ 可以达成目标`);
      console.log(`📋 计划详情:`);
      console.log(`   - 目标等级: ${result.targetLevel}级`);
      console.log(`   - 所需总金额: ${result.requiredAmount.toLocaleString()} USDT`);
      console.log(`   - 还需交易: ${result.remainingAmount.toLocaleString()} USDT`);
      console.log(`   - 交易次数: ${result.requiredTrades}次`);
      console.log(`   - 单次金额: ${result.principalAmount} USDT`);
      
      console.log(`💡 建议:`);
      result.suggestions.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
    } else {
      console.log(`❌ 无法达成目标`);
      result.suggestions.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
    }
    console.log('');
  });

  // 显示不同本金的推荐等级
  console.log('💰 不同本金的推荐目标等级:');
  console.log('');
  
  const principalAmounts = [50, 100, 200, 500, 1000, 2000];
  
  principalAmounts.forEach(principal => {
    console.log(`本金 ${principal} USDT:`);
    
    // 计算1个月内能达到的最高等级（60次交易）
    const maxAmount = principal * 60;
    const maxLevel = AlphaLevelCalculator.getLevelByAmount(maxAmount);
    
    // 推荐几个合理的目标等级
    const recommendLevels = [];
    for (let level = Math.max(1, maxLevel - 2); level <= Math.min(20, maxLevel + 1); level++) {
      const plan = AlphaLevelCalculator.calculateTradingPlan(principal, level);
      if (plan.canAchieve && plan.requiredTrades <= 60) {
        recommendLevels.push({
          level,
          trades: plan.requiredTrades,
          days: Math.ceil(plan.requiredTrades / 2)
        });
      }
    }
    
    recommendLevels.forEach(rec => {
      console.log(`   ${rec.level}级: ${rec.trades}次交易, 约${rec.days}天`);
    });
    console.log('');
  });
}

// 交互式计算器
function interactiveCalculator() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n🎯 交互式Alpha积分计算器');
  console.log('================================');
  
  rl.question('请输入本金金额(USDT): ', (principalStr) => {
    const principal = parseFloat(principalStr);
    
    if (!principal || principal <= 0) {
      console.log('❌ 请输入有效的本金金额');
      rl.close();
      return;
    }
    
    rl.question('请输入目标等级(1-20): ', (targetStr) => {
      const target = parseInt(targetStr);
      
      if (!target || target < 1 || target > 20) {
        console.log('❌ 请输入有效的目标等级(1-20)');
        rl.close();
        return;
      }
      
      rl.question('请输入当前交易总金额(USDT，可选，默认0): ', (currentStr) => {
        const current = parseFloat(currentStr) || 0;
        
        console.log('\n📊 计算结果:');
        console.log('================================');
        
        const result = AlphaLevelCalculator.calculateTradingPlan(principal, target, current);
        
        if (result.canAchieve) {
          console.log(`🎯 目标: ${result.targetLevel}级 (需要${result.requiredAmount.toLocaleString()} USDT)`);
          console.log(`💰 本金: ${result.principalAmount} USDT`);
          console.log(`📈 还需交易: ${result.remainingAmount.toLocaleString()} USDT`);
          console.log(`🔄 交易次数: ${result.requiredTrades}次`);
          console.log(`⏱️  预计时间: ${Math.ceil(result.requiredTrades / 2)}天 (每天2次交易)`);
          console.log('');
          console.log('💡 建议:');
          result.suggestions.forEach(suggestion => {
            console.log(`   • ${suggestion}`);
          });
        } else {
          console.log('❌ 无法达成目标:');
          result.suggestions.forEach(suggestion => {
            console.log(`   • ${suggestion}`);
          });
        }
        
        rl.close();
      });
    });
  });
}

// 主程序
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive') || args.includes('-i')) {
    interactiveCalculator();
  } else {
    runTests();
    console.log('💡 提示: 使用 --interactive 或 -i 参数可启动交互式计算器');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  AlphaLevelCalculator,
  ALPHA_LEVELS
}; 