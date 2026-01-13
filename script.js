// Объект для хранения долгов
let debts = [];

// DOM элементы
const debtForm = document.getElementById('debtForm');
const debtsTableBody = document.getElementById('debtsTableBody');
const addDebtBtn = document.getElementById('addDebtBtn');
const calculateBtn = document.getElementById('calculateBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const downloadReportBtn = document.getElementById('downloadReportBtn');

// Функция добавления долга
function addDebt() {
    const creditor = document.getElementById('creditor').value;
    const amount = parseInt(document.getElementById('amount').value);
    const monthly = parseInt(document.getElementById('monthly').value);
    const rate = parseInt(document.getElementById('rate').value);
    const months = parseInt(document.getElementById('months').value);
    
    if (!creditor || !amount || !monthly || !rate || !months) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Добавляем долг в массив
    const debt = {
        id: Date.now(),
        creditor: creditor,
        amount: amount,
        monthly: monthly,
        rate: rate,
        months: months
    };
    
    debts.push(debt);
    
    // Очищаем форму
    document.getElementById('creditor').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('monthly').value = '';
    document.getElementById('rate').value = '';
    document.getElementById('months').value = '';
    
    // Обновляем таблицу
    updateDebtsTable();
}

// Функция обновления таблицы
function updateDebtsTable() {
    debtsTableBody.innerHTML = '';
    
    debts.forEach(debt => {
        const row = document.createElement('tr');
        
        // Рассчитываем переплату
        const totalPayment = debt.monthly * debt.months;
        const overpayment = totalPayment - debt.amount;
        
        row.innerHTML = `
            <td>${debt.creditor}</td>
            <td>${debt.amount.toLocaleString('ru-RU')} ₽</td>
            <td>${debt.monthly.toLocaleString('ru-RU')} ₽</td>
            <td>${debt.rate}%</td>
            <td>${debt.months}</td>
            <td>
                <button class="action-btn" onclick="removeDebt(${debt.id})">
                    ❌ Удалить
                </button>
            </td>
        `;
        
        debtsTableBody.appendChild(row);
    });
}

// Функция удаления долга
function removeDebt(id) {
    debts = debts.filter(debt => debt.id !== id);
    updateDebtsTable();
}

// Функция расчета
function calculateBenefits() {
    if (debts.length === 0) {
        alert('Добавьте хотя бы один долг для расчета');
        return;
    }
    
    // Рассчитываем общую статистику
    let totalAmount = 0;
    let totalMonthly = 0;
    let totalOverpayment = 0;
    
    debts.forEach(debt => {
        totalAmount += debt.amount;
        totalMonthly += debt.monthly;
        
        const totalPayment = debt.monthly * debt.months;
        totalOverpayment += (totalPayment - debt.amount);
    });
    
    // Рассчитываем экономию при реструктуризации (условно 30-50%)
    const potentialSavings = Math.round(totalOverpayment * 0.4); // 40% экономии
    
    // Показываем результаты
    resultsContent.innerHTML = `
        <div class="result-card">
            <h3>📊 Общая сумма долгов</h3>
            <div class="result-value">${totalAmount.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div class="result-card">
            <h3>💰 Ежемесячный платеж</h3>
            <div class="result-value">${totalMonthly.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div class="result-card">
            <h3>📈 Ваша переплата</h3>
            <div class="result-value">${totalOverpayment.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div class="result-card">
            <h3>🎯 Возможная экономия</h3>
            <div class="result-value" style="color: #38a169;">${potentialSavings.toLocaleString('ru-RU')} ₽</div>
        </div>
    `;
    
    // Показываем блок с результатами
    resultsSection.style.display = 'block';
    
    // Прокручиваем к результатам
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Функция генерации отчета
function generateReport() {
    if (debts.length === 0) {
        alert('Нет данных для отчета. Добавьте долги и сделайте расчет.');
        return;
    }
    
    // В реальном проекте здесь был бы PDF генератор
    // Сейчас просто покажем ссылку на бота
    window.open('https://t.me/ArcadConsult_bot?start=report', '_blank');
}

// Назначаем обработчики событий
addDebtBtn.addEventListener('click', addDebt);
calculateBtn.addEventListener('click', calculateBenefits);
downloadReportBtn.addEventListener('click', generateReport);

// Инициализация
updateDebtsTable();
