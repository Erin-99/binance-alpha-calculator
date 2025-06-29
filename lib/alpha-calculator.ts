import { PrismaClient } from '@prisma/client';
import { BinanceClient } from './binance-client';

const prisma = new PrismaClient();

interface ProcessedTrade {
  orderId: string;
  symbol: string;
  side: string;
  origQty: number;
  executedQty: number;
  price: number;
  status: string;
  time: Date;
  updateTime: Date;
  quoteQty: number;
}

interface AlphaCalculation {
  date: string;
  totalBuyQty: number;
  alphaPoints: number;
  tradeCount: number;
  trades: ProcessedTrade[];
}

export class AlphaCalculator {
  private binanceClient: BinanceClient;

  constructor(apiKey: string, secretKey: string) {
    this.binanceClient = new BinanceClient({
      apiKey,
      secretKey
    });
  }

  // 处理原始订单数据
  private processOrderData(rawOrders: any[]): ProcessedTrade[] {
    return rawOrders
      .filter(order => order.status === 'FILLED') // 只处理成功的订单
      .map(order => ({
        orderId: order.orderId.toString(),
        symbol: order.symbol,
        side: order.side,
        origQty: parseFloat(order.origQty),
        executedQty: parseFloat(order.executedQty),
        price: parseFloat(order.price),
        status: order.status,
        time: new Date(order.time),
        updateTime: new Date(order.updateTime),
        quoteQty: parseFloat(order.cummulativeQuoteQty)
      }));
  }

  // 计算指定日期的Alpha积分
  calculateAlphaPoints(trades: ProcessedTrade[]): AlphaCalculation[] {
    const dailyStats = new Map<string, {
      totalBuyQty: number;
      tradeCount: number;
      trades: ProcessedTrade[];
    }>();

    // 按日期分组统计
    trades.forEach(trade => {
      const dateKey = trade.time.toISOString().split('T')[0];
      
      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, {
          totalBuyQty: 0,
          tradeCount: 0,
          trades: []
        });
      }
      
      const dayStats = dailyStats.get(dateKey)!;
      dayStats.trades.push(trade);
      dayStats.tradeCount++;
      
      // 只统计买入订单的数量
      if (trade.side === 'BUY') {
        dayStats.totalBuyQty += trade.executedQty;
      }
    });

    // 转换为结果格式
    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      totalBuyQty: stats.totalBuyQty,
      alphaPoints: stats.totalBuyQty * 2, // Alpha积分 = 买入量 * 2
      tradeCount: stats.tradeCount,
      trades: stats.trades
    }));
  }

  // 同步并保存交易数据
  async syncTradeData(): Promise<{
    newTrades: number;
    updatedStats: number;
    latestAlphaPoints: number;
  }> {
    try {
      console.log('开始同步币安交易数据...');
      
      // 获取最近的订单数据（最近30天）
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const orders = await this.binanceClient.getOrdersByTimeRange(thirtyDaysAgo);
      
      console.log(`获取到 ${orders.length} 条订单记录`);
      
      // 处理订单数据
      const processedTrades = this.processOrderData(orders);
      console.log(`处理了 ${processedTrades.length} 条成功交易`);

      // 保存交易数据到数据库
      let newTradesCount = 0;
      for (const trade of processedTrades) {
        const result = await prisma.trade.upsert({
          where: { orderId: trade.orderId },
          update: {
            ...trade,
            updatedAt: new Date()
          },
          create: trade
        });
        
        if (result.createdAt === result.updatedAt) {
          newTradesCount++;
        }
      }

      // 计算Alpha积分
      const alphaCalculations = this.calculateAlphaPoints(processedTrades);
      
      // 保存每日统计数据
      let updatedStatsCount = 0;
      for (const calc of alphaCalculations) {
        await prisma.alphaStats.upsert({
          where: { date: new Date(calc.date) },
          update: {
            totalBuyQty: calc.totalBuyQty,
            alphaPoints: calc.alphaPoints,
            tradeCount: calc.tradeCount,
            updatedAt: new Date()
          },
          create: {
            date: new Date(calc.date),
            totalBuyQty: calc.totalBuyQty,
            alphaPoints: calc.alphaPoints,
            tradeCount: calc.tradeCount
          }
        });
        updatedStatsCount++;
      }

      // 获取最新的Alpha积分
      const latestStats = await prisma.alphaStats.findFirst({
        orderBy: { date: 'desc' }
      });

      const result = {
        newTrades: newTradesCount,
        updatedStats: updatedStatsCount,
        latestAlphaPoints: latestStats?.alphaPoints || 0
      };

      console.log('同步完成:', result);
      return result;

    } catch (error) {
      console.error('同步数据失败:', error);
      throw error;
    }
  }

  // 获取Alpha积分统计
  async getAlphaStats(days = 30): Promise<{
    totalAlphaPoints: number;
    dailyStats: any[];
    summary: {
      totalTrades: number;
      totalBuyVolume: number;
      avgDailyAlpha: number;
    };
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await prisma.alphaStats.findMany({
      where: {
        date: {
          gte: startDate
        }
      },
      orderBy: { date: 'asc' }
    });

    const totalAlphaPoints = stats.reduce((sum, stat) => sum + stat.alphaPoints, 0);
    const totalTrades = stats.reduce((sum, stat) => sum + stat.tradeCount, 0);
    const totalBuyVolume = stats.reduce((sum, stat) => sum + stat.totalBuyQty, 0);
    const avgDailyAlpha = stats.length > 0 ? totalAlphaPoints / stats.length : 0;

    return {
      totalAlphaPoints,
      dailyStats: stats.map(stat => ({
        date: stat.date.toISOString().split('T')[0],
        alphaPoints: stat.alphaPoints,
        totalBuyQty: stat.totalBuyQty,
        tradeCount: stat.tradeCount
      })),
      summary: {
        totalTrades,
        totalBuyVolume,
        avgDailyAlpha
      }
    };
  }

  // 测试API连接
  async testConnection(): Promise<boolean> {
    return this.binanceClient.testConnection();
  }
} 