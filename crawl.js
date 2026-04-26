const fs = require("fs");

const BASE = "https://internship.cse.hcmut.edu.vn";
const WEBHOOK = process.env.DISCORD_WEBHOOK;

// ================= FETCH DATA =================
async function fetchData() {
  const listRes = await fetch(`${BASE}/home/company/all`);
  const listData = await listRes.json();

  const companies = listData.items.reverse();  
  const results = [];

  for (const c of companies) {
    try {
      const res = await fetch(`${BASE}/home/company/id/${c._id}`);
      const detail = await res.json();
      const item = detail.item;

      // ===== LẤY FILE MỚI NHẤT =====
      let fileObj = null;
      const list = item.internshipFiles || [];

      if (list.length > 0) {
        // ưu tiên PDF mới nhất nếu có
        const pdfFiles = list.filter(f => f.name.toLowerCase().endsWith(".pdf"));

        if (pdfFiles.length > 0) {
          fileObj = pdfFiles[pdfFiles.length - 1];
        } else {
          // nếu không có PDF → lấy file cuối
          fileObj = list[list.length - 1];
        }
      }

      const files = fileObj
        ? [{
            name: fileObj.name,
            url: BASE + fileObj.path
          }]
        : [];

      // ===== PUSH DATA =====
      results.push({
        name: c.fullname,
        address: item.address || "Không có",
        logo: BASE + item.image,

        maxAcceptedStudent: item.maxAcceptedStudent,
        maxRegister: item.maxRegister,
        studentRegister: item.studentRegister,
        studentAccepted: item.studentAccepted,

        files
      });

    } catch (e) {
      console.log("Error:", c._id);
    }
  }

  return results;
}

// ================= DISCORD =================
async function sendDiscord(message) {
  if (!WEBHOOK) return;

  await fetch(WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message })
  });
}

// ================= MAIN =================
async function main() {
  const newData = await fetchData();

  let oldData = [];
  if (fs.existsSync("data.json")) {
    oldData = JSON.parse(fs.readFileSync("data.json"));
  }

  if (JSON.stringify(oldData) === JSON.stringify(newData)) {
    console.log("No change");
    return;
  }

  console.log("Data changed!");

  // ===== CHỈ LẤY CÔNG TY CÒN SLOT =====
  const available = newData.filter(c =>
    c.studentRegister < c.maxRegister &&
    c.maxAcceptedStudent > c.studentAccepted
  );

  if (available.length > 0) {
    const msg = available.map(c =>
      `🟢 ${c.name} (${c.studentRegister}/${c.maxRegister})`
    ).join("\n");

    await sendDiscord(msg);
  }

  fs.writeFileSync("data.json", JSON.stringify(newData, null, 2));
}

main().then(() => console.log("Done"));