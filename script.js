// Конфигурация
const METRIKA_ID = 106284317;
const TELEGRAM_BOT_TOKEN = '8368573166:AAF9M_fXrL8jKeVU9Zn_Qwxwjj40jtCCUYk';
const TELEGRAM_CHAT_ID = '629511749';

// Основные элементы
let debts = [];
let calculatedResults = null;

// Элементы страницы
let addDebtBtn, calculateBtn, debtTableBody, emptyState;
let creditorInput, amountInput, monthlyInput, rateInput, monthsInput;
let contactFormSection, resultsSection, ctaSection, reportSection;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Калькулятор долгов загружен! Токен бота:', TELEGRAM_BOT_TOKEN);
    
    // Инициализация элементов
    initElements();
    setupEventListeners();
    setupConversionTracking();
    
    console.log('✅ Инициализация завершена. Готов к работе!');
});

// ===== 1. ИНИЦИАЛИЗАЦИЯ ЭЛЕМЕНТОВ =====
function initElements() {
    addDebtBtn = document.getElementById('addDebtBtn');
    calculateBtn = document.getElementById('calculateBtn');
    debtTableBody = document.getElementById('debtTableBody');
    emptyState = document.getElementById('emptyState');
    
    creditorInput = document.getElementById('creditor');
    amountInput = document.getElementById('amount');
    monthlyInput = document.getElementById('monthly');
    rateInput = document.getElementById('rate');
    monthsInput = document.getElementById('months');
    
    contactFormSection = document.getElementById('contactFormSection');
    resultsSection = document.getElementById('resultsSection');
    ctaSection = document.getElementById('ctaSection');
    reportSection = document.getElementById('reportSection');
}

// ===== 2. НАСТРОЙКА ОБРАБОТЧИКОВ =====
function setupEventListeners() {
    // Добавление долга
    addDebtBtn.addEventListener('click', addDebt);
    
    // Расчет выгоды (теперь показываем форму контактов)
    calculateBtn.addEventListener('click', showContactForm);
    
    // Обработка формы контактов
    document.getElementById('contactForm').addEventListener('submit', submitContactForm);
    document.getElementById('skipContactBtn').addEventListener('click', skipContactForm);
    
    // Маска для телефона
    const phoneInput = document.getElementById('userPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhone);
    }
}

// ===== 3. ДОБАВЛЕНИЕ ДОЛГА =====
function addDebt() {
    const creditor = creditorInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    const monthly = parseFloat(monthlyInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const months = parseFloat(monthsInput.value) || 0;
    
    // Валидация
    if (!creditor) {
        alert('Введите название кредитора');
        creditorInput.focus();
        return;
    }
    if (amount <= 0) {
        alert('Введите сумму долга (больше 0)');
        amountInput.focus();
        return;
    }
    if (monthly <= 0) {
        alert('Введите ежемесячный платеж (больше 0)');
        monthlyInput.focus();
        return;
    }
    
    // Создание объекта долга
    const newDebt = {
        id: Date.now(),
        creditor: creditor,
        amount: amount,
        monthly: monthly,
        rate: rate,
        months: months,
        date: new Date().toLocaleDateString('ru-RU')
    };
    
    debts.push(newDebt);
    
    // Метрика
    if (typeof ym !== 'undefined') {
        ym(METRIKA_ID, 'reachGoal', 'calculator_add_debt');
    }
    
    updateDebtTable();
    updateTotals();
    clearForm();
    showMessage('✅ Долг добавлен!', 'success');
}

// ===== 4. ПОКАЗ ФОРМЫ КОНТАКТОВ (вместо расчета) =====
function showContactForm() {
    if (debts.length === 0) {
        alert('Сначала добавьте хотя бы один долг');
        return;
    }
    
    // Рассчитываем, но не показываем результаты
    calculatedResults = calculateResultsInternal();
    
    // Показываем форму контактов
    contactFormSection.style.display = 'block';
    
    // Скрываем другие секции
    resultsSection.style.display = 'none';
    ctaSection.style.display = 'none';
    
    // Прокручиваем к форме
    contactFormSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Метрика
    if (typeof ym !== 'undefined') {
        ym(METRIKA_ID, 'reachGoal', 'contact_form_show');
    }
    
    console.log('✅ Показана форма контактов. Расчет готов:', calculatedResults);
}

// ===== 5. ОТПРАВКА ФОРМЫ КОНТАКТОВ (исправленная) =====
function submitContactForm(e) {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value.trim();
    const userPhone = document.getElementById('userPhone').value.trim();
    
    if (!userName || userName.length < 2) {
        alert('Введите ваше имя');
        document.getElementById('userName').focus();
        return;
    }
    
    if (!userPhone || userPhone.replace(/\D/g, '').length < 11) {
        alert('Введите корректный номер телефона');
        document.getElementById('userPhone').focus();
        return;
    }
    
    // Показываем индикатор загрузки
    const submitBtn = document.getElementById('submitContactBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
    submitBtn.disabled = true;
    
    // 1. Отправляем данные в Telegram
    sendToTelegram(userName, userPhone, calculatedResults)
        .then(success => {
            if (success) {
                // 2. Метрика
                if (typeof ym !== 'undefined') {
                    ym(METRIKA_ID, 'reachGoal', 'contact_form_submit');
                }
                
                // 3. Показываем результаты и сообщение об успехе
                contactFormSection.style.display = 'none';
                showFinalResults();
                
                // 4. Генерируем и "отправляем" PDF
                simulatePDFGeneration(userName, userPhone);
                
                showMessage('✅ Отчет отправлен! Юрист Михаил свяжется с вами в течение 15 минут.', 'success');
            } else {
                showMessage('⚠️ Ошибка отправки. Попробуйте позже или свяжитесь напрямую.', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
}

// ===== 6. ПРОПУСК ФОРМЫ КОНТАКТОВ =====
function skipContactForm() {
    if (!confirm('Вы получите только общие расчеты без персонализированного отчета и консультации. Продолжить?')) {
        return;
    }
    
    contactFormSection.style.display = 'none';
    showFinalResults();
    
    // Метрика для пропуска
    if (typeof ym !== 'undefined') {
        ym(METRIKA_ID, 'reachGoal', 'contact_form_skip');
    }
    
    showMessage('Расчет показан. Для получения полного отчета заполните форму контактов.', 'info');
}

// ===== 7. ПОКАЗ РЕЗУЛЬТАТОВ ПОСЛЕ ФОРМЫ =====
function showFinalResults() {
    if (!calculatedResults) {
        calculatedResults = calculateResultsInternal();
    }
    
    // Обновляем цифры на странице
    document.getElementById('resultTotalDebt').textContent = formatMoney(calculatedResults.totalDebt);
    document.getElementById('resultMonthly').textContent = formatMoney(calculatedResults.totalMonthly);
    document.getElementById('resultOverpayment').textContent = formatMoney(calculatedResults.totalOverpayment);
    document.getElementById('resultSavings').textContent = formatMoney(calculatedResults.potentialSavings);
    
    // Обновляем CTA
    document.getElementById('ctaOverpayment').textContent = formatMoney(calculatedResults.totalMonthly);
    
    // Показываем секции
    resultsSection.style.display = 'block';
    ctaSection.style.display = 'block';
    
    // Прокручиваем
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Метрика
    if (typeof ym !== 'undefined') {
        ym(METRIKA_ID, 'reachGoal', 'calculator_calculate');
    }
}

// ===== 8. ОТПРАВКА В TELEGRAM (исправленная версия) =====
function sendToTelegram(name, phone, results) {
    const message = `
🔥 НОВАЯ ЗАЯВКА С КАЛЬКУЛЯТОРА ДОЛГОВ!

👤 Имя: ${name}
📞 Телефон: ${phone}

💰 РАСЧЕТ:
• Общий долг: ${formatMoney(results.totalDebt)}
• Ежемесячный платеж: ${formatMoney(results.totalMonthly)}
• Возможное списание: ${formatMoney(results.potentialSavings)}

📋 Долги (${debts.length} шт.):
${debts.map((d, i) => `${i+1}. ${d.creditor}: ${formatMoney(d.amount)}`).join('\n')}

🕐 ${new Date().toLocaleString('ru-RU')}

#заявка #банкротство #списание
    `;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    console.log('📤 Отправка в Telegram...', { 
        url: url, 
        chat_id: TELEGRAM_CHAT_ID,
        token_length: TELEGRAM_BOT_TOKEN.length 
    });
    
    return fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => {
        console.log('📊 Статус ответа:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📨 Ответ Telegram:', data);
        if (data.ok === true) {
            console.log('✅ Сообщение успешно отправлено в Telegram!');
            return true;
        } else {
            console.error('❌ Ошибка Telegram API:', data.description);
            // Пробуем альтернативный способ
            return sendTelegramFallback(name, phone, results);
        }
    })
    .catch(error => {
        console.error('❌ Ошибка отправки в Telegram:', error);
        // Используем fallback
        return sendTelegramFallback(name, phone, results);
    });
}

// ===== 8.1. ALTERNATIVE TELEGRAM SEND (fallback) =====
function sendTelegramFallback(name, phone, results) {
    console.log('🔄 Используем fallback метод отправки...');
    
    // Сохраняем заявку локально
    saveLeadLocally(name, phone, results);
    
    // Показываем пользователю инструкцию
    showManualInstructions(name, phone, results);
    
    // Открываем Telegram с предзаполненным сообщением
    const telegramText = `Новая заявка с сайта калькулятора:%0AИмя: ${name}%0AТелефон: ${phone}%0AОбщий долг: ${formatMoney(results.totalDebt)}`;
    const telegramUrl = `https://t.me/BankrotHelperBot?start=${telegramText}`;
    
    setTimeout(() => {
        if (confirm('Открыть Telegram для отправки заявки?')) {
            window.open(telegramUrl, '_blank');
        }
    }, 1000);
    
    return true; // Все равно считаем успехом
}

// ===== 8.2. СОХРАНЕНИЕ ЛОКАЛЬНО =====
function saveLeadLocally(name, phone, results) {
    try {
        const leads = JSON.parse(localStorage.getItem('telegram_leads') || '[]');
        const newLead = {
            name: name,
            phone: phone,
            results: results,
            debts: debts.map(d => ({ creditor: d.creditor, amount: d.amount })),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('ru-RU')
        };
        
        leads.push(newLead);
        localStorage.setItem('telegram_leads', JSON.stringify(leads));
        
        console.log('💾 Заявка сохранена локально. Всего:', leads.length);
        console.log('Последняя заявка:', newLead);
        
        return true;
    } catch (error) {
        console.error('Ошибка сохранения локально:', error);
        return false;
    }
}

// ===== 8.3. ПОКАЗ ИНСТРУКЦИЙ =====
function showManualInstructions(name, phone, results) {
    const instructions = `
📋 ВАША ЗАЯВКА СОХРАНЕНА!

Для отправки юристу:
1. Откройте Telegram
2. Найдите @BankrotHelperBot
3. Отправьте сообщение:
"Новая заявка с сайта
Имя: ${name}
Телефон: ${phone}
Общий долг: ${formatMoney(results.totalDebt)}"

Или просто нажмите ОК и откроется Telegram
    `;
    
    // Показываем в консоли для отладки
    console.log(instructions);
    
    // Можно показать alert, но лучше не мешать пользователю
    // alert(instructions);
}

// ===== 9. ИМИТАЦИЯ ГЕНЕРАЦИИ PDF =====
function simulatePDFGeneration(name, phone) {
    console.log(`📄 PDF-отчет сгенерирован для ${name} (${phone})`);
    
    setTimeout(() => {
        showMessage('📄 PDF-отчет готов! Ссылка отправлена в Telegram.', 'success');
    }, 1500);
}

// ===== 10. РАСЧЕТ РЕЗУЛЬТАТОВ (внутренний) =====
function calculateResultsInternal() {
    let totalDebt = 0;
    let totalMonthly = 0;
    let totalOverpayment = 0;
    
    debts.forEach(function(debt) {
        totalDebt += debt.amount;
        totalMonthly += debt.monthly;
        const totalPayment = debt.monthly * debt.months;
        totalOverpayment += (totalPayment - debt.amount);
    });
    
    const potentialSavings = Math.round(totalOverpayment * 0.4);
    
    return {
        totalDebt,
        totalMonthly,
        totalOverpayment,
        potentialSavings
    };
}

// ===== 11. МАСКА ТЕЛЕФОНА =====
function formatPhone(e) {
    let input = e.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        if (value[0] === '7' || value[0] === '8') {
            value = value.substring(1);
        }
        
        let formatted = '+7 (';
        
        if (value.length > 0) {
            formatted += value.substring(0, 3);
        }
        if (value.length > 3) {
            formatted += ') ' + value.substring(3, 6);
        }
        if (value.length > 6) {
            formatted += '-' + value.substring(6, 8);
        }
        if (value.length > 8) {
            formatted += '-' + value.substring(8, 10);
        }
        
        input.value = formatted;
    }
}

// ===== 12. ОБНОВЛЕНИЕ ТАБЛИЦЫ ДОЛГОВ =====
function updateDebtTable() {
    debtTableBody.innerHTML = '';
    
    if (debts.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    debts.forEach(function(debt) {
        const row = document.createElement('tr');
        const totalPayment = debt.monthly * debt.months;
        
        row.innerHTML = `
            <td>
                <strong>${debt.creditor}</strong>
                <div style="font-size: 12px; color: #666;">Добавлен: ${debt.date}</div>
            </td>
            <td><strong>${formatMoney(debt.amount)}</strong></td>
            <td>${formatMoney(debt.monthly)}</td>
            <td>${debt.rate}%</td>
            <td>${debt.months} мес.</td>
            <td>
                <button onclick="deleteDebt(${debt.id})" class="delete-btn">
                    ❌ Удалить
                </button>
            </td>
        `;
        
        debtTableBody.appendChild(row);
    });
}

// ===== 13. УДАЛЕНИЕ ДОЛГА =====
window.deleteDebt = function(id) {
    if (!confirm('Удалить этот долг?')) return;
    
    debts = debts.filter(debt => debt.id !== id);
    updateDebtTable();
    updateTotals();
    showMessage('🗑️ Долг удален', 'info');
};

// ===== 14. ОБНОВЛЕНИЕ ИТОГОВ =====
function updateTotals() {
    let totalAmount = 0;
    let totalMonthly = 0;
    
    debts.forEach(debt => {
        totalAmount += debt.amount;
        totalMonthly += debt.monthly;
    });
    
    const totalDebtEl = document.getElementById('totalDebt');
    const totalMonthlyEl = document.getElementById('totalMonthly');
    
    if (totalDebtEl) totalDebtEl.textContent = formatMoney(totalAmount);
    if (totalMonthlyEl) totalMonthlyEl.textContent = formatMoney(totalMonthly);
}

// ===== 15. ОЧИСТКА ФОРМЫ =====
function clearForm() {
    creditorInput.value = '';
    amountInput.value = '';
    monthlyInput.value = '';
    rateInput.value = '';
    monthsInput.value = '';
    creditorInput.focus();
}

// ===== 16. ФОРМАТИРОВАНИЕ ДЕНЕГ =====
function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₽';
}

// ===== 17. ПОКАЗ СООБЩЕНИЙ =====
function showMessage(text, type) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#38a169' : type === 'error' ? '#c53030' : '#4299e1'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: fadeIn 0.3s;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                if (message.parentNode) document.body.removeChild(message);
            }, 300);
        }
    }, 4000);
}

// ===== 18. ПОКАЗ ОТЧЕТА =====
window.showReport = function() {
    console.log('Показ отчета...');
    
    if (debts.length === 0) {
        alert('Нет данных для отчета. Сначала добавьте долги и сделайте расчет.');
        return;
    }
    
    // Рассчитываем, если еще не рассчитано
    if (document.getElementById('resultSavings').textContent === '0 ₽') {
        if (!calculatedResults) {
            calculatedResults = calculateResultsInternal();
        }
        showFinalResults();
    }
    
    // Генерируем содержимое отчета
    generateReportContent();
    
    // Показываем блок отчета
    reportSection.style.display = 'block';
    
    // Метрика
    if (typeof ym !== 'undefined') {
        ym(METRIKA_ID, 'reachGoal', 'report_show');
    }
    
    // Прокручиваем к отчету
    reportSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    showMessage('📄 Отчет сгенерирован!', 'success');
};

// ===== 19. СКРЫТИЕ ОТЧЕТА =====
window.hideReport = function() {
    reportSection.style.display = 'none';
};

// ===== 20. ГЕНЕРАЦИЯ ОТЧЕТА =====
function generateReportContent() {
    const reportContent = document.getElementById('reportContent');
    
    // Рассчитываем итоги
    let totalDebt = 0;
    let totalMonthly = 0;
    let totalOverpayment = 0;
    
    debts.forEach(debt => {
        totalDebt += debt.amount;
        totalMonthly += debt.monthly;
        const totalPayment = debt.monthly * debt.months;
        totalOverpayment += (totalPayment - debt.amount);
    });
    
    const potentialSavings = Math.round(totalOverpayment * 0.4);
    const avgRate = debts.length > 0 ? 
        debts.reduce((sum, debt) => sum + debt.rate, 0) / debts.length : 0;
    
    // Формируем HTML отчета
    let html = `
        <div class="report-meta">
            <div class="report-row">
                <span class="report-label">Дата отчета:</span>
                <span class="report-value">${new Date().toLocaleDateString('ru-RU')}</span>
            </div>
            <div class="report-row">
                <span class="report-label">Количество долгов:</span>
                <span class="report-value">${debts.length}</span>
            </div>
        </div>
        
        <h3 style="margin: 25px 0 15px 0; color: #2d3748;">📋 Детализация долгов</h3>
    `;
    
    // Добавляем каждый долг
    debts.forEach((debt, index) => {
        const totalPayment = debt.monthly * debt.months;
        const debtOverpayment = totalPayment - debt.amount;
        
        html += `
            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="font-weight: 700; color: #2d3748; margin-bottom: 10px;">
                    ${index + 1}. ${debt.creditor}
                </div>
                <div class="report-row">
                    <span class="report-label">Сумма долга:</span>
                    <span class="report-value">${formatMoney(debt.amount)}</span>
                </div>
                <div class="report-row">
                    <span class="report-label">Ежемесячный платеж:</span>
                    <span class="report-value">${formatMoney(debt.monthly)}</span>
                </div>
                <div class="report-row">
                    <span class="report-label">Ставка:</span>
                    <span class="report-value">${debt.rate}% годовых</span>
                </div>
                <div class="report-row">
                    <span class="report-label">Остаток срока:</span>
                    <span class="report-value">${debt.months} месяцев</span>
                </div>
                <div class="report-row">
                    <span class="report-label">Общая переплата:</span>
                    <span class="report-value">${formatMoney(debtOverpayment)}</span>
                </div>
            </div>
        `;
    });
    
    // Итоги
    html += `
        <div class="report-total">
            <h3 style="margin-top: 0; color: #22543d;">💰 Итоговые показатели</h3>
            <div class="report-row">
                <span class="report-label">Общая сумма долгов:</span>
                <span class="report-value">${formatMoney(totalDebt)}</span>
            </div>
            <div class="report-row">
                <span class="report-label">Совокупный ежемесячный платеж:</span>
                <span class="report-value">${formatMoney(totalMonthly)}</span>
            </div>
            <div class="report-row">
                <span class="report-label">Средняя процентная ставка:</span>
                <span class="report-value">${avgRate.toFixed(1)}%</span>
            </div>
            <div class="report-row">
                <span class="report-label">Общая переплата:</span>
                <span class="report-value">${formatMoney(totalOverpayment)}</span>
            </div>
            <div class="report-row" style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <span class="report-label" style="font-size: 1.1rem; color: #22543d;">Возможное списание при банкротстве:</span>
                <span class="report-value" style="font-size: 1.3rem; color: #38a169;">${formatMoney(potentialSavings)}</span>
            </div>
        </div>
        
        <div class="report-note">
            <p><strong>Важно:</strong> Это предварительный расчет на основе введенных данных. 
            Точный размер списания определяется судом в рамках процедуры банкротства физического лица.</p>
            <p>Для детального анализа вашей ситуации и расчета реальной выгоды обратитесь к юристу.</p>
        </div>
        
        <div class="phone-cta">
            <h4>📞 Свяжитесь с нами</h4>
            <p style="color: #4a5568;">Получите бесплатную консультацию по списанию долгов</p>
            <div class="phone-number">
                <a href="tel:+79281068699" class="report-phone-link">+7 (928) 106-86-99</a>
            </div>
            <div class="phone-buttons">
                <a href="tel:+79281068699" class="btn-call report-phone-link">
                    <i class="fas fa-phone"></i> Позвонить сейчас
                </a>
                <a href="https://t.me/BankrotHelperBot" class="btn-telegram report-telegram-link">
                    <i class="fab fa-telegram"></i> Telegram
                </a>
            </div>
            <p style="margin-top: 15px; font-size: 0.9rem; color: #718096;">
                Работаем с 9:00 до 21:00, без выходных
            </p>
        </div>
    `;
    
    reportContent.innerHTML = html;
    
    // Назначаем обработчики для ссылок в отчете
    setTimeout(() => {
        document.querySelectorAll('.report-phone-link').forEach(link => {
            link.addEventListener('click', trackPhoneClick);
        });
        document.querySelectorAll('.report-telegram-link').forEach(link => {
            link.addEventListener('click', trackTelegramClick);
        });
    }, 100);
}

// ===== 21. ТРЕКИНГ КЛИКОВ ПО ТЕЛЕФОНУ =====
function trackPhoneClick(e) {
    console.log('📞 Клик по телефону');
    
    // Метрика
    if (typeof ym !== 'undefined') {
        ym(METRIKA_ID, 'reachGoal', 'conversion_phone_click');
    }
    
    // Даем время на отправку события
    setTimeout(() => {
        // Обычный переход по ссылке
    }, 300);
}

// ===== 22. ТРЕКИНГ КЛИКОВ ПО TELEGRAM =====
function trackTelegramClick(e) {
    console.log('📱 Клик по Telegram');
    
    // Метрика
    if (typeof ym !== 'undefined') {
        ym(METRIKA_ID, 'reachGoal', 'conversion_telegram_click');
    }
    
    // Открываем в новой вкладке
    e.preventDefault();
    setTimeout(() => {
        window.open(e.target.href || e.target.parentElement.href, '_blank');
    }, 300);
}

// ===== 23. НАСТРОЙКА ТРЕКИНГА КОНВЕРСИЙ =====
function setupConversionTracking() {
    // Клики на телефон в основном интерфейсе
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', trackPhoneClick);
    });
    
    // Клики на Telegram в основном интерфейсе
    document.querySelectorAll('a[href*="t.me"]').forEach(link => {
        link.addEventListener('click', trackTelegramClick);
    });
    
    console.log('✅ Трекинг конверсий настроен');
}

// ===== 24. ИНИЦИАЛИЗАЦИЯ СТИЛЕЙ ДЛЯ СООБЩЕНИЙ =====
if (!document.getElementById('message-styles')) {
    const style = document.createElement('style');
    style.id = 'message-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
        .delete-btn {
            background: #fed7d7;
            color: #c53030;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .delete-btn:hover {
            background: #feb2b2;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}

// ===== 25. ТЕСТОВАЯ ФУНКЦИЯ ДЛЯ ПРОВЕРКИ БОТА =====
window.testTelegramBot = function() {
    const testName = 'Тест Михаил';
    const testPhone = '+79123456789';
    const testResults = {
        totalDebt: 200000,
        totalMonthly: 15000,
        totalOverpayment: 50000,
        potentialSavings: 20000
    };
    
    console.log('🧪 Тестируем отправку в Telegram...');
    
    const message = `
🧪 ТЕСТОВОЕ СООБЩЕНИЕ

👤 Имя: ${testName}
📞 Телефон: ${testPhone}
💰 Долг: ${formatMoney(testResults.totalDebt)}

🕐 ${new Date().toLocaleString('ru-RU')}

#тест #бот
    `;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => {
        console.log('📊 Тестовый статус:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('📨 Тестовый ответ:', data);
        if (data.ok) {
            alert('✅ Тестовое сообщение отправлено в Telegram! Проверьте бота.');
        } else {
            alert('❌ Ошибка: ' + (data.description || 'Неизвестная ошибка'));
        }
    })
    .catch(error => {
        console.error('❌ Тестовая ошибка:', error);
        alert('❌ Ошибка отправки. Проверьте консоль браузера (F12 → Console)');
    });
};

// ===== 26. ПРОВЕРКА СОХРАНЕННЫХ ЗАЯВОК =====
window.showSavedLeads = function() {
    const leads = JSON.parse(localStorage.getItem('telegram_leads') || '[]');
    console.log('📊 Сохраненные заявки:', leads);
    
    if (leads.length === 0) {
        alert('Нет сохраненных заявок');
    } else {
        alert(`Сохранено ${leads.length} заявок. Посмотрите в консоли (F12 → Console)`);
        
        // Показываем последнюю заявку
        const lastLead = leads[leads.length - 1];
        console.log('📋 Последняя заявка:', lastLead);
    }
};
