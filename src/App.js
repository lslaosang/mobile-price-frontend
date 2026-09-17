import React, { useState } from 'react';
import './App.css'; 

function App() {
  // ข้อมูลเริ่มต้น
  const [formData, setFormData] = useState({
    'Storage': "128",
    'RAM': "8",
    'Screen Size (inches)': "6.5",
    'Battery Capacity (mAh)': "4500",
    'Camera_Total_MP': "64",
    'Brand_Encoded': "0" 
  });

  const [predictedPrice, setPredictedPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPredictedPrice(null);

    //  ระบบป้องกันการใส่ข้อมูลมั่ว
   
    
    // เช็คว่ามีช่องไหนเว้นว่างไว้หรือไม่
    const values = Object.values(formData);
    if (values.some(val => val === "" || val === null)) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      setIsLoading(false);
      return;
    }

    const dataToSend = {
      'Storage': Number(formData['Storage']),
      'RAM': Number(formData['RAM']),
      'Screen Size (inches)': Number(formData['Screen Size (inches)']),
      'Battery Capacity (mAh)': Number(formData['Battery Capacity (mAh)']),
      'Camera_Total_MP': Number(formData['Camera_Total_MP']),
      'Brand_Encoded': Number(formData['Brand_Encoded'])
    };

    // เช็คความสมเหตุสมผลของตัวเลข 
    if (dataToSend['Storage'] <= 0 || dataToSend['Storage'] > 2000) {
      setError(" ความจุข้อมูล (Storage) ต้องอยู่ระหว่าง 1 - 2000 GB");
      setIsLoading(false); return;
    }
    if (dataToSend['RAM'] <= 0 || dataToSend['RAM'] > 64) {
      setError(" แรม (RAM) ต้องอยู่ระหว่าง 1 - 64 GB");
      setIsLoading(false); return;
    }
    if (dataToSend['Screen Size (inches)'] <= 0 || dataToSend['Screen Size (inches)'] > 15) {
      setError(" ขนาดหน้าจอต้องอยู่ระหว่าง 1 - 15 นิ้ว");
      setIsLoading(false); return;
    }
    if (dataToSend['Battery Capacity (mAh)'] <= 0 || dataToSend['Battery Capacity (mAh)'] > 20000) {
      setError(" ความจุแบตเตอรี่ต้องอยู่ระหว่าง 1 - 20,000 mAh");
      setIsLoading(false); return;
    }
    if (dataToSend['Camera_Total_MP'] <= 0 || dataToSend['Camera_Total_MP'] > 400) {
      setError(" ความละเอียดกล้องต้องอยู่ระหว่าง 1 - 400 MP");
      setIsLoading(false); return;
    }
    // ==========================================

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setPredictedPrice(data.predicted_price);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">ระบบทำนายราคาสมาร์ทโฟน</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>ยี่ห้อ (Brand): </label>
            <select name="Brand_Encoded" value={formData['Brand_Encoded']} onChange={handleChange}>
              <option value="0">Apple</option>
              <option value="4">Google</option>
              <option value="9">OnePlus</option>
              <option value="12">Samsung</option>
              <option value="15">Xiaomi</option>
            </select>
          </div>
          <div className="form-group">
            <label>ความจุ (Storage - GB): </label>
            <input type="number" min="1" max="2000" name="Storage" value={formData['Storage']} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>แรม (RAM - GB): </label>
            <input type="number" min="1" max="64" name="RAM" value={formData['RAM']} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ขนาดหน้าจอ (นิ้ว): </label>
            <input type="number" step="0.1" min="1" max="15" name="Screen Size (inches)" value={formData['Screen Size (inches)']} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ความจุแบตเตอรี่ (mAh): </label>
            <input type="number" min="1" max="20000" name="Battery Capacity (mAh)" value={formData['Battery Capacity (mAh)']} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ความละเอียดกล้องรวม (MP): </label>
            <input type="number" min="1" max="400" name="Camera_Total_MP" value={formData['Camera_Total_MP']} onChange={handleChange} required />
          </div>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'กำลังคำนวณ...' : 'ทำนายราคา'}
          </button>
        </form>
        {error && <div className="error-msg" style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>{error}</div>}
        {predictedPrice !== null && !error && (
          <div className="result-card">
            <h3>ราคาที่ทำนายได้:</h3>
            <h1 className="price-tag">${predictedPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
            <p className="exchange-tag">(ประมาณ {(predictedPrice * 35).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท)</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;