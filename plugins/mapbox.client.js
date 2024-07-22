import mapbox from 'mapbox-gl/dist/mapbox-gl';
const axios = require("axios")
// import mapbox from '!mapbox-gl';

const mbxClient = require('@mapbox/mapbox-sdk')
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding')

export default async function ({ $axios,$config }, inject) {

    const response = await fetch('/api/secure-data');
    var data = await response.json();

    const baseClient = new mbxClient({ accessToken: data.CHARTMAT_MAPBOX_AUTH_TOKEN })
    const geocodeClient = mbxGeoCoding(baseClient)
    inject('geocode', geocodeClient)
    inject('mapbox', mapbox)
}