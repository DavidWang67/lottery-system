import React, { useState } from 'react';
import { Shuffle, RotateCcw, Trophy, Users, Settings } from 'lucide-react';

const LotterySystem = () => {
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(1000);
  const [drawCount, setDrawCount] = useState(6);
  const [minNumberInput, setMinNumberInput] = useState('1');
  const [maxNumberInput, setMaxNumberInput] = useState('1000');
  const [drawCountInput, setDrawCountInput] = useState('6');
  const [currentNumbers, setCurrentNumbers] = useState([]);
  const [absentNumbers, setAbsentNumbers] = useState([]);
  const [removedNumbers, setRemovedNumbers] = useState([]);
  const [allWinningNumbers, setAllWinningNumbers] = useState(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawHistory, setDrawHistory] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // 生成隨機號碼（排除已中獎號碼）
  const generateRandomNumbers = (count, min, max, exclude = new Set()) => {
    const availableNumbers = [];
    for (let i = min; i <= max; i++) {
      if (!exclude.has(i)) {
        availableNumbers.push(i);
      }
    }
    
    if (availableNumbers.length < count) {
      alert(`可用號碼不足！剩餘可抽號碼：${availableNumbers.length}個`);
      return [];
    }
    
    const selected = [];
    const shuffled = [...availableNumbers];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count).sort((a, b) => a - b);
  };

  // 進行抽獎
  const performDraw = () => {
    if (minNumber >= maxNumber) {
      alert('請確認號碼範圍設定正確');
      return;
    }
    
    if (drawCount <= 0) {
      alert('請設定正確的抽獎數量');
      return;
    }

    if (removedNumbers.length > 0) {
      alert('仍有不在現場的號碼尚未確認，請先完成本輪抽獎。');
      return;
    }

    setIsDrawing(true);
    
    // 模擬抽獎動畫效果
    setTimeout(() => {
      const excludeNumbers = new Set(allWinningNumbers);
      removedNumbers.forEach(num => excludeNumbers.add(num));
      const newNumbers = generateRandomNumbers(
        drawCount,
        minNumber,
        maxNumber,
        excludeNumbers
      );

      if (newNumbers.length > 0) {
        setCurrentNumbers(newNumbers);
        setAbsentNumbers([]);
      }
      
      setIsDrawing(false);
    }, 1000);
  };

  // 標記缺席號碼
  const markAbsent = (number) => {
    setAbsentNumbers(prev => (prev.includes(number) ? prev : [...prev, number]));
    setRemovedNumbers(prev => (prev.includes(number) ? prev : [...prev, number]));
    setCurrentNumbers(prev => prev.filter(n => n !== number));
  };

  // 重新抽取缺席號碼
  const redrawAbsent = () => {
    const absentCount = absentNumbers.length;
    if (absentCount === 0) return;

    setIsDrawing(true);
    
    setTimeout(() => {
      const excludeNumbers = new Set(allWinningNumbers);
      removedNumbers.forEach(num => excludeNumbers.add(num));
      absentNumbers.forEach(num => excludeNumbers.add(num));
      currentNumbers.forEach(num => excludeNumbers.add(num));
      const newNumbers = generateRandomNumbers(
        absentCount,
        minNumber,
        maxNumber,
        excludeNumbers
      );
      
      if (newNumbers.length > 0) {
        setCurrentNumbers(prev => [...prev, ...newNumbers]);
        setAbsentNumbers([]);
      }
      
      setIsDrawing(false);
    }, 1000);
  };

  // 確認本輪中獎號碼
  const confirmWinners = () => {
    if (currentNumbers.length === 0) {
      alert('請先進行抽獎');
      return;
    }

    const newWinners = [...currentNumbers];
    const currentAbsent = [...removedNumbers];
    
    // 將中獎號碼加入已中獎集合
    newWinners.forEach(num => allWinningNumbers.add(num));
    
    // 將不在現場號碼也加入已中獎集合（避免重複抽取，但在記錄中標示為不在現場）
    currentAbsent.forEach(num => allWinningNumbers.add(num));
    
    setDrawHistory(prev => [...prev, {
      round: currentRound,
      numbers: [...newWinners],
      absentNumbers: [...currentAbsent], // 記錄不在現場的號碼
      timestamp: new Date().toLocaleString('zh-TW')
    }]);
    
    setAllWinningNumbers(new Set(allWinningNumbers));
    setCurrentNumbers([]);
    setAbsentNumbers([]);
    setRemovedNumbers([]);
    setCurrentRound(prev => prev + 1);
    
    const absentMessage = currentAbsent.length > 0 ? `\n不在現場號碼：${currentAbsent.join(', ')}（已從號碼池中移除）` : '';
    alert(`第${currentRound}輪抽獎完成！中獎號碼：${newWinners.join(', ')}${absentMessage}`);
  };

  // 重置所有資料
  const resetAll = () => {
    if (confirm('確定要重置所有抽獎記錄嗎？')) {
      setCurrentNumbers([]);
      setAbsentNumbers([]);
      setRemovedNumbers([]);
      setAllWinningNumbers(new Set());
      setDrawHistory([]);
      setCurrentRound(1);
    }
  };

  const handleNumberInputChange = (value, setInput, setValue) => {
    setInput(value);

    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      setValue(Math.max(1, parsed));
    }
  };

  const handleNumberInputBlur = (inputValue, defaultValue, setInput, setValue) => {
    const trimmed = inputValue.trim();
    if (trimmed === '') {
      setInput(String(defaultValue));
      setValue(defaultValue);
      return;
    }

    const parsed = parseInt(trimmed, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setInput(String(defaultValue));
      setValue(defaultValue);
    } else {
      const normalized = String(parsed);
      setInput(normalized);
      setValue(parsed);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="text-yellow-400" />
            抽獎系統
            <Trophy className="text-yellow-400" />
          </h1>
          <p className="text-blue-200">第 {currentRound} 輪抽獎</p>
        </div>

        {/* 主要內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* 左側：設定和統計區域 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 設定區域 - 切換按鈕 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full p-4 text-left flex items-center justify-between text-white hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Settings className="text-blue-400" />
                  <span className="font-semibold">抽獎設定</span>
                </div>
                <div className={`transform transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>
              
              {showSettings && (
                <div className="p-4 pt-0 space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">最小號碼</label>
                    <input
                      type="number"
                      value={minNumberInput}
                      onChange={(e) => handleNumberInputChange(e.target.value, setMinNumberInput, setMinNumber)}
                      onBlur={() => handleNumberInputBlur(minNumberInput, 1, setMinNumberInput, setMinNumber)}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">最大號碼</label>
                    <input
                      type="number"
                      value={maxNumberInput}
                      onChange={(e) => handleNumberInputChange(e.target.value, setMaxNumberInput, setMaxNumber)}
                      onBlur={() => handleNumberInputBlur(maxNumberInput, 1, setMaxNumberInput, setMaxNumber)}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">抽獎數量</label>
                    <input
                      type="number"
                      value={drawCountInput}
                      onChange={(e) => handleNumberInputChange(e.target.value, setDrawCountInput, setDrawCount)}
                      onBlur={() => handleNumberInputBlur(drawCountInput, 1, setDrawCountInput, setDrawCount)}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 統計資訊 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-white/80 text-sm mb-1">累計中獎號碼</div>
                  <div className="text-3xl font-bold text-white">{allWinningNumbers.size}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/80 text-sm mb-1">剩餘可抽號碼</div>
                  <div className="text-3xl font-bold text-white">{maxNumber - minNumber + 1 - new Set([...allWinningNumbers, ...removedNumbers]).size}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/80 text-sm mb-1">已完成輪次</div>
                  <div className="text-3xl font-bold text-white">{drawHistory.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：本輪抽獎結果 */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 min-h-96">
              <h2 className="text-2xl font-bold text-white mb-6">本輪抽獎結果</h2>
              
              {/* 抽獎按鈕 */}
              <div className="text-center mb-8">
                <button
                  onClick={performDraw}
                  disabled={isDrawing}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
                >
                  <Shuffle className={isDrawing ? "animate-spin" : ""} />
                  {isDrawing ? '抽獎中...' : '開始抽獎'}
                </button>
              </div>

              {/* 抽獎結果顯示 */}
              {currentNumbers.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {currentNumbers.map((number, index) => (
                      <div key={index} className="relative">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-center transform hover:scale-105 transition-all duration-200 shadow-lg">
                          <div className="text-3xl font-bold text-white">{number}</div>
                        </div>
                        <button
                          onClick={() => markAbsent(number)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 text-sm font-bold flex items-center justify-center shadow-lg"
                          title="標記為不在現場"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={confirmWinners}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 mx-auto"
                    >
                      <Trophy size={24} />
                      確認中獎
                    </button>
                  </div>
                </div>
              )}

              {currentNumbers.length === 0 && !isDrawing && (
                <div className="text-center text-white/60 py-16">
                  <Trophy size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-xl">點擊上方按鈕開始抽獎</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 缺席號碼區域 */}
        {absentNumbers.length > 0 && (
          <div className="bg-red-500/20 backdrop-blur-md rounded-xl p-6 mb-6 border border-red-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">不在現場號碼</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              {absentNumbers.map((number, index) => (
                <div key={index} className="bg-red-500 rounded-lg p-4 text-center shadow-lg">
                  <div className="text-2xl font-bold text-white">{number}</div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={redrawAbsent}
                disabled={isDrawing}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 mx-auto"
              >
                <RotateCcw className={isDrawing ? "animate-spin" : ""} size={20} />
                重新抽取
              </button>
            </div>
          </div>
        )}

        {/* 歷史記錄 */}
        {drawHistory.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users />
                中獎記錄
              </h2>
              <button
                onClick={resetAll}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
              >
                重置全部
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {drawHistory.map((record, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">第 {record.round} 輪</span>
                    <span className="text-white/70 text-sm">{record.timestamp}</span>
                  </div>
                  <div className="mb-2">
                    <div className="text-white/80 text-sm mb-1">中獎號碼：</div>
                    <div className="flex flex-wrap gap-2">
                      {record.numbers.map((num, numIndex) => (
                        <span key={numIndex} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  {record.absentNumbers && record.absentNumbers.length > 0 && (
                    <div>
                      <div className="text-white/80 text-sm mb-1">不在現場：</div>
                      <div className="flex flex-wrap gap-2">
                        {record.absentNumbers.map((num, numIndex) => (
                          <span key={numIndex} className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LotterySystem;