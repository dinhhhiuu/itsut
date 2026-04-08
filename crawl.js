const fs = require("fs");

const BASE = "https://internship.cse.hcmut.edu.vn";
const WEBHOOK = process.env.DISCORD_WEBHOOK;

// ================= FETCH DATA =================
async function fetchData() {
  const listRes = await fetch(`${BASE}/home/company/all`);
  const listData = await listRes.json();

  const companies = listData.items;
  const results = [];

  for (const c of companies) {
    try {
      const res = await fetch(`${BASE}/home/company/id/${c._id}`);
      const detail = await res.json();
      const item = detail.item;

      results.push({
        name: c.fullname,
        maxAcceptedStudent: item.maxAcceptedStudent,
        maxRegister: item.maxRegister,
        studentRegister: item.studentRegister,
        studentAccepted: item.studentAccepted
      });
    } catch {}
  }

  return results;
}

// ================= DISCORD =================
async function sendDiscord(message) {
  if (!WEBHOOK) return;

  await fetch(WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: message
    })
  });
}

// ================= MAIN =================
async function main() {
  const newData = await fetchData();

  let oldData = [];
  if (fs.existsSync("data.json")) {
    oldData = JSON.parse(fs.readFileSync("data.json"));
  }

  // ================= CHECK CHANGE =================
  if (JSON.stringify(oldData) === JSON.stringify(newData)) {
    console.log("No change");
    return;
  }

  console.log("Data changed!");

  // ================= DISCORD: ONLY AVAILABLE =================
  const available = newData.filter(c =>
    c.studentRegister < c.maxRegister && c.maxAcceptedStudent > c.studentAccepted
  );

  if (available.length > 0) {
    const msg = available.map(c =>
      `🟢 ${c.name} (${c.studentRegister}/${c.maxRegister})`
    ).join("\n");

    await sendDiscord(msg);
  }

  // ================= SAVE FULL DATA FOR WEB =================
  fs.writeFileSync("data.json", JSON.stringify(newData, null, 2));
}

main().then(() => console.log("Done"));