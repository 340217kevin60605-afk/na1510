import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  ShoppingBag, User, Settings, Trash2, Plus, Minus, 
  ArrowLeft, Edit2, Lock, Search, Printer, Download, CheckSquare, Square, Copy, CheckCircle
} from 'lucide-react';

const getSevenStoreId = (storeName) => {
  if (!storeName) return null;
  const match = storeName.match(/\((\d{6})\)/);
  return match ? match[1] : null;
};

export default function LumoStore() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminPwdInput, setAdminPwdInput] = useState('');
  const [adminTab, setAdminTab] = useState('orders');

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  
  const [members, setMembers] = useState({ '0912345678': 250 });
  const [currentUserPhone, setCurrentUserPhone] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginPhoneInput, setLoginPhoneInput] = useState('');
  
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedOrders, setSearchedOrders] = useState(null);

  const [categories, setCategories] = useState(['服飾飾品', '生活選物', '客製設計']);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [cart, setCart] = useState({});
  const [formData, setFormData] = useState({
    name: '', phone: '', shippingMethod: '7-11', storeInfo: '', paymentMethod: 'COD', note: ''
  });
  const [usePoints, setUsePoints] = useState(false);

  const [products, setProducts] = useState([
    { id: 'p1', name: '經典燕麥色法式襯衫', price: 680, category: '服飾飾品', images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80'], tag: '現貨' },
    { id: 'p2', name: '品牌客製風格卡紙', price: 150, category: '客製設計', images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&q=80'], tag: '預購' }
  ]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', category: '服飾飾品', imageInput: '', tag: '' });

  const [orders, setOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // ================= 計算邏輯 =================
  const cartItemDetails = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => p.id === id);
    return product ? { ...product, qty } : null;
  }).filter(Boolean);

  const subtotal = cartItemDetails.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const currentPoints = members[formData.phone] || members[currentUserPhone] || 0;
  const maxDiscountAmount = Math.floor(currentPoints / 100);
  const discountAmount = usePoints ? Math.min(maxDiscountAmount, subtotal) : 0;
  
  // 運費全面改為 60
  const shippingFee = 60;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  // ================= 功能：前台 =================
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginPhoneInput.length >= 8) {
      setCurrentUserPhone(loginPhoneInput);
      if (members[loginPhoneInput] === undefined) setMembers(prev => ({ ...prev, [loginPhoneInput]: 0 }));
      setFormData(prev => ({ ...prev, phone: loginPhoneInput }));
      setLoginModalOpen(false);
    }
  };

  const handleCustomerSearch = () => {
    if (!searchPhone) return;
    const foundOrders = orders.filter(o => o.phone === searchPhone);
    setSearchedOrders(foundOrders);
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev; return rest;
      }
      return { ...prev, [id]: next };
    });
    setCartOpen(true);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const phoneToUse = formData.phone;
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      orderId: Date.now().toString().slice(-6),
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      ...formData,
      items: cartItemDetails.map(item => ({...item, quantity: item.qty, image: item.images[0]})), 
      logistics: '711',
      storeName: formData.storeInfo, 
      shippingFee: shippingFee,
      subtotal, discount: discountAmount, total: finalTotal, status: '待處理', 
      paymentStatus: formData.paymentMethod === 'COD' ? '未付款 (貨到付款)' : '未付款 (待轉帳)'
    };

    setOrders([newOrder, ...orders]);
    setMembers(prev => ({
      ...prev,
      [phoneToUse]: (prev[phoneToUse] || 0) - (discountAmount * 100) + Math.max(0, finalTotal - shippingFee) 
    }));
    setCart({}); setCheckoutStep(false); setCartOpen(false); setUsePoints(false);
    alert(`🎉 訂單已送出！\n本次消費獲得 ${Math.max(0, finalTotal - shippingFee)} 點。`);
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText('88611238224675');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // ================= 功能：後台管理 =================
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPwdInput === '1510') setAdminAuthenticated(true);
    else { alert('密碼錯誤！'); setAdminPwdInput(''); }
  };

  const togglePaymentStatus = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const isPaid = o.paymentStatus.includes('已付款');
        return { ...o, paymentStatus: isPaid ? '未付款' : '已付款' };
      }
      return o;
    }));
  };

  const saveProduct = (e) => {
    e.preventDefault();
    const imageArray = productForm.imageInput.split(/[\n,]+/).map(url => url.trim()).filter(Boolean);
    const newProduct = { ...productForm, images: imageArray };
    delete newProduct.imageInput;

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...newProduct, id: p.id } : p));
    } else {
      setProducts([{ ...newProduct, id: `p${Date.now()}` }, ...products]);
    }
    setEditingProduct(null);
    setProductForm({ name: '', price: '', category: categories[0] || '', imageInput: '', tag: '' });
  };

  // 分類功能管理 (含新增、刪除、上下排序)
  const handleAddCategory = () => {
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      setNewCategoryName('');
    }
  };

  const deleteCategory = (cat) => {
    setCategories(categories.filter(c => c !== cat));
    if (selectedCategory === cat) setSelectedCategory('全部');
  };

  // ★ 找回的分類排序功能
  const moveCategory = (index, direction) => {
    const newCats = [...categories];
    if (direction === 'up' && index > 0) {
      [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
    } else if (direction === 'down' && index < newCats.length - 1) {
      [newCats[index + 1], newCats[index]] = [newCats[index], newCats[index + 1]];
    }
    setCategories(newCats);
  };

  const handleSelectOrder = (id) => {
    setSelectedOrderIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // 📝 賣貨便匯入單
  const handleExport711Excel = () => {
    const ordersToExport = selectedOrderIds.length > 0 
        ? orders.filter(o => selectedOrderIds.includes(o.id)) 
        : orders;

    if (ordersToExport.length === 0) return alert("沒有訂單可以匯出");

    const headerRows = [
        ["賣貨便- 訂單匯入檢核"],
        ["請在本檔案填入商品資料，一次最多可以上傳 500 筆商品資料"],
        ["按下 「驗證」 後，會協助您檢查資料格式。"],
        ["【註：若整筆資料不要，請選取整列後按右鍵刪除】"],
        [], 
        ["＊取件人姓名", "＊取件人手機", "＊取件門市", "* 溫層", "＊商品", "＊訂單金額", "＊運費金額", "買家下訂日期", "商品備註", "其他資訊\n(FB/LINE/IG帳號)", "excel驗證結果說明"]
    ];

    const dataRows = ordersToExport.map(order => {
        const websiteTotal = Number(order.total) || 0;
        let collectionAmount = Math.max(0, websiteTotal - 38);
        
        if (order.paymentStatus.includes('已付款')) {
            collectionAmount = 20;
        }

        const rawStoreName = order.storeName || '';
        let storeId = getSevenStoreId(rawStoreName);
        
        if (!storeId && /^\d{6}$/.test(rawStoreName.trim())) {
            storeId = rawStoreName.trim();
        }

        let dateStr = "";
        if(order.createdAt) {
            const d = order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000) : new Date(order.createdAt);
            dateStr = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
        }

        return [
            order.name || '',           
            order.phone || '',          
            storeId || '',              
            "常溫",                     
            "服飾飾品",                 
            collectionAmount,           
            38,                         
            dateStr,                    
            order.note || '',           
            "",                         
            ""                          
        ];
    });

    const problemOrders = ordersToExport.filter((o, i) => !dataRows[i][2]);
    const finalData = [...headerRows, ...dataRows];
    
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "7-11匯入單");
    
    const fileName = `賣貨便匯入單_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    if (problemOrders.length > 0) {
        const errorDetail = problemOrders.map(o => `● 訂單 #${o.orderId} (門市: ${o.storeName || '未填寫'})`).join('\n');
        alert(`⚠️ 匯出完成，但有 ${problemOrders.length} 筆資料缺少店號！\n\n請手動檢查以下訂單：\n${errorDetail}`);
    } else {
        alert("✅ 匯出成功！格式已符合賣貨便要求。\n(訂單已自動轉為已出貨)");
        setOrders(prev => prev.map(o => selectedOrderIds.includes(o.id) ? { ...o, status: '已出貨' } : o));
        setSelectedOrderIds([]);
    }
  };

  // 📝 A6 終極列印單
  const printOrder = (input) => {
    if (!input) return;
    const ordersToPrint = Array.isArray(input) ? input : [input];
    if (ordersToPrint.length === 0) return;

    const printWindow = window.open('', '_blank');
    
    const ordersHtml = ordersToPrint.map((order, index) => {
        const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);
        const shipping = Number(order.shippingFee) || 0;
        const manualDiscount = Number(order.discount) || 0;
        const autoDiscount = Number(order.autoDiscount) || 0;
        const total = Math.max(0, subtotal + shipping - manualDiscount - autoDiscount);

        let logisticsMethod = '7-11 超商取貨';
        let addressDisplay = `門市：${order.storeName || '無'}<br/>地址：${order.address || '無'}`;
        const displayNote = (order.note || order.remarks || '無').replace(/\n/g, '<br/>');

        return `
        <div class="page ${index < ordersToPrint.length - 1 ? 'page-break' : ''}">
            <div class="header">
                <h1>LUMO 出貨單</h1>
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                     <p>Order #${order.orderId}</p>
                     <p style="font-size:9px; color:#555;">${order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'}</p>
                </div>
            </div>

            <div class="info-section">
                <div class="info-row"><span class="info-label">收件人：</span><span>${order.name} / ${order.phone}</span></div>
                <div class="info-row"><span class="info-label">物流：</span><span>${logisticsMethod}</span></div>
                <div class="info-row"><span class="info-label">狀態：</span><span>${order.paymentStatus}</span></div>
                <div class="info-row"><span class="info-label">地址：</span><span style="font-size:9px; line-height:1.2;">${addressDisplay}</span></div>
                <div class="info-row"><span class="info-label">備註：</span><span style="font-size:9px; line-height:1.2; color:#333; font-weight:bold;">${displayNote}</span></div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th width="40">圖片</th>
                        <th>品名 / 規格</th>
                        <th width="25" style="text-align:center">數</th>
                        <th width="35" style="text-align:right">單價</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items ? order.items.map((item, idx) => {
                        const imgUrl = item.image || item.images?.[0] || null;
                        
                        let customTextHtml = '';
                        if (item.nailCustomization) {
                            const label = (item.selectedVariant === '補甲' || item.customImageUrl) ? '補甲' : '客製';
                            customTextHtml = \`<div style="color:#d63384; font-size:9px; margin-top:2px; font-weight:bold;">(\${label}: \${item.nailCustomization})</div>\`;
                        }

                        return \`
                        <tr>
                            <td style="padding:2px; vertical-align:top;">
                                \${imgUrl ? \`<img src="\${imgUrl}" style="width:35px;height:35px;object-fit:cover;border-radius:4px;border:1px solid #eee;">\` : '<span style="color:#ccc;font-size:8px;">無圖</span>'}
                            </td>
                            
                            <td style="vertical-align:top; padding-top:4px;">
                                <div style="line-height:1.4;font-weight:bold;">
                                    \${idx + 1}. \${item.name}
                                    
                                    \${(() => {
                                        if (item.spotQty !== undefined && item.preorderQty !== undefined) {
                                            if (item.spotQty > 0 && item.preorderQty > 0) return \`<span style="font-size:9px; color:#16a34a; margin-left:4px; font-weight:bold;">[含預購 \${item.preorderQty}]</span>\`;
                                            else if (item.preorderQty > 0) return \`<span style="font-size:9px; border:1px solid #000; padding:1px 4px; margin-left:4px; border-radius:2px;">預購</span>\`;
                                            else return '';
                                        }
                                        return item.isPreOrder ? '<span style="font-size:9px; border:1px solid #000; padding:1px 4px; margin-left:4px; border-radius:2px;">預購</span>' : '';
                                    })()}
                                </div>
                                \${item.selectedVariant ? \`<div style="color:#666;font-size:9px;margin-top:2px;">規格: \${item.selectedVariant}</div>\` : ''}
                                \${customTextHtml}
                            </td>
                            <td style="text-align:center;vertical-align:middle;font-weight:bold;">\${item.quantity || item.qty || 1}</td>
                            <td style="text-align:right;vertical-align:middle;">$\${item.price}</td>
                        </tr>
                        \`;
                    }).join('') : ''}
                </tbody>
            </table>

            <div class="totals-section">
                <div class="total-row"><span>商品小計：</span><span>$\${subtotal.toLocaleString()}</span></div>
                <div class="total-row"><span>運費：</span><span>+$\${shipping}</span></div>
                \${manualDiscount > 0 ? \`<div class="total-row text-red"><span>點數折抵：</span><span>-$\${manualDiscount}</span></div>\` : ''}
                <div class="total-row final"><span>總金額：</span><span>NT$ \${total.toLocaleString()}</span></div>
            </div>
        </div>
        \`;
    }).join('');

    const htmlContent = \`
        <html>
        <head>
            <title>出貨單列印</title>
            <style>
                @page { size: A6; margin: 0; }
                body { font-family: "Microsoft JhengHei", "Noto Sans TC", sans-serif; margin: 0; padding: 0; background: #fff; color: #000; }
                .page { width: 105mm; padding: 5mm; box-sizing: border-box; font-size: 10px; line-height: 1.3; }
                .page-break { page-break-after: always; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 8px; }
                .header h1 { margin: 0; font-size: 16px; letter-spacing: 1px; }
                .header p { margin: 2px 0 0 0; font-size: 10px; }
                .info-section { margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .info-row { display: flex; margin-bottom: 2px; align-items: baseline; }
                .info-label { width: 45px; color: #666; font-weight: bold; flex-shrink: 0; }
                table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 5px; }
                th { text-align: left; border-bottom: 1px solid #000; padding: 3px 2px; font-size: 9px; background: #f9f9f9; }
                td { border-bottom: 1px dashed #ddd; padding: 4px 2px; }
                tr { page-break-inside: avoid; } 
                .totals-section { border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; font-size: 10px; width: 100%; page-break-inside: avoid; }
                .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                .total-row.text-red { color: #d32f2f; }
                .total-row.final { font-weight: bold; font-size: 14px; margin-top: 4px; border-top: 1px solid #eee; padding-top: 4px; }
            </style>
        </head>
        <body>
            \${ordersHtml}
            <script>
                window.onload = function() { setTimeout(() => window.print(), 500); }
            <\\/script>
        </body>
        </html>
    \`;     
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleBulkPrint = () => {
    if (selectedOrderIds.length === 0) {
        alert("請先選擇訂單");
        return;
    }
    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
    printOrder(selectedOrders);
    
    setOrders(prev => prev.map(o => selectedOrderIds.includes(o.id) ? { ...o, status: '已出貨' } : o));
    setSelectedOrderIds([]);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#4A403A] font-sans selection:bg-[#D3C2AD] selection:text-white">
      {/* 導覽列：置中 Logo 設計 (套用指定圖片) */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E8DED1] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 grid grid-cols-3 items-center">
          <div></div> 
          
          <div className="flex justify-center cursor-pointer" onClick={() => { setIsAdmin(false); setCartOpen(false); }}>
            <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full overflow-hidden bg-white border border-[#F0E4E4] flex items-center justify-center shadow-sm">
              <img src="S__38576157.jpg" alt="LUMO Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setIsAdmin(!isAdmin)} className="text-xs px-2 sm:px-3 py-1.5 rounded-full border border-[#D3C2AD] text-[#7A6B63] hover:bg-[#F3ECE1] transition">
              {isAdmin ? '回前台' : '管理'}
            </button>
            {!isAdmin && (
              <button onClick={() => setCartOpen(true)} className="relative p-2 bg-[#F3ECE1] rounded-full hover:bg-[#E8DED1] transition z-50">
                <ShoppingBag size={18} />
                {cartItemDetails.length > 0 && <span className="absolute -top-1 -right-1 bg-[#A67C52] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartItemDetails.reduce((a, c) => a + c.qty, 0)}</span>}
              </button>
            )}
          </div>
        </div>
        
        {/* 點數活動跑馬燈公告 */}
        <div className="bg-[#A67C52] text-white text-[11px] sm:text-xs text-center py-1.5 tracking-wide font-medium">
          📣 點數活動：消費 $1 累計 1 點，100 點可折抵 $1！
        </div>
      </header>

      {/* ================= 後台介面 ================= */}
      {isAdmin ? (
        <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
          {!adminAuthenticated ? (
            <div className="max-w-xs mx-auto mt-20 bg-white p-6 rounded-2xl shadow-sm border border-[#E8DED1]">
              <div className="flex justify-center mb-4 text-[#D3C2AD]"><Lock size={32} /></div>
              <h2 className="text-center font-bold mb-4">後台解鎖</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input type="password" value={adminPwdInput} onChange={e => setAdminPwdInput(e.target.value)} className="w-full border px-3 py-2 rounded-lg text-center focus:outline-none focus:border-[#D3C2AD]" placeholder="請輸入密碼" required />
                <button type="submit" className="w-full bg-[#D3C2AD] text-white py-2 rounded-lg font-bold">登入</button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex gap-4 mb-6 border-b border-[#E8DED1] pb-2 overflow-x-auto whitespace-nowrap">
                {['orders', 'products', 'categories'].map(tab => (
                  <button key={tab} onClick={() => setAdminTab(tab)} className={`font-bold pb-2 px-1 ${adminTab === tab ? 'text-[#A67C52] border-b-2 border-[#A67C52]' : 'text-[#8C7A70]'}`}>
                    {tab === 'orders' ? '訂單處理' : tab === 'products' ? '商品管理' : '分類管理'}
                  </button>
                ))}
              </div>

              {adminTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex gap-2 justify-end mb-4">
                    <button onClick={handleExport711Excel} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1"><Download size={14} /> 匯出7-11</button>
                    <button onClick={handleBulkPrint} className="bg-[#4b5563] hover:bg-[#374151] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1"><Printer size={14} /> 列印出貨單</button>
                  </div>
                  {orders.length === 0 ? <p className="text-center py-10 text-[#8C7A70]">目前尚無訂單</p> : 
                    orders.map(ord => (
                      <div key={ord.id} className={`bg-white rounded-xl p-5 border shadow-sm flex gap-4 transition ${selectedOrderIds.includes(ord.id) ? 'border-[#A67C52] ring-1 ring-[#A67C52]' : 'border-[#E8DED1]'}`}>
                        <button onClick={() => handleSelectOrder(ord.id)} className="pt-1 text-[#A67C52]">
                          {selectedOrderIds.includes(ord.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <div className="flex-1 text-sm">
                          <div className="flex flex-wrap gap-2 justify-between items-center mb-3 border-b pb-2">
                            <span className="font-bold">{ord.id}</span>
                            <div className="flex gap-2">
                              {/* 點擊切換付款狀態按鈕 */}
                              <button 
                                onClick={() => togglePaymentStatus(ord.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${ord.paymentStatus.includes('已付款') ? 'bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]' : 'bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca]'}`}
                              >
                                {ord.paymentStatus}
                              </button>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] ${ord.status === '已出貨' ? 'bg-[#E5E7EB] text-[#4B5563]' : 'bg-[#EBF3E8] text-[#486940]'}`}>
                                {ord.status}
                              </span>
                            </div>
                          </div>
                          <p>顧客：{ord.name} ({ord.phone})</p>
                          <p>門市：{ord.storeName}</p>
                          <p className="font-bold text-[#A67C52] mt-2">總計：${ord.total}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {adminTab === 'products' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <form onSubmit={saveProduct} className="bg-white p-5 rounded-2xl border border-[#E8DED1] space-y-4 shadow-sm h-fit">
                    <h3 className="font-bold text-[#A67C52] border-b pb-2">{editingProduct ? '編輯商品' : '新增商品'}</h3>
                    <input type="text" placeholder="商品名稱" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full border px-3 py-2 rounded-lg text-sm" />
                    <input type="number" placeholder="價格" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full border px-3 py-2 rounded-lg text-sm" />
                    <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full border px-3 py-2 rounded-lg text-sm">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="自訂標籤 (如：現貨)" value={productForm.tag} onChange={e => setProductForm({...productForm, tag: e.target.value})} className="w-full border px-3 py-2 rounded-lg text-sm" />
                    
                    {/* 多圖輸入區塊 */}
                    <div>
                      <label className="block text-xs font-bold text-[#7A6B63] mb-1">圖片網址 (多張請用逗號或換行隔開)</label>
                      <textarea 
                        required 
                        placeholder="https://image1.jpg,&#10;https://image2.jpg" 
                        value={productForm.imageInput} 
                        onChange={e => setProductForm({...productForm, imageInput: e.target.value})} 
                        className="w-full border px-3 py-2 rounded-lg text-sm h-24"
                      ></textarea>
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-[#D3C2AD] text-white py-2 rounded-lg font-bold text-sm">儲存</button>
                      {editingProduct && <button type="button" onClick={() => {setEditingProduct(null); setProductForm({ name: '', price: '', category: categories[0], imageInput: '', tag: '' });}} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm">取消</button>}
                    </div>
                  </form>
                  <div className="space-y-3">
                    {products.map(p => (
                      <div key={p.id} className="bg-white p-3 rounded-xl border flex gap-3 items-center">
                        <img src={p.images[0]} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{p.name}</h4>
                          <div className="text-[#8C7A70] text-[11px]">共 {p.images.length} 張圖</div>
                          <span className="text-[#A67C52] text-xs font-bold">${p.price}</span>
                        </div>
                        <button onClick={() => {setEditingProduct(p); setProductForm({...p, imageInput: p.images.join('\n')});}} className="text-[#A67C52] p-1.5"><Edit2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ★ 完整找回的後台分類管理 (含排序按鈕) */}
              {adminTab === 'categories' && (
                <div className="max-w-md bg-white p-5 rounded-2xl border border-[#E8DED1] shadow-sm">
                  <h3 className="font-bold text-[#A67C52] border-b pb-2 mb-4">前台分類設定</h3>
                  <div className="flex gap-2 mb-4">
                    <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="新增分類名稱" className="flex-1 border px-3 py-2 rounded-lg text-sm" />
                    <button onClick={handleAddCategory} className="bg-[#D3C2AD] text-white px-4 py-2 rounded-lg font-bold text-sm">新增</button>
                  </div>
                  <div className="space-y-2">
                    {categories.map((cat, idx) => (
                      <div key={cat} className="flex justify-between items-center bg-[#FAF6F0] p-3 rounded-lg border border-[#E8DED1]">
                        <span className="font-bold text-sm">{cat}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveCategory(idx, 'up')} className="p-1 text-gray-500 hover:text-black">↑</button>
                          <button onClick={() => moveCategory(idx, 'down')} className="p-1 text-gray-500 hover:text-black">↓</button>
                          <button onClick={() => deleteCategory(cat)} className="p-1 text-red-400 ml-2"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      ) : (
        /* ================= 前台購物與展示 ================= */
        <main className="max-w-4xl mx-auto px-4 py-8">
          
          <div className="bg-white rounded-2xl p-5 mb-8 border border-[#E8DED1] shadow-sm">
            <h2 className="font-bold text-[#A67C52] mb-3 flex items-center gap-2"><Search size={18}/> 查詢客寶專屬點數與訂單</h2>
            <div className="flex gap-2 mb-4">
              <input type="tel" placeholder="輸入下單手機號碼" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} className="flex-1 border border-[#E8DED1] px-4 py-2 rounded-xl focus:border-[#D3C2AD] focus:outline-none" />
              <button onClick={handleCustomerSearch} className="bg-[#D3C2AD] hover:bg-[#C2AF99] text-white px-5 py-2 rounded-xl font-bold transition">查詢</button>
            </div>
            
            {searchedOrders !== null && (
              <div className="mt-4 pt-4 border-t border-[#F0EAE1]">
                <p className="text-sm font-bold mb-3">歡迎回來，客寶！您目前累積點數：<span className="text-[#A67C52] text-lg">{members[searchPhone] || 0}</span> 點</p>
                {searchedOrders.length === 0 ? <p className="text-xs text-gray-500">查無訂單紀錄。</p> : (
                  <div className="space-y-3">
                    {searchedOrders.map(ord => (
                      <div key={ord.id} className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E8DED1] text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span>單號: {ord.id}</span>
                          <span className={`${ord.status === '已出貨' ? 'text-gray-500' : 'text-[#A67C52]'}`}>{ord.status}</span>
                        </div>
                        <p>金額: ${ord.total}</p>
                        <p className="text-gray-500 mt-1">門市: {ord.storeName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none mb-6 pb-2">
            <button onClick={() => setSelectedCategory('全部')} className={`px-4 py-2 rounded-full text-xs font-bold transition ${selectedCategory === '全部' ? 'bg-[#4A403A] text-white' : 'bg-white border border-[#E8DED1] text-[#7A6B63]'}`}>全部商品</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold transition ${selectedCategory === cat ? 'bg-[#4A403A] text-white' : 'bg-white border border-[#E8DED1] text-[#7A6B63]'}`}>{cat}</button>
            ))}
          </div>

          {/* ⚡️ 一行兩格商品列 (Mobile: grid-cols-2, PC: grid-cols-3) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {products.filter(p => selectedCategory === '全部' || p.category === selectedCategory).map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-[#E8DED1] shadow-sm group flex flex-col">
                {/* 支援左右滑動的多圖展示 */}
                <div className="h-40 sm:h-56 flex overflow-x-auto snap-x snap-mandatory scrollbar-none relative">
                  {product.images?.map((img, idx) => (
                    <img key={idx} src={img} className="w-full h-full object-cover shrink-0 snap-center transition duration-500" />
                  ))}
                  {product.tag && <span className="absolute top-2 left-2 text-[10px] sm:text-xs bg-white/90 px-2 py-1 rounded-full font-bold text-[#7A6B63] shadow-sm">{product.tag}</span>}
                  {product.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[9px] px-1.5 py-0.5 rounded-md pointer-events-none">
                      多圖滑動
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                  <h3 className="font-bold text-[#4A403A] text-xs sm:text-sm line-clamp-2 leading-tight">{product.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <span className="font-bold text-[#A67C52] text-sm">${product.price}</span>
                    <button onClick={() => updateQty(product.id, 1)} className="w-full sm:w-auto bg-[#D3C2AD] hover:bg-[#C2AF99] text-white text-[11px] sm:text-xs px-3 py-1.5 rounded-lg font-medium transition text-center">
                      加入
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ================= 購物車與結帳抽屜 ================= */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col pointer-events-auto">
            <div className="p-4 border-b flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center gap-2">
                {checkoutStep && <button onClick={() => setCheckoutStep(false)} className="text-[#7A6B63]"><ArrowLeft size={18} /></button>}
                <h3 className="font-bold">{checkoutStep ? '填寫結帳資訊' : '購物清單'}</h3>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-xs text-[#8C7A70]">關閉</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!checkoutStep ? (
                cartItemDetails.length === 0 ? <div className="text-center py-20 text-[#8C7A70] text-sm">購物車目前是空的</div> : (
                  cartItemDetails.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-[#F0EAE1] bg-[#FAF6F0]/40">
                      <img src={item.images?.[0]} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">{item.name}</h4>
                        <div className="text-xs text-[#A67C52] font-semibold mt-1">${item.price}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded bg-white border"><Minus size={12} /></button>
                          <span className="text-xs px-2">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded bg-white border"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4 text-sm">
                  <div><label className="block text-xs font-bold text-[#7A6B63] mb-1">姓名 *</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border px-3 py-2 rounded-lg" /></div>
                  <div><label className="block text-xs font-bold text-[#7A6B63] mb-1">手機號碼 *</label><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border px-3 py-2 rounded-lg" /></div>
                  
                  {/* 付款方式選項 */}
                  <div>
                    <label className="block text-xs font-bold text-[#7A6B63] mb-1">付款方式 *</label>
                    <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full border px-3 py-2 rounded-lg">
                      <option value="COD">貨到付款</option>
                      <option value="Bank">銀行轉帳</option>
                    </select>
                  </div>

                  {/* 選擇銀行轉帳時，顯示匯款帳號 */}
                  {formData.paymentMethod === 'Bank' && (
                    <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#D3C2AD] text-[#7A6B63] text-xs">
                      <p className="font-bold text-[#A67C52] mb-2">💰 請匯款至以下帳戶：</p>
                      <p>銀行代碼：<span className="font-bold">將來銀行 (823)</span></p>
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border mt-2">
                        <span className="font-mono font-bold text-[#4A403A] text-sm tracking-wider">88611238224675</span>
                        <button type="button" onClick={handleCopyBank} className="text-[#A67C52] flex items-center gap-1 font-bold">
                          {copiedBank ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                          {copiedBank ? '已複製' : '複製'}
                        </button>
                      </div>
                      <p className="mt-2 text-[#8C7A70] text-[11px]">⚠️ 匯款完成後，請主動聯繫官方 Line 或 IG 客服確認對帳唷！</p>
                    </div>
                  )}

                  <div><label className="block text-xs font-bold text-[#7A6B63] mb-1">取貨方式 *</label><div className="w-full border px-3 py-2 rounded-lg bg-gray-50 text-gray-500">7-11 超商取貨 (運費 $60)</div></div>
                  <div><label className="block text-xs font-bold text-[#7A6B63] mb-1">門市名稱與店號 (六碼) *</label><input type="text" required placeholder="例：鑫華門市 (981245)" value={formData.storeInfo} onChange={e => setFormData({...formData, storeInfo: e.target.value})} className="w-full border px-3 py-2 rounded-lg" /></div>
                  <div><label className="block text-xs font-bold text-[#7A6B63] mb-1">備註</label><textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full border px-3 py-2 rounded-lg h-16"></textarea></div>
                  
                  {currentPoints > 0 && (
                    <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DED1]">
                      <div className="flex justify-between items-center text-xs mb-2"><span className="font-bold">客寶專屬點數折抵</span><span>可用：{currentPoints} 點</span></div>
                      {maxDiscountAmount > 0 ? (
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input type="checkbox" checked={usePoints} onChange={e => setUsePoints(e.target.checked)} className="accent-[#A67C52]" />
                          使用點數折抵 <strong className="text-[#A67C52]">${discountAmount}</strong> 元
                        </label>
                      ) : <p className="text-[10px] text-gray-500">點數未滿 100 點，尚無法折抵。</p>}
                    </div>
                  )}
                </form>
              )}
            </div>

            {cartItemDetails.length > 0 && (
              <div className="p-4 border-t bg-white space-y-2">
                <div className="flex justify-between text-xs"><span>商品小計</span><span>${subtotal}</span></div>
                <div className="flex justify-between text-xs"><span>7-11 運費</span><span>+${shippingFee}</span></div>
                {usePoints && discountAmount > 0 && <div className="flex justify-between text-xs text-[#A67C52]"><span>點數折抵</span><span>-${discountAmount}</span></div>}
                <div className="flex justify-between font-bold pt-2 border-t text-sm"><span>總結帳金額</span><span className="text-[#A67C52]">${finalTotal}</span></div>
                {!checkoutStep ? (
                  <button onClick={() => setCheckoutStep(true)} className="w-full bg-[#D3C2AD] text-white py-3 rounded-xl font-bold mt-2">前往結帳</button>
                ) : (
                  <button type="submit" form="checkout-form" className="w-full bg-[#A67C52] text-white py-3 rounded-xl font-bold mt-2">確認送出訂單</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}