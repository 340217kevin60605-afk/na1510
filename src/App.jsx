import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function App() {
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('wholesale');

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8EDED] font-sans tracking-wide text-[#6B5A59] pb-20 selection:bg-[#E6D5D5] selection:text-[#6B5A59]">
      
      {/* --- 頂部導覽列 --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#F0E4E4] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer">
             <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white border border-[#F0E4E4]">
                <img src="https://bio.linkcdn.cc/upload/6072019vugjps/2026061915/178188145100086430.jpg" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <span className="font-bold tracking-wider text-[#6B5A59] text-[14px] sm:text-base">NA Shop 151</span>
          </div>
        </div>
      </nav>

      {/* =========================================================
          主頁面 (導覽與連結)
      ========================================================= */}
      <div className="max-w-3xl mx-auto px-2 mt-6 sm:mt-8 mb-5 sm:mb-6">
        <div className="flex justify-center gap-2 sm:gap-8 border-b border-[#E6D5D5] overflow-x-auto whitespace-nowrap scrollbar-none px-2">
          {['wholesale', 'design'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-[14px] sm:text-[17px] font-medium flex items-center transition-colors relative ${
                activeTab === tab ? 'text-[#6B5A59] font-bold' : 'text-[#B09F9E] hover:text-[#8C7A79]'
              }`}
            >
              {tab === 'wholesale' ? '純批發' : '卡紙設計/代印'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6B5A59] rounded-t-full"></div>}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-10 shadow-sm border border-[#F0E4E4]">
          <div className="text-center font-bold text-[#8C7A79] text-[13px] sm:text-[15px] tracking-wider mb-6 sm:mb-8">
            Step1:請先查看詳情 🔎 選方案
          </div>

          {/* 1. 純批發 */}
          {activeTab === 'wholesale' && (
            <div className="animate-fade-in">
              <h3 className="text-[17px] sm:text-[20px] font-bold text-[#6B5A59] mb-3 sm:mb-4">純批發</h3>
              <div className="text-[13px] sm:text-[15px] leading-relaxed text-[#6B5A59] space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div>
                  <p className="font-bold mb-1">🤎步驟說明</p>
                  <p>❶點選商品圖&gt;&gt;查看商品與批發價錢</p>
                  <p>❷挑選商品直接下單</p>
                </div>
                <hr className="border-[#F0E4E4] my-3 sm:my-4" />
                <div>
                  <p className="font-bold mb-1">🤎須知</p>
                  <p>✔️預購海運7~21天(韓國發貨)</p>
                  <p>✔️現貨2~5天</p>
                  <p>✔️2件起批</p>
                  <p>✔️可面交.到店取貨</p>
<p>✔️價格可能會有所微調</p>
                  <p className="mt-3 text-[#D98282]">❌不提供商品圖請自行準備</p>
                </div>
              </div>

              <div className="bg-[#F8EDED] rounded-2xl p-4 sm:p-5 border border-[#F0E4E4]">
                <div className="text-[#8C7A79] text-[12px] sm:text-[14px] leading-relaxed mb-3 sm:mb-4">
                  <span className="font-bold text-[#6B5A59] block mb-1.5 sm:mb-2">〰️ Step 2: 批發下一步</span>
                  <p>✔️可直接下單</p>
                  <p>✔️下單完直接登入電子郵件查訂單進度</p>
                </div>
                <a href="https://na-shop-cbcba.web.app/?wholesale=OK" target="_blank" rel="noreferrer" className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white text-[14px] sm:text-[15px] py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold shadow-sm">
                  前往批發專屬官網 <ExternalLink size={15} />
                </a>
              </div>
            </div>
          )}

          {/* 2. 卡紙設計/代印服務 */}
          {activeTab === 'design' && (
            <div className="animate-fade-in">
              <h3 className="text-[17px] sm:text-[20px] font-bold text-[#6B5A59] mb-3 sm:mb-4">卡紙設計/代印服務</h3>
              
              {/* 卡紙範例圖外部連結區塊 */}
              <a 
                href="https://na-shop-cbcba.web.app/?wholesale=OK&productId=OUdLJTaiLIXz3M5H2zbi"
                target="_blank" 
                rel="noreferrer"
                className="block mb-6 sm:mb-8 overflow-hidden rounded-2xl border border-[#F0E4E4] bg-[#F8EDED]/50 py-4 sm:py-5 px-4 text-center hover:bg-[#F0E4E4] transition-colors shadow-sm"
              >
                <p className="font-bold text-[#6B5A59] text-[14px] sm:text-[16px] flex items-center justify-center gap-2">
                  🤍 點擊查看卡紙範例與詳細介紹 <ExternalLink size={16} />
                </p>
              </a>

              <div className="text-[13px] sm:text-[15px] leading-relaxed text-[#6B5A59] space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="font-bold space-y-0.5">
                  <p>【▫️設計+影印】</p>
                  <p>OR</p>
                  <p>【▫️代印服務- 您自行設計·我們印出】</p>
                </div>
                <hr className="border-[#F0E4E4] my-3 sm:my-4" />
                <div>
                  <p className="font-bold mb-1">🤎須知</p>
                  <p>❶設計免費（如需耗時較長酌收$30～50不等）</p>
                  <p>❷可印彩色or黑白</p>
                  <p>❸可只印一張</p>
                  <p>❹風格、樣式可以討論 / 可手繪</p>
                  <p>❺可面交.到店取貨</p>
                </div>
                <hr className="border-[#F0E4E4] my-3 sm:my-4" />
                <div>
                  <p className="font-bold mb-1">🤎印出費用計算</p>
                  <p>❶卡紙大小基本A6大小（超過額外計算價格）</p>
                  <p>❷影印費用=一張A6 $6</p>
                  <p className="mt-1.5 text-[#8C7A79] text-[12px] sm:text-[13px]">
                    &gt;＞看設計的尺寸以A6為基礎切割<br/>
                    （ex:5*5cm可以在A6分6張=一張卡紙$1）
                  </p>
                </div>
              </div>

              {/* 🚨 Step 2: 複製表單 */}
              <div className="bg-[#FDF8F8] rounded-2xl p-4 sm:p-5 border border-[#E6D5D5] mb-5 sm:mb-6">
                <span className="font-bold text-[#6B5A59] block mb-2.5 sm:mb-3 text-[14px] sm:text-[16px]">〰️ Step 2: 請先複製表單至 Line 回覆與我們討論</span>
                
                <div className="space-y-2.5 sm:space-y-3 mb-1">
                  <button 
                    onClick={() => handleCopy("【影印+設計】\n❶ 喜歡何種風格/元素、預計卡紙尺寸：\n❷ 卡紙用途、印幾張：\n❸ 電子郵件、電話：\n❹ 想要如何交貨（711、到店取貨、面交）：", 'design')}
                    className="w-full bg-white hover:bg-[#F0E4E4] border border-[#E6D5D5] text-[#6B5A59] text-[13px] sm:text-[14px] py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl flex items-center justify-between transition-colors font-bold text-left shadow-sm"
                  >
                    <span>複製【影印+設計】表單</span>
                    {copiedId === 'design' ? <Check size={15} className="text-emerald-500"/> : <Copy size={15} className="text-[#B09F9E]"/>}
                  </button>

                  <button 
                    onClick={() => handleCopy("【代印服務】\n❶ 影印設計圖、印幾張：\n❷ 電子郵件、電話：\n❸ 想要如何交貨（711、到店取貨、面交）：", 'print')}
                    className="w-full bg-white hover:bg-[#F0E4E4] border border-[#E6D5D5] text-[#6B5A59] text-[13px] sm:text-[14px] py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl flex items-center justify-between transition-colors font-bold text-left shadow-sm"
                  >
                    <span>複製【代印服務】表單</span>
                    {copiedId === 'print' ? <Check size={15} className="text-emerald-500"/> : <Copy size={15} className="text-[#B09F9E]"/>}
                  </button>
                </div>
              </div>

              {/* 🚨 Step 3: 直接下單外部連結 */}
              <div className="bg-[#F8EDED] rounded-2xl p-4 sm:p-5 border border-[#F0E4E4]">
                <span className="font-bold text-[#6B5A59] block mb-3 sm:mb-4 text-[14px] sm:text-[16px]">〰️ Step 3: 討論完畢後，選擇規格並下單</span>
                
                <a 
                  href="https://na-shop-cbcba.web.app/?wholesale=OK&productId=OUdLJTaiLIXz3M5H2zbi"
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white text-[14px] sm:text-[15px] py-2.5 sm:py-3.5 rounded-xl font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
                >
                  前往官網專屬賣場下單 <ExternalLink size={15} />
                </a>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}