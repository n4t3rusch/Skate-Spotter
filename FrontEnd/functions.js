let map;
let userLocation;

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 10,
                center: userLocation
            });

        }, function() {
            handleLocationError(true, map.getCenter());
        });
    } else {
        handleLocationError(false, map.getCenter());
    }
}

const openBtn = document.getElementById("openModal"); 
const modal = document.getElementById("modal");

function handleLocationError(browserHasGeolocation, pos) {
    var errorMessage = browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.';
    
    var infoWindow = new google.maps.InfoWindow({map: map});
    infoWindow.setPosition(pos);
    infoWindow.setContent(errorMessage);
}

document.addEventListener("DOMContentLoaded", function() {
    let selectedSpotType = ''; 
    document.querySelectorAll('.dropdown .content a').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            selectedSpotType = this.getAttribute('data-value'); 
            document.querySelector('.dropdown button').innerText = selectedSpotType;
            document.querySelector('.dropdown .content').style.display = 'none';
        });
    });

    document.getElementById("createMarkerButton").addEventListener("click", function() {
        const markerText = document.getElementById("markerText").value;
        const descriptorText = document.getElementById("descriptorText").value;
        const imageFile = document.getElementById("input-file").files[0];
        
        if (markerText && selectedSpotType && descriptorText && imageFile) {
            getImage(imageFile).then(imageUrl => {
                createNewMarker(map, userLocation, markerText, descriptorText, selectedSpotType, imageUrl);

                const spotData = {
                    spotname: markerText,
                    description: descriptorText,
                    image: imageUrl,  // base64 string
                    rating: 0,  // default rating
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                };

                fetch('/addSpot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(spotData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
                
                resetModalInputs();
                selectedSpotType = '';
                modal.classList.remove("open");
            });
        }else{
            alert("Please fill in all the fields and upload an image");
        }
    });
});

function resetModalInputs() {
    document.getElementById("markerText").value = '';
    document.getElementById("descriptorText").value = '';
    document.getElementById("input-file").value = '';
    document.querySelector('.dropdown button').innerText = "spot type";
    document.querySelector('.dropdown .content').style.display = 'none';
}

function getImage(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event){
            resolve(event.target.result);
        };
        reader.onerror = function(error){
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}


openBtn.addEventListener("click", () => {
    modal.classList.add("open");
});

function createNewMarker(map, userLocation, markerText, descriptorText, spotType, imageUrl) {
    let markerColor;
    //console.log("checkpoint 1")
    switch (spotType.toLowerCase()) {
        case 'ledge':
            markerColor = 'red';
            break;
        case 'stair-set':
            markerColor = 'blue';
            break;
        case 'rail':
            markerColor = 'green';
            break;
        case 'handrail':
            markerColor = 'yellow';
            break;
        case 'bank':
            markerColor = 'purple';
            break;
        case 'park':
            markerColor = 'brown';
            break;
        default:
            markerColor = 'black';
    }

    const markerIcon = `http://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`;

    
    const marker = new google.maps.Marker({
        position: userLocation,
        map: map,
        icon: markerIcon
    });
    
    const contentString = `
        <div>
            <h1>${markerText}</h1>
            <div id="rating">
                <span class="star" data-value="1">&#9733;</span>
                <span class="star" data-value="2">&#9733;</span>
                <span class="star" data-value="3">&#9733;</span>
                <span class="star" data-value="4">&#9733;</span>
                <span class="star" data-value="5">&#9733;</span>
            </div>
            <p id="ratingValue">Rating: 0</p>
            <img src="${imageUrl}" alt="Marker Image" style="width:100%; max-width:100px;">
            
            <p1>${descriptorText}</p1>
        </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: contentString
    });
    
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
        
        google.maps.event.addListenerOnce(infoWindow, 'domready', function() {
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const rating = this.getAttribute('data-value');
                    document.getElementById('ratingValue').innerText = `Rating: ${rating}`;
                    stars.forEach(s => {
                        s.innerHTML = s.getAttribute('data-value') <= rating ? '&#9733;' : '&#9734;';
                    });
                });
            });
        });
    });
}

