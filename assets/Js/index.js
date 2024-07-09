const API_Url = 'https://mindicador.cl/api';
const selectCurrency = document.getElementById('currency');
const chartContainer = document.getElementById('chart').getContext('2d');
let chartRef = null;

// Función para calcular conversión de moneda
document.getElementById('btn').addEventListener('click', async function(event) {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;

    try {
        const response = await fetch(API_Url);
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        const data = await response.json();
        
        let rate;
        switch (currency) {
            case 'dolar':
                rate = data.dolar?.valor;
                break;
            case 'euro':
                rate = data.euro?.valor;
                break;
            case 'uf':
                rate = data.uf?.valor;
                break;
            case 'bitcoin':
                rate = data.bitcoin?.valor;
                break;
            default:
                rate = null;
        }

        if (rate === null) {
            document.getElementById('result').textContent = 'No se puede obtener el cambio de esta moneda seleccionada.';
            return;
        }

        const convertedAmount = amount / rate;
        document.getElementById('result').textContent = `El monto convertido es: ${convertedAmount.toFixed(2)}`;
    } catch (error) {
        document.getElementById('result').textContent = `Error: ${error.message}`;
    }
});

// Función para obtener y renderizar monedas
const fetchCoins = async(url) => {
    const dataJson = await fetch(url);
    const coinsData = await dataJson.json();

    const coins = [];
    for (const key in coinsData) {
        if (coinsData[key]['unidad_medida'] === 'Pesos') {
            const { codigo, nombre, valor } = coinsData[key];
            coins.push({ codigo, nombre, valor });
        }
    }
    renderCoins(coins, selectCurrency);
}

const renderCoins = (coins, container) => {
    let coinOptions = '';
    coinOptions += `<option value="" selected disabled>Selecciona una moneda</option>`;

    coins.forEach(({ codigo, nombre, valor }) => {
        coinOptions += `<option data-value="${valor}" value="${codigo}">${nombre}</option>`;
    });

    container.innerHTML = coinOptions;
}

// Función para obtener detalles de la moneda
const fetchCoinDetail = async (url, coinID) => {
    const dataJson = await fetch(`${url}/${coinID}`);
    const { serie } = await dataJson.json();

    const labels = [];
    const data = [];
    serie.slice(0, 11).forEach(({ fecha, valor }) => {
        const fechacorta = fecha.split('T')[0];
        labels.push(fechacorta);
        data.push(valor);
    });

    return {
        labels: labels.reverse(),
        data: data.reverse()
    }
}

// Función para renderizar el gráfico
const renderChart = (coinsData, container) => {
    if (chartRef) {
        chartRef.destroy();
    }
    
    chartRef = new Chart(container, {
        type: 'line',
        data: {
            labels: coinsData.labels,
            datasets: [{
                label: 'Fechas',
                data: coinsData.data,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Evento para manejar el botón de gráfico
document.getElementById('btn').addEventListener('click', async () => {
    const coinID = selectCurrency.value;

    const coinDetail = await fetchCoinDetail(API_Url, coinID);
    renderChart(coinDetail, chartContainer);

    console.log(chartRef);
});

// Inicializar con monedas disponibles
fetchCoins(API_Url);
