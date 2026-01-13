document.addEventListener('DOMContentLoaded', function() {
    console.log('Калькулятор долгов загружен!');
    
    // Элементы формы
    const addDebtBtn = document.getElementById('addDebtBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const debtTableBody = document.getElementById('debtTableBody');
    const emptyState = document.getElementById('emptyState');
    
    // Поля формы
    const creditorInput = document.getElementById('creditor');
    const amountInput = document.getElementById('amount');
    const monthlyInput = document.getElementById('monthly');
    const rateInput = document.getElementById('rate');
    const monthsInput = document.getElementById('months');
    
    // Массив долгов
    let debts = [];
    
    // ===== 1. ФУНКЦИЯ ДОБАВЛЕНИЯ ДОЛГА =====
    addDebtBtn.addEventListener('click', function() {
        console.log('Кнопка "Добавить долг" нажата');
        
        // Получаем значения из формы
        const creditor = creditorInput.value.trim();
        const amount = parseFloat(amountInput.value) || 0;
        const monthly = parseFloat(monthlyInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const months = parseFloat(monthsInput.value) || 0;
        
        console.log('Получены значения:', { creditor, amount, monthly, rate, months });
        
        // Проверяем заполненность полей
        if (!creditor) {
            alert('Введите название кредитора (например: Сбербанк, кредитная карта)');
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
        
        // Создаем объект долга
        const newDebt = {
            id: Date.now(), // уникальный ID
            creditor: creditor,
            amount: amount,
            monthly: monthly,
            rate: rate,
            months: months,
            date: new Date().toLocaleDateString('ru-RU')
        };
        
        console.log('Создан новый долг:', newDebt);
        
        // Добавляем в массив
        debts.push(newDebt);
        console.log('Всего долгов в массиве:', debts.length);
        
        // Обновляем таблицу
        updateDebtTable();
        
        // Обновляем итоги
        updateTotals();
        
        // Очищаем форму
        clearForm();
        
        // Показываем сообщение
        showMessage('✅ Долг добавлен!', 'success');
    });
    
    // ===== 2. ФУНКЦИЯ ОБНОВЛЕНИЯ ТАБЛИЦЫ =====
    function updateDebtTable() {
        console.log('Обновление таблицы...');
        
        // Очищаем таблицу
        debtTableBody.innerHTML = '';
        
        // Если нет долгов, показываем сообщение
        if (debts.length === 0) {
            emptyState.style.display = 'block';
            console.log('Нет долгов для отображения');
            return;
        }
        
        // Скрываем сообщение "нет долгов"
        emptyState.style.display = 'none';
        
        // Добавляем каждый долг в таблицу
        debts.forEach(function(debt, index) {
            const row = document.createElement('tr');
            
            // Рассчитываем общую выплату
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
                    <button onclick="deleteDebt(${debt.id})" 
                            style="background: #fed7d7; color: #c53030; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                        ❌ Удалить
                    </button>
                </td>
            `;
            
            debtTableBody.appendChild(row);
        });
        
        console.log('Таблица обновлена, добавлено строк:', debts.length);
    }
    
    // ===== 3. ФУНКЦИЯ УДАЛЕНИЯ ДОЛГА =====
    window.deleteDebt = function(id) {
        console.log('Удаление долга с ID:', id);
        
        if (!confirm('Удалить этот долг?')) return;
        
        // Фильтруем массив, оставляем все кроме удаляемого
        debts = debts.filter(function(debt) {
            return debt.id !== id;
        });
        
        updateDebtTable();
        updateTotals();
        showMessage('🗑️ Долг удален', 'info');
    };
    
    // ===== 4. ФУНКЦИЯ ОБНОВЛЕНИЯ ИТОГОВ =====
    function updateTotals() {
        console.log('Обновление итогов...');
        
        let totalAmount = 0;
        let totalMonthly = 0;
        
        debts.forEach(function(debt) {
            totalAmount += debt.amount;
            totalMonthly += debt.monthly;
        });
        
        // Обновляем элементы на странице (если они есть)
        const totalDebtEl = document.getElementById('totalDebt');
        const totalMonthlyEl = document.getElementById('totalMonthly');
        
        if (totalDebtEl) totalDebtEl.textContent = formatMoney(totalAmount);
        if (totalMonthlyEl) totalMonthlyEl.textContent = formatMoney(totalMonthly);
        
        console.log('Итоги: сумма =', totalAmount, 'ежемесячно =', totalMonthly);
    }
    
    // ===== 5. ФУНКЦИЯ РАСЧЕТА =====
    calculateBtn.addEventListener('click', function() {
        console.log('Расчет выгоды...');
        
        if (debts.length === 0) {
            alert('Сначала добавьте хотя бы один долг');
            return;
        }
        
        calculateResults();
        showMessage('📊 Расчет завершен!', 'success');
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
        
        // Потенциальная экономия (40% от переплаты)
        const potentialSavings = Math.round(totalOverpayment * 0.4);
        
        // Обновляем элементы результатов
        const resultTotalDebtEl = document.getElementById('resultTotalDebt');
        const resultMonthlyEl = document.getElementById('resultMonthly');
        const resultOverpaymentEl = document.getElementById('resultOverpayment');
        const resultSavingsEl = document.getElementById('resultSavings');
        
        if (resultTotalDebtEl) resultTotalDebtEl.textContent = formatMoney(totalDebt);
        if (resultMonthlyEl) resultMonthlyEl.textContent = formatMoney(totalMonthly);
        if (resultOverpaymentEl) resultOverpaymentEl.textContent = formatMoney(totalOverpayment);
        if (resultSavingsEl) resultSavingsEl.textContent = formatMoney(potentialSavings);
        
        // Прокручиваем к результатам
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        console.log('Результаты расчета:', {
            totalDebt,
            totalMonthly,
            totalOverpayment,
            potentialSavings
        });
    }
    
    // ===== 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
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
        // Создаем элемент сообщения
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
        
        // Удаляем через 3 секунды
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
        
        // Добавляем стили для анимации
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
    
    // ===== 7. ИНИЦИАЛИЗАЦИЯ =====
    console.log('Инициализация завершена');
    console.log('Готов к работе! Добавляйте долги.');
});
