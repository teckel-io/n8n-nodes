# n8n-nodes-teckel-navigation

An [n8n](https://n8n.io) community node for the [teckel](https://teckel.io) Navigation toolbox. Aviation weather, flight routing, geocoding, airport search and time/sun calculations.

## Installation

In your self-hosted n8n instance:

1. **Settings** → **Community Nodes** → **Install**
2. Enter `n8n-nodes-teckel-navigation`
3. Confirm and install

## Credentials

A **teckel Navigation API** credential is required:

| Field | Description |
|-------|-------------|
| API Key | Your teckel API key |
| Base URL | teckel API gateway URL (default: `https://mcp-servers.bh.tkllabs.io:9780`) |

### How to obtain your teckel API Key

#### First, download and install the teckel App.

[<img width="120" height="40" alt="Download on the App Store" src="https://github.com/user-attachments/assets/ecbe6c7a-02c9-4212-b2ab-58dd90c91bca" />](https://apps.apple.com/gb/app/teckel/id6746805799)
[<img width="135" height="45" alt="Get it on Google Play" src="https://github.com/user-attachments/assets/9f9b8443-d759-41c1-9fce-399dc690b439" />](https://play.google.com/store/apps/details?id=io.teckel.app)

#### Next, generate an API key using the teckel App.

1. Navigate to the Accounts page by tapping on the wallet icon in the upper right corner of the App home screen. Access the API Key Manager for the created or imported Ethereum Account by tapping **Manage API Key** on the Accounts page.
2. Enter the API key in the n8n credentials edit box.

## Operations (31)

### Weather (METAR / TAF)

| Operation | Description |
|-----------|-------------|
| Get METARs (ICAO list) | Current METAR reports for airports by ICAO code |
| Get TAFs (ICAO list) | TAF forecasts for airports by ICAO code |
| Nearest METAR for Coords | Nearest METAR for coordinates |
| Nearest METAR for Place | Nearest METAR for a place name |
| METARs for Coords within Range | METARs from all stations within range of coordinates |
| METARs for Place within Range | METARs from all stations within range of a place |

### Airports & navigation features

| Operation | Description |
|-----------|-------------|
| Airport Search by Name/Code | Search by name, ICAO, IATA or alternate ID |
| Airport Search by Coordinates | Airports within range of coordinates |
| Airport Search from Place | Airports within range of a place |
| Airports within Range (Coords) | Get airports within range of coordinates |
| Navaids within Range (Coords) | Aviation navaids within range (US only) |
| Fixes within Range (Coords) | Aviation fixes/waypoints within range (US only) |
| Features within Range (Coords) | Aviation features within range (US only) |
| Obstacles within Range (Coords) | Aviation obstacles within range (US only) |

### Routing & distance

| Operation | Description |
|-----------|-------------|
| Flight Route Calculations | Full VFR route calculation with weather, wind correction and navlog |
| Flight Distance between Coords | Great-circle / rhumbline distance and track between coordinates |
| Flight Distance between Places | Great-circle / rhumbline distance between places |
| Driving Distance between Coords | Driving distance and time between coordinates |
| Driving Distance between Places | Driving distance and time between places |
| Nav Bearing from Coords | Endpoint coordinates at bearing and range from start coordinates |
| Nav Bearing from Place | Endpoint coordinates at bearing and range from a place |
| Nav Bounding Box | Corner coordinates of a bounding box centred on a location |

### Geocoding & places

| Operation | Description |
|-----------|-------------|
| Geocode Search | Geographical coordinates for any location |
| Google Place Details | Details for a place by `place_id` |
| Google Nearest Places Search | Nearest objects within a radius of given coordinates |

### Time & sun

| Operation | Description |
|-----------|-------------|
| Get Current Time at Coords | Current local time, sunrise and sunset at coordinates |
| Get Current Time at Place | Current local time, sunrise and sunset at a place |
| Get Later Time at Coords | Local time N hours from now at coordinates |
| Get Later Time at Place | Local time N hours from now at a place |
| Sun Calculations | Sun position, elevation and light conditions for a location and time |

### Help

| Operation | Description |
|-----------|-------------|
| Help | Get help on the teckel Navigation toolbox |

## Resources

- [teckel platform](https://teckel.io)
- [GitHub repo](https://github.com/teckel-io/n8n-nodes)
- [Issues](https://github.com/teckel-io/n8n-nodes/issues)

## License

[MIT](https://github.com/teckel-io/n8n-nodes/blob/main/LICENSE)
