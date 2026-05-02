import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, Sparkles, Trophy, Flame } from 'lucide-react'
import { PackType, PACK_IMAGES } from '../lib/gacha'

// --- 修正 1: 強制要求 Inventory 必須包含 PackType 定義的所有類型 ---
type Inventory = Record<PackType, number>

const GachaPage: React.FC = () => {
  // --- 修正 2: 初始狀態必須補上 boss，數值可以自己改 ---
  const [inventory, setInventory] = useState<Inventory>({
    white: 5,
    gold: 2,
    rainbow: 1,
    boss: 1 // 新增的 BOSS 包數量
  })

  const [isOpening, setIsOpening] = useState(false)
  const [currentPack, setCurrentPack] = useState<PackType | null>(null)

  const handleOpenPack = (type: PackType) => {
    // 修復第 81 行的報錯：現在 type 'boss' 在 Inventory 索引中是合法的
    if (inventory[type] <= 0) return

    setCurrentPack(type)
    setIsOpening(true)

    // 模擬抽卡動畫
    setTimeout(() => {
      setInventory(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }))
      setIsOpening(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-3 text-indigo-400 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-bold tracking-[0.3em] uppercase">WikiGacha System</span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tight">KNOT GACHA <span className="text-indigo-500">倉庫</span></h1>
      </header>

      {/* Packs Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.keys(PACK_IMAGES) as PackType[]).map((type) => (
          <motion.div
            key={type}
            whileHover={{ y: -5 }}
            className={`relative group bg-slate-900/50 border rounded-3xl p-6 overflow-hidden ${
              type === 'boss' ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-white/10'
            }`}
          >
            {/* 背景圖飾 */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               {type === 'boss' ? <Flame size={80} /> : <Box size={80} />}
            </div>

            {/* 卡包圖片 - 讀取你在 gacha.ts 定義的路徑 */}
            <div className="relative z-10 aspect-[3/4] mb-6 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={PACK_IMAGES[type]} 
                alt={`${type} pack`}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* 資訊區 - 修復第 49 行的報錯 */}
            <div className="relative z-10">
              <h3 className="text-xl font-bold capitalize mb-1 flex items-center gap-2">
                {type === 'boss' && <Trophy className="w-4 h-4 text-amber-500" />}
                {type} Pack
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                擁有數量: <span className="text-white font-mono">{inventory[type]}</span>
              </p>

              <button
                onClick={() => handleOpenPack(type)}
                disabled={inventory[type] <= 0 || isOpening}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  inventory[type] > 0 
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {inventory[type] > 0 ? '立即開啟' : '尚未獲得'}
              </button>
            </div>
          </motion.div>
        ))}
      </main>

      {/* 抽卡 Overlay 動畫 */}
      <AnimatePresence>
        {isOpening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <div className="text-center">
              <motion.img 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                src={PACK_IMAGES[currentPack!]} 
                className="w-64 h-auto mb-8 mx-auto"
              />
              <h2 className="text-2xl font-black italic animate-pulse">正在解開繩結...</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GachaPage
