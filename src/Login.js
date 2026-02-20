import { api } from "./api";

export default function Login() {
  let email, password;

  async function login() {
    const r = await api("/doctor/login", "POST", {
      email: email.value,
      password: password.value
    });
    localStorage.token = r.token;
    window.location = "/";
  }

  return (
    <div>
      <h2>Doctor Login</h2>
      <input placeholder="Email" ref={e => email = e} />
      <input type="password" placeholder="Password" ref={e => password = e} />
      <button onClick={login}>Login</button>
    </div>
  );
}
