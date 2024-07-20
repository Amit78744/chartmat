import mapbox from 'mapbox-gl/dist/mapbox-gl';
// import mapbox from '!mapbox-gl';

const mbxClient = require('@mapbox/mapbox-sdk')
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding')

export default function ({ $config }, inject) {
    const baseClient = new mbxClient({ accessToken: $config.CHARTMAT_MAPBOX_AUTH_TOKEN })
    const geocodeClient = mbxGeoCoding(baseClient)
    inject('geocode', geocodeClient)
    inject('mapbox', mapbox)
}