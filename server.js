// 1. Import Dependencies
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// 2. Initialize Express App
const app = express();
const PORT = 5000;

// 3. Setup Middleware
app.use(cors());
app.use(bodyParser.json());

// --- DATABASE CONNECTION ---
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// --- MONGOOSE SCHEMAS & MODELS ---
// A Schema defines the structure of documents within a collection in MongoDB.

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // SECURITY WARNING: In a real app, ALWAYS HASH passwords using a library like bcrypt.
    // Storing plain text passwords is a major security risk.
    // The 'select: false' option prevents the password from being returned in queries by default.
    password: { type: String, required: true, select: false },
    role: { type: String, required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

const ExpenseSchema = new mongoose.Schema({
    // 'ref' creates a reference to the User model, linking expenses to users.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    comments: { type: String, default: '' },
});

const User = mongoose.model('User', UserSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

// --- API ENDPOINTS (Now using async/await with Mongoose) ---

// POST /api/login -> Authenticate a user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password'); // Explicitly request the password

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const { password: _, ...userToReturn } = user.toObject(); // Hide password before sending
        res.json({ message: "Login successful", user: userToReturn });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error });
    }
});

// POST /api/register -> Create a new user account
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        // In a real app, HASH the password here before saving!
        const newUser = new User({ name, email, password, role });
        await newUser.save();

        const { password: _, ...userToReturn } = newUser.toObject();
        res.status(201).json({ message: 'Registration successful', user: userToReturn });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error });
    }
});

// GET /api/data -> Fetch all users and expenses
app.get('/api/data', async (req, res) => {
    try {
        const users = await User.find(); // Password is not selected by default
        const expenses = await Expense.find();
        res.json({ users, expenses });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data.', error });
    }
});

// POST /api/expenses -> Create a new expense
app.post('/api/expenses', async (req, res) => {
    try {
        const newExpense = new Expense(req.body);
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: 'Error creating expense.', error });
    }
});

// PUT /api/expenses/:id -> Update an expense
app.put('/api/expenses/:id', async (req, res) => {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedExpense) return res.status(404).json({ message: 'Expense not found.' });
        res.json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense.', error });
    }
});

// PATCH /api/expenses/:id/status -> Update only the status
app.patch('/api/expenses/:id/status', async (req, res) => {
    try {
        const { status, comments } = req.body;
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            { status, comments },
            { new: true }
        );
        if (!updatedExpense) return res.status(404).json({ message: 'Expense not found.' });
        res.json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense status.', error });
    }
});

// 4. Start the Server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});