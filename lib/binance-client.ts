import { createHmac } from 'crypto';

interface BinanceConfig {
  apiKey: string;
  secretKey: string;
  baseURL?: string;
}

interface BinanceOrder {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice: string;
  icebergQty: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  workingTime: number;
  origQuoteOrderQty: string;
  selfTradePreventionMode: string;
}

export class BinanceClient {
  private config: BinanceConfig;
  
  constructor(config: BinanceConfig) {
    this.config = {
      baseURL: 'https://api.binance.com',
      ...config
    };
  }

  // 生成签名
  private createSignature(queryString: string): string {
    return createHmac('sha256', this.config.secretKey)
      .update(queryString)
      .digest('hex');
  }

  // 获取所有订单历史
  async getAllOrders(symbol?: string, limit = 1000): Promise<BinanceOrder[]> {
    const timestamp = Date.now();
    let queryString = `timestamp=${timestamp}&limit=${limit}`;
    
    if (symbol) {
      queryString += `&symbol=${symbol}`;
    }
    
    const signature = this.createSignature(queryString);
    const url = `${this.config.baseURL}/api/v3/allOrders?${queryString}&signature=${signature}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-MBX-APIKEY': this.config.apiKey
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Binance API Error: ${response.status} - ${error}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('获取订单数据失败:', error);
      throw error;
    }
  }

  // 获取指定时间范围的订单
  async getOrdersByTimeRange(
    startTime: number, 
    endTime?: number, 
    symbol?: string
  ): Promise<BinanceOrder[]> {
    const timestamp = Date.now();
    let queryString = `timestamp=${timestamp}&startTime=${startTime}`;
    
    if (endTime) {
      queryString += `&endTime=${endTime}`;
    }
    
    if (symbol) {
      queryString += `&symbol=${symbol}`;
    }
    
    const signature = this.createSignature(queryString);
    const url = `${this.config.baseURL}/api/v3/allOrders?${queryString}&signature=${signature}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-MBX-APIKEY': this.config.apiKey
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Binance API Error: ${response.status} - ${error}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('获取指定时间范围订单失败:', error);
      throw error;
    }
  }

  // 测试API连接
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/v3/ping`);
      return response.ok;
    } catch (error) {
      console.error('API连接测试失败:', error);
      return false;
    }
  }

  // 获取账户信息（用于验证API权限）
  async getAccountInfo() {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = this.createSignature(queryString);
    
    const url = `${this.config.baseURL}/api/v3/account?${queryString}&signature=${signature}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-MBX-APIKEY': this.config.apiKey
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Binance API Error: ${response.status} - ${error}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('获取账户信息失败:', error);
      throw error;
    }
  }
} 