const API = "http://localhost:5000";

export async function api(path, method="GET", body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.token || ""
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}