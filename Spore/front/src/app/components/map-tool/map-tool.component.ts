import { StaticNavBar } from '../static-nav/static-nav.component';
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FooterBarComponent } from '../footer-bar/footer-bar.component';
declare var google: any;

@Component({
    selector: 'map-tool',
    templateUrl: './map-tool.component.html',
    styleUrls: ['./map-tool.component.scss']
})
export class MapToolComponent implements OnInit {

    private inputLocation: string = '';
    
    ngOnInit() {
    }

    /* For Google GeoLocation */
    public geoFindMe() {

        if (this.inputLocation != '') {
            return;
        }

        var location = document.getElementById("location");
        var options = document.getElementById("options");

        if (!navigator.geolocation) {
            location.innerHTML = "<p>Geolocation is not supported by your browser</p>";
            return;
        }

        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var labelIndex = 0;
        var map;
        var service;
        var whereAmI;
        var marker;
        var infowindow;

        function success(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            location.innerHTML = '<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>';

            whereAmI = new google.maps.LatLng(latitude, longitude);
            var mapProp = {
                center: whereAmI,
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            map = new google.maps.Map(document.getElementById("map"), mapProp);

            var request = {
                location: whereAmI,
                radius: '1000',
                types: ['food']
            }

            marker = new google.maps.Marker({
                position: whereAmI,
                map: map,
                title: 'Hello World!',
                //label: 'YOU',
                draggable: true,
                animation: google.maps.Animation.DROP,
                icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
            });
            marker.addListener('click', toggleBounce);
            marker.setMap(map);

            infowindow = new google.maps.InfoWindow();
            var service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, callback);
        };

        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                }
            }
        }

        function createMarker(place) {
            var placeLoc = place.geometry.location;
            var label = labels[labelIndex++ % labels.length];
            var marker = new google.maps.Marker({
                map: map,
                label: label,
                position: place.geometry.location
            });

            options.innerHTML += '<p>' + label + ' => ' + place.name + '. cost: ' + place.price_level + '. rating:  ' + place.rating + '</p>';

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(place.name);
                infowindow.open(map, this);
            });
        }

        function toggleBounce() {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }

        function error() {
            location.innerHTML = "Unable to retrieve your location";
        };

        location.innerHTML = "<p>Locating…</p>";

        navigator.geolocation.getCurrentPosition(success, error);
    }

    /* For Google AutoFill */
    public setUpAutoFill() {
        var placeSearch, autocomplete;
        function initAutocomplete() {
            // Create the autocomplete object, restricting the search to geographical
            // location types.
            autocomplete = new google.maps.places.Autocomplete(
                (document.getElementById('autocomplete')),
                { types: ['geocode'] });

            // When the user selects an address from the dropdown, populate the address
            // fields in the form.
            // autocomplete.addListener('place_changed', fillInAddress);
        }

        // function fillInAddress() {
            // Get the place details from the autocomplete object.
            // var place = autocomplete.getPlace();

            // for (var component in componentForm) {
            //     document.getElementById(component).value = '';
            //     document.getElementById(component).disabled = false;
            // }

            // // Get each component of the address from the place details
            // // and fill the corresponding field on the form.
            // for (var i = 0; i < place.address_components.length; i++) {
            //     var addressType = place.address_components[i].types[0];
            //     if (componentForm[addressType]) {
            //         var val = place.address_components[i][componentForm[addressType]];
            //         document.getElementById(addressType).value = val;
            //     }
            // }
        // } 

        // Bias the autocomplete object to the user's geographical location,
        // as supplied by the browser's 'navigator.geolocation' object.
        function geolocate() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var geolocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    var circle = new google.maps.Circle({
                        center: geolocation,
                        radius: position.coords.accuracy
                    });
                    autocomplete.setBounds(circle.getBounds());
                });
            }
        }
        initAutocomplete();
        geolocate();
    }
}