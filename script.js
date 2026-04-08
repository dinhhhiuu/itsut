const tbody = document.getElementById("table-body");

let allData = [];

// ================= FETCH DATA =================
async function fetchData() {
  showLoading();

  try {
    const res = await fetch("data.json");
    const data = await res.json();

    allData = data;
    render(allData);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Error loading data</td></tr>`;
    console.error(err);
  }
}

// ================= RENDER =================
function render(data) {
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No data</td></tr>`;
    return;
  }

  data.forEach(c => {
    const tr = document.createElement("tr");

    // highlight full slot
    if (c.studentRegister >= c.maxRegister) {
      tr.classList.add("full");
    }

    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.maxAcceptedStudent}</td>
      <td>${c.maxRegister}</td>
      <td>${c.studentRegister}</td>
      <td>${c.studentAccepted}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ================= LOADING =================
function showLoading() {
  tbody.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;
}

// ================= FILTER =================
function showAvailableOnly() {
  const filtered = allData.filter(
    c => c.studentRegister < c.maxRegister && c.maxAcceptedStudent > c.studentAccepted
  );
  render(filtered);
}

// ================= SORT =================
function sortByRegister() {
  const sorted = [...allData].sort(
    (a, b) => b.studentRegister - a.studentRegister
  );
  render(sorted);
}

// ================= AUTO REFRESH =================
fetchData();
setInterval(fetchData, 60000); // 60 giây