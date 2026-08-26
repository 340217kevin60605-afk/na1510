import React, { useState, useEffect } from 'react';
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
  
  const [currentUserPhone, setCurrentUserPhone] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginPhoneInput, setLoginPhoneInput] = useState('');
  
 const [searchPhone, setSearchPhone] = useState('');
  const [searchedOrders, setSearchedOrders] = useState(null);
  const [categories, setCategories] = useState(['服飾飾品', '生活選物', '客製設計']);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    name: '', phone: '', shippingMethod: '7-11', storeInfo: '', paymentMethod: 'COD', note: ''
  });
  const [usePoints, setUsePoints] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
 const [productForm, setProductForm] = useState({ 
    name: '', price: '', category: '服飾飾品', imageInput: '', tag: '', description: '', stock: 0,
    spec1Name: '', spec1Options: '', spec2Name: '', spec2Options: '' 
  });
  const [activeProduct, setActiveProduct] = useState(null);
  const [tempSpec1, setTempSpec1] = useState('');
  const [tempSpec2, setTempSpec2] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // --- 👇 加入 LocalStorage 記憶體功能 ---
  const [members, setMembers] = useState(() => JSON.parse(localStorage.getItem('lumo_members')) || { '0912345678': 250 });
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('lumo_cart')) || {});
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('lumo_orders')) || []);
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem('lumo_products')) || [
    { id: 'p1', name: '經典燕麥色法式襯衫', price: 680, category: '服飾飾品', images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&q=80'], tag: '現貨', description: '親膚材質，百搭首選。', stock: 5 },
    { id: 'p2', name: '品牌客製風格卡紙', price: 150, category: '客製設計', images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&q=80'], tag: '預購', description: '進口厚磅卡紙。', stock: 0 }
  ]);

  useEffect(() => { localStorage.setItem('lumo_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('lumo_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('lumo_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('lumo_products', JSON.stringify(products)); }, [products]);
  // --- 👆 結束 ---

  // ================= 計算邏輯 =================
 const cartItemDetails = Object.entries(cart).map(([cartKey, qty]) => {
    const [id, s1, s2] = cartKey.split('|');
    const product = products.find(p => p.id === id);
    if (!product) return null;
    return { ...product, cartKey, selectedSpec1: s1 || '', selectedSpec2: s2 || '', qty };
  }).filter(Boolean);

  const subtotal = cartItemDetails.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const currentPoints = members[formData.phone] || members[currentUserPhone] || 0;
  const maxDiscountAmount = Math.floor(currentPoints / 100);
  const discountAmount = usePoints ? Math.min(maxDiscountAmount, subtotal) : 0;
  
  // 運費全面改為 60
  const shippingFee = subtotal >= 599 ? 0 : 60;
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
// --- 👇 步驟2 新增：客寶查詢與分類邏輯 ---



 

 


const handleAddClick = (product) => {
    const hasSpec1 = product.spec1Options && product.spec1Options.length > 0;
    const hasSpec2 = product.spec2Options && product.spec2Options.length > 0;
    if (hasSpec1 || hasSpec2) {
      setActiveProduct(product);
      setTempSpec1(hasSpec1 ? product.spec1Options[0] : '');
      setTempSpec2(hasSpec2 ? product.spec2Options[0] : '');
    } else { addToCart(product, '', ''); }
  };

  const addToCart = (product, s1, s2) => {
    const key = `${product.id}|${s1}|${s2}`;
    setCart(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    setCartOpen(true);
    setActiveProduct(null);
  };

  const updateQty = (cartKey, delta) => {
    setCart(prev => {
      const next = (prev[cartKey] || 0) + delta;
      if (next <= 0) { const { [cartKey]: _, ...rest } = prev; return rest; }
      return { ...prev, [cartKey]: next };
    });
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
    
    // 👇 結帳後自動扣除庫存
    setProducts(prev => prev.map(p => {
      const cartItem = cartItemDetails.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.qty) } : p;
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
    const s1Opts = productForm.spec1Options ? productForm.spec1Options.split(',').map(s => s.trim()) : [];
    const s2Opts = productForm.spec2Options ? productForm.spec2Options.split(',').map(s => s.trim()) : [];

    const newProduct = { 
      ...productForm, 
      images: imageArray, 
      stock: Number(productForm.stock),
      spec1Options: s1Opts,
      spec2Options: s2Opts
    };
    delete newProduct.imageInput;

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...newProduct, id: p.id } : p));
    } else {
      setProducts([{ ...newProduct, id: `p${Date.now()}` }, ...products]);
    }
    setEditingProduct(null);
    setProductForm({ name: '', price: '', category: categories[0] || '', imageInput: '', tag: '', description: '', stock: 0, spec1Name: '', spec1Options: '', spec2Name: '', spec2Options: '' });
  };

  // 👇 會員管理功能
  const handleEditMemberPhone = (oldPhone) => {
    const newPhone = prompt('請輸入新的電話號碼：', oldPhone);
    if (newPhone && newPhone !== oldPhone) {
      setMembers(prev => { const updated = { ...prev }; updated[newPhone] = updated[oldPhone]; delete updated[oldPhone]; return updated; });
    }
  };
  const handleEditMemberPoints = (phone) => {
    const newPoints = prompt('請輸入新的點數：', members[phone]);
    if (newPoints !== null && !isNaN(newPoints)) setMembers(prev => ({ ...prev, [phone]: Number(newPoints) }));
  };
  const handleDeleteMember = (phone) => {
    if(window.confirm(`確定刪除會員 ${phone} 嗎？`)) {
      setMembers(prev => { const updated = { ...prev }; delete updated[phone]; return updated; });
    }
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
                            customTextHtml = `<div style="color:#d63384; font-size:9px; margin-top:2px; font-weight:bold;">(${label}: ${item.nailCustomization})</div>`;
                        }

                        return `
                        <tr>
                            <td style="padding:2px; vertical-align:top;">
                                ${imgUrl ? `<img src="${imgUrl}" style="width:35px;height:35px;object-fit:cover;border-radius:4px;border:1px solid #eee;">` : '<span style="color:#ccc;font-size:8px;">無圖</span>'}
                            </td>
                            
                            <td style="vertical-align:top; padding-top:4px;">
                                <td style="vertical-align:top; padding-top:4px;">
                                <div style="line-height:1.4;font-weight:bold;">
                                    ${idx + 1}. ${item.name}
                                    ${Number(item.stock) <= 0 ? `<span style="color:#d32f2f;font-size:9px;border:1px solid #d32f2f;padding:1px 3px;margin-left:4px;border-radius:2px;">預購</span>` : ''}
                                </div>
                                ${customTextHtml}
                            </td>
                                    
                                    ${(() => {
                                        if (item.spotQty !== undefined && item.preorderQty !== undefined) {
                                            if (item.spotQty > 0 && item.preorderQty > 0) return `<span style="font-size:9px; color:#16a34a; margin-left:4px; font-weight:bold;">[含預購 ${item.preorderQty}]</span>`;
                                            else if (item.preorderQty > 0) return `<span style="font-size:9px; border:1px solid #000; padding:1px 4px; margin-left:4px; border-radius:2px;">預購</span>`;
                                            else return '';
                                        }
                                        return item.isPreOrder ? '<span style="font-size:9px; border:1px solid #000; padding:1px 4px; margin-left:4px; border-radius:2px;">預購</span>' : '';
                                    })()}
                                </div>
                                ${item.selectedVariant ? `<div style="color:#666;font-size:9px;margin-top:2px;">規格: ${item.selectedVariant}</div>` : ''}
                                ${customTextHtml}
                            </td>
                            <td style="text-align:center;vertical-align:middle;font-weight:bold;">${item.quantity || item.qty || 1}</td>
                            <td style="text-align:right;vertical-align:middle;">$${item.price}</td>
                        </tr>
                        `;
                    }).join('') : ''}
                </tbody>
            </table>

            <div class="totals-section">
                <div class="total-row"><span>商品小計：</span><span>$${subtotal.toLocaleString()}</span></div>
                <div class="total-row"><span>運費：</span><span>+$${shipping}</span></div>
                ${manualDiscount > 0 ? `<div class="total-row text-red"><span>點數折抵：</span><span>-$${manualDiscount}</span></div>` : ''}
                <div class="total-row final"><span>總金額：</span><span>NT$ ${total.toLocaleString()}</span></div>
            </div>
        </div>
        `;
    }).join('');

    const htmlContent = `
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
            ${ordersHtml}
            <script>
                window.onload = function() { setTimeout(() => window.print(), 500); }
            </script>
        </body>
        </html>
    `;     
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
    
    // 印單後自動改為已出貨
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
           <span className="font-serif tracking-[0.2em] font-extrabold text-2xl text-[#6B5A59]">LUMO</span>
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
          📣 點數活動：消費 $1 累計 1 點，100 點可折抵 $1 ｜ 🚚 全館滿 $599 免運費！
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
            {/* --- 👇 步驟3 替換：後台分頁按鈕 --- */}
             <div className="flex gap-4 mb-6 border-b border-[#E8DED1] pb-2 overflow-x-auto whitespace-nowrap">
                {['orders', 'products', 'categories', 'members'].map(tab => (
                  <button key={tab} onClick={() => setAdminTab(tab)} className={`font-bold pb-2 px-1 ${adminTab === tab ? 'text-[#A67C52] border-b-2 border-[#A67C52]' : 'text-[#8C7A70]'}`}>
                    {tab === 'orders' ? '訂單處理' : tab === 'products' ? '商品管理' : tab === 'categories' ? '分類管理' : '會員管理'}
                  </button>
                ))}
              </div>
              {/* --- 👆 結束 --- */}

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
                    <textarea placeholder="商品介紹描述" required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full border px-3 py-2 rounded-lg text-sm h-16"></textarea>
                    
                    <div>
                      <label className="block text-xs font-bold text-[#7A6B63] mb-1">庫存數量 (設為0即為預購)</label>
                      <input type="number" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full border px-3 py-2 rounded-lg text-sm" />
                    </div>

                    {/* 雙規格設定區塊 */}
                    <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#D3C2AD] space-y-3">
                      <p className="text-xs font-bold text-[#A67C52]">✨ 雙規格設定 (非必填)</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="規格一(例:顏色)" value={productForm.spec1Name} onChange={e => setProductForm({...productForm, spec1Name: e.target.value})} className="w-1/3 border px-2 py-1 rounded text-xs" />
                        <input type="text" placeholder="選項用逗號隔開(例:銀,金)" value={productForm.spec1Options} onChange={e => setProductForm({...productForm, spec1Options: e.target.value})} className="w-2/3 border px-2 py-1 rounded text-xs" />
                      </div>
                      <div className="flex gap-2">
                        <input type="text" placeholder="規格二(例:尺寸)" value={productForm.spec2Name} onChange={e => setProductForm({...productForm, spec2Name: e.target.value})} className="w-1/3 border px-2 py-1 rounded text-xs" />
                        <input type="text" placeholder="選項用逗號隔開(例:S,M)" value={productForm.spec2Options} onChange={e => setProductForm({...productForm, spec2Options: e.target.value})} className="w-2/3 border px-2 py-1 rounded text-xs" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-[#7A6B63] mb-1">圖片網址 (多張請用逗號或換行隔開)</label>
                      <textarea required placeholder="https://image1.jpg,&#10;https://image2.jpg" value={productForm.imageInput} onChange={e => setProductForm({...productForm, imageInput: e.target.value})} className="w-full border px-3 py-2 rounded-lg text-sm h-24"></textarea>
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-[#D3C2AD] text-white py-2 rounded-lg font-bold text-sm">儲存</button>
                      {editingProduct && <button type="button" onClick={() => {setEditingProduct(null); setProductForm({ name: '', price: '', category: categories[0], imageInput: '', tag: '', description: '', stock: 0, spec1Name: '', spec1Options: '', spec2Name: '', spec2Options: '' });}} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm">取消</button>}
                    </div>
                  </form>
                  <div className="space-y-3">
                    {/* --- 👇 步驟6 替換：加入 filter 過濾邏輯 --- */}
            {products.filter(p => selectedCategory === '全部' || p.category === selectedCategory).map((product) => (
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

{adminTab === 'members' && (
                <div className="bg-white p-5 rounded-2xl border border-[#E8DED1] shadow-sm max-w-2xl">
                  <h3 className="font-bold text-[#A67C52] border-b pb-2 mb-4">會員管理</h3>
                  <div className="space-y-2">
                    {Object.entries(members).map(([phone, points]) => (
                      <div key={phone} className="flex flex-wrap justify-between items-center bg-[#FAF6F0] p-3 rounded-lg border border-[#E8DED1] gap-2">
                        <div className="font-bold text-sm">📞 {phone} <span className="ml-4 text-[#A67C52]">💰 {points} 點</span></div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditMemberPhone(phone)} className="bg-white border px-2 py-1 rounded text-xs font-bold shadow-sm">改電話</button>
                          <button onClick={() => handleEditMemberPoints(phone)} className="bg-white border px-2 py-1 rounded text-xs font-bold shadow-sm">改點數</button>
                          <button onClick={() => handleDeleteMember(phone)} className="text-red-400 p-1"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

{/* --- 👇 步驟4 新增：分類管理介面 --- */}
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
              {/* --- 👆 結束 --- */}


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

          {/* --- 👇 步驟5 新增：客寶查詢與前台分類按鈕 --- */}
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
          {/* --- 👆 結束 --- */}
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
                  <h3 className="font-bold text-[#4A403A] text-xs sm:text-sm line-clamp-2 leading-tight">
  {product.name}
  {Number(product.stock) <= 0 && <span className="ml-1.5 text-[9px] text-[#d32f2f] border border-[#d32f2f] px-1 py-0.5 rounded-sm inline-block translate-y-[-1px]">預購</span>}
</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <span className="font-bold text-[#A67C52] text-sm">${product.price}</span>
                   <button onClick={() => handleAddClick(product)} className="w-full sm:w-auto bg-[#D3C2AD] hover:bg-[#C2AF99] text-white text-[11px] sm:text-xs px-3 py-1.5 rounded-lg font-medium transition text-center">加入</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

{activeProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl animate-fade-in relative">
                <button onClick={() => setActiveProduct(null)} className="absolute top-3 right-3 text-gray-400">✕</button>
                <div className="flex gap-3 mb-4">
                  <img src={activeProduct.images[0]} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-bold text-sm text-[#4A403A]">{activeProduct.name}</h3>
                    <span className="text-[#A67C52] font-bold text-sm">${activeProduct.price}</span>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  {activeProduct.spec1Options && activeProduct.spec1Options.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#7A6B63] mb-2">{activeProduct.spec1Name || '規格一'}</p>
                      <div className="flex flex-wrap gap-2">
                        {activeProduct.spec1Options.map(opt => (
                          <button key={opt} onClick={() => setTempSpec1(opt)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${tempSpec1 === opt ? 'bg-[#A67C52] text-white border-[#A67C52]' : 'bg-white text-[#7A6B63] border-[#E8DED1]'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeProduct.spec2Options && activeProduct.spec2Options.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#7A6B63] mb-2">{activeProduct.spec2Name || '規格二'}</p>
                      <div className="flex flex-wrap gap-2">
                        {activeProduct.spec2Options.map(opt => (
                          <button key={opt} onClick={() => setTempSpec2(opt)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${tempSpec2 === opt ? 'bg-[#A67C52] text-white border-[#A67C52]' : 'bg-white text-[#7A6B63] border-[#E8DED1]'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => addToCart(activeProduct, tempSpec1, tempSpec2)} className="w-full bg-[#D3C2AD] hover:bg-[#C2AF99] text-white py-3 rounded-xl font-bold transition">確認加入購物車</button>
              </div>
            </div>
          )}
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
                        <h4 className="text-xs font-bold truncate">
  {item.name}
{(item.selectedSpec1 || item.selectedSpec2) && (
    <div className="text-[10px] text-[#8C7A70] mt-0.5">規格：{item.selectedSpec1} {item.selectedSpec2}</div>
  )}
  {Number(item.stock) <= 0 && <span className="ml-1.5 text-[9px] text-[#d32f2f] border border-[#d32f2f] px-1 py-0.5 rounded-sm inline-block translate-y-[-1px]">預購</span>}
</h4>
                        <div className="text-xs text-[#A67C52] font-semibold mt-1">${item.price}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQty(item.cartKey, -1)} className="p-1 rounded bg-white border"><Minus size={12} /></button>
                          <span className="text-xs px-2">{item.qty}</span>
                          <button onClick={() => updateQty(item.cartKey, 1)} className="p-1 rounded bg-white border"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4 text-sm">
{/* --- 👇 新增：結帳下單與商品須知 --- */}
                  <div className="bg-[#FAF6F0] rounded-xl border border-[#E8DED1] p-4 mb-5 text-[#7A6B63] text-[11px] sm:text-xs leading-relaxed shadow-sm">
                    <h4 className="font-bold text-[#A67C52] text-[13px] mb-2 text-center border-b border-[#E8DED1] pb-2">🤍 LUMO 客寶下單與商品須知 🤍</h4>
                    
                    {/* 設定固定高度並允許上下滑動，避免佔用整個手機螢幕 */}
                    <div className="space-y-3 h-40 overflow-y-auto pr-2">
                      <p><span className="font-bold text-[#4A403A]">Material |</span> 925 銀 &nbsp;&nbsp; <span className="font-bold text-[#4A403A]">Color |</span> 銀、金</p>
                      
                      <div>
                        <p className="font-bold text-[#4A403A]">📦 出貨時間</p>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                          <li>現貨商品：1-3日內出貨</li>
                          <li>預購商品：7-21日內出貨 (不含假日與例假日)</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-bold text-[#4A403A]">✨ 商品須知</p>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                          <li>商品皆為實拍，因光線與螢幕顯色略有色差屬正常現象。</li>
                          <li>部分商品可能有微小瑕疵或凹痕，完美主義者請斟酌下單。</li>
                          <li>銀針耳環材質較軟，如於運送過程中略有變形，可手動輕輕調整，不影響配戴使用。</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-bold text-[#4A403A]">🔄 退換貨須知</p>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                          <li>鑑賞期非試用期，商品需保持全新與包裝完整方可退換。</li>
                          <li>若訂單使用折價券或賣場免運優惠，部分退貨後未達門檻，則保留商品不再適用折扣、運費優惠。</li>
                          <li>耳環屬貼身物品，基於衛生考量恕不提供退換服務。</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-bold text-[#4A403A]">💍 飾品保養</p>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                          <li>請避免配戴飾品沐浴、接觸水氣、香水或化學成分。</li>
                          <li>純銀飾品氧化變黑為自然現象，建議定期以拭銀布擦拭保養。</li>
                          <li>未配戴時建議擦拭乾淨後放入密封袋保存。</li>
                          <li>鍍色飾品會隨使用習慣產生耗損與褪色，屬正常情況。</li>
                        </ul>
                      </div>
                      
                      <p className="pt-2 border-t border-[#E8DED1] text-center mt-3 font-medium text-[#A67C52]">如有任何疑問，歡迎私訊詢問，我們會儘快回覆您。</p>
                    </div>
                  </div>
                  {/* --- 👆 結束 --- */}
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

                  <div><label className="block text-xs font-bold text-[#7A6B63] mb-1">取貨方式 *</label><div className="w-full border px-3 py-2 rounded-lg bg-gray-50 text-gray-500">7-11 超商取貨 (運費 $60，滿 $599 免運)</div></div>
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
                <div className="flex justify-between text-xs"><span>7-11 運費</span><span>{shippingFee === 0 ? <span className="text-green-600 font-bold">+$0 (滿額免運)</span> : '+$60'}</span></div>
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