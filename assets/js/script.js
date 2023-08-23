var formEl = document.getElementById("cityForm");
var cityNameInput = document.getElementById("cityNameInput");
var apiKey = "b757ba8a19934d32e44d948575da3a08"


// The submit button will take the input value and use it to build the API URL. 
// It will use it to fetch data and retrieve whatever city latitude and longitude.
var url ="";
formEl.addEventListener("submit", function(event){
    event.preventDefault();
    var cityName = cityNameInput.value;
    url = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=" + apiKey;
     
    fetch(url)
    .then(function(response){
        if(!response.ok){
            throw response.json();
        }
        return response.json();
    })
    .then(function(data){
        var lat = data[0].lat;
        var lon = data[0].lon;

        
        // The lat and lon values obtained from the previous step, will be used
        // to actually fetch the weather data. Any values obtaines, will be converted 
        // to metric system because of the last query parameter in the url
        var url_2 ="https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey +  "&units=metric";


        // I was making the mistake to start a second fecth out of the scope of the first one.
        // but I was getting undefined for lat and lon values.
        // So i found out that if I did so, the second fetch would run at the same time as the first and
        // the lat and lon values wouldnt be generated yet. So they have to obey a chronological
        // order and be placed inside one another.
        fetch(url_2)
        .then(function(response){
            if(!response.ok){
                throw response.json();
            }
            return response.json();
        })
        // this populates the main box with data for the current day
        .then(function(data){
            console.log(data)
            document.getElementById("dayCityName").textContent = data.name + " ("+ dayjs().format("DD/MMM/YYYY") +")";
            document.getElementById("dayTemp").textContent = "Temp: " + data.main.temp + "ºC";
            document.getElementById("dayWind").textContent = "Wind: " + data.wind.speed + "km/h";
            document.getElementById("dayHumidity").textContent = "Humidity: " + data.main.humidity + "%";

                            
                // finally, I'll save the input values in the local storage to build a 
                // perfonal search history for the user.
                var searchHistory = JSON.parse(localStorage.getItem("searchHistory"))||[];

                // This checks if the city name is already in the local storage.
                // in case !itIs, the name will be allewid in the array.
                // I could used the push method, but the for loop would be a
                // little more complicated to build the history list, because
                // it would have to count backwards - i--.
                if(!searchHistory.includes(data.name)) {
                    searchHistory.unshift(data.name);

                    // i also only want to have 5 elements in the array.
                    if(searchHistory.length>5){
                        searchHistory.pop();
                    }
                    
                    // pushes the city name to the local storage
                    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
                
                    updateSearchHistory(searchHistory);
                }
        })
        // perceive the difference between this link and the previous ones. This one uses a forecast.
        // again we have a query parameter to convert values to metric system, but this time we have a 
        // cnt=40. this takes the next 40 indexes in the data.list array. 40 is needed because there is a 
        // 3 hour span between each index. Since we need info for 5 days, we need 40 indexes and skip every
        // 8 indexes, so we will have one index for every 24h.
        .then(function(data){
            var url_3 = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey +  "&units=metric&cnt=40";

            fetch(url_3)
            .then(function(response){
                if(!response.ok){
                    throw response.json();
                }
                return response.json();
            })
            .then(function(data){
                // this next for loop iterate through data.list and through my samll HTML boxes
                // at the same time. The data retrieved from each day will be stored in each box.
                // again, perceive the i+=8 because of the 3h spam between the indexes. 
                for (var i =0; i < data.list.length; i+=8){
                   var boxesEls = document.getElementById("box-" + ((i/8) + 1));

                   boxesEls.innerHTML = "<p class='dDate'> Date: " + dayjs(data.list[i].dt * 1000).format("DD/MMM/YYYY")
                   + "</p> <p>Temp: " + data.list[i].main.temp 
                   + "ºC</p> <p> Wind: " + data.list[i].wind.speed 
                   + "km/h</p> <p>Humidity: " + data.list[i].main.humidity + "%</p>"
                }
            })
        })
    })
})

// This is the declaration of the last function called inside the submit event listener.
// it uses the searchHistory array saved in the local storage as an argument and build
// the list items and append to the unordered list.
function updateSearchHistory(history) {
    var historyList = document.getElementById("historyList");
    historyList.innerHTML = '';

    for(var i = 0; i < history.length; i++) {
        var historyItem = document.createElement("li");
        historyItem.textContent = history[i];
        historyList.appendChild(historyItem);
        historyItem.setAttribute("class", "bg-dark")
    }
}

// end of javascript :)

