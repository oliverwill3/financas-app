document.addEventListener('DOMContentLoaded', () => {
    // Navegação
    const mainPage = document.getElementById('main-page');
    const configPage = document.getElementById('config-page');
    const notesPage = document.getElementById('notes-page');
    const showMainButton = document.getElementById('show-main-page');
    const showConfigButton = document.getElementById('show-config-page');
    const showNotesButton = document.getElementById('show-notes-page');
    function showPage(page) {
        mainPage.classList.add('hidden');
        configPage.classList.add('hidden');
        notesPage.classList.add('hidden');
        showMainButton.classList.remove('active');
        showConfigButton.classList.remove('active');
        showNotesButton.classList.remove('active');
        page.classList.remove('hidden');
    }
    showMainButton.addEventListener('click', () => {
        showPage(mainPage);
        showMainButton.classList.add('active');
    });
    showConfigButton.addEventListener('click', () => {
        showPage(configPage);
        showConfigButton.classList.add('active');
    });
    showNotesButton.addEventListener('click', () => {
        showPage(notesPage);
        showNotesButton.classList.add('active');
        loadNote();
    });

    // Inputs e displays principais
    const initialBalanceInput = document.getElementById('initial-balance');
    const numDaysInput = document.getElementById('num-days');
    const gainRateInput = document.getElementById('gain-rate');
    const lossRateInput = document.getElementById('loss-rate');
    const tableBody = document.querySelector('#simulation-table tbody');
    const finalBalanceDisplay = document.getElementById('final-balance-display');
    const finalMetaDisplay = document.getElementById('final-meta-display');
    const performanceDisplay = document.getElementById('performance-display');
    const toggleValuesButton = document.getElementById('toggle-values');
    let valuesHidden = false;

    // Notas
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const saveNoteButton = document.getElementById('save-note');
    const noteStatusMessage = document.getElementById('note-status-message');

    // Função para formatar números como moeda
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const updateAllCalculations = () => {
        const rows = tableBody.querySelectorAll('tr');
        let currentBalance = parseFloat(initialBalanceInput.value) || 0;
        let currentMetaBalance = parseFloat(initialBalanceInput.value) || 0;
        let diferencaAcumulada = 0;
        const dailyGainRate = (parseFloat(gainRateInput.value) || 0) / 100;
        const dailyLossRate = (parseFloat(lossRateInput.value) || 0) / 100;

        rows.forEach(row => {
            const saldoInicialReal = currentBalance;
            const saldoInicialMeta = currentMetaBalance;
            const dailyResultInput = row.querySelector('.daily-result-input');
            const resultadoDoDia = parseFloat(dailyResultInput.value);
            const ganhoMetaDoDia = saldoInicialMeta * dailyGainRate;
            let diferencaDaMeta = 0;
            let status = '';
            if (!isNaN(resultadoDoDia)) {
                diferencaDaMeta = resultadoDoDia - ganhoMetaDoDia;
                diferencaAcumulada += diferencaDaMeta;
                if (resultadoDoDia < -Math.abs(saldoInicialMeta * dailyLossRate)) {
                    status = 'Stop-loss';
                } else if (diferencaDaMeta >= 0) {
                    status = 'OK';
                } else {
                    status = 'Déficit';
                }
            } else {
                status = '-';
            }
            const saldoFinalReal = saldoInicialReal + (isNaN(resultadoDoDia) ? 0 : resultadoDoDia);
            const saldoFinalMeta = saldoInicialMeta + ganhoMetaDoDia;

            row.querySelector('.initial-balance-cell').textContent = formatCurrency(saldoInicialReal);
            row.querySelector('.meta-gain-cell').textContent = formatCurrency(ganhoMetaDoDia);
            row.querySelector('.daily-diff-cell').textContent = isNaN(resultadoDoDia) ? '-' : formatCurrency(diferencaDaMeta);
            row.querySelector('.status-cell').textContent = status;

            const statusCell = row.querySelector('.status-cell');
            if (status === 'OK') {
                statusCell.style.color = '#008000';
            } else if (status === 'Déficit') {
                statusCell.style.color = '#dc3545';
            } else if (status === 'Stop-loss') {
                statusCell.style.color = '#ff6600';
            } else {
                statusCell.style.color = '#333';
            }

            row.querySelector('.final-balance-cell').textContent = formatCurrency(saldoFinalReal);

            currentBalance = saldoFinalReal;
            currentMetaBalance = saldoFinalMeta;
        });

        finalBalanceDisplay.textContent = formatCurrency(currentBalance);
        finalMetaDisplay.textContent = formatCurrency(currentMetaBalance);
        performanceDisplay.textContent = formatCurrency(diferencaAcumulada);

        if (diferencaAcumulada >= 0) {
            performanceDisplay.style.color = '#008000';
        } else {
            performanceDisplay.style.color = '#dc3545';
        }

        // Atualiza visualização de valores escondidos
        document.querySelectorAll('.initial-balance-cell, .final-balance-cell, .daily-diff-cell, .meta-gain-cell').forEach(cell => {
            if (valuesHidden) cell.classList.add('hidden-value');
            else cell.classList.remove('hidden-value');
        });
        [finalBalanceDisplay, finalMetaDisplay, performanceDisplay].forEach(el => {
            if (valuesHidden) el.classList.add('hidden-value');
            else el.classList.remove('hidden-value');
        });
    };

    const generateTable = () => {
        const numDays = parseInt(numDaysInput.value) || 0;
        tableBody.innerHTML = '';
        if (numDays <= 0) return;
        for (let i = 1; i <= numDays; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i}</td>
                <td class="initial-balance-cell"></td>
                <td class="meta-gain-cell"></td>
                <td class="input-cell-wrapper">
                    <button class="adjust-button" data-value="-10">-10</button>
                    <input type="number" class="daily-result-input" placeholder="Ganho ou Perda">
                    <button class="adjust-button" data-value="10">+10</button>
                </td>
                <td class="daily-diff-cell"></td>
                <td class="status-cell"></td>
                <td class="final-balance-cell"></td>
            `;
            tableBody.appendChild(row);
            const dailyResultInput = row.querySelector('.daily-result-input');
            dailyResultInput.addEventListener('input', updateAllCalculations);
            row.querySelectorAll('.adjust-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const value = parseFloat(e.target.getAttribute('data-value'));
                    const currentValue = parseFloat(dailyResultInput.value) || 0;
                    dailyResultInput.value = currentValue + value;
                    updateAllCalculations();
                });
            });
        }
        updateAllCalculations();
    };

    // Botão Esconder Valores
    toggleValuesButton.addEventListener('click', () => {
        valuesHidden = !valuesHidden;
        updateAllCalculations();
        toggleValuesButton.textContent = valuesHidden ? 'Mostrar Valores' : 'Esconder Valores';
    });

    // Notas
    const saveNote = () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        if (!title || !content) {
            noteStatusMessage.textContent = "Preencha o título e o conteúdo.";
            noteStatusMessage.style.color = "#dc3545";
            return;
        }
        const note = { title, content, date: new Date().toLocaleString() };
        localStorage.setItem('finance_sim_note', JSON.stringify(note));
        noteStatusMessage.textContent = "Anotação salva com sucesso!";
        noteStatusMessage.style.color = "#008000";
    };
    const loadNote = () => {
        const note = localStorage.getItem('finance_sim_note');
        if (note) {
            const obj = JSON.parse(note);
            noteTitleInput.value = obj.title;
            noteContentInput.value = obj.content;
            noteStatusMessage.textContent = `Última anotação salva em ${obj.date}`;
            noteStatusMessage.style.color = "#333";
        } else {
            noteTitleInput.value = "";
            noteContentInput.value = "";
            noteStatusMessage.textContent = "";
        }
    };
    saveNoteButton.addEventListener('click', saveNote);

    // Inputs dinâmica
    initialBalanceInput.addEventListener('input', generateTable);
    numDaysInput.addEventListener('input', generateTable);
    gainRateInput.addEventListener('input', generateTable);
    lossRateInput.addEventListener('input', generateTable);

    generateTable();
});