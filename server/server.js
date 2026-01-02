
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
// const nodemailer = require('nodemailer'); // Uncomment if you have SMTP credentials

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(bodyParser.json());

// --- Persistence Layer ---
const initDb = () => {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            users: [],
            tasks: [],
            subjects: [],
            schedule: [],
            notes: [],
            habits: [],
            savingsGoals: [],
            expenses: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
};

const getDb = () => {
    initDb();
    return JSON.parse(fs.readFileSync(DB_FILE));
};

const saveDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- Helper: OTP Generator ---
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// --- Helper: Send Email (Simulated) ---
const sendEmailOTP = async (email, otp) => {
    console.log("==================================================");
    console.log(`⚡️ [REAL-TIME LOGIN] Sending OTP to ${email}`);
    console.log(`🔑 YOUR LOGIN CODE IS: ${otp}`);
    console.log("==================================================");

    // TODO: To make this work with real Gmail/SendGrid, uncomment and configure below:
    /*
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'your-email@gmail.com', pass: 'your-app-password' }
    });
    await transporter.sendMail({
        from: 'EngiLife <noreply@engilife.ai>',
        to: email,
        subject: 'Your Verification Code',
        text: `Your code is ${otp}. It expires in 5 minutes.`
    });
    */
    return true;
};

// --- Middleware ---
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const tokenValue = token.split(' ')[1];
    if (!tokenValue) return res.status(401).json({ error: 'Invalid Token' });

    // In a real app, verify JWT signature. Here we parse the mock format.
    // Supports both mock frontend token (base64) and simple server token (userId|timestamp)
    let userId;
    
    try {
        if (tokenValue.includes('|')) {
            userId = tokenValue.split('|')[0];
        } else {
            const decoded = JSON.parse(Buffer.from(tokenValue, 'base64').toString());
            userId = decoded.sub;
        }
    } catch (e) {
        return res.status(401).json({ error: 'Invalid Token Format' });
    }

    if (!userId) return res.status(401).json({ error: 'Invalid Token Data' });

    req.user = { id: userId };
    next();
};

// --- Auth Routes ---

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.users.find(u => u.email === email);

    if (!user) {
        return res.status(400).json({ error: 'User not found.' });
    }

    // In a real app, bcrypt.compare(password, user.passwordHash)
    // For this simple file DB, we accept the login if user exists
    
    // Check if 2FA is enabled OR if email is unverified
    if (user.security.twoFactorEnabled || !user.emailVerified) {
        const otp = generateOTP();
        const expires = Date.now() + 5 * 60 * 1000; // 5 mins
        
        // Save OTP to user record
        user.otp = { code: otp, expires };
        saveDb(db);

        await sendEmailOTP(email, otp);

        return res.json({ 
            verificationRequired: true,
            message: 'OTP sent to email'
        });
    }

    // Direct Login
    user.security.lastLogin = new Date().toISOString();
    saveDb(db);
    return res.json({ 
        user, 
        token: `${user.id}|${Date.now()}` 
    });
});

app.post('/api/auth/signup', async (req, res) => {
    const { name, email, branch } = req.body;
    const db = getDb();

    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const otp = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000;

    const newUser = {
        id: 'user_' + Date.now(),
        name,
        email,
        emailVerified: false,
        branch: branch || 'Computer Science',
        university: 'Tech Institute',
        semester: 1,
        xp: 0,
        level: 1,
        achievements: [],
        bio: 'Engineering student ready to conquer.',
        joinedDate: new Date().toLocaleDateString(),
        security: { twoFactorEnabled: false, lastLogin: new Date().toISOString() },
        otp: { code: otp, expires }
    };

    db.users.push(newUser);
    saveDb(db);

    await sendEmailOTP(email, otp);

    res.json({ user: newUser, verificationRequired: true });
});

app.post('/api/auth/verify-email', (req, res) => {
    const { email, code } = req.body;
    const db = getDb();
    const user = db.users.find(u => u.email === email);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Real verification logic
    if (!user.otp || !user.otp.code) {
        return res.status(400).json({ error: 'No OTP request found. Please login again.' });
    }

    if (Date.now() > user.otp.expires) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp.code !== code) {
        return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Success
    user.emailVerified = true;
    user.otp = null; // Clear OTP
    user.security.lastLogin = new Date().toISOString();
    saveDb(db);

    return res.json({ 
        success: true, 
        user, 
        token: `${user.id}|${Date.now()}` 
    });
});

app.post('/api/auth/social-login', (req, res) => {
    const { provider, email, name, avatar } = req.body;
    const db = getDb();
    
    let user = db.users.find(u => u.email === email);

    if (user) {
        user.security.lastLogin = new Date().toISOString();
        if (!user.emailVerified) user.emailVerified = true;
    } else {
        user = {
            id: 'user_' + Date.now(),
            name: name || 'Student',
            email,
            emailVerified: true,
            branch: 'Computer Science',
            university: 'Tech Institute',
            semester: 1,
            xp: 0,
            level: 1,
            avatar: avatar,
            achievements: [],
            bio: `Joined via ${provider}`,
            joinedDate: new Date().toLocaleDateString(),
            security: { twoFactorEnabled: false, lastLogin: new Date().toISOString() }
        };
        db.users.push(user);
    }
    
    saveDb(db);
    res.json({ 
        user, 
        token: `${user.id}|${Date.now()}` 
    });
});

app.post('/api/auth/update', authenticate, (req, res) => {
    const updates = req.body;
    const db = getDb();
    const index = db.users.findIndex(u => u.id === req.user.id);

    if (index !== -1) {
        db.users[index] = { ...db.users[index], ...updates };
        saveDb(db);
        res.json(db.users[index]);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.get('/api/auth/me', authenticate, (req, res) => {
    const db = getDb();
    const user = db.users.find(u => u.id === req.user.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// --- Generic CRUD Generator ---
const createCrudRoutes = (resourceName) => {
    app.get(`/api/${resourceName}`, authenticate, (req, res) => {
        const db = getDb();
        const items = db[resourceName] || [];
        const userItems = items.filter(item => item.userId === req.user.id);
        res.json(userItems);
    });

    app.post(`/api/${resourceName}`, authenticate, (req, res) => {
        const db = getDb();
        const newItem = req.body;
        if (!newItem.id) newItem.id = Date.now().toString();
        newItem.userId = req.user.id;
        
        if (!db[resourceName]) db[resourceName] = [];
        db[resourceName].push(newItem);
        saveDb(db);
        res.json(newItem);
    });

    app.put(`/api/${resourceName}/:id`, authenticate, (req, res) => {
        const { id } = req.params;
        const db = getDb();
        const list = db[resourceName] || [];
        const index = list.findIndex(i => i.id === id);

        if (index !== -1) {
            if (list[index].userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
            
            db[resourceName][index] = { ...db[resourceName][index], ...req.body };
            saveDb(db);
            res.json(db[resourceName][index]);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    });

    app.delete(`/api/${resourceName}/:id`, authenticate, (req, res) => {
        const { id } = req.params;
        const db = getDb();
        const list = db[resourceName] || [];
        const item = list.find(i => i.id === id);
        
        if (!item) return res.status(404).json({ error: 'Item not found' });
        if (item.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        const newList = list.filter(i => i.id !== id);
        db[resourceName] = newList;
        saveDb(db);
        res.json({ success: true });
    });
};

['tasks', 'subjects', 'schedule', 'notes', 'habits', 'savingsGoals', 'expenses'].forEach(createCrudRoutes);

initDb();
app.listen(PORT, () => {
    console.log(`EngiLife Server running on http://localhost:${PORT}`);
    console.log(`Database persisting to: ${DB_FILE}`);
});
