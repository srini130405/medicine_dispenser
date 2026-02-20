import { useEffect, useRef, useState } from "react";
import { api } from "./api";

export default function RegisterPatient() {
  const uidRef = useRef(null);
  const rfidConsumedRef = useRef(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");

  // 🔹 Poll doctor-side PN532 (consume once)
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        if (rfidConsumedRef.current) return;

        const res = await api("/doctor/rfid-latest");

        if (res.uid && uidRef.current) {
          uidRef.current.value = res.uid;

          // mark as consumed locally
          rfidConsumedRef.current = true;

          // clear backend buffer
          await api("/doctor/rfid-clear", "POST");
        }
      } catch {}
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function register() {
    await api("/patient/register", "POST", {
      rfid_uid: uidRef.current.value,
      name,
      age,
      phone
    });
    alert("Patient registered");
  }

  return (
    <div className="container">
      <h2>Register Patient</h2>

      <input
        className="rfid"
        placeholder="Scan RFID"
        ref={uidRef}
        onChange={e => {
          // if doctor clears field manually,
          // allow next RFID scan to fill again
          if (e.target.value === "") {
            rfidConsumedRef.current = false;
          }
        }}
      />

      <input
        placeholder="Patient Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Age"
        value={age}
        onChange={e => setAge(e.target.value)}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <button onClick={register}>Register</button>
    </div>
  );
}
