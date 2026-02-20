import { useEffect, useRef, useState } from "react";
import { api } from "./api";

const MEDICINES = [
  "Paracetamol",
  "Dolo 650",
  "Azithromycin",
  "Amoxicillin",
  "Cetirizine",
  "Metformin",
  "Aspirin",
  "Ibuprofen",
  "Pantoprazole"
];

export default function Prescription() {
  const uidRef = useRef(null);
  const rfidConsumedRef = useRef(false);

  const [meds, setMeds] = useState([]);
  const [notes, setNotes] = useState("");

  const [patient, setPatient] = useState(null);
  const [lastRx, setLastRx] = useState(null);
  const [error, setError] = useState("");

  let name, food;
  let mQty, nQty, niQty;

  // ==============================
  // Fetch patient + last prescription
  // ==============================
  async function fetchPatient(uid) {
    if (!uid || uid.length < 4) return;

    try {
      const data = await api(`/patient/summary/${uid}`);
      setPatient(data.patient);
      setLastRx(data.lastPrescription);
      setError("");
    } catch {
      setPatient(null);
      setLastRx(null);
      setError("Patient not found");
    }
  }

  // ==============================
  // Poll doctor-side PN532 (consume once)
  // ==============================
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        if (rfidConsumedRef.current) return;

        const res = await api("/doctor/rfid-latest");

        if (res.uid && uidRef.current) {
          uidRef.current.value = res.uid;

          // consume this scan
          rfidConsumedRef.current = true;
          await api("/doctor/rfid-clear", "POST");

          // 🔥 IMPORTANT: trigger patient fetch manually
          fetchPatient(res.uid);
        }
      } catch {}
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==============================
  // Manual RFID typing / clearing
  // ==============================
  function handleRFIDChange(e) {
    const value = e.target.value;

    // If cleared manually, reset everything
    if (value === "") {
      rfidConsumedRef.current = false;
      setPatient(null);
      setLastRx(null);
      setError("");
      return;
    }

    fetchPatient(value);
  }

  // ==============================
  // Add medicine
  // ==============================
  function addMedicine() {
    if (!name.value) {
      alert("Please select a medicine");
      return;
    }

    setMeds([
      ...meds,
      {
        name: name.value,
        schedule: {
          morning: Number(mQty.value || 0),
          noon: Number(nQty.value || 0),
          night: Number(niQty.value || 0)
        },
        food: food.value
      }
    ]);

    name.value = "";
    mQty.value = nQty.value = niQty.value = "";
  }

  // ==============================
  // Save prescription
  // ==============================
  async function savePrescription() {
    await api("/prescription/create", "POST", {
      rfid_uid: uidRef.current.value,
      medicines: meds,
      notes
    });
    alert("Prescription saved");
  }

  return (
    <div className="container wide">
      <h2>Write Prescription</h2>

      {/* ===== Top Row ===== */}
      <div className="top-row">
        {/* Left: RFID + Patient */}
        <div className="left-panel">
          <input
            className="rfid"
            placeholder="Scan RFID"
            ref={uidRef}
            onChange={handleRFIDChange}
          />

          {patient && (
            <div className="info-card">
              <b>{patient.name}</b><br />
              Age: {patient.age}<br />
              Phone: {patient.phone}
            </div>
          )}

          {error && <div className="error">{error}</div>}
        </div>

        {/* Right: Previous Prescription */}
        <div className="right-panel">
          {lastRx ? (
            <div className="history-card">
              <b>Previous Prescription</b>
              <ul>
                {lastRx.medicines.map((m, i) => (
                  <li key={i}>
                    {m.name}<br />
                    🌅 {m.schedule.morning} |
                    ☀️ {m.schedule.noon} |
                    🌙 {m.schedule.night} ({m.food})
                  </li>
                ))}
              </ul>
              {lastRx.notes && (
                <div className="notes">📝 {lastRx.notes}</div>
              )}
            </div>
          ) : (
            <div className="history-card muted">
              No previous prescription
            </div>
          )}
        </div>
      </div>

      {/* ===== New Prescription ===== */}
      <label>Medicine Name</label>
      <select ref={e => (name = e)} defaultValue="">
        <option value="" disabled>Select medicine</option>
        {MEDICINES.map((med, i) => (
          <option key={i} value={med}>{med}</option>
        ))}
      </select>

      <label>Dosage (No. of pills)</label>
      <div className="time-grid">
        <div>🌅 Morning <input type="number" ref={e => (mQty = e)} /></div>
        <div>☀️ Noon <input type="number" ref={e => (nQty = e)} /></div>
        <div>🌙 Night <input type="number" ref={e => (niQty = e)} /></div>
      </div>

      <label>Food Intake</label>
      <select ref={e => (food = e)}>
        <option value="AFTER">After Food</option>
        <option value="BEFORE">Before Food</option>
      </select>

      <button onClick={addMedicine}>Add Medicine</button>

      <ul>
        {meds.map((m, i) => (
          <li key={i}>
            {m.name} — 🌅 {m.schedule.morning} |
            ☀️ {m.schedule.noon} |
            🌙 {m.schedule.night}
          </li>
        ))}
      </ul>

      <label>Doctor Notes</label>
      <textarea
        placeholder="Additional instructions..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />

      <button onClick={savePrescription}>Save Prescription</button>
      <button className="secondary" onClick={() => window.location = "/"}>
        Back
      </button>
    </div>
  );
}
