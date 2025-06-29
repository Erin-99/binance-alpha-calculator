import { NextRequest, NextResponse } from 'next/server';
import { AlphaLevelCalculator } from '@/lib/alpha-level-calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      principalAmount, 
      targetLevel, 
      currentTotalAmount = 0,
      maxDays = 30 
    } = body;

    // 验证输入参数
    if (!principalAmount || principalAmount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请输入有效的本金金额' 
        },
        { status: 400 }
      );
    }

    if (!targetLevel || targetLevel < 1 || targetLevel > 20) {
      return NextResponse.json(
        { 
          success: false, 
          error: '目标等级必须在1-20之间' 
        },
        { status: 400 }
      );
    }

    // 计算交易计划
    const tradingPlan = AlphaLevelCalculator.calculateTradingPlan(
      principalAmount,
      targetLevel,
      currentTotalAmount
    );

    // 获取当前等级信息
    const currentLevelInfo = AlphaLevelCalculator.getCurrentLevelInfo(currentTotalAmount);

    // 获取优化策略
    const optimizedStrategy = AlphaLevelCalculator.getOptimizedStrategy(
      principalAmount,
      targetLevel,
      maxDays
    );

    // 获取推荐等级
    const recommendedLevels = AlphaLevelCalculator.getRecommendedLevels(principalAmount);

    return NextResponse.json({
      success: true,
      data: {
        tradingPlan,
        currentLevelInfo,
        optimizedStrategy,
        recommendedLevels,
        levelTable: AlphaLevelCalculator.constructor.ALPHA_LEVELS || []
      }
    });

  } catch (error: any) {
    console.error('计算交易计划失败:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '计算失败' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 返回积分等级表和使用说明
    return NextResponse.json({
      success: true,
      data: {
        levelTable: [
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
        ],
        usage: {
          description: 'Alpha积分等级系统',
          formula: '积分等级 = log2(交易金额)',
          examples: [
            {
              description: '本金100 USDT，目标10级',
              calculation: '需要1024 USDT交易金额，约需10次交易'
            },
            {
              description: '本金500 USDT，目标12级',
              calculation: '需要4096 USDT交易金额，约需8次交易'
            }
          ]
        }
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '获取数据失败' 
      },
      { status: 500 }
    );
  }
} 