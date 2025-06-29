// Alpha积分等级表
export const ALPHA_LEVELS = [
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

export interface TradingPlan {
  targetLevel: number;
  requiredAmount: number;
  principalAmount: number;
  requiredTrades: number;
  tradeAmount: number;
  canAchieve: boolean;
  suggestions: string[];
}

export interface CurrentLevelInfo {
  currentLevel: number;
  currentAmount: number;
  nextLevel?: number;
  nextLevelAmount?: number;
  progressPercentage: number;
}

export class AlphaLevelCalculator {
  
  // 根据交易金额获取积分等级
  static getLevelByAmount(amount: number): number {
    if (amount < 2) return 0;
    
    // 使用对数计算：level = log2(amount)
    const level = Math.floor(Math.log2(amount));
    return Math.min(level, 20); // 最高20级
  }

  // 根据积分等级获取所需交易金额
  static getAmountByLevel(level: number): number {
    if (level < 1 || level > 20) return 0;
    return Math.pow(2, level);
  }

  // 获取当前积分等级信息
  static getCurrentLevelInfo(totalAmount: number): CurrentLevelInfo {
    const currentLevel = this.getLevelByAmount(totalAmount);
    const currentLevelAmount = this.getAmountByLevel(currentLevel);
    const nextLevel = currentLevel < 20 ? currentLevel + 1 : undefined;
    const nextLevelAmount = nextLevel ? this.getAmountByLevel(nextLevel) : undefined;
    
    let progressPercentage = 0;
    if (nextLevelAmount) {
      progressPercentage = ((totalAmount - currentLevelAmount) / (nextLevelAmount - currentLevelAmount)) * 100;
    } else {
      progressPercentage = 100; // 已达到最高级
    }

    return {
      currentLevel,
      currentAmount: totalAmount,
      nextLevel,
      nextLevelAmount,
      progressPercentage: Math.max(0, Math.min(100, progressPercentage))
    };
  }

  // 计算达到目标积分等级所需的交易次数
  static calculateTradingPlan(
    principalAmount: number,
    targetLevel: number,
    currentTotalAmount = 0
  ): TradingPlan {
    const requiredAmount = this.getAmountByLevel(targetLevel);
    const remainingAmount = Math.max(0, requiredAmount - currentTotalAmount);
    
    const suggestions: string[] = [];
    
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

    // 检查本金是否足够单次交易
    if (principalAmount < 1) {
      suggestions.push('建议本金至少1 USDT以上进行交易');
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
      }
    }

    return {
      targetLevel,
      requiredAmount,
      principalAmount,
      requiredTrades,
      tradeAmount: actualTradeAmount,
      canAchieve,
      suggestions
    };
  }

  // 计算多个目标等级的交易计划
  static calculateMultiLevelPlan(
    principalAmount: number,
    targetLevels: number[],
    currentTotalAmount = 0
  ) {
    return targetLevels.map(level => 
      this.calculateTradingPlan(principalAmount, level, currentTotalAmount)
    );
  }

  // 获取推荐的目标等级（基于本金）
  static getRecommendedLevels(principalAmount: number): number[] {
    const recommendations: number[] = [];
    
    // 根据本金推荐合理的目标等级
    if (principalAmount >= 1000) {
      recommendations.push(10, 12, 15); // 高本金推荐高等级
    } else if (principalAmount >= 100) {
      recommendations.push(8, 10, 12); // 中等本金
    } else if (principalAmount >= 10) {
      recommendations.push(5, 7, 8); // 低本金
    } else {
      recommendations.push(3, 4, 5); // 很低本金
    }
    
    return recommendations;
  }

  // 优化交易策略建议
  static getOptimizedStrategy(
    principalAmount: number,
    targetLevel: number,
    maxDays = 30
  ): {
    strategy: string;
    dailyTrades: number;
    tradeAmount: number;
    estimatedDays: number;
    feasible: boolean;
  } {
    const plan = this.calculateTradingPlan(principalAmount, targetLevel);
    const maxTrades = maxDays * 2; // 假设每天最多2次交易
    
    if (plan.requiredTrades <= maxTrades) {
      return {
        strategy: 'standard',
        dailyTrades: Math.ceil(plan.requiredTrades / maxDays),
        tradeAmount: principalAmount,
        estimatedDays: Math.ceil(plan.requiredTrades / 2),
        feasible: true
      };
    } else {
      // 需要增加单次交易金额
      const requiredAmount = this.getAmountByLevel(targetLevel);
      const optimizedTradeAmount = Math.ceil(requiredAmount / maxTrades);
      
      return {
        strategy: 'optimized',
        dailyTrades: 2,
        tradeAmount: optimizedTradeAmount,
        estimatedDays: maxDays,
        feasible: optimizedTradeAmount <= principalAmount * 2 // 假设可以2倍杠杆
      };
    }
  }
} 