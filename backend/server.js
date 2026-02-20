const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 5000;
const JWT_SECRET = "dev_secret_key";

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json()); // 🔴 REQUIRED

const MEDICINE_CODES = {
  "Dolo 650": 2,
  "Paracetamol": 1,
  "Azithromycin": 3,
  "Amoxicillin": 4,
  "Cetirizine": 5,
  "Metformin": 6,
  "Aspirin": 7,
  "Ibuprofen": 8,
  "Pantoprazole": 9
};


// ================= MONGO ======================
mongoose.connect("mongodb+srv://srinivasanarayanan2005:seenu2005@cluster0.qr23app.mongodb.net/?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err));

// ================= SCHEMAS ====================
const DoctorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const Doctor = mongoose.model("Doctor", DoctorSchema);

const Patient = mongoose.model("Patient", new mongoose.Schema({
  rfid_uid: { type: String, unique: true },
  name: String,
  age: Number,
  phone: String,
  createdAt: { type: Date, default: Date.now }
}));

const Prescription = mongoose.model("Prescription", new mongoose.Schema({
  rfid_uid: String,
  doctor_id: mongoose.Schema.Types.ObjectId,

  medicines: [
    {
      name: String,

      schedule: {
        morning: { type: Number, default: 0 },
        noon: { type: Number, default: 0 },
        night: { type: Number, default: 0 }
      },

      food: {
        type: String,
        enum: ["BEFORE", "AFTER"]
      }
    }
  ],

  notes: String,

  status: { type: String, default: "PENDING" },
  createdAt: { type: Date, default: Date.now }
}));


// ================= DEBUG ROUTE =================
app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

// ================= AUTH =======================
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ================= DOCTOR LOGIN =================
app.post("/doctor/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body); // 🔴 DEBUG

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const doctor = await Doctor.findOne({ email });
  if (!doctor)
    return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, doctor.password);
  if (!match)
    return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: doctor._id }, JWT_SECRET);
  res.json({ token });
});

// ================= REGISTER PATIENT =============
app.post("/patient/register", auth, async (req, res) => {
  await Patient.create(req.body);
  res.json({ ok: true });
});

// ================= CREATE PRESCRIPTION ==========
app.post("/prescription/create", auth, async (req, res) => {
  const { rfid_uid, medicines, notes } = req.body;

  await Prescription.create({
    rfid_uid,
    doctor_id: req.user.id,
    medicines,
    notes
  });

  res.json({ ok: true });
});

// ================= DISPENSER ====================
app.get("/dispense/:uid", async (req, res) => {
  const p = await Prescription.findOne({
    rfid_uid: req.params.uid,
    status: "PENDING"
  }).sort({ createdAt: -1 });

  if (!p) return res.status(404).json({ error: "None" });
  res.json(p);
});

app.post("/dispense/complete/:id", async (req, res) => {
  await Prescription.findByIdAndUpdate(req.params.id, {
    status: "DISPENSED"
  });
  res.json({ ok: true });
});
// ================= PATIENT + LATEST PRESCRIPTION =================
app.get("/patient/summary/:uid", auth, async (req, res) => {
  const patient = await Patient.findOne({ rfid_uid: req.params.uid });
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  const lastPrescription = await Prescription.findOne({
    rfid_uid: req.params.uid
  }).sort({ createdAt: -1 });

  res.json({
    patient,
    lastPrescription
  });
});

// ================= ESP DISPENSE API =================
app.get("/esp/dispense/:rfid", async (req, res) => {
  const rfid = req.params.rfid;

  // 1. Get latest pending prescription
  const prescription = await Prescription.findOne({
    rfid_uid: rfid,
    status: "PENDING"
  }).sort({ createdAt: -1 });

  if (!prescription) {
    return res.status(404).json({
      error: "NO_PRESCRIPTION"
    });
  }

  // 2. Build dispense payload
  const dispenseList = [];

  prescription.medicines.forEach(med => {
    const code = MEDICINE_CODES[med.name];

    if (!code) return; // skip unknown meds

    const totalQty =
      (med.schedule.morning || 0) +
      (med.schedule.noon || 0) +
      (med.schedule.night || 0);

    if (totalQty > 0) {
      dispenseList.push({
        code,               // 1–9
        quantity: totalQty  // total pills
      });
    }
  });

  // 3. Respond to ESP
  res.json({
    prescription_id: prescription._id,
    dispense: dispenseList
  });
});
app.post("/esp/dispense/complete/:id", async (req, res) => {
  await Prescription.findByIdAndUpdate(req.params.id, {
    status: "DISPENSED"
  });

  res.json({ ok: true });
});

let lastDoctorUID = null;


// Doctor-side ESP uploads UID
app.post("/doctor/rfid-scan", (req, res) => {
  const uid = req.body.uid;
  lastDoctorUID = uid?.toUpperCase() || null;
  console.log("Doctor scanned UID:", lastDoctorUID);
  res.json({ ok: true });
});

// React polls this
app.get("/doctor/rfid-latest", (req, res) => {
  res.json({ uid: lastDoctorUID });
});

// 🔹 NEW: Clear after consumption
app.post("/doctor/rfid-clear", (req, res) => {
  lastDoctorUID = null;
  res.json({ ok: true });
});



// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
