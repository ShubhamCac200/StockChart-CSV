async function fetchCSVData(stockCompany) {
    try {
        const response = await fetch(`${stockCompany}.csv`);
        const csvText = await response.text();
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: false,
                dynamicTyping: true,
                complete: (result) => {
                    if (result.errors.length === 0) {
                        resolve(result.data);
                    } else {
                        reject(result.errors);
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error fetching CSV data:', error);
        return [];
    }
}

async function createChart(stockCompany, timePeriod = 'all') {
    const csvData = await fetchCSVData(stockCompany);

    let filteredData = csvData;

    if (timePeriod !== 'all') {
        
        const currentDate = luxon.DateTime.local(2021, 4, 30); 

        if (timePeriod === '7days') {
            const sevenDaysAgo = currentDate.minus({ days: 7 });
            filteredData = csvData.filter(item => {
                const itemDate = luxon.DateTime.fromISO(item[0]).setZone('Asia/Kolkata');
                return itemDate >= sevenDaysAgo && itemDate <= currentDate;
            });
        } else if (timePeriod === '1month') {
            const oneMonthAgo = currentDate.minus({ months: 1 });
            filteredData = csvData.filter(item => {
                const itemDate = luxon.DateTime.fromISO(item[0]).setZone('Asia/Kolkata');
                return itemDate >= oneMonthAgo && itemDate <= currentDate;
            });
        } else if (timePeriod === '1year') {
            const oneYearAgo = currentDate.minus({ years: 1 });
            filteredData = csvData.filter(item => {
                const itemDate = luxon.DateTime.fromISO(item[0]).setZone('Asia/Kolkata');
                return itemDate >= oneYearAgo && itemDate <= currentDate;
            });
        }
    }

    const data = {
        datasets: [{
            label: `${stockCompany} STOCK`,
            data: filteredData.map(item => ({
                x: luxon.DateTime.fromISO(item[0]).setZone('Asia/Kolkata').valueOf(),
                o: parseFloat(item[4]),
                h: parseFloat(item[5]),
                l: parseFloat(item[6]),
                c: parseFloat(item[8])
            })),
        }]
    };

    const config = {
        type: 'candlestick',
        data,
        options: {
            
        }
    };

    if (currentChart) {
        currentChart.data = data;
        currentChart.update();
    } else {
        currentChart = new Chart(
            document.getElementById('myChart'),
            config
        );
    }

    return currentChart;
}

let currentChart = null;

function setupChartButtons() {
    const stockCompanyDropdown = document.getElementById('stockCompany');

    stockCompanyDropdown.addEventListener('change', () => {
        const selectedStockCompany = stockCompanyDropdown.value;
        createChart(selectedStockCompany);
    });

    document.getElementById('btn7Days').addEventListener('click', () => {
        const selectedStockCompany = stockCompanyDropdown.value;
        createChart(selectedStockCompany, '7days');
    });

    document.getElementById('btn1Month').addEventListener('click', () => {
        const selectedStockCompany = stockCompanyDropdown.value;
        createChart(selectedStockCompany, '1month');
    });

    document.getElementById('btn1Year').addEventListener('click', () => {
        const selectedStockCompany = stockCompanyDropdown.value;
        createChart(selectedStockCompany, '1year');
    });

    document.getElementById('btnAllYears').addEventListener('click', () => {
        const selectedStockCompany = stockCompanyDropdown.value;
        createChart(selectedStockCompany, 'all'); 
    });
}

async function initializeChart() {
    setupChartButtons();
    const selectedStockCompany = document.getElementById('stockCompany').value;
    createChart(selectedStockCompany, '1year'); 
}

initializeChart();