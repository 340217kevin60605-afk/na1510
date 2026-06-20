import React, { useState } from 'react';
import { ShoppingBag, Printer, Share2, Copy, Check, ExternalLink, Info, Image as ImageIcon, ArrowRight, ChevronRight } from 'lucide-react';

export default function App() {
  const [copiedId, setCopiedId] = useState(null);

  // 一鍵複製功能
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const Navbar = () => (
    <nav className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
        <h1 className="text-lg tracking-widest font-light text-stone-800 flex items-center gap-2.5">
          <ShoppingBag size={20} className="text-[#D3C4B7]" />
          NA Shop
        </h1>
        <span className="text-xs text-stone-400 tracking-wider">方案導覽中心</span>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 pb-20 selection:bg-[#D3C4B7] selection:text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FAF6F0] text-[#A6907C] rounded-full mb-4 shadow-sm">
            <Info size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-light tracking-widest mb-3 text-stone-800">方案詳情與合作</h2>
          <p className="text-xs sm:text-sm text-stone-400 tracking-wider mb-6">請先查看下方方案說明，再選擇適合您的下一步。</p>
          
          <button className="inline-flex items-center gap-2 text-xs font-medium text-[#A6907C] bg-white px-4 py-2 rounded-full border border-[#D3C4B7]/50 hover:bg-[#FAF6F0] transition-colors shadow-sm">
            <ImageIcon size={14} /> 🤍 點此查看卡紙範例圖
          </button>
        </div>

        {/* --- Step 1: 方案說明區塊 --- */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-[#A6907C] text-white text-xs font-medium px-3 py-1 rounded-full tracking-wider shadow-sm">Step 1</span>
            <h3 className="text-lg font-medium text-stone-700 tracking-wider">請先查看詳情 🔎 選方案</h3>
          </div>

          <div className="space-y-6">
            {/* 1. 純批發 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D3C4B7]"></div>
              <h4 className="text-lg font-medium text-stone-800 mb-5 flex items-center gap-2">
                <ShoppingBag className="text-[#A6907C]" size={20} /> 純批發
              </h4>
              
              <div className="grid sm:grid-cols-2 gap-6 text-sm font-light text-stone-600">
                <div className="space-y-2.5 bg-stone-50/50 p-4 rounded-2xl border border-stone-50">
                  <p className="font-medium text-[#A6907C] text-xs tracking-wider mb-3">🤎 步驟說明</p>
                  <p>❶ 點選商品圖 &gt;&gt; 查看商品與批發價錢</p>
                  <p>❷ 挑選商品直接下單</p>
                </div>
                <div className="space-y-2.5 bg-stone-50/50 p-4 rounded-2xl border border-stone-50">
                  <p className="font-medium text-[#A6907C] text-xs tracking-wider mb-3">🤎 批發須知</p>
                  <p>✔️ 皆從韓國叫貨</p>
                  <p>✔️ 為壓低成本採海運 7~21 天 (若有現貨 2~5 天)</p>
                  <p>✔️ ② 件起批</p>
                  <p>✔️ 可面交 / 到店取貨</p>
                  <p className="text-rose-500 pt-2 font-medium">❌ 不提供商品圖請自行準備</p>
                </div>
              </div>
            </div>

            {/* 2. 卡紙設計/代印服務 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-300"></div>
              <h4 className="text-lg font-medium text-stone-800 mb-3 flex items-center gap-2">
                <Printer className="text-stone-400" size={20} /> 卡紙設計 / 代印服務
              </h4>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-stone-50 text-stone-500 border border-stone-200 text-[11px] px-3 py-1 rounded-lg">▫️ 設計 + 影印</span>
                <span className="text-stone-300 text-xs py-1">OR</span>
                <span className="bg-stone-50 text-stone-500 border border-stone-200 text-[11px] px-3 py-1 rounded-lg">▫️ 代印服務 (您設計·我們印)</span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 text-sm font-light text-stone-600">
                <div className="space-y-2.5 bg-stone-50/50 p-4 rounded-2xl border border-stone-50">
                  <p className="font-medium text-stone-500 text-xs tracking-wider mb-3">🤎 服務須知</p>
                  <p>❶ 設計免費 (如需耗時較長酌收 $30～$50 不等)</p>
                  <p>❷ 可印彩色 or 黑白</p>
                  <p>❸ 可只印一張</p>
                  <p>❹ 風格、樣式可以討論</p>
                  <p>❺ 可面交 / 到店取貨</p>
                </div>
                <div className="space-y-2.5 bg-stone-50/50 p-4 rounded-2xl border border-stone-50">
                  <p className="font-medium text-stone-500 text-xs tracking-wider mb-3">🤎 印出費用計算</p>
                  <p>❶ 卡紙大小基本 A6 大小 (超過額外計算價格)</p>
                  <p>❷ 影印費用 = 一張 A6 $6</p>
                  <div className="bg-white p-3 rounded-xl border border-stone-100 text-[11px] text-stone-500 mt-2">
                    <p className="font-medium mb-1">&gt;&gt; 看設計的尺寸以 A6 為基礎切割</p>
                    <p>(ex: 5*5cm 可以在 A6 分 6 張 = 一張卡紙 $1)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 社群分潤 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#E8DCC4]"></div>
              <h4 className="text-lg font-medium text-stone-800 mb-5 flex items-center gap-2">
                <Share2 className="text-[#c1a98e]" size={20} /> 社群分潤
              </h4>
              
              <div className="grid sm:grid-cols-3 gap-4 text-xs font-light text-stone-600 leading-relaxed">
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-50">
                  <p className="font-medium text-[#c1a98e] tracking-wider mb-2">🤎 合作方式</p>
                  <p>❶ 我們提供分潤連結</p>
                  <p>❷ 您分享 → 顧客購買 → 獲利</p>
                  <p>❸ 由我們出貨</p>
                  <p>❹ 合作期限：1 個月 (可續約)</p>
                </div>
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-50">
                  <p className="font-medium text-[#c1a98e] tracking-wider mb-2">🤎 推廣方式</p>
                  <p>❶ 自由選擇分享平台</p>
                  <p>❷ 可挑選任意商品分享</p>
                </div>
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-50">
                  <p className="font-medium text-[#c1a98e] tracking-wider mb-2">🤎 分潤連結計算</p>
                  <p>❶ 導入 NA shop 官網下單</p>
                  <p>❷ 下單即有 Email 通知夥伴</p>
                  <p className="font-medium text-stone-700 mt-2">❸ 總金額 x 30% 分潤</p>
                  <p className="text-[10px] text-stone-400 mt-1">(例: 下單500*30% = 獲150)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Step 2: 行動區塊 --- */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-t border-stone-200 pt-10">
            <span className="bg-stone-800 text-white text-xs font-medium px-3 py-1 rounded-full tracking-wider shadow-sm">Step 2</span>
            <h3 className="text-lg font-medium text-stone-700 tracking-wider">依方案選擇您的下一步</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Action 1: 批發 */}
            <div className="bg-[#FAF6F0] p-6 rounded-3xl border border-[#D3C4B7]/30 flex flex-col h-full">
              <h4 className="font-medium text-[#A6907C] mb-2 flex items-center gap-1.5"><ShoppingBag size={16}/> 批發客戶</h4>
              <p className="text-xs text-stone-500 mb-4 font-light leading-relaxed">✔️ 可直接下單<br/>✔️ 下單完直接登入電子郵件查進度</p>
              <div className="mt-auto">
                <a 
                  href="https://na-shop-cbcba.web.app/?wholesale=OK" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full bg-[#A6907C] hover:bg-[#8e7a68] text-white text-xs tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm font-medium"
                >
                  前往批發專屬官網 <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Action 2: 分潤 */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 flex flex-col h-full shadow-sm">
              <h4 className="font-medium text-stone-700 mb-2 flex items-center gap-1.5"><Share2 size={16} className="text-[#c1a98e]"/> 社群分潤申請</h4>
              <p className="text-[11px] text-stone-400 mb-3 font-light">請複製以下表單，並至 Line 回覆我們：</p>
              
              <div className="bg-stone-50 p-3 rounded-xl text-[11px] text-stone-600 font-light mb-4 border border-stone-100 flex-grow">
                ❶ 大概會如何進行推廣<br/>
                ❷ 您的電子郵件<br/>
                <span className="text-[10px] text-stone-400">(用於客人下單告知合作夥伴的)</span>
              </div>
              
              <button 
                onClick={() => handleCopy("【申請社群分潤】\n❶ 大概會如何進行推廣：\n❷ 您的電子郵件：", 'share')}
                className="w-full bg-stone-800 hover:bg-stone-700 text-white text-xs tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm font-medium"
              >
                {copiedId === 'share' ? <><Check size={14} className="text-emerald-400"/> 已複製</> : <><Copy size={14} /> 複製回覆表單</>}
              </button>
            </div>

            {/* Action 3: 卡紙設計 */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 flex flex-col h-full shadow-sm">
              <h4 className="font-medium text-stone-700 mb-2 flex items-center gap-1.5"><Printer size={16} className="text-stone-400"/> 卡紙設計 / 影印</h4>
              <p className="text-[11px] text-stone-400 mb-3 font-light">請複製對應表單，並至 Line 回覆我們：</p>
              
              <div className="flex flex-col gap-2 mb-4 flex-grow">
                <button 
                  onClick={() => handleCopy("【影印+設計】\n❶ 喜歡何種風格/元素、預計卡紙尺寸：\n❷ 卡紙用途、印幾張：\n❸ 電子郵件、電話：\n❹ 想要如何交貨 (711/到店/面交)：", 'design_print')}
                  className="w-full bg-stone-50 hover:bg-[#FAF6F0] border border-stone-200 text-stone-600 text-[11px] py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors text-left"
                >
                  <span className="font-medium">複製【影印+設計】表單</span>
                  {copiedId === 'design_print' ? <Check size={14} className="text-emerald-500"/> : <Copy size={14} className="text-stone-400"/>}
                </button>

                <button 
                  onClick={() => handleCopy("【代印服務】\n❶ 影印設計圖、印幾張：\n❷ 電子郵件、電話：\n❸ 想要如何交貨 (711/到店/面交)：", 'print_only')}
                  className="w-full bg-stone-50 hover:bg-[#FAF6F0] border border-stone-200 text-stone-600 text-[11px] py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors text-left"
                >
                  <span className="font-medium">複製【代印服務】表單</span>
                  {copiedId === 'print_only' ? <Check size={14} className="text-emerald-500"/> : <Copy size={14} className="text-stone-400"/>}
                </button>
              </div>

              <div className="text-[10px] text-stone-400 font-light bg-stone-50/50 p-2.5 rounded-lg border border-stone-100">
                <p>▫️ 到店: 水漾路一段39號 (近三重捷運站)</p>
                <p>▫️ 面交限北北基</p>
                <p>▫️ 7-11運費40</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}