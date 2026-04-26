const tbody = document.getElementById("table-body");

let allData = [];

// ================= FETCH =================
async function fetchData() {
  showLoading();

  try {
    const res = await fetch("data.json");
    const data = await res.json();

    allData = data;
    render(allData);

  } catch {
    tbody.innerHTML = `<tr><td colspan="7">Error</td></tr>`;
  }
}

// ================= RENDER =================
function render(data) {
  tbody.innerHTML = "";

  data.forEach(c => {
    const tr = document.createElement("tr");

    if (c.studentRegister >= c.maxRegister) {
      tr.classList.add("full");
    }

    const filesHTML = (c.files && c.files.length > 0)
      ? c.files.map(f => `
          <button onclick="viewFile('${f.url}')">Xem</button>
        `).join("")
      : "Không có";

    tr.innerHTML = `
      <td>
        <img src="${c.logo}" width="50"><br>
        ${c.name}
      </td>
      <td>${c.address}</td>
      <td>${c.maxAcceptedStudent}</td>
      <td>${c.maxRegister}</td>
      <td>${c.studentRegister}</td>
      <td>${c.studentAccepted}</td>
      <td>${filesHTML}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ================= POPUP =================
function viewFile(url) {
  console.log("OPEN:", url); // debug

  // PDF → popup
  if (url.toLowerCase().endsWith(".pdf")) {
    const iframe = document.getElementById("viewer");
    const popup = document.getElementById("popup");

    iframe.src = url;
    popup.style.display = "block";
  } 
  // DOCX → MỞ TAB (KHÔNG iframe)
  else {
    window.open(url, "_blank");
  }
}
function closePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("viewer").src = "";
}

window.onclick = function(e) {
  const popup = document.getElementById("popup");
  if (e.target === popup) closePopup();
};

// ================= UI =================
function showLoading() {
  tbody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;
}

function showAvailableOnly() {
  render(allData.filter(c => c.studentRegister < c.maxRegister));
}

function sortByRegister() {
  render([...allData].sort((a, b) => b.studentRegister - a.studentRegister));
}

// ================= AUTO =================
fetchData();
setInterval(fetchData, 60000);