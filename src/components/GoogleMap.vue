<template>
    <div class="location-container">
        <div class="grid-x">
            <div class="cell medium-6">
                <div class="location-map">
                    <gmap-map
                            ref="map"
                            :options="mapOptions"
                            :center="center"
                            :zoom="12"
                            >
                        <gmap-info-window :options="infoOptions" :position="infoWindowPos" :opened="infoWinOpen" @closeclick="closeInfoWindow">
                        </gmap-info-window>
                        <gmap-marker
                                :key="index"
                                v-for="(m, index) in markers"
                                :position="m.position"
                                @click="toggleInfoWindow(m,index)"
                        ></gmap-marker>
                    </gmap-map>
                </div>
            </div>
            <div class="cell medium-6">
                <div class="location-list">
                    <div class="list-item" v-for="item in addressMarkers" @click="selectAddress(item)">
                        <div>{{item.name}}</div>
                        <div>{{item.address}}</div>
                        <div>{{item.phone}}</div>
                        <div>{{item.hours}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    /* eslint-disable no-unused-vars, no-console, no-debugger */
    import jsonLocations from '../files/locations-v3.json';
    import 'lodash';
    import '../assets/sass/app.scss';

    const FIELD_PILL          = 'pill',
          FIELD_PATCH         = 'patch',
          FIELD_RING          = 'ring',
          FIELD_CONDOMS       = 'condoms',
          FIELD_MORNING_AFTER = 'morningAfter',
          FIELD_SHOT          = 'shot',
          FIELD_IUD           = 'iud',
          FIELD_IMPLANT       = 'implant',
          FIELD_NAME          = 'name',
          FIELD_ADDRESS       = 'address',
          FIELD_PHONE         = 'phone',
          FIELD_HOURS         = 'hours',
          FIELD_LAT           = 'lat',
          FIELD_LNG           = 'lng',
          FIELD_INITIAL       = 'initial';


    let settings = {
            geocode: false
        },
        lang     = [
            {
                name : FIELD_PILL,
                eng  : 'Pill',
                match: /^pill/i
            },
            {
                name : FIELD_PATCH,
                eng  : 'Patch',
                match: /^patch/i
            },
            {
                name : FIELD_RING,
                eng  : 'Ring',
                match: /^ring/i
            },
            {
                name : FIELD_CONDOMS,
                eng  : 'Condoms',
                match: /^Condoms/i
            },
            {
                name : FIELD_MORNING_AFTER,
                eng  : 'Morning after pill',
                match: /^Morning After/i
            },
            {
                name : FIELD_SHOT,
                eng  : 'Shot',
                match: /^Shot/i
            },
            {
                name : FIELD_IUD,
                eng  : 'IUD',
                match: /^IUD/i
            },
            {
                name : FIELD_IMPLANT,
                eng  : 'Implant',
                match: /^Implant/i
            },
            {
                name : FIELD_NAME,
                eng  : 'Name',
                match: /^Name/i
            },
            {
                name : FIELD_ADDRESS,
                eng  : 'Address',
                match: /^Address/i
            },
            {
                name : FIELD_PHONE,
                eng  : 'Phone Number',
                match: /^Phone Number/i
            },
            {
                name : FIELD_HOURS,
                eng  : 'Hours of Operation',
                match: /^Hours of Operation/i
            },
            {
                name : FIELD_LAT,
                eng  : 'Latitude',
                match: /^lat/i
            },
            {
                name : FIELD_LNG,
                eng  : 'Longitude',
                match: /^lng/i
            },
            {
                name : FIELD_INITIAL,
                eng  : 'Initial Map',
                match: /^initial/i
            }
        ].reduce((acc, curr) => {
            acc[curr.name] = curr;
            return acc;
        }, {});

    export default {
        name: "GoogleMap",
        data() {
            return {
                bounds        : null,
                infoContent   : '',
                infoWindowPos : null,
                infoWinOpen   : false,
                infoOptions   : {
                    pixelOffset: {
                        width : 0,
                        height: -35
                    },
                    content    : ''
                },
                addressMarkers: [],
                filter        : '',
                filterFields  : [
                    FIELD_PILL,
                    FIELD_PATCH,
                    FIELD_MORNING_AFTER,
                    FIELD_IUD,
                    FIELD_IMPLANT,
                    FIELD_SHOT,
                    FIELD_CONDOMS,
                    FIELD_RING,
                ],
                currentMidx   : null,
                // default to Montreal to keep it simple
                // change this to whatever makes sense
                center        : {lat: 45.508, lng: -73.587},
                markers       : [],
                places        : [],
                currentPlace  : null,
                mapOptions    : {
                    scrollwheel   : false,
                    mapTypeControl: false

                }
            };
        },

        mounted() {
            let vm              = this,
                markerLocations = this.translateJsonLocations(jsonLocations);
            this.addressMarkers = markerLocations.filter(marker => {
                return marker[FIELD_ADDRESS] && marker[FIELD_ADDRESS].length > 0;
            });

            if (settings.geocode) {
                this.geocode(this.addressMarkers);
            }

            this.$gmapApiPromiseLazy().then(function () {
                vm.bounds = new window.google.maps.LatLngBounds();
                vm.filterMarkers();
            });

            // this.geolocate();
        },

        methods: {
            setFilter: function (field) {
                let query          = {};
                this.filter        = field;
                query[this.filter] = 'Yes';
                this.filterMarkers(query);
            },

            // receives a place object via the autocomplete component
            setPlace(place) {
                this.currentPlace = place;
            },
            geocode(markers) {
                let geocoder,
                    vm = this;

                if (markers.length > 0) {
                    let marker = markers.pop();
                    this.$gmapApiPromiseLazy().then(function () {
                        if (!geocoder) {
                            geocoder = new window.google.maps.Geocoder();
                        }
                        geocoder.geocode({
                            address: marker[FIELD_ADDRESS]
                        }, function (results, status) {
                            if (status === 'OK') {
                                var location = results.pop().geometry.location,
                                    center   = {
                                        lat: location.lat(),
                                        lng: location.lng()
                                    };
                                console.log(marker[FIELD_ADDRESS], center.lat, center.lng);
                            }
                            else {
                                // console.log(marker.name, marker.address)
                            }
                            setTimeout(function () {
                                vm.geocode(markers);
                            }, 500);
                        });
                    });
                }
            },
            setCache(field, val) {
                this.cache[field] = val;
            },
            getCache(field) {
                return this.cache[field];
            },
            getTranslation(key, field) {
                let res = lang[key] || null;
                if (res && field) {
                    return res[field];
                }
                return res;
            },
            filterMarkers(query) {
                let markers;

                if (!query) {
                    markers = this.addressMarkers;
                }
                else {
                    markers = _.filter(this.addressMarkers, query);
                }

                console.log(_.map(markers, 'name'));

                this.markers = [];
                markers.map(marker => this.setMarker(marker));
                this.$refs.map.fitBounds(this.bounds);
            },
            translateJsonLocations(input) {
                let vm = this;
                return input.map(row => {
                    let res = {};
                    Object.keys(row).forEach(rowField => {
                        Object.values(lang).forEach(field => {
                            if (field.match.test(rowField)) {
                                res[field.name] = row[rowField];
                            }
                        });
                    });
                    return res;
                });
            },
            setMarker(marker) {
                const location = {
                    lat: marker[FIELD_LAT],
                    lng: marker[FIELD_LNG]
                };
                this.markers.push({
                    name    : marker[FIELD_NAME],
                    position: location,
                    infoText: this.getInfoObject(marker)
                });
                if (marker[FIELD_INITIAL] === 'Yes') {
                    this.bounds.extend(location);
                }
                this.center = marker;
            },
            getInfoObject(marker) {
                let element   = document.createElement('div'),
                    titleEl   = document.createElement('div'),
                    addressEl = document.createElement('div'),
                    phoneEl   = document.createElement('div'),
                    hoursEl   = document.createElement('ul');


                titleEl.innerHTML = marker[FIELD_NAME] || '';
                titleEl.classList.add('title');

                addressEl.innerHTML = marker[FIELD_ADDRESS] || '';
                addressEl.classList.add('address');

                phoneEl.innerHTML = marker[FIELD_PHONE] || '';
                phoneEl.classList.add('address');


                element.appendChild(titleEl);
                element.appendChild(addressEl);
                element.appendChild(phoneEl);
                if (marker.hours) {
                    marker.hours.split('\n').map(line => {
                        // console.log(line);
                        let itemElement       = document.createElement('li');
                        itemElement.innerHTML = line;
                        hoursEl.appendChild(itemElement);
                    });
                    element.appendChild(hoursEl);
                }

                return element;
            },
            geolocate() {
                navigator.geolocation.getCurrentPosition(position => {
                    this.center = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                });
            },
            closeInfoWindow() {
                this.infoWinOpen = false;
                // this.$refs.map.$mapObject.setZoom(12);
            },
            selectAddress(address) {
                this.closeInfoWindow();
                let found = _.find(this.markers, {name: address.name});
                this.toggleInfoWindow(found);
            },
            toggleInfoWindow(marker, idx) {
                this.infoWindowPos       = marker.position;
                this.infoContent         = marker.infoText.innerHTML;
                this.infoOptions.content = marker.infoText.innerHTML;

                //check if its the same marker that was selected if yes toggle
                if (this.currentMidx === idx) {
                    this.infoWinOpen = !this.infoWinOpen;
                }
                //if different marker set infowindow to open and reset current marker index
                else {
                    this.infoWinOpen = true;
                    this.currentMidx = idx;

                }

                // this.$refs.map.$mapObject.setZoom(13);
                this.$refs.map.$mapObject.setCenter(this.infoWindowPos);
            }
        }
    };
</script>

<style scoped>

</style>