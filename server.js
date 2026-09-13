const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'unipulse_app';
const JWT_SECRET = process.env.JWT_SECRET || 'unipulse-local-fallback-change-me';
if (!MONGODB_URI) {
  console.error('MONGODB_URI is missing. Start UniPulse using RUN_UNIPULSE_WINDOWS.bat.');
  process.exit(1);
}

mongoose.set('strictQuery', true);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  program: { type: String, default: 'M.Information Systems' },
  year: { type: Number, default: 2 },
  notifications: { type: Boolean, default: true }
}, { timestamps: true });

const classSchema = new mongoose.Schema({
  dayIndex: { type: Number, min: 0, max: 6, required: true },
  dateLabel: String,
  time: String,
  title: String,
  location: String,
  lecturer: String,
  color: String
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: String,
  dateLabel: String,
  timeLocation: String,
  category: String,
  freeFood: { type: Boolean, default: false }
}, { timestamps: true });

const rsvpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }
}, { timestamps: true });
rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: Number, min: 0, max: 4, required: true }
}, { timestamps: true });

const counsellingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedSlot: { type: String, default: '2:30 PM' },
  status: { type: String, enum: ['requested', 'confirmed', 'cancelled'], default: 'requested' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const ClassItem = mongoose.model('ClassItem', classSchema);
const Event = mongoose.model('Event', eventSchema);
const Rsvp = mongoose.model('Rsvp', rsvpSchema);
const Mood = mongoose.model('Mood', moodSchema);
const Counselling = mongoose.model('Counselling', counsellingSchema);

const publicUser = (u) => ({
  id: u._id.toString(), name: u.name, email: u.email,
  program: u.program, year: u.year, notifications: u.notifications
});
const tokenFor = (u) => jwt.sign({ sub: u._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

async function auth(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Authentication required.' });
    const p = jwt.verify(token, JWT_SECRET);
    const u = await User.findById(p.sub);
    if (!u) return res.status(401).json({ message: 'User not found.' });
    req.user = u;
    next();
  } catch (_) {
    res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

app.get('/health', (_, res) => res.json({ ok: true, service: 'unipulse-windows', database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' }));
app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || !email.includes('@') || password.length < 6) {
      return res.status(400).json({ message: 'Enter a valid name, email and password of at least 6 characters.' });
    }
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const u = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: tokenFor(u), user: publicUser(u) });
  } catch (e) {
    console.error('Register error:', e.message);
    res.status(500).json({ message: 'Could not create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const u = await User.findOne({ email });
    if (!u || !(await bcrypt.compare(password, u.passwordHash))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    res.json({ token: tokenFor(u), user: publicUser(u) });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(500).json({ message: 'Login failed.' });
  }
});

app.get('/api/dashboard', auth, async (req, res) => {
  const nextClass = await ClassItem.findOne({ dayIndex: 3, time: '11:00' }) || await ClassItem.findOne({ dayIndex: 3 }).sort({ time: 1 });
  const event = await Event.findOne().sort({ createdAt: 1 });
  const going = event ? !!(await Rsvp.exists({ user: req.user._id, event: event._id })) : false;
  res.json({ user: publicUser(req.user), nextClass, event: event ? { ...event.toObject(), going } : null });
});

app.get('/api/timetable', auth, async (req, res) => {
  const dayIndex = Number(req.query.dayIndex ?? 3);
  res.json(await ClassItem.find({ dayIndex }).sort({ time: 1 }));
});

app.get('/api/events', auth, async (req, res) => {
  const category = String(req.query.category || 'All');
  const search = String(req.query.search || '').trim();
  const filter = {};
  if (category === 'Clubs') filter.category = 'Clubs';
  if (category === 'Free Food') filter.freeFood = true;
  if (search) filter.title = { $regex: search, $options: 'i' };
  const events = await Event.find(filter).sort({ createdAt: 1 });
  const rsvps = await Rsvp.find({ user: req.user._id, event: { $in: events.map(e => e._id) } });
  const set = new Set(rsvps.map(r => r.event.toString()));
  res.json(events.map(e => ({ ...e.toObject(), going: set.has(e._id.toString()) })));
});

app.post('/api/events/:id/rsvp', auth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  const existing = await Rsvp.findOne({ user: req.user._id, event: event._id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ going: false });
  }
  await Rsvp.create({ user: req.user._id, event: event._id });
  res.json({ going: true });
});

app.get('/api/wellbeing', auth, async (req, res) => {
  const latest = await Mood.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  const appointments = await Counselling.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
  res.json({ mood: latest ? latest.mood : 3, appointments });
});

app.post('/api/wellbeing/mood', auth, async (req, res) => {
  const mood = Number(req.body.mood);
  if (!Number.isInteger(mood) || mood < 0 || mood > 4) return res.status(400).json({ message: 'Mood must be from 0 to 4.' });
  const item = await Mood.create({ user: req.user._id, mood });
  res.status(201).json(item);
});

app.post('/api/wellbeing/counselling', auth, async (req, res) => {
  const requestedSlot = String(req.body.requestedSlot || '2:30 PM');
  const item = await Counselling.create({ user: req.user._id, requestedSlot });
  res.status(201).json(item);
});

app.get('/api/profile', auth, async (req, res) => res.json(publicUser(req.user)));
app.put('/api/profile', auth, async (req, res) => {
  const name = String(req.body.name ?? req.user.name).trim();
  const program = String(req.body.program ?? req.user.program).trim();
  const year = Number(req.body.year ?? req.user.year);
  if (name.length < 2) return res.status(400).json({ message: 'Name is too short.' });
  req.user.name = name;
  req.user.program = program || 'M.Information Systems';
  req.user.year = Math.max(1, Math.min(8, Number.isFinite(year) ? year : 1));
  await req.user.save();
  res.json(publicUser(req.user));
});

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') return next();
  res.sendFile(path.join(publicDir, 'index.html'));
});

async function seed() {
  let demo = await User.findOne({ email: 'demo@unipulse.local' });
  if (!demo) {
    demo = await User.create({
      name: 'Priya Sharma', email: 'demo@unipulse.local',
      passwordHash: await bcrypt.hash('Demo123!', 10),
      program: 'M.Information Systems', year: 2
    });
  }

  if (await ClassItem.countDocuments() === 0) {
    await ClassItem.insertMany([
      { dayIndex: 1, dateLabel: 'Sun 12 Apr', time: '10:00', title: 'BUS204 Business Analytics', location: 'Building C, Room 112', lecturer: 'Dr. Noor', color: 'green' },
      { dayIndex: 2, dateLabel: 'Mon 13 Apr', time: '13:00', title: 'MIS205 Database Systems', location: 'Lab B14', lecturer: 'Prof. Lewis', color: 'orange' },
      { dayIndex: 3, dateLabel: 'Tue 14 Apr', time: '09:00', title: 'MIS202 Systems Analysis', location: 'Building A, Room 105', lecturer: 'Dr. Chen', color: 'indigo' },
      { dayIndex: 3, dateLabel: 'Tue 14 Apr', time: '11:00', title: 'MIS210 Enterprise Systems', location: 'Building A, Room 203', lecturer: 'Dr. Maya Patel', color: 'orange' },
      { dayIndex: 3, dateLabel: 'Tue 14 Apr', time: '14:00', title: 'Study Group – Capstone', location: 'Library', lecturer: '', color: 'green' },
      { dayIndex: 4, dateLabel: 'Wed 15 Apr', time: '10:00', title: 'UXD220 Interaction Design', location: 'Design Studio 2', lecturer: 'Prof. Lewis', color: 'indigo' },
      { dayIndex: 4, dateLabel: 'Wed 15 Apr', time: '15:00', title: 'Analytics Lab', location: 'Lab B14', lecturer: 'Dr. Noor', color: 'green' }
    ]);
  }

  if (await Event.countDocuments() === 0) {
    await Event.insertMany([
      { title: 'Career Fair 2026', dateLabel: '14 APR', timeLocation: '2:00 PM • Student Hub', category: 'Career', freeFood: true },
      { title: 'Uni Society Trivia Night', dateLabel: '15 APR', timeLocation: '6:30 PM • Campus Bar', category: 'Clubs', freeFood: true },
      { title: 'Women in Leadership', dateLabel: '16 APR', timeLocation: '5:00 PM • Room 204', category: 'Talks', freeFood: false }
    ]);
  }
}

(async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000
    });
    console.log('MongoDB Atlas connected.');
    await seed();
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`UniPulse is ready: http://127.0.0.1:${PORT}`);
    });
  } catch (e) {
    console.error('\nUNIPULSE STARTUP ERROR');
    console.error(e && e.message ? e.message : e);
    console.error('\nCheck: Atlas Network Access, database username/password, cluster status, and internet connection.');
    process.exit(1);
  }
})();
