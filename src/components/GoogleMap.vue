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
                                :zIndex="m.zIndex"
                                v-for="(m, index) in markers"
                                :position="m.position"
                                @click="toggleInfoWindow(m,index,$event)"
                        ></gmap-marker>
                    </gmap-map>
                </div>
            </div>
            <div class="cell medium-6">
                <div class="location-list">
                    <div class="list-container">
                        <div class="list-item" v-for="item in addressMarkers" @click="selectAddress(item)">
                            <div class="title">{{item.name}}</div>
                            <div class="address">{{item.address}}</div>
                            <div class="phone"><span>Phone: </span>{{item.phone}}</div>
                            <div class="hours item-group">
                                <div class="title">Hours</div>
                                <div class="hours-list">
                                    <div class="hours-list-item" v-for="(hours) in item.hoursList">
                                        <span>{{hours}}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="services item-group">
                                <div class="title">Services</div>
                                <div class="service-item" v-for="(service, index) in item.serviceList">
                                    <span class="name">{{ service }}</span><span v-if="index < (item.serviceList.length - 1)">, </span>
                                </div>
                            </div>
                            <div class="insurances item-group">
                                <div class="title">Accepted Insurance</div>
                                <div class="display-inline" v-for="(insurance, index) in item.insuranceList">
                                    <span class="name">{{ insurance }}</span><span v-if="index < (item.insuranceList.length - 1)">, </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    /* eslint-disable no-unused-vars */
    import smoothscroll from 'smoothscroll-polyfill';
    import jsonLocations from '../files/locations-v6.json';
    import 'lodash';
    import '../assets/sass/app.scss';

    smoothscroll.polyfill();

    "Accepts Medicaid (Y/N)\tAccepts Private Insurance (Y/N)\tAccepts Fidelis (Y/N)\tAccepts Uninsured (Y/N)";
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
          FIELD_INITIAL       = 'initial',
          FIELD_MEDICAID      = 'Medicaid',
          FIELD_PRIVATE_INS   = 'Private Insurance',
          FIELD_FIDELIS       = 'Fidelis',
          FIELD_UNINSURED     = 'Uninsured',
          FIELD_PUBLIC_PROV   = 'public provider',
          FIELD_STD_TEST     = 'std testing';


    let settings = {
            geocode: false
        },
        lang     = [
            {
                name : FIELD_PUBLIC_PROV,
                eng  : 'Public Provider',
                match: /^public prov/i
            },
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
                match: /^Morning After Pill/i
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
            },
            {
                name : FIELD_MEDICAID,
                eng  : 'Medicaid',
                match: /^accepts medicaid/i
            },
            {
                name : FIELD_PRIVATE_INS,
                eng  : 'Private Insurance',
                match: /^accepts private/i
            },
            {
                name : FIELD_UNINSURED,
                eng  : 'Uninsured',
                match: /^accepts uninsured/i
            },
            {
                name : FIELD_FIDELIS,
                eng  : 'Fidelis',
                match: /^accepts fidelis/i
            },
            {
                name : FIELD_STD_TEST,
                eng  : 'STD Testing',
                match: /^STD Test/i
            },
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
                rawLocations = this.translateJsonLocations(jsonLocations),
                sortedLocations = _.orderBy(rawLocations, 'name'),
            publicLocations = _.filter(sortedLocations, function (o) {
                return o[FIELD_PUBLIC_PROV].toLowerCase() === 'yes';
            }),
                privateLocations = _.filter(sortedLocations, function (o) {
                    return o[FIELD_PUBLIC_PROV].toLowerCase() !== 'yes';
                }),
                markerLocations = publicLocations.concat(privateLocations);

            this.addressMarkers = markerLocations.filter(marker => {
                return marker[FIELD_ADDRESS] && marker[FIELD_ADDRESS].length > 0;
            });

            let serviceTypes    = [
                    FIELD_PATCH,
                    FIELD_PILL,
                    FIELD_RING,
                    FIELD_IUD,
                    FIELD_SHOT,
                    FIELD_IMPLANT,
                    FIELD_CONDOMS,
                    FIELD_MORNING_AFTER,
                    FIELD_STD_TEST
                ],
                insuranceTypes  = [
                    FIELD_MEDICAID,
                    FIELD_PRIVATE_INS,
                    FIELD_FIDELIS,
                    FIELD_UNINSURED
                ];
            this.addressMarkers = this.addressMarkers.map(location => {
                location.serviceList   = serviceTypes.filter(service => location[service].match(/^y/i)).map(service => this.getTranslation(service, 'eng'));
                location.insuranceList = insuranceTypes.filter(type => location[type].match(/^y/i)).map(type => this.getTranslation(type, 'eng'));
                location.hoursList     = location.hours.split('\n');
                return location;
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

        computed: {
            locationList() {

                return '';

            }


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
                            } else {
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
                } else {
                    markers = _.filter(this.addressMarkers, query);
                }

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
                            if (field.match.test(rowField.trim().replace(/['"]/g, ''))) {
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
                    zIndex  : 1,
                    infoText: this.getInfoObject(marker)
                });
                if (marker[FIELD_INITIAL] === 'Yes') {
                    this.bounds.extend(location);
                }
                this.center = marker;
            },
            getInfoObject(marker) {
                let vm         = this,
                    element    = document.createElement('div'),
                    container  = document.createElement('div'),
                    titleEl    = document.createElement('div'),
                    addressEl  = document.createElement('div'),
                    phoneEl    = document.createElement('div'),
                    hoursEl    = document.createElement('div'),
                    servicesEl = document.createElement('div'),
                    insuranceEl = document.createElement('div');


                container.classList.add('marker-item');

                titleEl.innerHTML = marker[FIELD_NAME] || '';
                titleEl.classList.add('title');

                addressEl.innerHTML = marker[FIELD_ADDRESS] || '';
                addressEl.classList.add('address');

                phoneEl.innerHTML = marker[FIELD_PHONE] || '';
                phoneEl.classList.add('phone');

                hoursEl.classList.add('hours');

                servicesEl.classList.add('services');
                servicesEl.innerHTML = '<div class="title">Services</div>';

                insuranceEl.classList.add('insurance');
                insuranceEl.innerHTML = '<div class="title">Accepted Insurance</div>';

                container.appendChild(titleEl);
                container.appendChild(addressEl);
                container.appendChild(phoneEl);
                if (marker.hoursList) {
                    marker.hoursList.map(line => {
                        let itemElement       = document.createElement('div');
                        itemElement.innerHTML = line;
                        hoursEl.appendChild(itemElement);
                    });
                    container.appendChild(hoursEl);
                }
                if (marker.serviceList) {
                    marker.serviceList.map((line, index) => {
                        let itemElement = document.createElement('span');
                        itemElement.classList.add('name');
                        itemElement.innerHTML = line;
                        servicesEl.appendChild(itemElement);
                        if (index < marker.serviceList.length - 1) {
                            servicesEl.appendChild(document.createTextNode(', '));
                        }
                    });
                    container.appendChild(servicesEl);
                }
                if (marker.insuranceList) {
                    marker.insuranceList.map((line, index) => {
                        let itemElement = document.createElement('span');
                        itemElement.classList.add('name');
                        itemElement.innerHTML = line;
                        insuranceEl.appendChild(itemElement);
                        if (index < marker.insuranceList.length - 1) {
                            insuranceEl.appendChild(document.createTextNode(', '));
                        }
                    });
                    container.appendChild(insuranceEl);
                }
                element.appendChild(container);

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
                let found    = _.find(this.markers, {name: address.name});
                found.zIndex = 1;
                this.toggleInfoWindow(found);
                // document.querySelector('#birth-control-finder').scrollIntoView({behavior: 'smooth', block: 'start'});
            },
            resetMarkers() {
                this.markers.map(marker => marker.zIndex = 1);
            },
            toggleInfoWindow(marker, idx, event) {

                this.resetMarkers();
                marker.zIndex            = 1000;
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
