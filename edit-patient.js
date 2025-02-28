// ตัวแปรสำหรับเก็บข้อมูลผู้ป่วยทั้งหมด
let allPatients = [];
// ตัวแปรสำหรับเก็บข้อมูลผู้ป่วยที่กำลังแก้ไข
let currentPatient = null;

// เริ่มทำงานเมื่อโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', function() {
  // โหลดข้อมูลผู้ป่วยทั้งหมด
  loadAllPatients();
  
  // ตรวจสอบว่ามีข้อมูลผู้ป่วยที่ถูกเลือกมาจากหน้าอื่นหรือไม่
  const selectedPatientId = getSelectedPatient();
  
  if (selectedPatientId) {
    selectPatientById(selectedPatientId);
    // ลบข้อมูลการเลือกเมื่อใช้งานเสร็จ
    clearSelectedPatient();
  } else {
    // ตรวจสอบ query parameters ในกรณีที่ไม่มีข้อมูลใน localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');
    
    if (patientId) {
      selectPatientById(patientId);
    }
  }
  
  // เพิ่ม event listener สำหรับคำนวณ BMI อัตโนมัติ
  document.getElementById('height').addEventListener('input', calculateBMI);
  document.getElementById('weight').addEventListener('input', calculateBMI);
  
  // เพิ่ม event listener สำหรับคำนวณอายุอัตโนมัติ
  document.getElementById('birth-date').addEventListener('change', calculateAge);
  
  // เพิ่ม event listener สำหรับปุ่มบันทึกและยกเลิก
  document.querySelector('.form-actions .primary-button').addEventListener('click', savePatientData);
  document.querySelector('.form-actions .secondary-button').addEventListener('click', cancelEditPatient);
});

// โหลดข้อมูลผู้ป่วยทั้งหมด
function loadAllPatients() {
  // ตรวจสอบข้อมูลใน localStorage ก่อน
  const storedPatients = getAllPatients();
  
  if (storedPatients && storedPatients.length > 0) {
    allPatients = storedPatients;
  } else {
    // กรณีไม่มีข้อมูลใน localStorage ให้ใช้ข้อมูลตัวอย่าง
    allPatients = [
      { 
        user_id: 1, 
        prefix: 'นาย',
        firstname: 'สมชาย', 
        lastname: 'วิชัยดิษฐ์', 
        gender: 'male',
        birthDate: '1980-05-15',
        age: 44,
        phone: '081-234-5678',
        email: 'somchai@example.com',
        address: '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
        emergencyContact: 'นางสมศรี วิชัยดิษฐ์ (ภรรยา) โทร. 081-876-5432',
        entryDate: '2023-10-01',
        disease: 'โรคเบาหวาน', 
        category: 'metabolism',
        height: 170,
        weight: 75,
        bmi: 25.95,
        bloodType: 'O',
        bloodPressure: '140/90',
        heartRate: 78,
        underlyingDiseases: ['diabetes', 'hypertension'],
        medication: 'Metformin 500mg วันละ 2 ครั้ง\nEnalapril 5mg วันละ 1 ครั้ง',
        medicalHistory: 'เคยผ่าตัดไส้ติ่งเมื่อปี 2563\nแพ้ยา Penicillin',
        foodRestrictions: ['gluten'],
        otherAllergies: 'แพ้เห็ด',
        activityLevel: 'light',
        mealFrequency: 3,
        targetWeight: 70,
        weightGoal: 'lose',
        dietPreference: 'อาหารไทย อาหารญี่ปุ่น',
        dietNotes: 'ชอบทานผลไม้ ไม่ชอบทานผัก'
      },
      { 
        user_id: 2, 
        prefix: 'นาง',
        firstname: 'สมหญิง', 
        lastname: 'รักษ์ไทย', 
        gender: 'female',
        birthDate: '1975-08-20',
        age: 49,
        phone: '089-876-5432',
        email: 'somying@example.com',
        address: '456 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
        emergencyContact: 'นายสมศักดิ์ รักษ์ไทย (สามี) โทร. 089-123-4567',
        entryDate: '2023-11-15',
        disease: 'โรคความดันโลหิตสูง', 
        category: 'cardiovascular',
        height: 160,
        weight: 65,
        bmi: 25.39,
        bloodType: 'A',
        bloodPressure: '145/95',
        heartRate: 82,
        underlyingDiseases: ['hypertension'],
        medication: 'Amlodipine 5mg วันละ 1 ครั้ง',
        medicalHistory: '',
        foodRestrictions: [],
        otherAllergies: '',
        activityLevel: 'sedentary',
        mealFrequency: 3,
        targetWeight: 60,
        weightGoal: 'lose',
        dietPreference: 'อาหารไทย',
        dietNotes: 'ไม่ทานเนื้อวัว'
      },
      { 
        user_id: 3, 
        prefix: 'นาย',
        firstname: 'ชาญชัย', 
        lastname: 'มีชัย', 
        gender: 'male',
        birthDate: '1990-03-10',
        age: 34,
        phone: '063-456-7890',
        email: 'chanchai@example.com',
        address: '789 ถ.เพชรเกษม แขวงหนองค้างพลู เขตหนองแขม กรุงเทพฯ 10160',
        emergencyContact: 'นางสาวชมพู่ มีชัย (น้องสาว) โทร. 063-987-6543',
        entryDate: '2024-01-05',
        disease: 'โรคหอบหืด', 
        category: 'respiratory',
        height: 175,
        weight: 68,
        bmi: 22.2,
        bloodType: 'B',
        bloodPressure: '120/80',
        heartRate: 75,
        underlyingDiseases: ['allergy'],
        medication: 'Ventolin พ่นเวลามีอาการ\nZyrtec 10mg เวลามีอาการแพ้',
        medicalHistory: 'มีอาการหอบหืดตั้งแต่วัยเด็ก',
        foodRestrictions: ['peanut'],
        otherAllergies: 'แพ้ฝุ่น ละอองเกสรดอกไม้',
        activityLevel: 'moderate',
        mealFrequency: 3,
        targetWeight: 70,
        weightGoal: 'gain',
        dietPreference: 'อาหารเพื่อสุขภาพ',
        dietNotes: 'ต้องการเพิ่มกล้ามเนื้อ'
      },
      { 
        user_id: 4, 
        prefix: 'นาย',
        firstname: 'วิชัย', 
        lastname: 'สุขสมบูรณ์', 
        gender: 'male',
        birthDate: '1965-12-05',
        age: 59,
        phone: '087-654-3210',
        email: 'vichai@example.com',
        address: '101 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
        emergencyContact: 'นายวิชิต สุขสมบูรณ์ (บุตรชาย) โทร. 087-123-4567',
        entryDate: '2023-09-10',
        disease: 'โรคไขมันในเลือดสูง', 
        category: 'metabolism',
        height: 172,
        weight: 80,
        bmi: 27.04,
        bloodType: 'O',
        bloodPressure: '130/85',
        heartRate: 76,
        underlyingDiseases: [],
        medication: 'Simvastatin 20mg ก่อนนอน',
        medicalHistory: '',
        foodRestrictions: [],
        otherAllergies: '',
        activityLevel: 'light',
        mealFrequency: 3,
        targetWeight: 75,
        weightGoal: 'lose',
        dietPreference: 'อาหารไทย อาหารจีน',
        dietNotes: ''
      },
      { 
        user_id: 5, 
        prefix: 'นางสาว',
        firstname: 'นารี', 
        lastname: 'สุนทรภู่', 
        gender: 'female',
        birthDate: '1985-07-22',
        age: 39,
        phone: '092-345-6789',
        email: 'naree@example.com',
        address: '202 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
        emergencyContact: 'นางสมใจ สุนทรภู่ (มารดา) โทร. 092-987-6543',
        entryDate: '2023-12-20',
        disease: 'โรคหัวใจ', 
        category: 'cardiovascular',
        height: 165,
        weight: 55,
        bmi: 20.2,
        bloodType: 'AB',
        bloodPressure: '110/70',
        heartRate: 68,
        underlyingDiseases: ['heart'],
        medication: 'Aspirin 81mg วันละ 1 เม็ด',
        medicalHistory: 'เคยผ่าตัดหัวใจเมื่อปี 2562',
        foodRestrictions: [],
        otherAllergies: '',
        activityLevel: 'light',
        mealFrequency: 5,
        targetWeight: 55,
        weightGoal: 'maintain',
        dietPreference: 'อาหารเพื่อสุขภาพ',
        dietNotes: 'ทานมังสวิรัติบางมื้อ'
      }
    ];
    
    // บันทึกข้อมูลลง localStorage
    storeAllPatients(allPatients);
  }
  
  // แสดงรายการผู้ป่วย
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
    
    // สร้างชื่อเต็มผู้ป่วย
    const fullName = `${patient.prefix} ${patient.firstname} ${patient.lastname}`;
    
    patientCard.innerHTML = `
      <div class="patient-card-header">
        <div class="patient-card-name">${fullName}</div>
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
    `${patient.firstname} ${patient.lastname}`.toLowerCase().includes(searchTerm) || 
    patient.disease.toLowerCase().includes(searchTerm)
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
  
  // แสดงแบบฟอร์มแก้ไขข้อมูล
  showPatientForm(patient);
  
  // อัปเดต URL เพื่อให้สามารถแชร์หรือบุ๊คมาร์คได้
  window.history.replaceState({}, '', `history.html?id=${patient.user_id}`);
}

// แสดงแบบฟอร์มข้อมูลผู้ป่วย
function showPatientForm(patient) {
  // แสดงฟอร์ม
  document.getElementById('patient-form').style.display = 'block';
  
  // ซ่อนรายการผู้ป่วย
  document.getElementById('patient-list').style.display = 'none';
  document.querySelector('.search-box').style.display = 'none';
  
  // กรอกข้อมูลลงในฟอร์ม
  
  // ข้อมูลส่วนตัว
  document.getElementById('patient-id').value = patient.user_id;
  document.getElementById('prefix').value = patient.prefix;
  document.getElementById('firstname').value = patient.firstname;
  document.getElementById('lastname').value = patient.lastname;
  document.getElementById('birth-date').value = patient.birthDate;
  document.getElementById('age').value = patient.age;
  document.getElementById('gender-male').checked = patient.gender === 'male';
  document.getElementById('gender-female').checked = patient.gender === 'female';
  document.getElementById('phone').value = patient.phone || '';
  document.getElementById('email').value = patient.email || '';
  document.getElementById('address').value = patient.address || '';
  document.getElementById('emergency-contact').value = patient.emergencyContact || '';
  document.getElementById('entry-date').value = patient.entryDate || '';
  
  // ข้อมูลทางการแพทย์
  document.getElementById('height').value = patient.height || '';
  document.getElementById('weight').value = patient.weight || '';
  document.getElementById('bmi').value = patient.bmi || '';
  document.getElementById('blood-type').value = patient.bloodType || 'O';
  document.getElementById('blood-pressure').value = patient.bloodPressure || '';
  document.getElementById('heart-rate').value = patient.heartRate || '';
  document.getElementById('disease').value = patient.disease || '';
  document.getElementById('disease-category').value = patient.category || 'other';
  
  // ล้างค่า checkboxes โรคประจำตัว
  document.querySelectorAll('input[name="underlying-disease"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // เลือก checkboxes ตามข้อมูลผู้ป่วย
  if (patient.underlyingDiseases) {
    patient.underlyingDiseases.forEach(disease => {
      const checkbox = document.getElementById(`disease-${disease}`);
      if (checkbox) checkbox.checked = true;
    });
  }
  
  document.getElementById('medication').value = patient.medication || '';
  document.getElementById('medical-history').value = patient.medicalHistory || '';
  
  // ข้อมูลโภชนาการ
  // ล้างค่า checkboxes ข้อจำกัดด้านอาหาร
  document.querySelectorAll('input[name="food-restrictions"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // เลือก checkboxes ตามข้อมูลผู้ป่วย
  if (patient.foodRestrictions) {
    patient.foodRestrictions.forEach(restriction => {
      const checkbox = document.getElementById(`allergy-${restriction}`);
      if (checkbox) checkbox.checked = true;
    });
  }
  
  document.getElementById('other-allergies').value = patient.otherAllergies || '';
  document.getElementById('activity-level').value = patient.activityLevel || 'sedentary';
  document.getElementById('meal-frequency').value = patient.mealFrequency || '3';
  document.getElementById('target-weight').value = patient.targetWeight || '';
  document.getElementById('weight-goal').value = patient.weightGoal || 'maintain';
  document.getElementById('diet-preference').value = patient.dietPreference || '';
  document.getElementById('diet-notes').value = patient.dietNotes || '';
  
  // แสดงแท็บข้อมูลส่วนตัว
  switchTab('personal-info');
}

// สลับแท็บ
function switchTab(tabId) {
  // ซ่อนทุกแท็บ
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // ลบ active จากทุกปุ่มแท็บ
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // แสดงแท็บที่เลือก
  document.getElementById(tabId).classList.add('active');
  
  // เพิ่ม active ให้ปุ่มแท็บที่เลือก
  document.querySelector(`.tab[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

// คำนวณ BMI
function calculateBMI() {
  const height = parseFloat(document.getElementById('height').value);
  const weight = parseFloat(document.getElementById('weight').value);
  
  if (height && weight) {
    // คำนวณ BMI (น้ำหนักหน่วยกิโลกรัม / (ส่วนสูงหน่วยเมตร)^2)
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    document.getElementById('bmi').value = bmi.toFixed(2);
  }
}

// คำนวณอายุจากวันเกิด
function calculateAge() {
  const birthDateStr = document.getElementById('birth-date').value;
  
  if (birthDateStr) {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // ถ้ายังไม่ถึงวันเกิดในปีนี้ ให้ลดอายุลง 1 ปี
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    document.getElementById('age').value = age;
  }
}

// บันทึกข้อมูลผู้ป่วย
function savePatientData() {
  // ตรวจสอบว่ามีการเลือกผู้ป่วยหรือไม่
  if (!currentPatient) {
    alert('ไม่พบข้อมูลผู้ป่วยที่จะบันทึก');
    return;
  }
  
  // ดึงข้อมูลจากฟอร์ม
  currentPatient.prefix = document.getElementById('prefix').value;
  currentPatient.firstname = document.getElementById('firstname').value;
  currentPatient.lastname = document.getElementById('lastname').value;
  currentPatient.birthDate = document.getElementById('birth-date').value;
  currentPatient.age = parseInt(document.getElementById('age').value);
  currentPatient.gender = document.getElementById('gender-male').checked ? 'male' : 'female';
  currentPatient.phone = document.getElementById('phone').value;
  currentPatient.email = document.getElementById('email').value;
  currentPatient.address = document.getElementById('address').value;
  currentPatient.emergencyContact = document.getElementById('emergency-contact').value;
  currentPatient.entryDate = document.getElementById('entry-date').value;
  currentPatient.height = parseFloat(document.getElementById('height').value);
  currentPatient.weight = parseFloat(document.getElementById('weight').value);
  currentPatient.bmi = parseFloat(document.getElementById('bmi').value);
  currentPatient.bloodType = document.getElementById('blood-type').value;
  currentPatient.bloodPressure = document.getElementById('blood-pressure').value;
  currentPatient.heartRate = parseInt(document.getElementById('heart-rate').value);
  currentPatient.disease = document.getElementById('disease').value;
  currentPatient.category = document.getElementById('disease-category').value;
  
  // เก็บโรคประจำตัว
  currentPatient.underlyingDiseases = [];
  document.querySelectorAll('input[name="underlying-disease"]:checked').forEach(checkbox => {
    currentPatient.underlyingDiseases.push(checkbox.value);
  });
  
  currentPatient.medication = document.getElementById('medication').value;
  currentPatient.medicalHistory = document.getElementById('medical-history').value;
  
  // เก็บข้อจำกัดด้านอาหาร
  currentPatient.foodRestrictions = [];
  document.querySelectorAll('input[name="food-restrictions"]:checked').forEach(checkbox => {
    currentPatient.foodRestrictions.push(checkbox.value);
  });
  
  currentPatient.otherAllergies = document.getElementById('other-allergies').value;
  currentPatient.activityLevel = document.getElementById('activity-level').value;
  currentPatient.mealFrequency = parseInt(document.getElementById('meal-frequency').value);
  currentPatient.targetWeight = parseFloat(document.getElementById('target-weight').value);
  currentPatient.weightGoal = document.getElementById('weight-goal').value;
  currentPatient.dietPreference = document.getElementById('diet-preference').value;
  currentPatient.dietNotes = document.getElementById('diet-notes').value;
  
  // อัปเดตข้อมูลผู้ป่วยในรายการทั้งหมด
  const index = allPatients.findIndex(p => p.user_id === currentPatient.user_id);
  if (index !== -1) {
    allPatients[index] = currentPatient;
    // บันทึกข้อมูลลง localStorage
    storeAllPatients(allPatients);
    
    // แสดงข้อความสำเร็จ
    alert('บันทึกข้อมูลสำเร็จ');
    
    // ตรวจสอบว่ามาจากหน้า nutrition หรือไม่
    if (document.referrer.includes('nutrition.html')) {
      // ถ้ามาจากหน้า nutrition ให้กลับไปที่หน้านั้น
      goToNutritionPage(currentPatient.user_id);
    } else {
      // กลับไปที่รายการผู้ป่วย
      document.getElementById('patient-form').style.display = 'none';
      document.getElementById('patient-list').style.display = 'block';
      document.querySelector('.search-box').style.display = 'block';
      
      // อัปเดตรายการผู้ป่วย
      displayPatientList(allPatients);
    }
  } else {
    // กรณีไม่พบผู้ป่วยในรายการ (ไม่ควรเกิดขึ้น)
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ไม่พบผู้ป่วยในระบบ');
  }
}

// ยกเลิกการแก้ไขข้อมูล
function cancelEditPatient() {
  // ตรวจสอบว่ามาจากหน้า nutrition หรือไม่
  if (document.referrer.includes('nutrition.html')) {
    // ถ้ามาจากหน้า nutrition ให้กลับไปที่หน้านั้น
    window.location.href = 'nutrition.html';
  } else {
    // กลับไปที่รายการผู้ป่วย
    document.getElementById('patient-form').style.display = 'none';
    document.getElementById('patient-list').style.display = 'block';
    document.querySelector('.search-box').style.display = 'block';
  }
}