console.log('Debt Calculator Script Loaded');
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
    console.log('Download button clicked in Telegram WebApp');
    
    // Генерируем отчёт
    const reportText = generateReport();
    
    // Проверяем, открыто ли в Telegram WebApp
    const isTelegramWebApp = typeof window.Telegram !== 'undefined' && window.Telegram.WebApp;
    
    if (isTelegramWebApp) {
        // === РАБОТАЕТ В TELEGRAM WEBAPP ===
        showTelegramReportViewer(reportText);
    } else if (navigator.userAgent.includes('Telegram')) {
        // === ОТКРЫТО В TELEGRAM БРАУЗЕРЕ ===
        showMobileReportViewer(reportText);
    } else {
        // === ОБЫЧНЫЙ БРАУЗЕР ===
        standardDownload(reportText);
    }
}

// === ДЛЯ TELEGRAM WEBAPP ===
function showTelegramReportViewer(reportText) {
    // Используем Telegram WebApp API
    const tg = window.Telegram.WebApp;
    
    // Показываем загрузку
    tg.showPopup({
        title: '📊 Генерируем отчёт',
        message: 'Подготовка вашего персонального отчёта...',
        buttons: []
    });
    
    // Ждём немного для визуального эффекта
    setTimeout(() => {
        // Закрываем предыдущий popup
        tg.close();
        
        // Показываем отчёт в большом popup
        tg.showPopup({
            title: '✅ Ваш отчёт готов!',
            message: reportText.substring(0, 200) + '...\n\n💾 *Как сохранить:*\n1. Скопируйте весь текст\n2. Отправьте себе в Telegram\n3. Сохраните в "Избранное"',
            buttons: [{
                id: 'copy',
                type: 'default',
                text: '📋 Скопировать первую часть'
            }, {
                id: 'full',
                type: 'default',
                text: '📄 Показать полный отчёт'
            }, {
                id: 'close',
                type: 'cancel',
                text: 'Закрыть'
            }]
        }, function(buttonId) {
            if (buttonId === 'copy') {
                // Копируем в буфер
                tg.showPopup({
                    title: 'Скопировано!',
                    message: 'Первая часть отчёта скопирована. Отправьте себе в Telegram и сохраните.',
                    buttons: [{ id: 'ok', type: 'ok' }]
                });
            } else if (buttonId === 'full') {
                // Открываем полный отчёт в новой вкладке
                const fullReportWindow = window.open('', '_blank');
                fullReportWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Полный отчёт</title>
                        <style>
                            body { padding: 20px; font-family: Arial; }
                            pre { background: #f5f5f5; padding: 20px; border-radius: 10px; white-space: pre-wrap; }
                        </style>
                    </head>
                    <body>
                        <h2>📊 Полный отчёт по долгам</h2>
                        <pre>${reportText}</pre>
                        <p><strong>💡 Чтобы сохранить:</strong></p>
                        <ol>
                            <li>Выделите весь текст выше</li>
                            <li>Скопируйте (долгое нажатие → Копировать)</li>
                            <li>Отправьте себе в Telegram</li>
                            <li>Нажмите на сообщение → "Сохранить"</li>
                        </ol>
                    </body>
                    </html>
                `);
            }
        });
    }, 1000);
}

// === ДЛЯ МОБИЛЬНОГО БРАУЗЕРА TELEGRAM ===
function showMobileReportViewer(reportText) {
    // Создаём модальное окно
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 10000;
        padding: 20px;
        overflow-y: auto;
        color: white;
    `;
    
    modal.innerHTML = `
        <div style="
            max-width: 600px;
            margin: 0 auto;
            background: #1a1a1a;
            padding: 25px;
            border-radius: 15px;
            position: relative;
        ">
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: #f44336;
                        color: white;
                        border: none;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        font-size: 20px;
                        cursor: pointer;
                    ">×</button>
            
            <h2 style="color: #4CAF50; margin-top: 0;">📊 Ваш отчёт готов!</h2>
            
            <div style="
                background: #2d2d2d;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                font-family: monospace;
                white-space: pre-wrap;
                font-size: 14px;
                max-height: 50vh;
                overflow-y: auto;
                border-left: 4px solid #4CAF50;
            ">
                ${reportText.substring(0, 1500)}...
                ${reportText.length > 1500 ? '\n\n[Отчёт продолжается. Скопируйте полную версию ниже]' : ''}
            </div>
            
            <div style="
                background: #2d2d2d;
                padding: 15px;
                border-radius: 10px;
                margin: 15px 0;
            ">
                <h4 style="color: #4CAF50; margin-top: 0;">💾 Как сохранить в Telegram:</h4>
                <ol style="line-height: 1.8; padding-left: 20px;">
                    <li><strong>Нажмите кнопку "Скопировать весь отчёт" ниже</strong></li>
                    <li>Откройте диалог с собой (поиск: "Saved Messages" или своё имя)</li>
                    <li>Вставьте скопированный текст и отправьте</li>
                    <li>Нажмите на сообщение → "Save Message" (Сохранить)</li>
                </ol>
            </div>
            
            <button onclick="copyFullReport()" 
                    style="
                        width: 100%;
                        padding: 18px;
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 18px;
                        font-weight: bold;
                        cursor: pointer;
                        margin-top: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    ">
                📋 СКОПИРОВАТЬ ВЕСЬ ОТЧЁТ
            </button>
            
            <button onclick="shareToTelegram()" 
                    style="
                        width: 100%;
                        padding: 18px;
                        background: #0088cc;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        cursor: pointer;
                        margin-top: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    ">
                📤 ОТКРЫТЬ TELEGRAM ДЛЯ ОТПРАВКИ
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем функции в глобальную область видимости
    window.copyFullReport = function() {
        navigator.clipboard.writeText(reportText).then(() => {
            // Показываем подтверждение
            const alertDiv = document.createElement('div');
            alertDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #4CAF50;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    z-index: 10001;
                    text-align: center;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                ">
                    <h3 style="margin-top: 0;">✅ Отчёт скопирован!</h3>
                    <p>Теперь откройте Telegram и вставьте в сообщение себе</p>
                    <button onclick="this.parentElement.parentElement.remove()"
                            style="
                                margin-top: 15px;
                                padding: 10px 20px;
                                background: white;
                                color: #4CAF50;
                                border: none;
                                border-radius: 5px;
                                cursor: pointer;
                            ">
                        OK
                    </button>
                </div>
            `;
            document.body.appendChild(alertDiv);
            
            // Автоудаление через 5 секунд
            setTimeout(() => {
                if (alertDiv.parentElement) {
                    alertDiv.remove();
                }
            }, 5000);
        }).catch(err => {
            // Fallback для старых браузеров
            const textarea = document.createElement('textarea');
            textarea.value = reportText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            alert('✅ Весь отчёт скопирован! Вставьте в Telegram.');
        });
    };
    
    window.shareToTelegram = function() {
        // Открываем Telegram с предзаполненным текстом
        const encodedText = encodeURIComponent(reportText.substring(0, 4000));
        window.open(`https://t.me/share/url?text=${encodedText}`, '_blank');
    };
}

// === ДЛЯ ОБЫЧНОГО БРАУЗЕРА ===
function standardDownload(reportText) {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Отчёт_по_долгам_' + new Date().toLocaleDateString('ru-RU') + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    alert('Отчёт скачивается... Проверьте папку "Загрузки"');
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


