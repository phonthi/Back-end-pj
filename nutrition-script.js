let currentPatient = null;
let nutritionData = [];
let allPatients = [];

// เริ่มทำงานเมื่อโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', function() {
  // โหลดและแสดงรายชื่อผู้ป่วยทั้งหมด
  loadAllPatients();
  
  // ตั้งค่าวันที่ปัจจุบันในฟอร์ม
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date-logged').value = today;
  
  // ตรวจสอบ query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');
  
  if (patientId) {
    // ถ้ามี id ในพารามิเตอร์ ให้เลือกผู้ป่วยนั้น
    selectPatientById(patientId);
  } else if (allPatients.length > 0) {
    // ถ้าไม่มี id แต่มีรายชื่อผู้ป่วย ให้เลือกผู้ป่วยคนแรก
    selectPatient(allPatients[0]);
  }
});

// โหลดรายชื่อผู้ป่วยทั้งหมด
function loadAllPatients() {
  // สร้างข้อมูลผู้ป่วยตัวอย่าง
  allPatients = [
    { user_id: 1, full_name: 'คุณสมชาย วิชัยดิษฐ์', disease: 'โรคเบาหวาน', category: 'metabolism' },
    { user_id: 2, full_name: 'คุณสมหญิง รักษ์ไทย', disease: 'โรคความดันโลหิตสูง', category: 'cardiovascular' },
    { user_id: 3, full_name: 'คุณชาญชัย มีชัย', disease: 'โรคหอบหืด', category: 'respiratory' },
    { user_id: 4, full_name: 'คุณวิชัย สุขสมบูรณ์', disease: 'โรคไขมันในเลือดสูง', category: 'metabolism' },
    { user_id: 5, full_name: 'คุณนารี สุนทรภู่', disease: 'โรคหัวใจ', category: 'cardiovascular' },
    { user_id: 6, full_name: 'คุณธนิช ชูเกียรติ', disease: 'โรคภูมิแพ้', category: 'respiratory' },
  ];
  
  // แสดงรายชื่อผู้ป่วย
  displayPatientList(allPatients);
}

// แสดงรายการผู้ป่วย
function displayPatientList(patients) {
  const patientListElement = document.getElementById('patient-list');
  patientListElement.innerHTML = '';
  
  if (patients.length === 0) {
    patientListElement.innerHTML = '<div class="empty-list">ไม่พบข้อมูลผู้ป่วย</div>';
    return;
  }
  
  patients.forEach(patient => {
    const patientCard = document.createElement('div');
    patientCard.className = 'patient-card';
    patientCard.dataset.id = patient.user_id;
    patientCard.onclick = () => selectPatient(patient);
    
    // กำหนดแบ็ดสำหรับสถานะ
    const statusClass = patient.user_id % 2 === 0 ? 'status-active' : 'status-pending';
    const statusText = patient.user_id % 2 === 0 ? 'กำลังรักษา' : 'รอการประเมิน';
    
    // กำหนดไอคอนตามประเภทโรค
    let diseaseIcon = '';
    if (patient.category === 'metabolism') {
      diseaseIcon = '🩸';
    } else if (patient.category === 'cardiovascular') {
      diseaseIcon = '❤️';
    } else if (patient.category === 'respiratory') {
      diseaseIcon = '🫁';
    }
    
    patientCard.innerHTML = `
      <div class="patient-card-header">
        <div class="patient-card-name">${patient.full_name}</div>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="patient-card-disease">${diseaseIcon} ${patient.disease}</div>
    `;
    
    patientListElement.appendChild(patientCard);
  });
}

// ค้นหา/กรองผู้ป่วย
function filterPatients() {
  const searchTerm = document.getElementById('patient-search').value.toLowerCase();
  
  if (!searchTerm) {
    displayPatientList(allPatients);
    return;
  }
  
  const filteredPatients = allPatients.filter(patient => 
    patient.full_name.toLowerCase().includes(searchTerm) || 
    (patient.disease && patient.disease.toLowerCase().includes(searchTerm))
  );
  
  displayPatientList(filteredPatients);
}

// เลือกผู้ป่วยจาก ID
function selectPatientById(patientId) {
  const patient = allPatients.find(p => p.user_id == patientId);
  if (patient) {
    selectPatient(patient);
  } else {
    console.error(`ไม่พบผู้ป่วย ID: ${patientId}`);
    // ถ้าไม่พบผู้ป่วยที่ระบุ ให้เลือกผู้ป่วยคนแรก (ถ้ามี)
    if (allPatients.length > 0) {
      selectPatient(allPatients[0]);
    }
  }
}

// เลือกผู้ป่วยเพื่อแสดงข้อมูล
function selectPatient(patient) {
  // เคลียร์การเลือกเดิม
  document.querySelectorAll('.patient-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // ไฮไลท์การ์ดที่เลือก
  document.querySelector(`.patient-card[data-id="${patient.user_id}"]`)?.classList.add('selected');
  
  // ตั้งค่าผู้ป่วยปัจจุบัน
  currentPatient = patient;
  
  // แสดงข้อมูลผู้ป่วย
  displayPatientInfo(patient);
  
  // โหลดข้อมูลโภชนาการ
  loadNutritionData(patient.user_id);
  
  // อัปเดต URL เพื่อให้สามารถแชร์หรือบุ๊คมาร์คได้
  window.history.replaceState({}, '', `nutrition.html?id=${patient.user_id}`);
}

// แสดงข้อมูลผู้ป่วย
function displayPatientInfo(patient) {
  document.getElementById('patient-info').style.display = 'block';
  document.getElementById('nutrition-dashboard').style.display = 'block';
  document.getElementById('nutrition-table-container').style.display = 'block';
  document.getElementById('nutrition-recommendation').style.display = 'block';
  
  document.getElementById('patient-name').textContent = patient.full_name;
  document.getElementById('patient-disease').textContent = `โรค: ${patient.disease || '-'}`;
  
  // กำหนดสถานะ
  const statusBadge = document.getElementById('patient-status-badge');
  statusBadge.innerHTML = '';
  const badgeElem = document.createElement('span');
  badgeElem.className = patient.user_id % 2 === 0 ? 'status-badge status-active' : 'status-badge status-pending';
  badgeElem.textContent = patient.user_id % 2 === 0 ? 'กำลังรักษา' : 'รอการประเมิน';
  statusBadge.appendChild(badgeElem);
  
  // สร้างคำแนะนำโภชนาการตามโรค
  generateNutritionRecommendations(patient);
}

// ซ่อนทุกส่วน
function hideAllSections() {
  document.getElementById('patient-info').style.display = 'none';
  document.getElementById('nutrition-form').style.display = 'none';
  document.getElementById('nutrition-dashboard').style.display = 'none';
  document.getElementById('nutrition-table-container').style.display = 'none';
  document.getElementById('nutrition-recommendation').style.display = 'none';
  
  // ล้างข้อมูล
  currentPatient = null;
  nutritionData = [];
}

// โหลดข้อมูลโภชนาการ
function loadNutritionData(patientId) {
    // สร้างข้อมูลโภชนาการตัวอย่าง
    let sampleData = [];
    
    // สร้างข้อมูลโภชนาการย้อนหลัง 10 วัน
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // สร้างค่าสุ่มสำหรับข้อมูลโภชนาการ
      const calories = 1500 + Math.floor(Math.random() * 500);
      const protein = 60 + Math.floor(Math.random() * 30);
      const carbs = 150 + Math.floor(Math.random() * 50);
      const fats = 40 + Math.floor(Math.random() * 20);
      
      sampleData.push({
        nutrition_id: i + 1,
        date_logged: date.toISOString().split('T')[0],
        calories: calories,
        protein: protein,
        carbs: carbs,
        fats: fats
      });
    }
    
    nutritionData = sampleData;
    
    // แสดงข้อมูลในตาราง
    displayNutritionTable(nutritionData);
    
    // อัปเดตกราฟ
    updateCharts();
  }
  
  // แสดงข้อมูลโภชนาการในตาราง
  function displayNutritionTable(data) {
    const tableBody = document.getElementById('nutrition-table-body');
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" class="empty-table">ไม่พบข้อมูลโภชนาการ</td>';
      tableBody.appendChild(row);
      return;
    }
    
    // เรียงข้อมูลตามวันที่ล่าสุด
    data.sort((a, b) => new Date(b.date_logged) - new Date(a.date_logged));
    
    data.forEach(item => {
      const row = document.createElement('tr');
      
      // ปรับรูปแบบวันที่
      const dateParts = item.date_logged.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${item.calories.toLocaleString()}</td>
        <td>${item.protein.toLocaleString()}</td>
        <td>${item.carbs.toLocaleString()}</td>
        <td>${item.fats.toLocaleString()}</td>
        <td>
          <button class="button small-button" onclick="editNutritionData(${item.nutrition_id})">แก้ไข</button>
          <button class="button small-button delete-button" onclick="deleteNutritionData(${item.nutrition_id})">ลบ</button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  // อัปเดตกราฟ
  function updateCharts() {
    const dateRange = parseInt(document.getElementById('date-range').value);
    
    // กรองข้อมูลตามช่วงเวลาที่เลือก
    const filteredData = filterDataByDateRange(nutritionData, dateRange);
    
    // สร้างกราฟแคลอรี่
    createCaloriesChart(filteredData);
    
    // สร้างกราฟสัดส่วนสารอาหาร
    createNutrientsChart(filteredData);
  }
  
  // กรองข้อมูลตามช่วงเวลา
  function filterDataByDateRange(data, days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return data.filter(item => {
      const itemDate = new Date(item.date_logged);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }
  
  // รีเฟรชข้อมูลโภชนาการ
  function refreshNutritionData() {
    if (currentPatient) {
      loadNutritionData(currentPatient.user_id);
    }
  }
  
  // แสดงฟอร์มเพิ่มข้อมูลโภชนาการ
  function showNutritionForm() {
    document.getElementById('nutrition-form').style.display = 'block';
    document.getElementById('form-overlay').style.display = 'block';
  }
  
  // ซ่อนฟอร์มเพิ่มข้อมูลโภชนาการ
  function hideNutritionForm() {
    document.getElementById('nutrition-form').style.display = 'none';
    document.getElementById('form-overlay').style.display = 'none';
    
    // เปลี่ยนกลับเป็นฟอร์มเพิ่มข้อมูล (ไม่ใช่แก้ไข)
    document.querySelector('#nutrition-form .form-header h3').textContent = 'เพิ่มข้อมูลโภชนาการ';
    document.querySelector('#nutrition-form .form-actions .primary-button').textContent = 'บันทึกข้อมูล';
    
    // ล้างค่า data-edit-id
    document.getElementById('nutrition-form').removeAttribute('data-edit-id');
    
    // ล้างฟอร์ม
    document.getElementById('calories').value = '';
    document.getElementById('protein').value = '';
    document.getElementById('carbs').value = '';
    document.getElementById('fats').value = '';
    document.getElementById('date-logged').value = new Date().toISOString().split('T')[0];
  }
  
  // บันทึกข้อมูลโภชนาการ
  function submitNutritionData() {
    // ตรวจสอบข้อมูลที่กรอก
    const calories = document.getElementById('calories').value;
    const protein = document.getElementById('protein').value;
    const carbs = document.getElementById('carbs').value;
    const fats = document.getElementById('fats').value;
    const dateLogged = document.getElementById('date-logged').value;
    
    if (!calories || !protein || !carbs || !fats || !dateLogged) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    if (!currentPatient) {
      alert("กรุณาเลือกผู้ป่วยก่อนบันทึกข้อมูล");
      return;
    }
    
    const formElement = document.getElementById('nutrition-form');
    const isEditing = formElement.hasAttribute('data-edit-id');
    const editId = isEditing ? parseInt(formElement.dataset.editId) : null;
    
    // ข้อมูลที่จะบันทึกหรืออัปเดต
    const nutritionDataItem = {
      date_logged: dateLogged,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fats: parseFloat(fats)
    };
    
    if (isEditing) {
      // กรณีแก้ไขข้อมูล
      const index = nutritionData.findIndex(item => item.nutrition_id === editId);
      
      if (index !== -1) {
        // คงค่า nutrition_id เดิมไว้
        nutritionDataItem.nutrition_id = editId;
        
        // อัปเดตข้อมูลในอาร์เรย์
        nutritionData[index] = nutritionDataItem;
        
        alert("อัปเดตข้อมูลโภชนาการสำเร็จ");
      } else {
        alert("ไม่พบข้อมูลที่ต้องการแก้ไข");
      }
    } else {
      // กรณีเพิ่มข้อมูลใหม่
      nutritionDataItem.nutrition_id = generateNewId();
      
      // เพิ่มข้อมูลใหม่
      nutritionData.push(nutritionDataItem);
      
      alert("บันทึกข้อมูลโภชนาการสำเร็จ");
    }
    
    // อัปเดตการแสดงผล
    displayNutritionTable(nutritionData);
    updateCharts();
    
    // ซ่อนฟอร์ม
    hideNutritionForm();
  }
  
  // สร้าง ID ใหม่สำหรับข้อมูลโภชนาการ
  function generateNewId() {
    if (nutritionData.length === 0) {
      return 1;
    }
    return Math.max(...nutritionData.map(item => item.nutrition_id)) + 1;
  }
  
  // แก้ไขข้อมูลโภชนาการ
  function editNutritionData(nutritionId) {
    // ค้นหาข้อมูลที่ต้องการแก้ไข
    const nutritionItem = nutritionData.find(item => item.nutrition_id === nutritionId);
    
    if (!nutritionItem) {
      alert("ไม่พบข้อมูลที่ต้องการแก้ไข");
      return;
    }
    
    // เปลี่ยนชื่อฟอร์มเป็นแบบแก้ไข
    document.querySelector('#nutrition-form .form-header h3').textContent = 'แก้ไขข้อมูลโภชนาการ';
    
    // ใส่ข้อมูลเดิมลงในฟอร์ม
    document.getElementById('calories').value = nutritionItem.calories;
    document.getElementById('protein').value = nutritionItem.protein;
    document.getElementById('carbs').value = nutritionItem.carbs;
    document.getElementById('fats').value = nutritionItem.fats;
    document.getElementById('date-logged').value = nutritionItem.date_logged;
    
    // เพิ่ม data-id ให้ฟอร์มเพื่อระบุว่ากำลังแก้ไขข้อมูลใด
    document.getElementById('nutrition-form').dataset.editId = nutritionId;
    
    // เปลี่ยนปุ่มบันทึกเป็น "อัปเดตข้อมูล"
    document.querySelector('#nutrition-form .form-actions .primary-button').textContent = 'อัปเดตข้อมูล';
    
    // แสดงฟอร์ม
    showNutritionForm();
  }
  
  // ลบข้อมูลโภชนาการ
  function deleteNutritionData(nutritionId) {
    const confirmDelete = confirm("ต้องการลบข้อมูลโภชนาการนี้หรือไม่?");
    
    if (confirmDelete) {
      // ลบข้อมูลจาก array
      nutritionData = nutritionData.filter(item => item.nutrition_id !== nutritionId);
      
      // อัปเดตการแสดงผล
      displayNutritionTable(nutritionData);
      updateCharts();
      
      alert("ลบข้อมูลโภชนาการสำเร็จ");
    }
  }
  
  // สร้างคำแนะนำโภชนาการตามโรค
  function generateNutritionRecommendations(patient) {
    let recommendedCalories = 0;
    let recommendedProtein = 0;
    let recommendedCarbs = 0;
    let recommendedFats = 0;
    
    // สร้างข้อมูลคำแนะนำตามประเภทโรค
    if (patient.category === 'metabolism') {
      // สำหรับโรคเมตาบอลิซึม
      if (patient.disease === 'โรคเบาหวาน') {
        recommendedCalories = 1800;
        recommendedProtein = 90;
        recommendedCarbs = 180;
        recommendedFats = 60;
      } else if (patient.disease === 'โรคไขมันในเลือดสูง') {
        recommendedCalories = 1700;
        recommendedProtein = 85;
        recommendedCarbs = 190;
        recommendedFats = 45;
      } else {
        recommendedCalories = 1600;
        recommendedProtein = 80;
        recommendedCarbs = 200;
        recommendedFats = 50;
      }
    } else if (patient.category === 'cardiovascular') {
      // สำหรับโรคหัวใจและหลอดเลือด
      recommendedCalories = 1600;
      recommendedProtein = 80;
      recommendedCarbs = 180;
      recommendedFats = 50;
    } else if (patient.category === 'respiratory') {
      // สำหรับโรคระบบทางเดินหายใจ
      recommendedCalories = 2000;
      recommendedProtein = 100;
      recommendedCarbs = 220;
      recommendedFats = 60;
    } else {
      // ค่าเริ่มต้นสำหรับผู้ป่วยทั่วไป
      recommendedCalories = 2000;
      recommendedProtein = 75;
      recommendedCarbs = 250;
      recommendedFats = 65;
    }
    
    // แสดงค่าแนะนำ
    document.getElementById('recommended-calories').textContent = `${recommendedCalories} kcal`;
    document.getElementById('recommended-protein').textContent = `${recommendedProtein} g`;
    document.getElementById('recommended-carbs').textContent = `${recommendedCarbs} g`;
    document.getElementById('recommended-fats').textContent = `${recommendedFats} g`;
  }

  // สร้างกราฟแคลอรี่
  function createCaloriesChart(data) {
    const caloriesChartElement = document.getElementById('calories-chart');
    caloriesChartElement.innerHTML = '<canvas id="calories-canvas"></canvas>';
    
    // เรียงข้อมูลตามวันที่
    data.sort((a, b) => new Date(a.date_logged) - new Date(b.date_logged));
    
    // เตรียมข้อมูลสำหรับกราฟ
    const labels = data.map(item => {
      const date = new Date(item.date_logged);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    
    const caloriesData = data.map(item => item.calories);
    
    // หาค่าแนะนำแคลอรี่
    let recommendedCalories = 2000; // ค่าเริ่มต้น
    if (currentPatient) {
      const recommendedText = document.getElementById('recommended-calories').textContent;
      recommendedCalories = parseInt(recommendedText);
    }
    
    // สร้างกราฟ
    const ctx = document.getElementById('calories-canvas').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'แคลอรี่ (kcal)',
            data: caloriesData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.3,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            fill: true
          },
          {
            label: 'ค่าแนะนำ',
            data: Array(labels.length).fill(recommendedCalories),
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'แคลอรี่รายวัน',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'แคลอรี่ (kcal)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'วันที่ (วัน/เดือน)'
            }
          }
        }
      }
    });
  }
  
  // สร้างกราฟสัดส่วนสารอาหาร
  function createNutrientsChart(data) {
    const nutrientsChartElement = document.getElementById('nutrients-chart');
    nutrientsChartElement.innerHTML = '<div class="chart-title"><span class="nutrients-icon"></span>สัดส่วนพลังงานจากสารอาหาร</div><div class="pie-chart-container"><canvas id="nutrients-pie-canvas"></canvas></div>';
    
    // คำนวณค่าเฉลี่ยของสารอาหารแต่ละประเภท
    let avgProtein = 0;
    let avgCarbs = 0;
    let avgFats = 0;
    
    if (data.length > 0) {
      avgProtein = data.reduce((sum, item) => sum + item.protein, 0) / data.length;
      avgCarbs = data.reduce((sum, item) => sum + item.carbs, 0) / data.length;
      avgFats = data.reduce((sum, item) => sum + item.fats, 0) / data.length;
    }
    
    // คำนวณสัดส่วนพลังงานจากสารอาหารแต่ละประเภท
    // โปรตีน 4 kcal/g, คาร์โบไฮเดรต 4 kcal/g, ไขมัน 9 kcal/g
    const proteinCalories = avgProtein * 4;
    const carbsCalories = avgCarbs * 4;
    const fatCalories = avgFats * 9;
    const totalCalories = proteinCalories + carbsCalories + fatCalories;
    
    let proteinPercentage = 0;
    let carbsPercentage = 0;
    let fatPercentage = 0;
    
    if (totalCalories > 0) {
      proteinPercentage = (proteinCalories / totalCalories * 100).toFixed(1);
      carbsPercentage = (carbsCalories / totalCalories * 100).toFixed(1);
      fatPercentage = (fatCalories / totalCalories * 100).toFixed(1);
    }
    
    // สร้างกราฟวงกลม
    const pieCtx = document.getElementById('nutrients-pie-canvas').getContext('2d');
    
    new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: [
          `โปรตีน (${proteinPercentage}%)`, 
          `คาร์โบไฮเดรต (${carbsPercentage}%)`, 
          `ไขมัน (${fatPercentage}%)`
        ],
        datasets: [{
          data: [proteinCalories, carbsCalories, fatCalories],
          backgroundColor: [
            'rgba(33, 150, 243, 0.8)',  // สีฟ้าสำหรับโปรตีน
            'rgba(76, 175, 80, 0.8)',   // สีเขียวสำหรับคาร์โบไฮเดรต
            'rgba(255, 152, 0, 0.8)'    // สีส้มสำหรับไขมัน
          ],
          borderColor: [
            'rgba(33, 150, 243, 1)',
            'rgba(76, 175, 80, 1)',
            'rgba(255, 152, 0, 1)'
          ],
          borderWidth: 2,
          hoverOffset: 15,
          borderRadius: 5
        }]
      },
      options: {
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 0
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#333',
            titleFont: {
              family: 'Sarabun',
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              family: 'Sarabun',
              size: 13
            },
            padding: 12,
            borderColor: '#ddd',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${value.toFixed(1)} kcal`;
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 12,
              font: {
                family: 'Sarabun',
                size: 12
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1200,
          easing: 'easeOutQuart'
        }
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: function(chart) {
          const width = chart.width;
          const height = chart.height;
          const ctx = chart.ctx;
          
          ctx.restore();
          ctx.font = "bold 20px Sarabun";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#2E7D32";
          
          const text = `${Math.round(totalCalories)} kcal`;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2 + 5;
          
          ctx.fillText(text, textX, textY);
          
          ctx.font = "13px Sarabun";
          ctx.fillStyle = "#555";
          const subText = "พลังงานเฉลี่ย";
          const subTextX = Math.round((width - ctx.measureText(subText).width) / 2);
          const subTextY = height / 2 - 20;
          
          ctx.fillText(subText, subTextX, subTextY);
          ctx.save();
        }
      }]
    });
  }

  // ฟังก์ชันนำทางไปยังหน้าแก้ไขประวัติผู้ป่วย
function goToEditPatientPage() {
  if (!currentPatient) {
    alert('กรุณาเลือกผู้ป่วยก่อนแก้ไขประวัติ');
    return;
  }
  
  // นำทางไปยังหน้า history.html พร้อม ID ผู้ป่วย
  window.location.href = `history.html?id=${currentPatient.user_id}`;
}