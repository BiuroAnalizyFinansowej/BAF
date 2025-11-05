// Plik: script.js
document.addEventListener('DOMContentLoaded', function() {
    const formattedDate = 'Dane na dzień: 04.11.2025';

    // Sprawdzenie, czy elementy istnieją na stronie, zanim spróbujemy ich użyć
    const wiborDateElem = document.getElementById('current-date-wibor');
    const odsetkiDateElem = document.getElementById('current-date-odsetki');
    const wibor1mElem = document.getElementById('wibor-1m');
    const wibor3mElem = document.getElementById('wibor-3m');
    const wibor6mElem = document.getElementById('wibor-6m');
    const odsetkiOpoznienieElem = document.getElementById('odsetki-opoznienie');

    if (wiborDateElem) wiborDateElem.textContent = formattedDate;
    if (odsetkiDateElem) odsetkiDateElem.textContent = formattedDate;
    if (wibor1mElem) wibor1mElem.textContent = '4,50%';
    if (wibor3mElem) wibor3mElem.textContent = '4,38%';
    if (wibor6mElem) wibor6mElem.textContent = '4,27%';
    if (odsetkiOpoznienieElem) odsetkiOpoznienieElem.textContent = '10%';
});
