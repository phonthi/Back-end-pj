const http = require('http');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require("path");

// ใช้ PORT จาก environment variable สำหรับ Vercel
const PORT = process.env.PORT || 3001;

// สร้างการเชื่อมต่อ MySQL โดยมีการจัดการข้อผิดพลาดที่ดีขึ้น
let connection;
try {
    // ใช้ production environment SSL หรือใช้ไฟล์ตาม path
    const sslCert = process.env.SSL_CERT || fs.readFileSync(path.join(__dirname, 'isrgrootx1.pem'));
    
    connection = mysql.createConnection({
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        user: '2LLA3VcZ2xDv9HN.root',
        password: "x78GsCrl3tF4FO7M",
        database: 'nutrition_management',
        port: 4000,
        ssl: {
            ca: sslCert
        }
    });
} catch (err) {
    console.error('Error setting up MySQL connection:', err.stack);
}

// เชื่อมต่อกับ MySQL และจัดการข้อผิดพลาด
function connectToDatabase() {
    if (!connection) {
        console.error('No database connection available');
        return;
    }
    
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err.stack);
            // ลองเชื่อมต่อใหม่หลังจาก delay
            setTimeout(connectToDatabase, 5000);
            return;
        }
        console.log('Connected to MySQL as id ' + connection.threadId);
    });
    
    // จัดการการเชื่อมต่อที่หลุด
    connection.on('error', (err) => {
        console.error('Database connection error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connectToDatabase();
        } else {
            throw err;
        }
    });
}

// เริ่มเชื่อมต่อกับฐานข้อมูล
connectToDatabase();

// แก้ไขการใช้งาน middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ฟังก์ชันเพื่อตรวจสอบการเชื่อมต่อ MySQL ก่อนที่จะดำเนินการกับ query
function safeQuery(sql, params, res, callback) {
    if (!connection) {
        return res.status(500).json({ 
            error: true, 
            message: "Database connection not available" 
        });
    }
    
    connection.query(sql, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: true, 
                message: err.message 
            });
        }
        callback(results);
    });
}

// API Documentation
app.get('/', (req, res) => {
    res.json({
        "Name": "Nutrition Management API",
        "Author": "Charoenporn Bouyam",
        "APIs": [
            // Users
            { "api_name": "/getUsers/", "method": "get", "description": "Get all users" },
            { "api_name": "/getUser/:id", "method": "get", "description": "Get user by ID" },
            { "api_name": "/addUser/", "method": "post", "description": "Add new user" },
            { "api_name": "/updateUser/", "method": "put", "description": "Update user" },
            { "api_name": "/deleteUser/:id", "method": "delete", "description": "Delete user" },
            
            // Roles
            { "api_name": "/getRoles/", "method": "get", "description": "Get all roles" },
            { "api_name": "/getRole/:id", "method": "get", "description": "Get role by ID" },
            
            // Nutrition Data
            { "api_name": "/getNutritionData/", "method": "get", "description": "Get all nutrition data" },
            { "api_name": "/getNutritionDataByUser/:userId", "method": "get", "description": "Get nutrition data by user ID" },
            { "api_name": "/addNutritionData", "method": "post", "description": "Add new nutrition data" },
            { "api_name": "/updateNutritionData/:id", "method": "put", "description": "Update nutrition data" },
            { "api_name": "/deleteNutritionData/:id", "method": "delete", "description": "Delete nutrition data" },
            
            // Meal Plans
            { "api_name": "/getMealPlans/", "method": "get", "description": "Get all meal plans" },
            { "api_name": "/getMealPlansByUser/:userId", "method": "get", "description": "Get meal plans by user ID" },
            { "api_name": "/addMealPlan/", "method": "post", "description": "Add new meal plan" },
            { "api_name": "/updateMealPlan/", "method": "put", "description": "Update meal plan" },
            { "api_name": "/deleteMealPlan/:id", "method": "delete", "description": "Delete meal plan" },
            
            // Activity Logs
            { "api_name": "/getActivityLogs/", "method": "get", "description": "Get all activity logs" },
            { "api_name": "/getActivityLogsByUser/:userId", "method": "get", "description": "Get activity logs by user ID" },
            { "api_name": "/addActivityLog/", "method": "post", "description": "Add new activity log" },
            { "api_name": "/updateActivityLog/", "method": "put", "description": "Update activity log" },
            { "api_name": "/deleteActivityLog/:id", "method": "delete", "description": "Delete activity log" },
            
            // Alerts
            { "api_name": "/getAlerts/", "method": "get", "description": "Get all alerts" },
            { "api_name": "/getAlertsByUser/:userId", "method": "get", "description": "Get alerts by user ID" },
            { "api_name": "/addAlert/", "method": "post", "description": "Add new alert" },
            { "api_name": "/markAlertAsRead/:id", "method": "put", "description": "Mark alert as read" },
            { "api_name": "/deleteAlert/:id", "method": "delete", "description": "Delete alert" },
            
            // Backup
            { "api_name": "/getBackups/", "method": "get", "description": "Get all backups" },
            { "api_name": "/addBackup/", "method": "post", "description": "Create new backup" },
            { "api_name": "/deleteBackup/:id", "method": "delete", "description": "Delete backup" },
            
            // Dashboard
            { "api_name": "/getUserSummary/:userId", "method": "get", "description": "Get user summary with nutrition info" },
            { "api_name": "/getNutritionByDateRange/:userId/:startDate/:endDate", "method": "get", "description": "Get nutrition data by date range" },
            { "api_name": "/getDailyNutritionSummary/:userId/:date", "method": "get", "description": "Get daily nutrition summary" }
        ]
    });
});

// แก้ไขการสร้าง server เพื่อรองรับ Vercel
const server = http.createServer(app);

// แก้ไขการ listen ให้ใช้งานกับ Vercel ได้ (ไม่ระบุ host)
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/getUserSummary/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
    SELECT 
        u.user_id, u.username, u.full_name,
        SUM(nd.calories) as total_calories,
        SUM(nd.protein) as total_protein,
        SUM(nd.carbs) as total_carbs,
        SUM(nd.fats) as total_fats,
        COUNT(DISTINCT nd.date_logged) as days_logged,
        COUNT(al.log_id) as activity_count,
        SUM(al.calories_burned) as total_calories_burned
    FROM users u
    LEFT JOIN nutrition_data nd ON u.user_id = nd.user_id
    LEFT JOIN activity_logs al ON u.user_id = al.user_id
    WHERE u.user_id = ?
    GROUP BY u.user_id, u.username, u.full_name
    `;
    
    safeQuery(sql, [userId], res, (results) => {
        if (results.length === 0) {
            return res.status(404).json({ error: true, message: "User not found" });
        }
        res.json(results[0]);
    });
});

// ==============================
// ROLES APIs
// ==============================
app.get('/getRoles/', (req, res) => {
    let sql = 'SELECT * FROM roles';
    safeQuery(sql, [], res, (results) => {
        res.json(results);
    });
});

app.get('/getRole/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'SELECT * FROM roles WHERE role_id = ?';
    safeQuery(sql, [id], res, (results) => {
        if (results.length === 0) {
            return res.status(404).json({ error: true, message: "Role not found" });
        }
        res.json(results[0]);
    });
});

app.post('/addRole', (req, res) => {
    if (!req.body.role_name) {
        return res.status(400).json({ 
            error: true, 
            message: "Missing role_name field" 
        });
    }

    const sql = 'INSERT INTO roles(role_name) VALUES (?)';
    safeQuery(sql, [req.body.role_name], res, (results) => {
        res.json({ 
            error: false, 
            data: results, 
            message: "Role added successfully" 
        });
    });
});

app.put('/updateRole', (req, res) => {
    if (!req.body.role_id || !req.body.role_name) {
        return res.status(400).json({
            error: true,
            message: "Missing role_id or role_name"
        });
    }

    let sql = 'UPDATE roles SET role_name = ? WHERE role_id = ?';
    let values = [req.body.role_name, req.body.role_id];
    
    safeQuery(sql, values, res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "Role not found" });
        }
        res.json({ error: false, data: results, message: "Role updated successfully" });
    });
});

app.delete('/deleteRole/:id', (req, res) => {
    let id = req.params.id;
    
    // Check if role is being used by any user
    let checkSql = 'SELECT COUNT(*) as count FROM users WHERE role_id = ?';
    safeQuery(checkSql, [id], res, (checkResults) => {
        if (checkResults[0].count > 0) {
            return res.status(400).json({ 
                error: true, 
                message: "Cannot delete role that is assigned to users" 
            });
        }
        
        let sql = 'DELETE FROM roles WHERE role_id = ?';
        safeQuery(sql, [id], res, (results) => {
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: true, message: "Role not found" });
            }
            res.json({ error: false, message: "Role deleted successfully" });
        });
    });
});

// ==============================
// USERS APIs
// ==============================
app.get('/getUsers/', (req, res) => {
    let sql = 'SELECT * FROM users';
    safeQuery(sql, [], res, (results) => {
        res.json(results);
    });
});

app.get('/getUser/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'SELECT * FROM users WHERE user_id = ?';
    safeQuery(sql, [id], res, (results) => {
        if (results.length === 0) {
            return res.status(404).json({ error: true, message: "User not found" });
        }
        res.json(results[0]);
    });
});

app.post('/addUser', (req, res) => {
    if (!req.body.username || !req.body.email || !req.body.password || !req.body.full_name || !req.body.role_id) {
        return res.status(400).json({ 
            error: true, 
            message: "Missing required fields" 
        });
    }

    const sql = 'INSERT INTO users(username, email, password, full_name, role_id) VALUES (?, ?, SHA2(?, 256), ?, ?)';
    const values = [
        req.body.username, 
        req.body.email, 
        req.body.password, 
        req.body.full_name, 
        req.body.role_id
    ];
    
    safeQuery(sql, values, res, (results) => {
        res.json({ 
            error: false, 
            data: results, 
            message: "User added successfully" 
        });
    });
});

app.put('/updateUser', (req, res) => {
    if (!req.body.user_id) {
        return res.status(400).json({
            error: true,
            message: "Missing user_id"
        });
    }

    let sql = 'UPDATE users SET username = ?, email = ?, full_name = ?, role_id = ? WHERE user_id = ?';
    let values = [
        req.body.username, 
        req.body.email, 
        req.body.full_name, 
        req.body.role_id, 
        req.body.user_id
    ];
    
    safeQuery(sql, values, res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "User not found" });
        }
        res.json({ error: false, data: results, message: "User updated successfully" });
    });
});

app.put('/updateUserPassword', (req, res) => {
    if (!req.body.user_id || !req.body.password) {
        return res.status(400).json({
            error: true,
            message: "Missing user_id or password"
        });
    }

    let sql = 'UPDATE users SET password = SHA2(?, 256) WHERE user_id = ?';
    let values = [req.body.password, req.body.user_id];
    
    safeQuery(sql, values, res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "User not found" });
        }
        res.json({ error: false, message: "Password updated successfully" });
    });
});

app.delete('/deleteUser/:id', (req, res) => {
    let id = req.params.id;
    
    // Start transaction to delete related records
    if (!connection) {
        return res.status(500).json({ error: true, message: "Database connection not available" });
    }
    
    connection.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ error: true, message: err.message });
        }
        
        // Delete from related tables
        const tables = ['nutrition_data', 'meal_plans', 'activity_logs', 'alerts', 'backup'];
        let promises = tables.map(table => {
            return new Promise((resolve, reject) => {
                let sql = `DELETE FROM ${table} WHERE user_id = ?`;
                connection.query(sql, [id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
        
        Promise.all(promises)
            .then(() => {
                // Now delete the user
                let sql = 'DELETE FROM users WHERE user_id = ?';
                connection.query(sql, [id], (err, results) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ error: true, message: err.message });
                        });
                    }
                    
                    if (results.affectedRows === 0) {
                        return connection.rollback(() => {
                            res.status(404).json({ error: true, message: "User not found" });
                        });
                    }
                    
                    connection.commit(err => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ error: true, message: err.message });
                            });
                        }
                        res.json({ error: false, message: "User and all related data deleted successfully" });
                    });
                });
            })
            .catch(err => {
                connection.rollback(() => {
                    res.status(500).json({ error: true, message: err.message });
                });
            });
    });
});

// ==============================
// NUTRITION_DATA APIs
// ==============================
app.get('/getNutritionData/', (req, res) => {
    let sql = 'SELECT * FROM nutrition_data';
    safeQuery(sql, [], res, (results) => {
        res.json(results);
    });
});

app.get('/getNutritionDataByUser/:userId', (req, res) => {
    let userId = req.params.userId;
    let sql = 'SELECT * FROM nutrition_data WHERE user_id = ? ORDER BY date_logged DESC';
    safeQuery(sql, [userId], res, (results) => {
        res.json(results);
    });
});

app.get('/getNutritionDataByDate/:userId/:date', (req, res) => {
    let { userId, date } = req.params;
    let sql = 'SELECT * FROM nutrition_data WHERE user_id = ? AND date_logged = ?';
    safeQuery(sql, [userId, date], res, (results) => {
        res.json(results);
    });
});

app.post('/addNutritionData', (req, res) => {
    if (!req.body.user_id || !req.body.calories || !req.body.protein || !req.body.carbs || !req.body.fats) {
        return res.status(400).json({ 
            error: true, 
            message: "Missing required fields" 
        });
    }

    const sql = 'INSERT INTO nutrition_data(user_id, calories, protein, carbs, fats, date_logged) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [
        req.body.user_id, 
        req.body.calories, 
        req.body.protein, 
        req.body.carbs, 
        req.body.fats, 
        req.body.date_logged || new Date().toISOString().split('T')[0]
    ];
    
    safeQuery(sql, values, res, (results) => {
        res.json({ 
            error: false, 
            data: results, 
            message: "Nutrition data added successfully" 
        });
    });
});

app.put('/updateNutritionData/:id', (req, res) => {
    let nutritionId = req.params.id;
    
    let sql = 'UPDATE nutrition_data SET calories = ?, protein = ?, carbs = ?, fats = ? WHERE nutrition_id = ?';
    let values = [
        req.body.calories, 
        req.body.protein, 
        req.body.carbs, 
        req.body.fats, 
        nutritionId
    ];
    
    safeQuery(sql, values, res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "Nutrition data not found" });
        }
        res.json({ error: false, data: results, message: "Nutrition data updated successfully" });
    });
});

app.delete('/deleteNutritionData/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'DELETE FROM nutrition_data WHERE nutrition_id = ?';
    
    safeQuery(sql, [id], res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "Nutrition data not found" });
        }
        res.json({ error: false, message: "Nutrition data deleted successfully" });
    });
});

// ==============================
// BACKUP APIs
// ==============================
app.get('/getBackups/', (req, res) => {
    let sql = 'SELECT * FROM backup ORDER BY backup_date DESC';
    safeQuery(sql, [], res, (results) => {
        res.json(results);
    });
});

app.get('/getBackupsByUser/:userId', (req, res) => {
    let userId = req.params.userId;
    let sql = 'SELECT * FROM backup WHERE user_id = ? ORDER BY backup_date DESC';
    safeQuery(sql, [userId], res, (results) => {
        res.json(results);
    });
});

app.get('/getBackup/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'SELECT * FROM backup WHERE backup_id = ?';
    safeQuery(sql, [id], res, (results) => {
        if (results.length === 0) {
            return res.status(404).json({ error: true, message: "Backup not found" });
        }
        res.json(results[0]);
    });
});

app.post('/addBackup', (req, res) => {
    if (!req.body.user_id || !req.body.backup_file) {
        return res.status(400).json({ 
            error: true, 
            message: "Missing required fields" 
        });
    }

    const sql = 'INSERT INTO backup(user_id, backup_file) VALUES (?, ?)';
    const values = [
        req.body.user_id, 
        req.body.backup_file
    ];
    
    safeQuery(sql, values, res, (results) => {
        res.json({ 
            error: false, 
            data: results, 
            message: "Backup added successfully" 
        });
    });
});

app.delete('/deleteBackup/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'DELETE FROM backup WHERE backup_id = ?';
    
    safeQuery(sql, [id], res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "Backup not found" });
        }
        res.json({ error: false, message: "Backup deleted successfully" });
    });
});

// ==============================
// ALERTS APIs
// ==============================
app.get('/getAlerts/', (req, res) => {
    let sql = 'SELECT * FROM alerts ORDER BY alert_date DESC';
    safeQuery(sql, [], res, (results) => {
        res.json(results);
    });
});

app.get('/getAlertsByUser/:userId', (req, res) => {
    let userId = req.params.userId;
    let sql = 'SELECT * FROM alerts WHERE user_id = ? ORDER BY alert_date DESC';
    safeQuery(sql, [userId], res, (results) => {
        res.json(results);
    });
});

app.get('/getUnreadAlertsByUser/:userId', (req, res) => {
    let userId = req.params.userId;
    let sql = 'SELECT * FROM alerts WHERE user_id = ? AND is_read = 0 ORDER BY alert_date DESC';
    safeQuery(sql, [userId], res, (results) => {
        res.json(results);
    });
});

app.post('/addAlert', (req, res) => {
    if (!req.body.user_id || !req.body.alert_message) {
        return res.status(400).json({ 
            error: true, 
            message: "Missing required fields" 
        });
    }

    const sql = 'INSERT INTO alerts(user_id, alert_message) VALUES (?, ?)';
    const values = [
        req.body.user_id, 
        req.body.alert_message
    ];
    
    safeQuery(sql, values, res, (results) => {
        res.json({ 
            error: false, 
            data: results, 
            message: "Alert added successfully" 
        });
    });
});

app.put('/markAlertAsRead/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'UPDATE alerts SET is_read = 1 WHERE alert_id = ?';
    
    safeQuery(sql, [id], res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "Alert not found" });
        }
        res.json({ error: false, message: "Alert marked as read" });
    });
});

app.put('/markAllAlertsAsRead/:userId', (req, res) => {
    let userId = req.params.userId;
    let sql = 'UPDATE alerts SET is_read = 1 WHERE user_id = ?';
    
    safeQuery(sql, [userId], res, (results) => {
        res.json({ 
            error: false, 
            message: `Marked ${results.affectedRows} alerts as read` 
        });
    });
});

app.delete('/deleteAlert/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'DELETE FROM alerts WHERE alert_id = ?';
    
    safeQuery(sql, [id], res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "Alert not found" });
        }
        res.json({ error: false, message: "Alert deleted successfully" });
    });
});

app.delete('/deleteAllAlertsByUser/:userId', (req, res) => {
    let userId = req.params.userId;
    let sql = 'DELETE FROM alerts WHERE user_id = ?';
    
    safeQuery(sql, [userId], res, (results) => {
        res.json({ 
            error: false, 
            message: `Deleted ${results.affectedRows} alerts for user` 
        });
    });
});

// ==============================
// MEAL_PLANS APIs
// ==============================
app.get('/getMealPlans/', (req, res) => {
    let sql = 'SELECT * FROM meal_plans';
    safeQuery(sql, [], res, (results) => {
        res.json(results);
    });
});

app.get('/getMealPlansByUser/:userId', (req, res) => {
    let userId = req.params.userId;
    let sql = 'SELECT * FROM meal_plans WHERE user_id = ?';
    safeQuery(sql, [userId], res, (results) => {
        res.json(results);
    });
});

app.get('/getMealPlan/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'SELECT * FROM meal_plans WHERE plan_id = ?';
    safeQuery(sql, [id], res, (results) => {
        if (results.length === 0) {
            return res.status(404).json({ error: true, message: "Meal plan not found" });
        }
        res.json(results[0]);
    });
});

app.post('/addMealPlan', (req, res) => {
    if (!req.body.user_id || !req.body.meal_name || !req.body.calories) {
        return res.status(400).json({ 
            error: true, 
            message: "Missing required fields" 
        });
    }

    const sql = 'INSERT INTO meal_plans(user_id, meal_name, description, calories) VALUES (?, ?, ?, ?)';
    const values = [
        req.body.user_id, 
        req.body.meal_name, 
        req.body.description || null, 
        req.body.calories
    ];
    
    safeQuery(sql, values, res, (results) => {
        res.json({ 
            error: false, 
            data: results, 
            message: "Meal plan added successfully" 
        });
    });
});

app.put('/updateMealPlan', (req, res) => {
    if (!req.body.plan_id) {
        return res.status(400).json({
            error: true,
            message: "Missing plan_id"
        });
    }

    let sql = 'UPDATE meal_plans SET meal_name = ?, description = ?, calories = ? WHERE plan_id = ?';
    let values = [
        req.body.meal_name, 
        req.body.description, 
        req.body.calories, 
        req.body.plan_id
    ];
    
    safeQuery(sql, values, res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "Meal plan not found" });
        }
        res.json({ error: false, data: results, message: "Meal plan updated successfully" });
    });
});

app.delete('/deleteMealPlan/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'DELETE FROM meal_plans WHERE plan_id = ?';
    
    safeQuery(sql, [id], res, (results) => {
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: true, message: "Meal plan not found" });
        }
        res.json({ error: false, message: "Meal plan deleted successfully" });
    });
});

// ==============================
// ACTIVITY_LOGS APIs
//
