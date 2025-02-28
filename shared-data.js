// shared-data.js
const sharedPatientsData = [
    { 
      id: 1, 
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
      dietNotes: 'ชอบทานผลไม้ ไม่ชอบทานผัก',
      status: 'active',
      nutrition: [
        { date: '2025-02-25', calories: 1850, protein: 85, carbs: 220, fats: 65 },
        { date: '2025-02-26', calories: 1780, protein: 90, carbs: 200, fats: 60 }
      ]
    },
    // ข้อมูลผู้ป่วยคนอื่นๆ...
  ];
  
  // ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ป่วย
  function updatePatientData(updatedPatient) {
    const index = sharedPatientsData.findIndex(p => p.id === updatedPatient.id);
    if (index !== -1) {
      sharedPatientsData[index] = updatedPatient;
      
      // บันทึกข้อมูลลง localStorage เพื่อให้สามารถใช้ข้อมูลร่วมกันระหว่างหน้าได้
      localStorage.setItem('patientsData', JSON.stringify(sharedPatientsData));
      return true;
    }
    return false;
  }
  
  // ฟังก์ชันสำหรับโหลดข้อมูลผู้ป่วย
  function loadPatientsData() {
    const savedData = localStorage.getItem('patientsData');
    if (savedData) {
      const loadedData = JSON.parse(savedData);
      // อัปเดตข้อมูลในตัวแปรกลาง
      loadedData.forEach((patient, index) => {
        if (index < sharedPatientsData.length) {
          sharedPatientsData[index] = patient;
        }
      });
      return true;
    }
    return false;
  }
  
  // ฟังก์ชันเพื่อรับข้อมูลผู้ป่วยตาม ID
  function getPatientById(id) {
    // แปลง ID เป็นตัวเลขหากเป็นข้อความ
    const patientId = typeof id === 'string' ? parseInt(id) : id;
    return sharedPatientsData.find(p => p.id === patientId);
  }