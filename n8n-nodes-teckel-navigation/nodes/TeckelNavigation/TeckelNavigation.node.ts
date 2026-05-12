import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';

// ── Parameter-group membership arrays ───────────────────────────────────────

const ICAO_OPS       = ['getMetars', 'getTafs'];
const PLACE_OPS      = ['geocodeSearch', 'getCurrentTimeAtPlace', 'getNearestMetarForPlace', 'getLaterTimeAtPlace', 'getMetarsForPlaceRange', 'navBearingFromPlace'];
const COORDS_OPS     = ['getCurrentTimeAtCoords', 'getNearestMetarForCoords', 'getLaterTimeAtCoords', 'getMetarsForCoordsRange', 'getAirportsForCoordsRange', 'getNavaidsForCoordsRange', 'getFixesForCoordsRange', 'getFeaturesForCoordsRange', 'getObstaclesForCoordsRange', 'getNavBoundingBox', 'sunCalculations', 'navBearingFromCoords'];
const RANGE_NM_OPS   = ['getMetarsForCoordsRange', 'getMetarsForPlaceRange', 'getAirportsForCoordsRange', 'getNavaidsForCoordsRange', 'getFixesForCoordsRange', 'getFeaturesForCoordsRange', 'getObstaclesForCoordsRange', 'airportSearchCoords', 'airportSearchPlace'];
const HOURS_LATER_OPS = ['getLaterTimeAtCoords', 'getLaterTimeAtPlace'];
const PLACE_ID_OPS   = ['getGooglePlaceDetails'];
const BEARING_OPS    = ['navBearingFromCoords', 'navBearingFromPlace'];
const MAG_GC_OPS     = ['navBearingFromCoords', 'navBearingFromPlace', 'flightDistanceBetweenCoords', 'flightDistanceBetweenPlaces'];
const COORDS2_OPS    = ['flightDistanceBetweenCoords', 'drivingDistanceBetweenCoords'];
const PLACES2_OPS    = ['flightDistanceBetweenPlaces', 'drivingDistanceBetweenPlaces'];
const AIRPORT_FILTER_OPS = ['airportSearch', 'airportSearchCoords', 'airportSearchPlace'];

// ── Endpoint paths ───────────────────────────────────────────────────────────

const OP_PATHS: Record<string, string> = {
	navigationHelp:                'get_api_navigation_help',
	getMetars:                     'get_metars',
	getTafs:                       'get_tafs',
	geocodeSearch:                 'perform_google_geocode_search',
	nearestPlacesSearch:           'perform_google_nearest_places_search',
	getGooglePlaceDetails:         'get_google_place_details',
	airportSearch:                 'perform_openaip_airport_search',
	airportSearchCoords:           'perform_openaip_airport_search_coords',
	airportSearchPlace:            'perform_openaip_airport_search_place',
	flightRouteCalculations:       'perform_flight_route_calculations',
	getCurrentTimeAtCoords:        'get_current_time_at_location_coords',
	getCurrentTimeAtPlace:         'get_current_time_at_place',
	getLaterTimeAtCoords:          'get_later_time_at_location_coords',
	getLaterTimeAtPlace:           'get_later_time_at_place',
	getNavBoundingBox:             'get_nav_bounding_box',
	sunCalculations:               'perform_sun_calculations',
	navBearingFromCoords:          'nav_bearing_from_coords',
	navBearingFromPlace:           'nav_bearing_from_place',
	flightDistanceBetweenCoords:   'flight_nav_distance_between_coords',
	drivingDistanceBetweenCoords:  'driving_distance_between_coords',
	flightDistanceBetweenPlaces:   'flight_nav_distance_between_places',
	drivingDistanceBetweenPlaces:  'driving_distance_between_places',
	getNearestMetarForCoords:      'get_nearest_METAR_for_coords',
	getNearestMetarForPlace:       'get_nearest_METAR_for_place',
	getMetarsForCoordsRange:       'get_METARS_for_coords_range',
	getMetarsForPlaceRange:        'get_METARS_for_place_range',
	getAirportsForCoordsRange:     'get_airports_for_coords_range',
	getNavaidsForCoordsRange:      'get_navaids_for_coords_range',
	getFixesForCoordsRange:        'get_fixes_for_coords_range',
	getFeaturesForCoordsRange:     'get_features_for_coords_range',
	getObstaclesForCoordsRange:    'get_obstacles_for_coords_range',
};

const AIRPORT_TYPE_DESC = 'Leave blank or specify: 0=Airport, 1=Glider Site, 2=Airfield Civil, 3=International Airport, 4=Heliport Military, 5=Military Aerodrome, 6=Ultra Light, 7=Heliport Civil, 8=Closed, 9=IFR, 10=Water, 11=Landing Strip, 12=Agricultural Strip, 13=Altiport';
const FUEL_TYPE_DESC    = 'Leave blank or specify: 0=Super PLUS, 1=AVGAS, 2=JET A, 3=JET A1, 4=JET B, 5=Diesel, 6=AVGAS UL91';
const HANDLING_TYPE_DESC = 'Leave blank or specify: 0=Cargo, 1=De-Icing, 2=Maintenance, 3=Security, 4=Shelter';
const SERVICE_TYPE_DESC = 'Leave blank or specify: 0=Bank, 1=Post Office, 2=Customs, 3=Lodging, 4=Medical, 5=Restaurant, 6=Sanitation, 7=Transportation, 8=Laundry, 9=Camping';

export class TeckelNavigation implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'teckel Navigation',
		name: 'teckelNavigation',
		icon: 'file:teckel-navigation.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Aviation weather, flight routing, geocoding and navigation tools via the teckel platform',
		defaults: { name: 'teckel Navigation' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'teckelNavigationApi', required: true }],
		properties: [

			// ── Operation selector ────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'getMetars',
				options: [
					{ name: 'Airport Search by Coordinates', value: 'airportSearchCoords', description: 'Search for airports within range of coordinates', action: 'Airport search by coordinates' },
					{ name: 'Airport Search by Name/Code', value: 'airportSearch', description: 'Search for airports by name, ICAO, IATA or alternate ID', action: 'Airport search by name or code' },
					{ name: 'Airport Search From Place', value: 'airportSearchPlace', description: 'Search for airports within range of a place', action: 'Airport search from place' },
					{ name: 'Airports Within Range (Coords)', value: 'getAirportsForCoordsRange', description: 'Get airports within range of coordinates', action: 'Airports within range coords' },
					{ name: 'Driving Distance Between Coords', value: 'drivingDistanceBetweenCoords', description: 'Get driving distance and time between two coordinate pairs', action: 'Driving distance between coords' },
					{ name: 'Driving Distance Between Places', value: 'drivingDistanceBetweenPlaces', description: 'Get driving distance and time between two places', action: 'Driving distance between places' },
					{ name: 'Features Within Range (Coords)', value: 'getFeaturesForCoordsRange', description: 'Get aviation features within range of coordinates (US only)', action: 'Features within range coords' },
					{ name: 'Fixes Within Range (Coords)', value: 'getFixesForCoordsRange', description: 'Get aviation fixes/waypoints within range of coordinates (US only)', action: 'Fixes within range coords' },
					{ name: 'Flight Distance Between Coords', value: 'flightDistanceBetweenCoords', description: 'Get great-circle/rhumbline distance and track between two coordinate pairs', action: 'Flight distance between coords' },
					{ name: 'Flight Distance Between Places', value: 'flightDistanceBetweenPlaces', description: 'Get great-circle/rhumbline distance and track between two places', action: 'Flight distance between places' },
					{ name: 'Flight Route Calculations', value: 'flightRouteCalculations', description: 'Full VFR flight route calculation with weather, wind correction and navlog', action: 'Flight route calculations' },
					{ name: 'Geocode Search', value: 'geocodeSearch', description: 'Get geographical coordinates for any location', action: 'Geocode search' },
					{ name: 'Get Current Time at Coords', value: 'getCurrentTimeAtCoords', description: 'Get current local time, sunrise and sunset for coordinates', action: 'Get current time at coords' },
					{ name: 'Get Current Time at Place', value: 'getCurrentTimeAtPlace', description: 'Get current local time, sunrise and sunset for a place', action: 'Get current time at place' },
					{ name: 'Get Later Time at Coords', value: 'getLaterTimeAtCoords', description: 'Get local time N hours from now for coordinates', action: 'Get later time at coords' },
					{ name: 'Get Later Time at Place', value: 'getLaterTimeAtPlace', description: 'Get local time N hours from now for a place', action: 'Get later time at place' },
					{ name: 'Get METARs (ICAO List)', value: 'getMetars', description: 'Get current METAR reports for airports by ICAO code', action: 'Get meta rs icao list' },
					{ name: 'Get TAFs (ICAO List)', value: 'getTafs', description: 'Get TAF forecasts for airports by ICAO code', action: 'Get ta fs icao list' },
					{ name: 'Google Nearest Places Search', value: 'nearestPlacesSearch', description: 'Find nearest objects within a radius of given coordinates', action: 'Google nearest places search' },
					{ name: 'Google Place Details', value: 'getGooglePlaceDetails', description: 'Get details for a place by place_id', action: 'Google place details' },
					{ name: 'Help', value: 'navigationHelp', description: 'Get help on the teckel Navigation toolbox', action: 'Help' },
					{ name: 'METARs for Coords Within Range', value: 'getMetarsForCoordsRange', description: 'Get METAR reports from all stations within range of coordinates', action: 'Meta rs for coords within range' },
					{ name: 'METARs for Place Within Range', value: 'getMetarsForPlaceRange', description: 'Get METAR reports from all stations within range of a place', action: 'Meta rs for place within range' },
					{ name: 'Nav Bearing From Coords', value: 'navBearingFromCoords', description: 'Get endpoint coordinates at bearing and range from start coordinates', action: 'Nav bearing from coords' },
					{ name: 'Nav Bearing From Place', value: 'navBearingFromPlace', description: 'Get endpoint coordinates at bearing and range from a place', action: 'Nav bearing from place' },
					{ name: 'Nav Bounding Box', value: 'getNavBoundingBox', description: 'Get corner coordinates of a bounding box centred on a location', action: 'Nav bounding box' },
					{ name: 'Navaids Within Range (Coords)', value: 'getNavaidsForCoordsRange', description: 'Get aviation navaids within range of coordinates (US only)', action: 'Navaids within range coords' },
					{ name: 'Nearest METAR for Coords', value: 'getNearestMetarForCoords', description: 'Get the nearest METAR for coordinates', action: 'Nearest METAR for coords' },
					{ name: 'Nearest METAR for Place', value: 'getNearestMetarForPlace', description: 'Get the nearest METAR for a place', action: 'Nearest METAR for place' },
					{ name: 'Obstacles Within Range (Coords)', value: 'getObstaclesForCoordsRange', description: 'Get aviation obstacles within range of coordinates (US only)', action: 'Obstacles within range coords' },
					{ name: 'Sun Calculations', value: 'sunCalculations', description: 'Get sun position, elevation and light conditions for a location and time', action: 'Sun calculations' },
				],
			},

			// ── ICAO CSV ──────────────────────────────────────────────────────
			{
				displayName: 'Airport ICAO Codes',
				name: 'airports_icao_csv',
				type: 'string',
				default: '',
				required: true,
				description: 'Comma-separated ICAO codes with no spaces, e.g. EGPF,KLAX',
				displayOptions: { show: { operation: ICAO_OPS } },
			},

			// ── Single place ─────────────────────────────────────────────────
			{
				displayName: 'Place',
				name: 'search_address',
				type: 'string',
				default: '',
				required: true,
				description: 'Any place name, address, postcode etc',
				displayOptions: { show: { operation: PLACE_OPS } },
			},

			// ── Coordinates ──────────────────────────────────────────────────
			{
				displayName: 'Latitude',
				name: 'latitude',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive North',
				displayOptions: { show: { operation: COORDS_OPS } },
			},
			{
				displayName: 'Longitude',
				name: 'longitude',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive East',
				displayOptions: { show: { operation: COORDS_OPS } },
			},

			// ── Range (Nm) ───────────────────────────────────────────────────
			{
				displayName: 'Range (Nautical Miles)',
				name: 'rangeNm',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: RANGE_NM_OPS } },
			},

			// ── Hours later ──────────────────────────────────────────────────
			{
				displayName: 'Hours From Now',
				name: 'hours_later',
				type: 'string',
				default: '',
				required: true,
				description: 'Number of hours ahead for the time calculation',
				displayOptions: { show: { operation: HOURS_LATER_OPS } },
			},

			// ── Google Nearest Places ────────────────────────────────────────
			{
				displayName: 'Objects to Search For',
				name: 'objects_to_search_for',
				type: 'string',
				default: '',
				required: true,
				description: 'Comma-separated objects, e.g. hotels, restaurants',
				displayOptions: { show: { operation: ['nearestPlacesSearch'] } },
			},
			{
				displayName: 'Centre Latitude',
				name: 'centre_latitude',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive North',
				displayOptions: { show: { operation: ['nearestPlacesSearch'] } },
			},
			{
				displayName: 'Centre Longitude',
				name: 'centre_longitude',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive East',
				displayOptions: { show: { operation: ['nearestPlacesSearch'] } },
			},
			{
				displayName: 'Search Radius (Metres)',
				name: 'radial_range_metres',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['nearestPlacesSearch'] } },
			},
			{
				displayName: 'Max Results',
				name: 'max_result_count',
				type: 'string',
				default: '10',
				required: true,
				displayOptions: { show: { operation: ['nearestPlacesSearch'] } },
			},

			// ── Google Place Details ─────────────────────────────────────────
			{
				displayName: 'Place ID',
				name: 'place_id',
				type: 'string',
				default: '',
				required: true,
				description: 'Place_id returned from Google Nearest Places Search',
				displayOptions: { show: { operation: PLACE_ID_OPS } },
			},

			// ── Airport search filters (shared across 3 ops) ─────────────────
			{
				displayName: 'Search String',
				name: 'search_string',
				type: 'string',
				default: '',
				required: true,
				description: 'Airport name, ICAO code, IATA code or alternate identifier',
				displayOptions: { show: { operation: ['airportSearch', 'airportSearchPlace'] } },
			},
			{
				displayName: 'Distance (Nm)',
				name: 'distanceNm',
				type: 'string',
				default: '',
				required: true,
				description: 'Search limit range in nautical miles',
				displayOptions: { show: { operation: ['airportSearchCoords', 'airportSearchPlace'] } },
			},
			{
				displayName: 'Airport Latitude',
				name: 'airport_latitude',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive North',
				displayOptions: { show: { operation: ['airportSearchCoords'] } },
			},
			{
				displayName: 'Airport Longitude',
				name: 'airport_longitude',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive East',
				displayOptions: { show: { operation: ['airportSearchCoords'] } },
			},
			{
				displayName: 'Airport Type',
				name: 'airport_type',
				type: 'string',
				default: '',
				description: AIRPORT_TYPE_DESC,
				displayOptions: { show: { operation: AIRPORT_FILTER_OPS } },
			},
			{
				displayName: 'Traffic Type',
				name: 'traffic_type',
				type: 'string',
				default: '',
				description: 'Leave blank, or 0 for VFR, 1 for IFR',
				displayOptions: { show: { operation: AIRPORT_FILTER_OPS } },
			},
			{
				displayName: 'PPR Required',
				name: 'ppr_flag',
				type: 'string',
				default: '',
				description: 'Leave blank or 0, or 1 for PPR required only',
				displayOptions: { show: { operation: AIRPORT_FILTER_OPS } },
			},
			{
				displayName: 'Private Only',
				name: 'private_flag',
				type: 'string',
				default: '',
				description: 'Leave blank or 0, or 1 for private airfields only',
				displayOptions: { show: { operation: AIRPORT_FILTER_OPS } },
			},
			{
				displayName: 'Fuel Type',
				name: 'fuel_type',
				type: 'string',
				default: '',
				description: FUEL_TYPE_DESC,
				displayOptions: { show: { operation: AIRPORT_FILTER_OPS } },
			},
			{
				displayName: 'Handling Type',
				name: 'handling_type',
				type: 'string',
				default: '',
				description: HANDLING_TYPE_DESC,
				displayOptions: { show: { operation: AIRPORT_FILTER_OPS } },
			},
			{
				displayName: 'Services Type',
				name: 'services_type',
				type: 'string',
				default: '',
				description: SERVICE_TYPE_DESC,
				displayOptions: { show: { operation: AIRPORT_FILTER_OPS } },
			},

			// ── Nav Bounding Box ─────────────────────────────────────────────
			{
				displayName: 'Box Width (Nm)',
				name: 'boxWidthNm',
				type: 'string',
				default: '',
				required: true,
				description: 'East-West extent in nautical miles',
				displayOptions: { show: { operation: ['getNavBoundingBox'] } },
			},
			{
				displayName: 'Box Height (Nm)',
				name: 'boxHeightNm',
				type: 'string',
				default: '',
				required: true,
				description: 'North-South extent in nautical miles',
				displayOptions: { show: { operation: ['getNavBoundingBox'] } },
			},

			// ── Sun Calculations ─────────────────────────────────────────────
			{
				displayName: 'Altitude (Metres)',
				name: 'altitudeMetres',
				type: 'string',
				default: '0',
				required: true,
				description: 'Observer altitude above MSL in metres',
				displayOptions: { show: { operation: ['sunCalculations'] } },
			},
			{
				displayName: 'Date/Time UTC',
				name: 'dateTimeUTCstr',
				type: 'string',
				default: '',
				required: true,
				description: 'Date and time UTC, e.g. 25-Oct-2025 14:18:39',
				displayOptions: { show: { operation: ['sunCalculations'] } },
			},

			// ── Nav Bearing ──────────────────────────────────────────────────
			{
				displayName: 'Start Latitude',
				name: 'startLat',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive North',
				displayOptions: { show: { operation: ['navBearingFromCoords'] } },
			},
			{
				displayName: 'Start Longitude',
				name: 'startLon',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive East',
				displayOptions: { show: { operation: ['navBearingFromCoords'] } },
			},
			{
				displayName: 'Bearing (Degrees)',
				name: 'bearingDeg',
				type: 'string',
				default: '',
				required: true,
				description: 'Degrees clockwise from North',
				displayOptions: { show: { operation: BEARING_OPS } },
			},
			{
				displayName: 'Range (Nm)',
				name: 'rangeNmBearing',
				type: 'string',
				default: '',
				required: true,
				description: 'Range in nautical miles',
				displayOptions: { show: { operation: BEARING_OPS } },
			},
			{
				displayName: 'Magnetic Bearing',
				name: 'doMagnetic',
				type: 'boolean',
				default: false,
				description: 'Whether to use magnetic bearing (accounts for magnetic variation)',
				displayOptions: { show: { operation: MAG_GC_OPS } },
			},
			{
				displayName: 'Great Circle',
				name: 'doGreatCircle',
				type: 'boolean',
				default: true,
				description: 'Whether to compute great-circle arclength (true) or rhumbline (false)',
				displayOptions: { show: { operation: MAG_GC_OPS } },
			},

			// ── Two-coordinate ops ───────────────────────────────────────────
			{
				displayName: 'Start Latitude',
				name: 'lat1',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive North',
				displayOptions: { show: { operation: COORDS2_OPS } },
			},
			{
				displayName: 'Start Longitude',
				name: 'lon1',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive East',
				displayOptions: { show: { operation: COORDS2_OPS } },
			},
			{
				displayName: 'End Latitude',
				name: 'lat2',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive North',
				displayOptions: { show: { operation: COORDS2_OPS } },
			},
			{
				displayName: 'End Longitude',
				name: 'lon2',
				type: 'string',
				default: '',
				required: true,
				description: 'Decimal degrees, positive East',
				displayOptions: { show: { operation: COORDS2_OPS } },
			},

			// ── Two-place ops ─────────────────────────────────────────────────
			{
				displayName: 'Start Place',
				name: 'search_address1',
				type: 'string',
				default: '',
				required: true,
				description: 'Start location — any airport, ICAO code, address or postcode',
				displayOptions: { show: { operation: PLACES2_OPS } },
			},
			{
				displayName: 'End Place',
				name: 'search_address2',
				type: 'string',
				default: '',
				required: true,
				description: 'End location — any airport, ICAO code, address or postcode',
				displayOptions: { show: { operation: PLACES2_OPS } },
			},

			// ── Flight Route Calculations ─────────────────────────────────────
			{
				displayName: 'Origin',
				name: 'origin',
				type: 'string',
				default: '',
				required: true,
				description: 'Departure airfield — name, ICAO, IATA, alternate ID, or lat,lon pair',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'string',
				default: '',
				required: true,
				description: 'Destination airfield — name, ICAO, IATA, alternate ID, or lat,lon pair',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Altitude (Feet)',
				name: 'altitudeFeetAverage',
				type: 'string',
				default: '2500',
				description: 'Average cruise altitude AMSL in feet',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'IAS (Knots)',
				name: 'iasKtsAverage',
				type: 'string',
				default: '100',
				description: 'Average indicated airspeed in knots',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Fuel Flow (per Hour)',
				name: 'fuelFlowPerHourAverage',
				type: 'string',
				default: '8',
				description: 'Average fuel consumption per hour (any units — output matches)',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Depart in (Minutes)',
				name: 'departMinutesFromNow',
				type: 'string',
				default: '60',
				description: 'Planned departure in minutes from now',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 1',
				name: 'intermediateWayPoint1',
				type: 'string',
				default: '',
				description: 'Optional intermediate waypoint — name, ICAO, address or lat,lon pair',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 2',
				name: 'intermediateWayPoint2',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 3',
				name: 'intermediateWayPoint3',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 4',
				name: 'intermediateWayPoint4',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 5',
				name: 'intermediateWayPoint5',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 6',
				name: 'intermediateWayPoint6',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 7',
				name: 'intermediateWayPoint7',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 8',
				name: 'intermediateWayPoint8',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 9',
				name: 'intermediateWayPoint9',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
			{
				displayName: 'Waypoint 10',
				name: 'intermediateWayPoint10',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['flightRouteCalculations'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('teckelNavigationApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const path = OP_PATHS[operation];
				const qs: IDataObject = {};

				if (ICAO_OPS.includes(operation)) {
					qs.airports_icao_csv = this.getNodeParameter('airports_icao_csv', i) as string;
				}
				if (PLACE_OPS.includes(operation)) {
					qs.search_address = this.getNodeParameter('search_address', i) as string;
				}
				if (COORDS_OPS.includes(operation)) {
					qs.latitude  = this.getNodeParameter('latitude', i) as string;
					qs.longitude = this.getNodeParameter('longitude', i) as string;
				}
				if (RANGE_NM_OPS.includes(operation)) {
					qs.rangeNm = this.getNodeParameter('rangeNm', i) as string;
				}
				if (HOURS_LATER_OPS.includes(operation)) {
					qs.hours_later = this.getNodeParameter('hours_later', i) as string;
				}
				if (PLACE_ID_OPS.includes(operation)) {
					qs.place_id = this.getNodeParameter('place_id', i) as string;
				}
				if (BEARING_OPS.includes(operation)) {
					qs.bearingDeg = this.getNodeParameter('bearingDeg', i) as string;
					qs.rangeNm    = this.getNodeParameter('rangeNmBearing', i) as string;
				}
				if (MAG_GC_OPS.includes(operation)) {
					qs.doMagnetic   = (this.getNodeParameter('doMagnetic', i, false) as boolean) ? 'True' : 'False';
					qs.doGreatCircle = (this.getNodeParameter('doGreatCircle', i, true) as boolean) ? 'True' : 'False';
				}
				if (COORDS2_OPS.includes(operation)) {
					qs.lat1 = this.getNodeParameter('lat1', i) as string;
					qs.lon1 = this.getNodeParameter('lon1', i) as string;
					qs.lat2 = this.getNodeParameter('lat2', i) as string;
					qs.lon2 = this.getNodeParameter('lon2', i) as string;
				}
				if (PLACES2_OPS.includes(operation)) {
					qs.search_address1 = this.getNodeParameter('search_address1', i) as string;
					qs.search_address2 = this.getNodeParameter('search_address2', i) as string;
				}
				if (AIRPORT_FILTER_OPS.includes(operation)) {
					qs.airport_type   = this.getNodeParameter('airport_type', i, '') as string;
					qs.traffic_type   = this.getNodeParameter('traffic_type', i, '') as string;
					qs.ppr_flag       = this.getNodeParameter('ppr_flag', i, '') as string;
					qs.private_flag   = this.getNodeParameter('private_flag', i, '') as string;
					qs.fuel_type      = this.getNodeParameter('fuel_type', i, '') as string;
					qs.handling_type  = this.getNodeParameter('handling_type', i, '') as string;
					qs.services_type  = this.getNodeParameter('services_type', i, '') as string;
				}

				if (operation === 'nearestPlacesSearch') {
					qs.objects_to_search_for = this.getNodeParameter('objects_to_search_for', i) as string;
					qs.centre_latitude       = this.getNodeParameter('centre_latitude', i) as string;
					qs.centre_longitude      = this.getNodeParameter('centre_longitude', i) as string;
					qs.radial_range_metres   = this.getNodeParameter('radial_range_metres', i) as string;
					qs.max_result_count      = this.getNodeParameter('max_result_count', i) as string;
				}
				if (operation === 'airportSearch' || operation === 'airportSearchPlace') {
					qs.search_string = this.getNodeParameter('search_string', i) as string;
				}
				if (operation === 'airportSearchCoords') {
					qs.latitude  = this.getNodeParameter('airport_latitude', i) as string;
					qs.longitude = this.getNodeParameter('airport_longitude', i) as string;
					qs.distanceNm = this.getNodeParameter('distanceNm', i) as string;
				}
				if (operation === 'airportSearchPlace') {
					qs.distanceNm = this.getNodeParameter('distanceNm', i) as string;
				}
				if (operation === 'getNavBoundingBox') {
					qs.centreLat  = this.getNodeParameter('latitude', i) as string;
					qs.centreLon  = this.getNodeParameter('longitude', i) as string;
					qs.boxWidthNm  = this.getNodeParameter('boxWidthNm', i) as string;
					qs.boxHeightNm = this.getNodeParameter('boxHeightNm', i) as string;
				}
				if (operation === 'sunCalculations') {
					qs.altitudeMetres  = this.getNodeParameter('altitudeMetres', i) as string;
					qs.dateTimeUTCstr  = this.getNodeParameter('dateTimeUTCstr', i) as string;
				}
				if (operation === 'navBearingFromCoords') {
					qs.startLat = this.getNodeParameter('startLat', i) as string;
					qs.startLon = this.getNodeParameter('startLon', i) as string;
				}
				if (operation === 'flightRouteCalculations') {
					qs.origin                 = this.getNodeParameter('origin', i) as string;
					qs.destination            = this.getNodeParameter('destination', i) as string;
					qs.altitudeFeetAverage    = this.getNodeParameter('altitudeFeetAverage', i, '2500') as string;
					qs.iasKtsAverage          = this.getNodeParameter('iasKtsAverage', i, '100') as string;
					qs.fuelFlowPerHourAverage = this.getNodeParameter('fuelFlowPerHourAverage', i, '8') as string;
					qs.departMinutesFromNow   = this.getNodeParameter('departMinutesFromNow', i, '60') as string;
					const wp = (n: string) => { const v = this.getNodeParameter(n, i, '') as string; if (v) qs[n] = v; };
					wp('intermediateWayPoint1'); wp('intermediateWayPoint2'); wp('intermediateWayPoint3');
					wp('intermediateWayPoint4'); wp('intermediateWayPoint5'); wp('intermediateWayPoint6');
					wp('intermediateWayPoint7'); wp('intermediateWayPoint8'); wp('intermediateWayPoint9');
					wp('intermediateWayPoint10');
				}

				const responseData = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'teckelNavigationApi',
					{
						method: 'POST',
						url: `${baseUrl}/${path}`,
						qs,
					},
				)) as IDataObject;

				returnData.push({ json: responseData, pairedItem: i });

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
					continue;
				}
				// HTTP errors from httpRequestWithAuthentication carry httpCode / response — surface those
				// via NodeApiError so the n8n UI shows status, body and headers. Everything else is an
				// operational error.
				const err = error as { httpCode?: unknown; response?: unknown };
				if (err.httpCode !== undefined || err.response !== undefined) {
					throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
