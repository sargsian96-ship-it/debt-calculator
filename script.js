console.log('Debt Calculator Script Loaded');
// ==================== СИСТЕМА АНАЛИТИКИ КАЛЬКУЛЯТОРА ====================
console.log('=== АНАЛИТИКА КАЛЬКУЛЯТОРА ===');
console.log('Запущено:', new Date().toLocaleString('ru-RU'));

// Глобальный объект для статистики
window.calculatorAnalytics = {
    // Основные метрики
    visits: 0,
    calculations: 0,
    consultationsClicked: 0,
    reportsGenerated: 0,
    
    // Ежедневная статистика
    dailyStats: {},
    
    // Информация о запуске
    startedAt: new Date().toISOString(),
    lastUpdated: null,
    
    // Информация об устройстве/источнике
    deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language
    },
    
    // UTM-метки
    utmParams: {}
};

// ==================== ФУНКЦИИ ====================

// Загрузка сохранённой статистики
function loadAnalytics() {
    try {
        const saved = localStorage.getItem('calculator_analytics');
        if (saved) {
            const parsed = JSON.parse(saved);
            window.calculatorAnalytics = {
                ...window.calculatorAnalytics,
                ...parsed,
                // Не перезаписываем deviceInfo
                deviceInfo: window.calculatorAnalytics.deviceInfo
            };
            console.log('📊 Статистика загружена из localStorage');
        }
    } catch (e) {
        console.error('❌ Ошибка загрузки статистики:', e);
    }
}

// Сохранение статистики
function saveAnalytics() {
    try {
        window.calculatorAnalytics.lastUpdated = new Date().toISOString();
        localStorage.setItem('calculator_analytics', JSON.stringify(window.calculatorAnalytics));
        console.log('💾 Статистика сохранена');
    } catch (e) {
        console.error('❌ Ошибка сохранения статистики:', e);
    }
}

// Обновление ежедневной статистики
function updateDailyStats(action) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!window.calculatorAnalytics.dailyStats[today]) {
        window.calculatorAnalytics.dailyStats[today] = {
            visits: 0,
            calculations: 0,
            consultations: 0,
            reports: 0,
            date: today,
            dayOfWeek: new Date().toLocaleDateString('ru-RU', { weekday: 'long' })
        };
    }
    
    switch(action) {
        case 'visit':
            window.calculatorAnalytics.dailyStats[today].visits++;
            break;
        case 'calculation':
            window.calculatorAnalytics.dailyStats[today].calculations++;
            break;
        case 'consultation':
            window.calculatorAnalytics.dailyStats[today].consultations++;
            break;
        case 'report':
            window.calculatorAnalytics.dailyStats[today].reports++;
            break;
    }
}

// Извлечение UTM-параметров
function extractUTMParams() {
    const params = new URLSearchParams(window.location.search);
    window.calculatorAnalytics.utmParams = {
        source: params.get('utm_source') || 'direct',
        medium: params.get('utm_medium') || 'none',
        campaign: params.get('utm_campaign') || 'none',
        content: params.get('utm_content') || 'none',
        term: params.get('utm_term') || 'none'
    };
}

// Отображение статистики в консоли
function showConsoleStats() {
    const stats = window.calculatorAnalytics;
    
    console.log('\n%c📊 ТЕКУЩАЯ СТАТИСТИКА КАЛЬКУЛЯТОРА', 
        'color: white; background: linear-gradient(90deg, #4CAF50, #2196F3); padding: 5px 10px; border-radius: 3px; font-weight: bold;');
    
    console.log(`%c👥 Посещений: ${stats.visits}`, 'color: #4CAF50; font-weight: bold;');
    console.log(`%c🧮 Расчётов: ${stats.calculations}`, 'color: #2196F3; font-weight: bold;');
    console.log(`%c💬 Консультаций: ${stats.consultationsClicked}`, 'color: #FF9800; font-weight: bold;');
    console.log(`%c📄 Отчётов: ${stats.reportsGenerated}`, 'color: #9C27B0; font-weight: bold;');
    
    // Конверсии
    const visitToCalc = stats.visits > 0 ? ((stats.calculations / stats.visits) * 100).toFixed(1) : 0;
    const calcToConsult = stats.calculations > 0 ? ((stats.consultationsClicked / stats.calculations) * 100).toFixed(1) : 0;
    
    console.log(`%c📈 Конверсия посещение→расчёт: ${visitToCalc}%`, 'color: #4CAF50;');
    console.log(`%c📈 Конверсия расчёт→консультация: ${calcToConsult}%`, 'color: #2196F3;');
    
    // Сегодняшняя статистика
    const today = new Date().toISOString().split('T')[0];
    const todayStats = stats.dailyStats[today];
    if (todayStats) {
        console.log(`%c📅 Сегодня (${todayStats.dayOfWeek}):`, 'color: #FF9800; font-weight: bold;');
        console.log(`   👥 Посещений: ${todayStats.visits}`);
        console.log(`   🧮 Расчётов: ${todayStats.calculations}`);
        console.log(`   💬 Консультаций: ${todayStats.consultations}`);
        console.log(`   📄 Отчётов: ${todayStats.reports}`);
    }
    
    // UTM параметры
    if (stats.utmParams.source !== 'direct') {
        console.log(`%c🎯 Источник: ${stats.utmParams.source} / ${stats.utmParams.campaign}`, 'color: #9C27B0;');
    }
    
    console.log(`%c⏱️ Сбор данных с: ${new Date(stats.startedAt).toLocaleString('ru-RU')}`, 'color: #607D8B; font-size: 12px;');
    console.log(`%c🔄 Последнее обновление: ${stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString('ru-RU') : 'только что'}`, 'color: #607D8B; font-size: 12px;');
}

// Сброс статистики (только для разработки)
function resetAnalytics() {
    if (confirm('Очистить ВСЮ статистику калькулятора? Это действие необратимо.')) {
        localStorage.removeItem('calculator_analytics');
        window.calculatorAnalytics = {
            visits: 0,
            calculations: 0,
            consultationsClicked: 0,
            reportsGenerated: 0,
            dailyStats: {},
            startedAt: new Date().toISOString(),
            lastUpdated: null,
            deviceInfo: window.calculatorAnalytics.deviceInfo,
            utmParams: window.calculatorAnalytics.utmParams
        };
        console.log('🗑️ Статистика сброшена');
        showConsoleStats();
    }
}

// Экспорт статистики в JSON
function exportAnalytics() {
    const dataStr = JSON.stringify(window.calculatorAnalytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `статистика_калькулятора_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log('💾 Статистика экспортирована в JSON');
}

// ==================== ОТСЛЕЖИВАНИЕ СОБЫТИЙ ====================

// Трекер посещений
function trackVisit() {
    window.calculatorAnalytics.visits++;
    updateDailyStats('visit');
    saveAnalytics();
    console.log('📍 Новое посещение калькулятора');
}

// Трекер расчётов
function trackCalculation() {
    window.calculatorAnalytics.calculations++;
    updateDailyStats('calculation');
    saveAnalytics();
    console.log('🧮 Выполнен новый расчёт');
}

// Трекер консультаций
function trackConsultation() {
    window.calculatorAnalytics.consultationsClicked++;
    updateDailyStats('consultation');
    saveAnalytics();
    console.log('💬 Запрошена консультация');
}

// Трекер отчётов
function trackReport() {
    window.calculatorAnalytics.reportsGenerated++;
    updateDailyStats('report');
    saveAnalytics();
    console.log('📄 Создан новый отчёт');
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

// Инициализация аналитики при загрузке страницы
function initAnalytics() {
    console.log('🔄 Инициализация системы аналитики...');
    
    // 1. Загружаем сохранённые данные
    loadAnalytics();
    
    // 2. Извлекаем UTM-параметры
    extractUTMParams();
    
    // 3. Отслеживаем новое посещение
    trackVisit();
    
    // 4. Показываем статистику в консоли
    setTimeout(showConsoleStats, 1000);
    
    // 5. Обновляем статистику каждые 30 секунд (на всякий случай)
    setInterval(saveAnalytics, 30000);
    
    // 6. Добавляем глобальные функции для отладки
    window.showStats = showConsoleStats;
    window.resetStats = resetAnalytics;
    window.exportStats = exportAnalytics;
    
    console.log('✅ Система аналитики готова!');
    console.log('💡 Доступные команды: showStats(), resetStats(), exportStats()');
}

// ==================== ИНТЕГРАЦИЯ С СУЩЕСТВУЮЩИМ КОДОМ ====================

// Обернём существующие функции для отслеживания

// Обёртка для функции calculateAll()
const originalCalculateAll = window.calculateAll || function() { console.log('Функция calculateAll не найдена'); };
window.calculateAll = function() {
    const result = originalCalculateAll.apply(this, arguments);
    trackCalculation();
    return result;
};

// Обёртка для функции bookFreeConsult()
const originalBookFreeConsult = window.bookFreeConsult || function() { console.log('Функция bookFreeConsult не найдена'); };
window.bookFreeConsult = function() {
    const result = originalBookFreeConsult.apply(this, arguments);
    trackConsultation();
    return result;
};

// Обёртка для функции bookPaidConsult()
const originalBookPaidConsult = window.bookPaidConsult || function() { console.log('Функция bookPaidConsult не найдена'); };
window.bookPaidConsult = function() {
    const result = originalBookPaidConsult.apply(this, arguments);
    trackConsultation();
    return result;
};

// Обёртка для функции downloadReport()
const originalDownloadReport = window.downloadReport || function() { console.log('Функция downloadReport не найдена'); };
window.downloadReport = function() {
    const result = originalDownloadReport.apply(this, arguments);
    trackReport();
    return result;
};

// ==================== ЗАПУСК ====================

// Запускаем аналитику при полной загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
    initAnalytics();
}

// Экспорт для использования в других файлах
window.calculatorAnalyticsAPI = {
    trackVisit,
    trackCalculation,
    trackConsultation,
    trackReport,
    showStats: showConsoleStats,
    resetStats: resetAnalytics,
    exportStats: exportAnalytics,
    getStats: () => window.calculatorAnalytics
};
let isTelegramWebApp = false;

// Проверяем, открыто ли в Telegram WebApp
if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
    isTelegramWebApp = true;
    console.log('Running in Telegram WebApp');
    
    // Инициализируем Telegram WebApp
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand(); // На весь экран
    tg.enableClosingConfirmation(); // Подтверждение закрытия
    
    // Меняем тему, если нужно
    tg.setHeaderColor('#4CAF50');
    tg.setBackgroundColor('#f5f7fa');
}
// === ФУНКЦИИ КАЛЬКУЛЯТОРА ===
// Добавление строки в таблицу
function addTableRow() {
    const tbody = document.getElementById('table-body');
    const rowId = Date.now();
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <input type="text" class="table-input creditor" 
                   placeholder="Например: Сбербанк" 
                   value="Кредит ${tbody.children.length + 1}">
        </td>
        <td>
            <input type="number" class="table-input debt" 
                   placeholder="200000" value="200000" min="0">
        </td>
        <td>
            <input type="number" class="table-input payment" 
                   placeholder="15000" value="15000" min="0">
        </td>
        <td>
            <input type="number" class="table-input rate" 
                   placeholder="20" value="20" min="0" max="500" step="0.1">
        </td>
        <td>
            <input type="number" class="table-input term" 
                   placeholder="24" value="24" min="1" max="360">
        </td>
        <td>
            <button class="delete-btn" onclick="deleteRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
}

// Удаление строки
function deleteRow(button) {
    const row = button.closest('tr');
    if (document.getElementById('table-body').children.length > 1) {
        row.remove();
    } else {
        alert('Должен остаться хотя бы один долг');
    }
}

// Основная функция расчета
function calculateAll() {
    console.log('Calculate button clicked');
    
    const rows = document.querySelectorAll('#table-body tr');
    let totalDebt = 0;
    let totalMonthlyPayment = 0;
    let totalOverpayment = 0;
    let totalPotentialSaving = 0;
    
    const details = [];
    
    rows.forEach((row, index) => {
        const debt = parseFloat(row.querySelector('.debt').value) || 0;
        const payment = parseFloat(row.querySelector('.payment').value) || 0;
        const rate = parseFloat(row.querySelector('.rate').value) || 0;
        const term = parseFloat(row.querySelector('.term').value) || 0;
        const creditor = row.querySelector('.creditor').value || `Кредит ${index + 1}`;
        
        if (!debt || !term) {
            alert(`Пожалуйста, заполните все поля в строке "${creditor}"`);
            return;
        }
        
        // Расчеты (по формулам из Excel)
        const monthlyInterest = (debt * (rate / 12)) / 100;
        const interestBurden = monthlyInterest / payment * 100;
        const totalInterest = monthlyInterest * term;
        const potentialSaving = totalInterest * 0.4;
        
        totalDebt += debt;
        totalMonthlyPayment += payment;
        totalOverpayment += totalInterest;
        totalPotentialSaving += potentialSaving;
        
        details.push({
            creditor,
            debt,
            payment,
            rate,
            term,
            monthlyInterest,
            interestBurden,
            totalInterest,
            potentialSaving
        });
    });
    
    // Обновляем UI с результатами
    updateResults(totalDebt, totalMonthlyPayment, totalOverpayment, totalPotentialSaving, details);
    
    // Показываем раздел с результатами
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    
    console.log('Calculation completed');
}

// Обновление блока результатов
function updateResults(totalDebt, monthlyLoad, totalOverpayment, potentialSaving, details) {
    // Обновляем цифры
    document.getElementById('total-debt').textContent = formatCurrency(totalDebt);
    document.getElementById('monthly-load').textContent = formatCurrency(monthlyLoad);
    document.getElementById('total-overpayment').textContent = formatCurrency(totalOverpayment);
    document.getElementById('potential-saving').textContent = formatCurrency(potentialSaving);
    
    // Обновляем детализацию
    const detailsList = document.getElementById('details-list');
    detailsList.innerHTML = '';
    
    details.forEach(detail => {
        const item = document.createElement('div');
        item.className = 'detail-item';
        item.innerHTML = `
            <div>
                <strong>${detail.creditor}</strong><br>
                <small>${detail.rate}% годовых, ${detail.term} мес.</small>
            </div>
            <div style="text-align: right;">
                <strong>${formatCurrency(detail.debt)}</strong><br>
                <small>Переплата: ${formatCurrency(detail.totalInterest)}</small>
            </div>
        `;
        detailsList.appendChild(item);
    });
    
    // Генерируем рекомендацию
    const recommendation = document.getElementById('recommendation');
    let recommendationText = '';
    
    if (totalOverpayment > totalDebt * 0.5) {
        recommendationText = `
            <h3><i class="fas fa-exclamation-triangle"></i> Высокая финансовая нагрузка</h3>
            <p>Ваша переплата составляет более 50% от суммы долга. Рекомендуем рассмотреть процедуру 
            <strong>банкротства</strong> или <strong>реструктуризации долгов</strong>. 
            Экономия может составить ${formatCurrency(potentialSaving)}.</p>
            <p><strong>Следующий шаг:</strong> Запишитесь на бесплатную консультацию для анализа 
            вашей конкретной ситуации.</p>
        `;
    } else if (monthlyLoad > 30000) {
        recommendationText = `
            <h3><i class="fas fa-chart-pie"></i> Значительная ежемесячная нагрузка</h3>
            <p>Ежемесячные платежи (${formatCurrency(monthlyLoad)}) занимают существенную часть дохода. 
            Рекомендуем <strong>консолидацию долгов</strong> или <strong>реструктуризацию</strong> 
            для снижения платежей.</p>
        `;
    } else {
        recommendationText = `
            <h3><i class="fas fa-check-circle"></i> Умеренная нагрузка</h3>
            <p>Ваша долговая нагрузка управляема. Рассмотрите возможность 
            <strong>досрочного погашения</strong> наиболее дорогих кредитов 
            (с самой высокой процентной ставкой) для экономии на процентах.</p>
        `;
    }
    
    recommendation.innerHTML = recommendationText;
}

// Форматирование валюты
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

// === ОБРАБОТЧИКИ КНОПОК "СЛЕДУЮЩИЕ ШАГИ" ===
function bookFreeConsult() {
    console.log('Free consultation clicked');
    window.open('https://t.me/ArcadConsult_bot?start=free_consult', '_blank');
    alert('Открывается Telegram для записи на бесплатную консультацию...');
}

function bookPaidConsult() {
    console.log('Paid session clicked');
    window.open('https://t.me/ArcadConsult_bot?start=paid_session', '_blank');
    alert('Открывается Telegram для записи на стратегическую сессию...');
}

function downloadReport() {
    const report = generateReport();
    
    // Просто показываем alert с текстом
    alert('📊 ВАШ ОТЧЁТ:\n\n' + 
          report.substring(0, 1000) + 
          (report.length > 1000 ? '\n\n... (полный отчёт скопируйте с сайта)' : '') +
          '\n\n💡 Полную версию откройте в браузере: https://sargsian96.github.io/debt-calculator/');
}
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function generateReport() {
    let report = '📊 ОТЧЕТ ПО АНАЛИЗУ ДОЛГОВ\n';
    report += 'Сгенерировано: ' + new Date().toLocaleString() + '\n';
    report += '='.repeat(50) + '\n\n';
    
    const rows = document.querySelectorAll('#table-body tr');
    
    report += 'ВАШИ ДОЛГИ:\n';
    rows.forEach((row, i) => {
        const creditor = row.querySelector('.creditor').value || `Долг ${i+1}`;
        const debt = row.querySelector('.debt').value || 0;
        const payment = row.querySelector('.payment').value || 0;
        const rate = row.querySelector('.rate').value || 0;
        const term = row.querySelector('.term').value || 0;
        
        report += `${i+1}. ${creditor}\n`;
        report += `   Сумма: ${debt} ₽ | Платеж: ${payment} ₽/мес\n`;
        report += `   Ставка: ${rate}% | Срок: ${term} мес.\n\n`;
    });
    
    report += 'ИТОГИ АНАЛИЗА:\n';
    report += 'Общая сумма долгов: ' + (document.getElementById('total-debt')?.textContent || '0 ₽') + '\n';
    report += 'Ежемесячная нагрузка: ' + (document.getElementById('monthly-load')?.textContent || '0 ₽') + '\n';
    report += 'Общая переплата: ' + (document.getElementById('total-overpayment')?.textContent || '0 ₽') + '\n';
    report += 'Возможная экономия: ' + (document.getElementById('potential-saving')?.textContent || '0 ₽') + '\n\n';
    
    report += 'РЕКОМЕНДАЦИИ:\n';
    const totalDebt = parseFloat(document.getElementById('total-debt')?.textContent.replace(/[^\d]/g, '') || 0);
    const totalOverpayment = parseFloat(document.getElementById('total-overpayment')?.textContent.replace(/[^\d]/g, '') || 0);
    
    if (totalOverpayment > totalDebt * 0.5) {
        report += '⚠️ ВЫСОКАЯ НАГРУЗКА\n';
        report += 'Рекомендуется консультация юриста по банкротству.\n';
        report += 'Обратитесь: @ArcadConsult_bot\n';
    } else if (totalOverpayment > 0) {
        report += '⚠️ СРЕДНЯЯ НАГРУЗКА\n';
        report += 'Рассмотрите реструктуризацию долгов.\n';
    } else {
        report += '✅ НИЗКАЯ НАГРУЗКА\n';
        report += 'Ваша ситуация управляема.\n';
    }
    
    report += '\n' + '='.repeat(50) + '\n';
    report += 'Сгенерировано в Калькуляторе долгов\n';
    report += 'Консультация: @ArcadConsult_bot\n';
    report += 'Канал: https://t.me/Arcad_help\n';
    
    return report;
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // 1. Инициализация кнопок "Следующие шаги"
    const freeBtn = document.getElementById('free-consult');
    const paidBtn = document.getElementById('paid-consult');
    const downloadBtn = document.getElementById('download-report');
    
    if (!freeBtn) console.error('Кнопка #free-consult не найдена!');
    if (!paidBtn) console.error('Кнопка #paid-consult не найдена!');
    if (!downloadBtn) console.error('Кнопка #download-report не найдена!');
    
    if (freeBtn) {
        freeBtn.addEventListener('click', bookFreeConsult);
        freeBtn.style.cursor = 'pointer';
        console.log('Free button initialized');
    }
    
    if (paidBtn) {
        paidBtn.addEventListener('click', bookPaidConsult);
        paidBtn.style.cursor = 'pointer';
        console.log('Paid button initialized');
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadReport);
        downloadBtn.style.cursor = 'pointer';
        console.log('Download button initialized');
    }
    
    // 2. Инициализация кнопок калькулятора
    const addRowBtn = document.getElementById('add-row');
    const calculateBtn = document.getElementById('calculate');
    
    if (addRowBtn) {
        addRowBtn.addEventListener('click', addTableRow);
        addRowBtn.style.cursor = 'pointer';
        console.log('Add row button initialized');
    } else {
        console.error('Кнопка #add-row не найдена!');
    }
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateAll);
        calculateBtn.style.cursor = 'pointer';
        console.log('Calculate button initialized');
    } else {
        console.error('Кнопка #calculate не найдена!');
    }
    
    // 3. Добавляем первую строку в таблицу
    addTableRow();
    
    console.log('All buttons initialized');

});




