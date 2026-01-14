document.addEventListener('DOMContentLoaded', function() {
    console.log('Калькулятор долгов загружен!');
    
    // ===== ФУНКЦИИ ДЛЯ ЯНДЕКС.МЕТРИКИ =====
    function trackYandexMetrica(eventCategory, eventAction, eventLabel = '') {
        if (typeof ym !== 'undefined') {
            ym(95797677, 'reachGoal', eventAction);
            console.log('YM Track:', eventCategory, eventAction, eventLabel);
        }
    }
    
    // ===== ОСНОВНЫЕ ЭЛЕМЕНТЫ =====
    const addDebtBtn = document.getElementById('addDebtBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const debtTableBody = document.getElementById('debtTableBody');
    const emptyState = document.getElementById('emptyState');
    
    const creditorInput = document.getElementById('creditor');
    const amountInput = document.getElementById('amount');
    const monthlyInput = document.getElementById('monthly');
    const rateInput = document.getElementById('rate');
    const monthsInput = document.getElementById('months');
    
    let debts = [];
    
    // ===== 1. ДОБАВЛЕНИЕ ДОЛГА =====
    addDebtBtn.addEventListener('click', function() {
        const creditor = creditorInput.value.trim();
        const amount = parseFloat(amountInput.value) || 0;
        const monthly = parseFloat(monthlyInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const months = parseFloat(monthsInput.value) || 0;
        
        if (!creditor) {
            alert('Введите название кредитора');
            creditorInput.focus();
            return;
        }
        
        if (amount <= 0) {
            alert('Введите сумму долга');
            amountInput.focus();
            return;
        }
        
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
        
        // ОТСЛЕЖИВАНИЕ: Добавление долга
        trackYandexMetrica('calculator', 'add_debt', `Сумма: ${amount}₽`);
        
        updateDebtTable();
        updateTotals();
        clearForm();
        showMessage('✅ Долг добавлен!', 'success');
    });
    
    // ===== 2. ОБНОВЛЕНИЕ ТАБЛИЦЫ =====
    function updateDebtTable() {
        debtTableBody.innerHTML = '';
        
        if (debts.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        debts.forEach(function(debt, index) {
            const row = document.createElement('tr');
            const totalPayment = debt.monthly * debt.months;
            const overpayment = totalPayment - debt.amount;
            
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
    
    // ===== 3. УДАЛЕНИЕ ДОЛГА =====
    window.deleteDebt = function(id) {
        if (!confirm('Удалить этот долг?')) return;
        
        debts = debts.filter(function(debt) {
            return debt.id !== id;
        });
        
        updateDebtTable();
        updateTotals();
        showMessage('🗑️ Долг удален', 'info');
    };
    
    // ===== 4. ОБНОВЛЕНИЕ ИТОГОВ =====
    function updateTotals() {
        let totalAmount = 0;
        let totalMonthly = 0;
        
        debts.forEach(function(debt) {
            totalAmount += debt.amount;
            totalMonthly += debt.monthly;
        });
        
        const totalDebtEl = document.getElementById('totalDebt');
        const totalMonthlyEl = document.getElementById('totalMonthly');
        
        if (totalDebtEl) totalDebtEl.textContent = formatMoney(totalAmount);
        if (totalMonthlyEl) totalMonthlyEl.textContent = formatMoney(totalMonthly);
    }
    
    // ===== 5. РАСЧЕТ ВЫГОДЫ =====
    calculateBtn.addEventListener('click', function() {
        if (debts.length === 0) {
            alert('Сначала добавьте хотя бы один долг');
            return;
        }
        
        calculateResults();
    });
    
    function calculateResults() {
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
        
        const resultTotalDebtEl = document.getElementById('resultTotalDebt');
        const resultMonthlyEl = document.getElementById('resultMonthly');
        const resultOverpaymentEl = document.getElementById('resultOverpayment');
        const resultSavingsEl = document.getElementById('resultSavings');
        
        if (resultTotalDebtEl) resultTotalDebtEl.textContent = formatMoney(totalDebt);
        if (resultMonthlyEl) resultMonthlyEl.textContent = formatMoney(totalMonthly);
        if (resultOverpaymentEl) resultOverpaymentEl.textContent = formatMoney(totalOverpayment);
        if (resultSavingsEl) resultSavingsEl.textContent = formatMoney(potentialSavings);
        
        // ОТСЛЕЖИВАНИЕ: Расчет завершен
        trackYandexMetrica('calculator', 'calculate', `Долг: ${totalDebt}₽, Списание: ${potentialSavings}₽`);
        
        // Показываем CTA
        showCTA(totalMonthly, totalOverpayment);
        
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        showMessage('📊 Расчет завершен!', 'success');
    }
    
    // ===== 6. ПРИЗЫВ К ДЕЙСТВИЮ =====
    function showCTA(totalMonthly, totalOverpayment) {
        const ctaSection = document.getElementById('ctaSection');
        const ctaOverpaymentEl = document.getElementById('ctaOverpayment');
        
        if (ctaOverpaymentEl) {
            ctaOverpaymentEl.textContent = formatMoney(totalMonthly);
        }
        
        ctaSection.style.display = 'block';
        
        setTimeout(() => {
            ctaSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 500);
    }
    
    // ===== 7. ПОКАЗ ОТЧЕТА =====
    window.showReport = function() {
        if (debts.length === 0) {
            alert('Нет данных для отчета. Сначала добавьте долги.');
            return;
        }
        
        // ОТСЛЕЖИВАНИЕ: Показ отчета
        trackYandexMetrica('report', 'show', `Долгов: ${debts.length}`);
        
        if (document.getElementById('resultSavings').textContent === '0 ₽') {
            calculateResults();
        }
        
        generateReportContent();
        document.getElementById('reportSection').style.display = 'block';
        
        document.getElementById('reportSection').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        showMessage('📄 Отчет сгенерирован!', 'success');
    };
    
    // ===== 8. СКРЫТИЕ ОТЧЕТА =====
    window.hideReport = function() {
        document.getElementById('reportSection').style.display = 'none';
    };
    
    // ===== 9. ГЕНЕРАЦИЯ ОТЧЕТА =====
    function generateReportContent() {
        const reportContent = document.getElementById('reportContent');
        
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
        const avgRate = debts.reduce((sum, debt) => sum + debt.rate, 0) / debts.length;
        
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
                    <a href="tel:+79281068699" id="reportPhoneLink">+7 (928) 106-86-99</a>
                </div>
                <div class="phone-buttons">
                    <a href="tel:+79281068699" class="btn-call" id="reportCallBtn">
                        <i class="fas fa-phone"></i> Позвонить сейчас
                    </a>
                    <a href="https://t.me/ArcadConsult_bot" class="btn-telegram" id="reportTelegramLink">
                        <i class="fab fa-telegram"></i> Telegram
                    </a>
                </div>
                <p style="margin-top: 15px; font-size: 0.9rem; color: #718096;">
                    Работаем с 9:00 до 21:00, без выходных
                </p>
            </div>
        `;
        
        reportContent.innerHTML = html;
    }
    
    // ===== 10. ОТСЛЕЖИВАНИЕ КЛИКОВ =====
    function setupClickTracking() {
        // Телефонные ссылки
        const phoneLinks = [
            'phoneBtn', 'offerPhoneLink', 'footerPhoneLink', 
            'footerPhoneLink2', 'reportPhoneLink', 'reportCallBtn'
        ];
        
        phoneLinks.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', function() {
                    trackYandexMetrica('conversion', 'phone_click', this.href || this.textContent);
                });
            }
        });
        
        // Telegram ссылки
        const telegramLinks = [
            'telegramBtn', 'offerTelegramBtn', 'footerTelegramLink',
            'channelLink', 'shareLink', 'footerBotLink', 'footerChannelLink',
            'reportTelegramBtn', 'reportTelegramLink', 'premiumBtn'
        ];
        
        telegramLinks.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', function() {
                    trackYandexMetrica('conversion', 'telegram_click', 'Клик на Telegram');
                });
            }
        });
        
        // Кнопка показа отчета
        const showReportBtn = document.getElementById('showReportBtn');
        if (showReportBtn) {
            showReportBtn.addEventListener('click', function() {
                trackYandexMetrica('report', 'show_button', 'Кнопка "Показать отчет"');
            });
        }
        
        // Кнопка Telegram в отчете
        const reportTelegramBtn = document.getElementById('reportTelegramBtn');
        if (reportTelegramBtn) {
            reportTelegramBtn.addEventListener('click', function() {
                trackYandexMetrica('conversion', 'report_telegram_click', 'Telegram из отчета');
            });
        }
    }
    
    // ===== 11. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
    function clearForm() {
        creditorInput.value = '';
        amountInput.value = '';
        monthlyInput.value = '';
        rateInput.value = '';
        monthsInput.value = '';
        creditorInput.focus();
    }
    
    function formatMoney(amount) {
        return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
    }
    
    function showMessage(text, type) {
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#38a169' : '#4299e1'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: fadeIn 0.3s;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(function() {
            if (message.parentNode) {
                message.style.animation = 'fadeOut 0.3s';
                setTimeout(function() {
                    if (message.parentNode) {
                        document.body.removeChild(message);
                    }
                }, 300);
            }
        }, 3000);
        
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
            `;
            document.head.appendChild(style);
        }
    }
    
    // ===== 12. ИНИЦИАЛИЗАЦИЯ =====
    console.log('Инициализация завершена');
    console.log('Готов к работе! Добавляйте долги.');
    
    // Настройка отслеживания кликов
    setTimeout(setupClickTracking, 1000);
});
