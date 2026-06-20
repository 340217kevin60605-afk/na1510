import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function App() {
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('detail');

  // 一鍵複製功能
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    // 最外層背景色：對應截圖中外圍的淺粉米色
    <div className="min-h-screen bg-[#F3EDED] font-sans text-[#6A5C5B] pb-20 selection:bg-[#D9D0CF] selection:text-[#6A5C5B]">
      
      {/* --- Logo 區塊 --- */}
      <div className="flex justify-center pt-10 pb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-sm border-4 border-white bg-white">
          {/* 讀取 public 資料夾下的圖片 */}
          <img 
            src="/178188145100086430.jpg" 
            alt="NA Shop 151 Logo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* --- 頂部 Tabs (對應截圖) --- */}
      <div className="max-w-3xl mx-auto px-4 mb-6">
        <div className="flex justify-center gap-8 border-b border-[#D9D0CF]">
          <button 
            onClick={() => setActiveTab('detail')}
            className={`pb-3 px-2 text-[17px] font-bold flex items-center gap-1.5 transition-colors relative ${
              activeTab === 'detail' ? 'text-[#6A5C5B]' : 'text-[#B3A8A7] hover:text-[#8C7D7C]'
            }`}
          >
            🔎 方案詳情
            {activeTab === 'detail' && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6A5C5B] rounded-t-full"></div>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 px-2 text-[17px] font-bold flex items-center gap-1.5 transition-colors relative ${
              activeTab === 'gallery' ? 'text-[#6A5C5B]' : 'text-[#B3A8A7] hover:text-[#8C7D7C]'
            }`}
          >
            🤍 卡紙範例圖
            {activeTab === 'gallery' && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6A5C5B] rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* --- 主要內容區塊 (對應截圖中的圓角白底) --- */}
      <main className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm">
          
          {activeTab === 'detail' && (
            <>
              {/* Step 1 標題 */}
              <div className="text-center font-bold text-[#8C7D7C] text-[15px] tracking-wider mb-8">
                Step1:請先查看詳情 🔎 選方案
              </div>

              {/* 1. 純批發 */}
              <div className="mb-10">
                <h3 className="text-[20px] font-bold text-[#6A5C5B] mb-4">純批發</h3>
                <div className="text-[15px] leading-relaxed text-[#6A5C5B] space-y-4">
                  <div>
                    <p className="font-bold mb-1">🤎步驟說明</p>
                    <p>❶點選商品圖&gt;&gt;查看商品與批發價錢</p>
                    <p>❷挑選商品直接下單</p>
                  </div>
                  
                  <hr className="border-[#D9D0CF] my-4" />
                  
                  <div>
                    <p className="font-bold mb-1">🤎須知</p>
                    <p>✔️皆從韓國叫貨</p>
                    <p>✔️為壓低成本採海運7~21天（若有現貨2~5）</p>
                    <p>✔️②件起批</p>
                    <p>✔️可面交.到店取貨</p>
                    <p className="mt-4">❌不提供商品圖請自行準備</p>
                  </div>
                </div>
              </div>

              {/* 2. 卡紙設計/代印服務 */}
              <div className="mb-10">
                <h3 className="text-[20px] font-bold text-[#6A5C5B] mb-4">卡紙設計/代印服務</h3>
                <div className="text-[15px] leading-relaxed text-[#6A5C5B] space-y-4">
                  <div className="font-bold space-y-1">
                    <p>【▫️設計+影印】</p>
                    <p>OR</p>
                    <p>【▫️代印服務- 您自行設計·我們印出】</p>
                  </div>

                  <hr className="border-[#D9D0CF] my-4" />

                  <div>
                    <p className="font-bold mb-1">🤎須知</p>
                    <p>❶設計免費（如需耗時較長酌收$30～50不等）</p>
                    <p>❷可印彩色or黑白</p>
                    <p>❸可只印一張</p>
                    <p>❹風格、樣式可以討論</p>
                    <p>❺可面交.到店取貨</p>
                  </div>

                  <hr className="border-[#D9D0CF] my-4" />

                  <div>
                    <p className="font-bold mb-1">🤎印出費用計算</p>
                    <p>❶卡紙大小基本A6大小（超過額外計算價格）</p>
                    <p>❷影印費用=一張A6 $6</p>
                    <p className="mt-2 text-[#8C7D7C]">
                      &gt;＞看設計的尺寸以A6為基礎切割<br/>
                      （ex:5*5cm可以在A6分6張=一張卡紙$1）
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. 社群分潤 (對應截圖中的淺灰色區塊) */}
              <div className="mb-12">
                <h3 className="text-[20px] font-bold text-[#6A5C5B] mb-4">社群分潤</h3>
                <div className="bg-[#EFEAE9] rounded-2xl p-6 text-[15px] leading-relaxed text-[#6A5C5B] space-y-4">
                  <div>
                    <p className="font-bold mb-1">🤎合作方式：</p>
                    <p>❶我們提供分潤連結</p>
                    <p>❷您在社群分享→顧客購買 → 您獲得分潤</p>
                    <p>❹由我們出貨</p>
                    <p>❺合作期限：1 個月 （可續約）</p>
                  </div>

                  <hr className="border-[#D9D0CF] my-4" />

                  <div>
                    <p className="font-bold mb-1">🤎推廣方式</p>
                    <p>❶自由選擇要在哪個平台分享</p>
                    <p>❷可挑選任意商品分享</p>
                  </div>

                  <hr className="border-[#D9D0CF] my-4" />

                  <div>
                    <p className="font-bold mb-1">🤎分潤連結</p>
                    <p>❶客人會直接導入到NA shop官網進行下單</p>
                    <p>❷下單會有電子郵件通知合作夥伴</p>
                    <p>❸分潤計算：下單總金額 x 30% 分潤</p>
                    <p className="mt-4 text-[#8C7D7C]">
                      （例如下單500*30%=您獲得150）<br/>
                      （客人點選分潤連結下單的任意商品皆算入<br/>
                      總金額內）
                    </p>
                  </div>
                </div>
              </div>

              {/* 波浪分隔線 */}
              <div className="text-center text-[#B3A8A7] text-2xl tracking-[0.5em] mb-12">〰️</div>

              {/* Step 2 標題 */}
              <div className="text-center font-bold text-[#8C7D7C] text-[15px] tracking-wider mb-8">
                Step2:依方案選擇下一步
              </div>

              {/* Step 2 動作區塊 */}
              <div className="space-y-6">
                
                {/* 批發 */}
                <div className="bg-[#EFEAE9] rounded-2xl p-6">
                  <h4 className="text-[17px] font-bold text-[#6A5C5B] mb-3">批發</h4>
                  <div className="text-[#8C7D7C] text-[14px] leading-relaxed mb-4">
                    <p>✔️可直接下單</p>
                    <p>✔️下單完直接登入電子郵件查訂單進度</p>
                  </div>
                  <a 
                    href="https://na-shop-cbcba.web.app/?wholesale=OK" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-[#6A5C5B] hover:bg-[#524544] text-white text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold"
                  >
                    前往批發專屬官網 <ExternalLink size={16} />
                  </a>
                </div>

                {/* 社群分潤 */}
                <div className="border border-[#D9D0CF] rounded-2xl p-6">
                  <h4 className="text-[17px] font-bold text-[#6A5C5B] mb-3">社群分潤</h4>
                  <p className="text-[#8C7D7C] text-[14px] mb-4">請複製以下表單在line回覆：</p>
                  <div className="bg-[#F3EDED] p-4 rounded-xl text-[14px] text-[#6A5C5B] mb-4">
                    ❶大概會如何進行推廣<br/>
                    ❷您的電子郵件<br/>
                    <span className="text-[#A29493]">（用於客人下單告知合作夥伴的）</span>
                  </div>
                  <button 
                    onClick={() => handleCopy("【申請社群分潤】\n❶ 大概會如何進行推廣：\n❷ 您的電子郵件：", 'share')}
                    className="w-full bg-white border border-[#6A5C5B] text-[#6A5C5B] hover:bg-[#F3EDED] text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold"
                  >
                    {copiedId === 'share' ? <><Check size={16} className="text-emerald-500"/> 已複製</> : <><Copy size={16} /> 複製回覆表單</>}
                  </button>
                </div>

                {/* 卡紙設計/影印 */}
                <div className="border border-[#D9D0CF] rounded-2xl p-6">
                  <h4 className="text-[17px] font-bold text-[#6A5C5B] mb-3">卡紙設計/影印</h4>
                  <p className="text-[#8C7D7C] text-[14px] mb-4">請複製以下表單在line回覆：</p>
                  
                  <div className="space-y-3 mb-6">
                    <button 
                      onClick={() => handleCopy("【影印+設計】\n❶ 喜歡何種風格/元素、預計卡紙尺寸：\n❷ 卡紙用途、印幾張：\n❸ 電子郵件、電話：\n❹ 想要如何交貨（711、到店取貨、面交）：", 'design')}
                      className="w-full bg-[#F3EDED] hover:bg-[#EFEAE9] text-[#6A5C5B] text-[14px] py-3 px-4 rounded-xl flex items-center justify-between transition-colors font-bold text-left"
                    >
                      <span>複製【影印+設計】表單</span>
                      {copiedId === 'design' ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} className="text-[#B3A8A7]"/>}
                    </button>

                    <button 
                      onClick={() => handleCopy("【代印服務】\n❶ 影印設計圖、印幾張：\n❷ 電子郵件、電話：\n❸ 想要如何交貨（711、到店取貨、面交）：", 'print')}
                      className="w-full bg-[#F3EDED] hover:bg-[#EFEAE9] text-[#6A5C5B] text-[14px] py-3 px-4 rounded-xl flex items-center justify-between transition-colors font-bold text-left"
                    >
                      <span>複製【代印服務】表單</span>
                      {copiedId === 'print' ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} className="text-[#B3A8A7]"/>}
                    </button>
                  </div>

                  <div className="text-[13px] text-[#8C7D7C] space-y-1 border-t border-[#D9D0CF] pt-4">
                    <p>▫️到店取貨：水漾路一段39號（近三重捷運站）</p>
                    <p>▫️面交限北北基</p>
                    <p>▫️711運費40</p>
                  </div>
                </div>

              </div>
            </>
          )}

          {activeTab === 'gallery' && (
            <div className="text-center py-20 text-[#8C7D7C]">
              {/* 這裡保留給未來的圖片展示區 */}
              <p className="font-bold text-[17px] mb-2">卡紙範例圖</p>
              <p className="text-[14px]">圖片準備中...</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}