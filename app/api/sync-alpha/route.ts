import { NextResponse } from 'next/server';
import { AlphaCalculator } from '@/lib/alpha-calculator';

export async function POST() {
  try {
    // 检查环境变量
    const apiKey = process.env.BINANCE_API_KEY;
    const secretKey = process.env.BINANCE_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { success: false, error: '请在环境变量中配置币安API密钥' },
        { status: 400 }
      );
    }

    // 创建Alpha计算器实例
    const calculator = new AlphaCalculator(apiKey, secretKey);

    // 测试API连接
    const isConnected = await calculator.testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: '无法连接到币安API' },
        { status: 500 }
      );
    }

    // 同步数据
    const syncResult = await calculator.syncTradeData();

    return NextResponse.json({
      success: true,
      message: '数据同步成功',
      data: syncResult
    });

  } catch (error: any) {
    console.error('数据同步失败:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '数据同步失败' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const apiKey = process.env.BINANCE_API_KEY;
    const secretKey = process.env.BINANCE_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { success: false, error: '请在环境变量中配置币安API密钥' },
        { status: 400 }
      );
    }

    const calculator = new AlphaCalculator(apiKey, secretKey);
    
    // 获取最近30天的Alpha统计
    const stats = await calculator.getAlphaStats(30);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '获取统计数据失败' 
      },
      { status: 500 }
    );
  }
} 