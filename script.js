async function getWeather() {
    const city = document.getElementById("city-input").value;
    const apiKey = 'e6569bdc18b7c88d718b64998c8b60f3'; // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== '200') {
            document.getElementById('weather-info').textContent = 'City not found';
            return;
        }

        // Display weather data
        const weatherInfo =
            `${data.city.name}, ${data.city.country} 
            Temperature: ${data.list[0].main.temp}°C
            Condition: ${data.list[0].weather[0].description}`;
        document.getElementById('weather-info').innerHTML = weatherInfo;

        // Prepare data for charts
        const labels = data.list.map(item => new Date(item.dt * 1000).toLocaleDateString());
        const temperatures = data.list.map(item => item.main.temp);
        const humidity = data.list.map(item => item.main.humidity);
        const windSpeed = data.list.map(item => item.wind.speed);

        // Draw charts
        drawBarChart(labels, temperatures);
        drawDoughnutChart(humidity);
        drawLineChart(labels, temperatures, windSpeed);

        // Populate forecast table
        populateForecastTable(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function drawBarChart(labels, data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function drawDoughnutChart(data) {
    const ctx = document.getElementById('doughnutChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Humidity'],
            datasets: [{
                label: 'Humidity (%)',
                data: data,
                backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

function drawLineChart(labels, tempData, windData) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: tempData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false
                },
                {
                    label: 'Wind Speed (m/s)',
                    data: windData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function populateForecastTable(data) {
    const tableBody = document.getElementById('forecast-table-body');
    tableBody.innerHTML = ''; // Clear previous data

    for (let i = 0; i < 5; i++) {
        const date = new Date(data.list[i * 8].dt * 1000).toLocaleDateString(); // Every 8th item is a new day
        const temp = data.list[i * 8].main.temp;
        const weather = data.list[i * 8].weather[0].description;
        const humidity = data.list[i * 8].main.humidity;
        const wind = data.list[i * 8].wind.speed;

        const row = `
            <tr>
                <td>${date}</td>
                <td>${temp}°C</td>
                <td>${weather}</td>
                <td>${humidity}%</td>
                <td>${wind} m/s</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    }
}

function showTable() {
    document.getElementById('charts-section').style.display = 'none'; // Hide charts
    document.getElementById('table-container').style.display = 'block'; // Show table
}

function showDashboard() {
    document.getElementById('charts-section').style.display = 'grid'; // Show charts
    document.getElementById('table-container').style.display = 'none'; // Hide table
}


// chatbot

function askChatbot() {
    const question = document.getElementById('chat-input').value;
    const chatbotBody = document.getElementById('chatbot-body');

    fetchWeatherData().then(data => {
        const response = handleChatbotQuestion(question, data);
        chatbotBody.innerHTML += `<p>You: ${question}</p><p>Bot: ${response}</p>`;
        document.getElementById('chat-input').value = ''; // Clear input after asking
    });
}

function fetchWeatherData() {
    const city = document.getElementById('city-input').value;
    const apiKey = 'your_openweather_api_key';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    return fetch(url).then(response => response.json());
}

function getStatistics(data) {
    const temps = data.list.map(item => item.main.temp);

    const highestTemp = Math.max(...temps);
    const lowestTemp = Math.min(...temps);
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2);

    return {
        highest: highestTemp,
        lowest: lowestTemp,
        average: avgTemp
    };
}

function handleChatbotQuestion(question, data) {
    const stats = getStatistics(data);

    if (question.includes("highest")) {
        return `The highest temperature this week was ${stats.highest}°C.`;
    } else if (question.includes("lowest")) {
        return `The lowest temperature this week was ${stats.lowest}°C.`;
    } else if (question.includes("average")) {
        return `The average temperature this week was ${stats.average}°C.`;
    } else {
        return "I'm not sure how to answer that. Please ask about the highest, lowest, or average temperature.";
    }
}
