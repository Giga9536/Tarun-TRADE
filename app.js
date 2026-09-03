// Tab Switching Logic
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
    loadData(tabId);
}

// Add Purchase/Expense/Personal Data
function addData(e, category) {
    e.preventDefault();
    const desc = document.getElementById(`${category}-desc`).value;
    const amt = document.getElementById(`${category}-amt`).value;
    const date = document.getElementById(`${category}-date`).value;

    const item = { id: Date.now(), desc, amt, date };
    let data = JSON.parse(localStorage.getItem(category)) || [];
    data.push(item);
    localStorage.setItem(category, JSON.stringify(data));
    
    e.target.reset();
    loadData(category);
}

// Load Data to UI
function loadData(category) {
    if(category === 'reminders') return loadReminders();
    const container = document.getElementById(`${category}-list`);
    let data = JSON.parse(localStorage.getItem(category)) || [];
    
    container.innerHTML = '';
    data.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(item => {
        container.innerHTML += `
            <div class="card">
                <div class="card-info">
                    <h4>${item.desc}</h4>
                    <p><i class="far fa-calendar-alt"></i> ${item.date} | <strong>₹${item.amt}</strong></p>
                </div>
                <div class="card-actions">
                    <button class="btn-delete" onclick="deleteData('${category}', ${item.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

// Delete Data
function deleteData(category, id) {
    let data = JSON.parse(localStorage.getItem(category)) || [];
    data = data.filter(item => item.id !== id);
    localStorage.setItem(category, JSON.stringify(data));
    loadData(category);
}

// WhatsApp Report Share
function shareOnWhatsApp(category) {
    let data = JSON.parse(localStorage.getItem(category)) || [];
    if(data.length === 0) return alert('शेयर करने के लिए कोई डेटा नहीं है!');
    
    let text = `*📊 मेरी ${category === 'personal' ? 'पर्सनल खर्च' : ''} रिपोर्ट:*\n\n`;
    let total = 0;
    data.forEach(item => {
        text += `🔸 ${item.date} - ${item.desc}: ₹${item.amt}\n`;
        total += parseFloat(item.amt);
    });
    text += `\n*कुल: ₹${total}*`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// --- Reminders & Notifications Logic ---
function addReminder(e) {
    e.preventDefault();
    if(Notification.permission !== "granted") Notification.requestPermission();

    const title = document.getElementById('rem-title').value;
    const time = document.getElementById('rem-time').value;

    const item = { id: Date.now(), title, time, notified: false };
    let data = JSON.parse(localStorage.getItem('reminders')) || [];
    data.push(item);
    localStorage.setItem('reminders', JSON.stringify(data));
    
    e.target.reset();
    loadReminders();
}

function loadReminders() {
    const container = document.getElementById('reminders-list');
    let data = JSON.parse(localStorage.getItem('reminders')) || [];
    container.innerHTML = '';
    data.forEach(item => {
        let dateObj = new Date(item.time);
        container.innerHTML += `
            <div class="card" style="border-left-color: #F59E0B;">
                <div class="card-info">
                    <h4>${item.title}</h4>
                    <p><i class="far fa-clock"></i> ${dateObj.toLocaleString()}</p>
                </div>
                <div class="card-actions">
                    <button class="btn-delete" onclick="deleteData('reminders', ${item.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

// Check reminders every minute
setInterval(() => {
    let data = JSON.parse(localStorage.getItem('reminders')) || [];
    let now = new Date();
    data.forEach(item => {
        let remTime = new Date(item.time);
        if (!item.notified && remTime <= now) {
            if (Notification.permission === "granted") {
                new Notification("My Tracker रिमाइंडर 🔔", { body: item.title });
            } else {
                alert(`रिमाइंडर: ${item.title}`);
            }
            item.notified = true; // Mark as notified
        }
    });
    localStorage.setItem('reminders', JSON.stringify(data));
}, 60000);

// Initialize
window.onload = () => {
    Notification.requestPermission(); // Request notification permission
    loadData('purchases');
};

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
