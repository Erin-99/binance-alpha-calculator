'use client';

import React, { useState } from 'react';

// 币安Alpha积分规则

// 交易量积分规则 (购买Alpha代币)
const TRADING_VOLUME_POINTS = [
  { points: 1, minAmount: 2, maxAmount: 4, label: '$2' },
  { points: 2, minAmount: 4, maxAmount: 8, label: '$4' },
  { points: 3, minAmount: 8, maxAmount: 16, label: '$8' },
  { points: 4, minAmount: 16, maxAmount: 32, label: '$16' },
  { points: 5, minAmount: 32, maxAmount: 64, label: '$32' },
  { points: 6, minAmount: 64, maxAmount: 128, label: '$64' },
  { points: 7, minAmount: 128, maxAmount: 256, label: '$128' },
  { points: 8, minAmount: 256, maxAmount: 512, label: '$256' },
  { points: 9, minAmount: 512, maxAmount: 1024, label: '$512' },
  { points: 10, minAmount: 1024, maxAmount: 2048, label: '$1024' },
  { points: 11, minAmount: 2048, maxAmount: 4096, label: '$2048' },
  { points: 12, minAmount: 4096, maxAmount: 8192, label: '$4096' },
  { points: 13, minAmount: 8192, maxAmount: 16384, label: '$8192' },
  { points: 14, minAmount: 16384, maxAmount: 32768, label: '$16384' },
  { points: 15, minAmount: 32768, maxAmount: 65536, label: '$32768' },
];

// 余额积分规则 (持有资产)
const BALANCE_POINTS = [
  { points: 1, minAmount: 100, maxAmount: 1000, label: '$100 - $1000' },
  { points: 2, minAmount: 1000, maxAmount: 10000, label: '$1000 - $10000' },
  { points: 3, minAmount: 10000, maxAmount: 100000, label: '$10000 - $100000' },
  { points: 4, minAmount: 100000, maxAmount: Infinity, label: '$100000+' },
];

// 模拟Alpha活动数据
const MOCK_ALPHA_DATA = [
  { date: '2024-01-15', tradingVolume: 32, balance: 2500 },
  { date: '2024-01-14', tradingVolume: 16, balance: 2500 },
  { date: '2024-01-13', tradingVolume: 64, balance: 2500 },
  { date: '2024-01-12', tradingVolume: 8, balance: 2500 },
  { date: '2024-01-11', tradingVolume: 128, balance: 2500 },
];

// Alpha积分计算器
class AlphaCalculator {
  // 根据交易量计算积分
  static calculateTradingVolumePoints(amount: number): number {
    if (amount < 2) return 0;
    
    // 基于公式：$2=1分, $4=2分, $8=3分... 即 积分 = log₂(金额)
    const points = Math.floor(Math.log2(amount));
    return Math.max(0, Math.min(points, 15)); // 最高15分
  }
  
  // 根据余额计算积分
  static calculateBalancePoints(balance: number): number {
    if (balance >= 100000) return 4;
    if (balance >= 10000) return 3;
    if (balance >= 1000) return 2;
    if (balance >= 100) return 1;
    return 0;
  }
  
  // 计算达到目标交易积分所需的金额
  static calculateRequiredTradingAmount(targetPoints: number): number {
    if (targetPoints <= 0) return 0;
    if (targetPoints === 1) return 2;
    return Math.pow(2, targetPoints);
  }
  
  // 计算交易计划
  static calculateTradingPlan(
    userBalance: number,
    targetTotalPoints: number,
    currentTradingVolume: number = 0
  ) {
    const balancePoints = this.calculateBalancePoints(userBalance);
    const neededTradingPoints = Math.max(0, targetTotalPoints - balancePoints);
    const requiredTradingAmount = this.calculateRequiredTradingAmount(neededTradingPoints);
    const remainingTradingAmount = Math.max(0, requiredTradingAmount - currentTradingVolume);
    const singleTradeAmount = userBalance * 2;
    const requiredTrades = singleTradeAmount > 0 ? 
      Math.ceil(remainingTradingAmount / singleTradeAmount) : 0;
    const recommendedTrades = requiredTrades > 0 ? requiredTrades + 1 : 0;
    const estimatedDays = Math.ceil(recommendedTrades / 25);
    const currentTradingPoints = this.calculateTradingVolumePoints(currentTradingVolume);
    const currentTotalPoints = currentTradingPoints + balancePoints;
    
    return {
      userBalance,
      targetTotalPoints,
      balancePoints,
      neededTradingPoints,
      currentTradingPoints,
      currentTotalPoints,
      requiredTradingAmount,
      remainingTradingAmount,
      singleTradeAmount,
      requiredTrades,
      recommendedTrades,
      estimatedDays,
      canAchieve: userBalance > 0 && targetTotalPoints > 0,
      isCompleted: currentTotalPoints >= targetTotalPoints
    };
  }
}

export default function HomePage() {
  const [userBalance, setUserBalance] = useState<number>(0);
  const [targetTotalPoints, setTargetTotalPoints] = useState<number>(0);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  
  // 翻译对象
  const translations = {
    zh: {
      title: '币安Alpha积分计算器',
      subtitle: '根据本金计算达到目标积分等级所需的交易次数',
      targetPoints: '目标积分',
      currentBalance: '当前余额 (USD)',
      enterTarget: '输入目标积分',
      enterBalance: '输入当前余额',
      tradingTimes: '交易次数',
      congratulations: '恭喜！',
      targetReached: '您已达到目标积分！',
      pointsRulesRef: '积分规则说明',
      balancePoints: '余额积分',
      tradingPoints: '交易积分',
      formula: '计算公式',
      noMaxLimit: '无上限',
      unlimitedPoints: '无限积分',
      noteTrading: '买+卖算一次交易',
      noteExtra: '考虑磨损因素，建议多做1-2次交易防止卡线，或者当前余额扣除磨损之后计算',
      waitingCalculation: '等待计算...',
      pleaseEnterValues: '请输入目标积分和当前余额',
      point: '分',
      points: '分'
    },
    en: {
      title: 'Binance Alpha Points Calculator',
      subtitle: 'Calculate required trading times to reach target points based on your balance',
      targetPoints: 'Target Points',
      currentBalance: 'Current Balance (USD)',
      enterTarget: 'Enter target',
      enterBalance: 'Enter your current balance',
      tradingTimes: 'Trading Times',
      congratulations: 'Congratulations!',
      targetReached: 'You\'ve already reached your target!',
      pointsRulesRef: 'Points Rules Reference',
      balancePoints: 'Balance Points',
      tradingPoints: 'Trading Points',
      formula: 'Formula',
      noMaxLimit: 'No maximum limit',
      unlimitedPoints: 'Unlimited points',
      noteTrading: 'Buy + Sell = 1 trade',
      noteExtra: 'Consider slippage, suggest 1-2 extra trades to avoid threshold issues, or calculate with current balance minus slippage costs',
      waitingCalculation: 'Waiting for calculation...',
      pleaseEnterValues: 'Please enter target points and current balance',
      point: 'point',
      points: 'points'
    }
  };

  const t = translations[language];
  
  // 实时计算
  const result = AlphaCalculator.calculateTradingPlan(
    userBalance, 
    targetTotalPoints
  );

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e8eaf6 100%)',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
  };

  const innerContainerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '48px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '16px'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '18px',
    color: '#718096'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    marginBottom: '48px'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.5)'
  };

  const cardTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px'
  };

  const iconStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    fontSize: '20px'
  };

  const cardTitleTextStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a202c'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontSize: '28px',
    fontWeight: '300',
    textAlign: 'center',
    color: '#1a202c',
    background: '#f7fafc',
    border: 'none',
    borderRadius: '16px',
    padding: '20px',
    outline: 'none',
    transition: 'all 0.3s ease'
  };

  const circularCardStyle: React.CSSProperties = {
    ...cardStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  };

  const circularElementStyle: React.CSSProperties = {
    width: '160px',
    height: '160px',
    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)'
  };

  const innerCircleStyle: React.CSSProperties = {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const coreCircleStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontSize: '24px'
  };

  const requirementItemStyle: React.CSSProperties = {
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px'
  };

  const blueItemStyle: React.CSSProperties = {
    ...requirementItemStyle,
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    border: '1px solid #93c5fd'
  };

  const orangeItemStyle: React.CSSProperties = {
    ...requirementItemStyle,
    background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
    border: '1px solid #fb923c'
  };

  const greenItemStyle: React.CSSProperties = {
    ...requirementItemStyle,
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    border: '1px solid #6ee7b7'
  };

  const itemLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px'
  };

  const itemValueStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '20px',
    padding: '20px 64px',
    borderRadius: '24px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 25px 50px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '0 auto'
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
    cursor: 'not-allowed',
    boxShadow: 'none'
  };

  const resultCardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0 25px 50px rgba(139, 92, 246, 0.3)',
    marginTop: '48px'
  };

  const resultGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '24px',
    marginTop: '32px'
  };

  const resultItemStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)'
  };

  return (
    <div style={containerStyle}>
      <div style={innerContainerStyle}>
        
        {/* Language Toggle */}
        <div style={{textAlign: 'right', marginBottom: '24px'}}>
          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginLeft: 'auto',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>🌐</span>
            <span>{language === 'zh' ? 'English' : '中文'}</span>
          </button>
        </div>

        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>{t.title}</h1>
          <p style={subtitleStyle}>{t.subtitle}</p>
        </div>

        {/* Top Input Cards */}
        <div style={gridStyle}>
          
          {/* Target Points Card */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={{...iconStyle, background: '#dbeafe', color: '#1d4ed8'}}>🎯</div>
              <h2 style={cardTitleTextStyle}>{t.targetPoints}</h2>
            </div>
            <input
              type="number"
              value={targetTotalPoints || ''}
              onChange={(e) => setTargetTotalPoints(Number(e.target.value))}
              placeholder={t.enterTarget}
              style={inputStyle}
              min="1"
              max="19"
            />
          </div>

          {/* Current Balance Card */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={{...iconStyle, background: '#d1fae5', color: '#065f46'}}>💰</div>
              <h2 style={cardTitleTextStyle}>{t.currentBalance}</h2>
            </div>
            <input
              type="number"
              value={userBalance || ''}
              onChange={(e) => setUserBalance(Number(e.target.value))}
              placeholder={t.enterBalance}
              style={inputStyle}
              min="0"
            />
          </div>
        </div>

        {/* Trading Result */}
        <div style={{
          ...cardStyle,
          textAlign: 'center',
          background: userBalance > 0 && targetTotalPoints > 0 && result.canAchieve 
            ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          color: userBalance > 0 && targetTotalPoints > 0 && result.canAchieve ? 'white' : '#64748b',
          marginTop: '32px',
          border: userBalance > 0 && targetTotalPoints > 0 && result.canAchieve 
            ? 'none' 
            : '2px dashed #cbd5e1'
        }}>
          {userBalance > 0 && targetTotalPoints > 0 && result.canAchieve ? (
            result.isCompleted ? (
              <div>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>🎉</div>
                <h3 style={{fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0'}}>{t.congratulations}</h3>
                <p style={{fontSize: '18px', opacity: 0.9, margin: 0}}>{t.targetReached}</p>
              </div>
            ) : (
              <div>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>📈</div>
                <div style={{fontSize: '64px', fontWeight: '300', marginBottom: '8px'}}>{result.requiredTrades}</div>
                <div style={{fontSize: '24px', fontWeight: '600', opacity: 0.9, marginBottom: '24px'}}>{t.tradingTimes}</div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  textAlign: 'left'
                }}>
                  <div style={{marginBottom: '8px'}}>• {t.noteTrading}</div>
                  <div>• {t.noteExtra}</div>
                </div>
              </div>
            )
          ) : (
            <div style={{padding: '40px 20px'}}>
              <div style={{fontSize: '48px', marginBottom: '16px', opacity: 0.3}}>📊</div>
              <div style={{fontSize: '24px', fontWeight: '500', marginBottom: '8px', opacity: 0.7}}>
                {t.waitingCalculation}
              </div>
              <div style={{fontSize: '16px', opacity: 0.5}}>
                {t.pleaseEnterValues}
              </div>
            </div>
          )}
        </div>

        {/* Points Rules Reference */}
        <div style={{
          ...cardStyle,
          marginTop: '48px',
          background: 'rgba(255, 255, 255, 0.95)'
        }}>
          <h3 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1a202c',
            marginBottom: '32px',
            textAlign: 'center'
          }}>{t.pointsRulesRef}</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px'
          }}>
            
            {/* Balance Points */}
            <div>
              <h4 style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#065f46',
                marginBottom: '20px'
              }}>{t.balancePoints}</h4>
              
              <div style={{
                background: '#f0fdfa',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #a7f3d0'
              }}>
                <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #d1fae5'}}>
                  <span style={{color: '#064e3b', fontSize: '16px'}}>$100 - $1,000</span>
                  <span style={{color: '#065f46', fontWeight: 'bold'}}>1 {t.point}</span>
                </div>
                <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #d1fae5'}}>
                  <span style={{color: '#064e3b', fontSize: '16px'}}>$1,000 - $10,000</span>
                  <span style={{color: '#065f46', fontWeight: 'bold'}}>2 {t.points}</span>
                </div>
                <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #d1fae5'}}>
                  <span style={{color: '#064e3b', fontSize: '16px'}}>$10,000 - $100,000</span>
                  <span style={{color: '#065f46', fontWeight: 'bold'}}>3 {t.points}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0'}}>
                  <span style={{color: '#064e3b', fontSize: '16px'}}>$100,000+</span>
                  <span style={{color: '#065f46', fontWeight: 'bold'}}>4 {t.points}</span>
                </div>
              </div>
            </div>

            {/* Trading Points */}
            <div>
              <h4 style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#1d4ed8',
                marginBottom: '20px'
              }}>{t.tradingPoints}</h4>
              
              <div style={{
                background: '#eff6ff',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #93c5fd'
              }}>
                <div style={{marginBottom: '12px', textAlign: 'center', padding: '8px', background: '#dbeafe', borderRadius: '6px'}}>
                  <div style={{color: '#1e3a8a', fontSize: '12px', fontWeight: '600', marginBottom: '2px'}}>{t.formula}</div>
                  <div style={{color: '#1d4ed8', fontSize: '14px', fontWeight: 'bold'}}>floor(log₂(volume))</div>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 8px', fontSize: '12px'}}>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1e3a8a'}}>$2 → 1{t.point}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1d4ed8'}}>$4 → 2{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1e3a8a'}}>$8 → 3{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1d4ed8'}}>$16 → 4{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1e3a8a'}}>$32 → 5{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1d4ed8'}}>$64 → 6{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1e3a8a'}}>$128 → 7{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1d4ed8'}}>$256 → 8{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1e3a8a'}}>$512 → 9{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1d4ed8'}}>$1K → 10{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1e3a8a'}}>$2K → 11{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1d4ed8'}}>$4K → 12{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1e3a8a'}}>$8K → 13{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1d4ed8'}}>$16K → 14{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1e3a8a'}}>$32K → 15{t.points}</span>
                  </div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#1d4ed8'}}>$65K → 16{t.points}</span>
                  </div>
                  <div></div>
                  <div style={{textAlign: 'center', padding: '4px 2px'}}>
                    <span style={{color: '#64748b', fontSize: '11px'}}>...</span>
                  </div>
                </div>
                
                <div style={{marginTop: '12px', padding: '8px', background: '#f8fafc', borderRadius: '6px', textAlign: 'center'}}>
                  <span style={{color: '#1e3a8a', fontSize: '11px', fontWeight: '500'}}>{t.noMaxLimit} - {t.unlimitedPoints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 