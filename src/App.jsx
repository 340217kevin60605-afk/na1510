import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function App() {
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('wholesale'); // 預設顯示純批發

  // 一鍵複製功能
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    // 最外層背景色：溫柔淡粉色
    <div className="min-h-screen bg-[#F8EDED] font-sans text-[#6B5A59] pb-20 selection:bg-[#E6D5D5] selection:text-[#6B5A59]">
      
      {/* --- Logo 區塊 --- */}
      <div className="flex justify-center pt-10 pb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-sm border-4 border-white bg-white">
          <img 
            src="https://bio.linkcdn.cc/upload/6072019vugjps/2026061915/178188145100086430.jpg" 
            alt="NA Shop 151 Logo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* --- 頂部 Tabs (改為三個方案) --- */}
      <div className="max-w-3xl mx-auto px-2 mb-6">
        <div className="flex justify-center gap-4 sm:gap-8 border-b border-[#E6D5D5] overflow-x-auto whitespace-nowrap scrollbar-none">
          <button 
            onClick={() => setActiveTab('wholesale')}
            className={`pb-3 px-2 text-[16px] sm:text-[17px] font-bold flex items-center transition-colors relative ${
              activeTab === 'wholesale' ? 'text-[#6B5A59]' : 'text-[#B09F9E] hover:text-[#8C7A79]'
            }`}
          >
            純批發
            {activeTab === 'wholesale' && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6B5A59] rounded-t-full"></div>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('design')}
            className={`pb-3 px-2 text-[16px] sm:text-[17px] font-bold flex items-center transition-colors relative ${
              activeTab === 'design' ? 'text-[#6B5A59]' : 'text-[#B09F9E] hover:text-[#8C7A79]'
            }`}
          >
            卡紙設計/代印
            {activeTab === 'design' && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6B5A59] rounded-t-full"></div>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('share')}
            className={`pb-3 px-2 text-[16px] sm:text-[17px] font-bold flex items-center transition-colors relative ${
              activeTab === 'share' ? 'text-[#6B5A59]' : 'text-[#B09F9E] hover:text-[#8C7A79]'
            }`}
          >
            社群分潤
            {activeTab === 'share' && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6B5A59] rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* --- 主要內容區塊 --- */}
      <main className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-[#F0E4E4]">
          
          {/* 共通頂部標題 */}
          <div className="text-center font-bold text-[#8C7A79] text-[15px] tracking-wider mb-8">
            Step1:請先查看詳情 🔎 選方案
          </div>

          {/* =========================================
              分頁 1：純批發
          ========================================== */}
          {activeTab === 'wholesale' && (
            <div className="animate-fade-in">
              <h3 className="text-[20px] font-bold text-[#6B5A59] mb-4">純批發</h3>
              <div className="text-[15px] leading-relaxed text-[#6B5A59] space-y-4 mb-8">
                <div>
                  <p className="font-bold mb-1">🤎步驟說明</p>
                  <p>❶點選商品圖&gt;&gt;查看商品與批發價錢</p>
                  <p>❷挑選商品直接下單</p>
                </div>
                
                <hr className="border-[#F0E4E4] my-4" />
                
                <div>
                  <p className="font-bold mb-1">🤎須知</p>
                  <p>✔️皆從韓國叫貨</p>
                  <p>✔️為壓低成本採海運7~21天（若有現貨2~5）</p>
                  <p>✔️②件起批</p>
                  <p>✔️可面交.到店取貨</p>
                  <p className="mt-4 text-[#D98282]">❌不提供商品圖請自行準備</p>
                </div>
              </div>

              {/* 批發的 Step 2 */}
              <div className="bg-[#F8EDED] rounded-2xl p-5 border border-[#F0E4E4]">
                <div className="text-[#8C7A79] text-[14px] leading-relaxed mb-4">
                  <span className="font-bold text-[#6B5A59] block mb-2">〰️ Step 2: 批發下一步</span>
                  <p>✔️可直接下單</p>
                  <p>✔️下單完直接登入電子郵件查訂單進度</p>
                </div>
                <a 
                  href="https://na-shop-cbcba.web.app/?wholesale=OK" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold shadow-sm"
                >
                  前往批發專屬官網 <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )}

          {/* =========================================
              分頁 2：卡紙設計/代印服務 (包含圖片)
          ========================================== */}
          {activeTab === 'design' && (
            <div className="animate-fade-in">
              <h3 className="text-[20px] font-bold text-[#6B5A59] mb-4">卡紙設計/代印服務</h3>
              <div className="text-[15px] leading-relaxed text-[#6B5A59] space-y-4 mb-8">
                <div className="font-bold space-y-1">
                  <p>【▫️設計+影印】</p>
                  <p>OR</p>
                  <p>【▫️代印服務- 您自行設計·我們印出】</p>
                </div>

                <hr className="border-[#F0E4E4] my-4" />

                <div>
                  <p className="font-bold mb-1">🤎須知</p>
                  <p>❶設計免費（如需耗時較長酌收$30～50不等）</p>
                  <p>❷可印彩色or黑白</p>
                  <p>❸可只印一張</p>
                  <p>❹風格、樣式可以討論</p>
                  <p>❺可面交.到店取貨</p>
                </div>

                <hr className="border-[#F0E4E4] my-4" />

                <div>
                  <p className="font-bold mb-1">🤎印出費用計算</p>
                  <p>❶卡紙大小基本A6大小（超過額外計算價格）</p>
                  <p>❷影印費用=一張A6 $6</p>
                  <p className="mt-2 text-[#8C7A79]">
                    &gt;＞看設計的尺寸以A6為基礎切割<br/>
                    （ex:5*5cm可以在A6分6張=一張卡紙$1）
                  </p>
                </div>
              </div>

              {/* ✨ 將卡紙範例圖整合進來 ✨ */}
              <div className="bg-[#F8EDED]/50 rounded-2xl p-5 mb-8 border border-[#F0E4E4]">
                <div className="font-bold text-[#6B5A59] text-[15px] mb-4 text-center">
                  🤍 卡紙與吊牌設計範例
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <img 
                    src="https://bio.linkcdn.cc/upload/6072019vugjps/2026061917/178188956700026933.jpg" 
                    alt="範例 1" 
                    className="w-full h-auto rounded-xl shadow-sm border border-[#F0E4E4] object-cover" 
                  />
                  <img 
                    src="https://bio.linkcdn.cc/upload/6072019vugjps/2026061917/178188958400083329.jpg" 
                    alt="範例 2" 
                    className="w-full h-auto rounded-xl shadow-sm border border-[#F0E4E4] object-cover" 
                  />
                  <img 
                    src="https://bio.linkcdn.cc/upload/6072019vugjps/2026061917/178188960000016192.jpg" 
                    alt="範例 3" 
                    className="w-full h-auto rounded-xl shadow-sm border border-[#F0E4E4] object-cover" 
                  />
                  <img 
                    src="https://bio.linkcdn.cc/upload/6072019vugjps/2026061917/178188961500094446.jpg" 
                    alt="範例 4" 
                    className="w-full h-auto rounded-xl shadow-sm border border-[#F0E4E4] object-cover" 
                  />
                </div>
              </div>

              {/* 卡紙設計的 Step 2 */}
              <div className="bg-[#F8EDED] rounded-2xl p-5 border border-[#F0E4E4]">
                <span className="font-bold text-[#6B5A59] block mb-3">〰️ Step 2: 請複製以下表單在 line 回覆</span>
                
                <div className="bg-white p-4 rounded-xl text-[14px] text-[#6B5A59] mb-4 space-y-4 shadow-sm border border-[#F0E4E4]">
                  <div>
                    <p className="font-bold">【影印+設計】</p>
                    <p>❶ 喜歡何種風格/元素、預計卡紙尺寸</p>
                    <p>❷ 卡紙用途、印幾張</p>
                    <p>❸ 電子郵件、電話</p>
                    <p>❹ 想要如何交貨（711、到店取貨、面交）</p>
                  </div>
                  <hr className="border-[#F0E4E4]"/>
                  <div>
                    <p className="font-bold">【代印服務】</p>
                    <p>❶ 影印設計圖、印幾張</p>
                    <p>❷ 電子郵件、電話</p>
                    <p>❸ 想要如何交貨（711、到店取貨、面交）</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <button 
                    onClick={() => handleCopy("【影印+設計】\n❶ 喜歡何種風格/元素、預計卡紙尺寸：\n❷ 卡紙用途、印幾張：\n❸ 電子郵件、電話：\n❹ 想要如何交貨（711、到店取貨、面交）：", 'design')}
                    className="w-full bg-white hover:bg-[#F0E4E4] border border-[#E6D5D5] text-[#6B5A59] text-[14px] py-3 px-4 rounded-xl flex items-center justify-between transition-colors font-bold text-left shadow-sm"
                  >
                    <span>複製【影印+設計】表單</span>
                    {copiedId === 'design' ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} className="text-[#B09F9E]"/>}
                  </button>

                  <button 
                    onClick={() => handleCopy("【代印服務】\n❶ 影印設計圖、印幾張：\n❷ 電子郵件、電話：\n❸ 想要如何交貨（711、到店取貨、面交）：", 'print')}
                    className="w-full bg-white hover:bg-[#F0E4E4] border border-[#E6D5D5] text-[#6B5A59] text-[14px] py-3 px-4 rounded-xl flex items-center justify-between transition-colors font-bold text-left shadow-sm"
                  >
                    <span>複製【代印服務】表單</span>
                    {copiedId === 'print' ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} className="text-[#B09F9E]"/>}
                  </button>
                </div>

                <div className="text-[13px] text-[#8C7A79] space-y-1">
                  <p>▫️到店取貨：水漾路一段39號（近三重捷運站）</p>
                  <p>▫️面交限北北基</p>
                  <p>▫️711運費40</p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              分頁 3：社群分潤
          ========================================== */}
          {activeTab === 'share' && (
            <div className="animate-fade-in">
              <h3 className="text-[20px] font-bold text-[#6B5A59] mb-4">社群分潤</h3>
              <div className="text-[15px] leading-relaxed text-[#6B5A59] space-y-4 mb-8">
                <div>
                  <p className="font-bold mb-1">🤎合作方式：</p>
                  <p>❶我們提供分潤連結</p>
                  <p>❷您在社群分享→顧客購買 → 您獲得分潤</p>
                  <p>❹由我們出貨</p>
                  <p>❺合作期限：1 個月 （可續約）</p>
                </div>

                <hr className="border-[#F0E4E4] my-4" />

                <div>
                  <p className="font-bold mb-1">🤎推廣方式</p>
                  <p>❶自由選擇要在哪個平台分享</p>
                  <p>❷可挑選任意商品分享</p>
                </div>

                <hr className="border-[#F0E4E4] my-4" />

                <div>
                  <p className="font-bold mb-1">🤎分潤連結</p>
                  <p>❶客人會直接導入到NA shop官網進行下單</p>
                  <p>❷下單會有電子郵件通知合作夥伴</p>
                  <p>❸分潤計算：下單總金額 x 30% 分潤</p>
                  <p className="mt-4 text-[#8C7A79]">
                    （例如下單500*30%=您獲得150）<br/>
                    （客人點選分潤連結下單的任意商品皆算入<br/>
                    總金額內）
                  </p>
                </div>
              </div>

              {/* 社群分潤的 Step 2 */}
              <div className="bg-[#F8EDED] rounded-2xl p-5 border border-[#F0E4E4]">
                <span className="font-bold text-[#6B5A59] block mb-3">〰️ Step 2: 請複製以下表單在 line 回覆</span>
                
                <div className="bg-white p-4 rounded-xl text-[14px] text-[#6B5A59] mb-4 shadow-sm border border-[#F0E4E4]">
                  ❶ 大概會如何進行推廣<br/>
                  ❷ 您的電子郵件<br/>
                  <span className="text-[#A29493]">（用於客人下單告知合作夥伴的）</span>
                </div>
                
                <button 
                  onClick={() => handleCopy("【申請社群分潤】\n❶ 大概會如何進行推廣：\n❷ 您的電子郵件：", 'share')}
                  className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold shadow-sm"
                >
                  {copiedId === 'share' ? <><Check size={16} className="text-emerald-500"/> 已複製</> : <><Copy size={16} /> 複製回覆表單</>}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}