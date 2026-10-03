# Home Hub

A Home Assistant dashboard card for a wall-mounted portrait tablet: one custom element with two pages.

- **Hub**: weather, calendar, climate, car, power, house and security, media, and system health, on a frosted-glass layout.
- **Today**: a big clock and a large-type calendar that reads from across the room.

**Try it:** open `index.html` (or the GitHub Pages link once published). The demo runs entirely in your browser against a made-up house. Nothing is connected to Home Assistant, and every name, place, event and photo is invented.

## Things it does

- Scales to whatever screen it is given (designed on a 1080 x 1920 canvas) and tightens up when the visible height is short.
- Eleven themes: Default, four seasons, and seven holidays. `Auto` picks one by date: holidays run from two days before to two days after, seasons apply on Saturday and Sunday, weekdays stay on Default. Any theme can also be forced from an `input_select` helper.
- A Hub/Today switch that fades in on touch and fades out again, and returns to a default page after a period of no touches.
- A tap-to-open Systems panel that lists warnings (serious ones red, notices amber), every battery by name, backup status, security panel health and irrigation.
- A "…" button that shows or hides Home Assistant's own top bar through a helper, if you use the kiosk-mode plugin.

## Install

1. Copy `home-hub-card.js` into your Home Assistant `config/www/` folder.
2. In Settings → Dashboards → ⋮ → Resources, add `/local/home-hub-card.js` as a **JavaScript module**.
3. Create a dashboard with a panel view:

```yaml
views:
  - title: Home Hub
    path: hub
    panel: true
    cards:
      - type: custom:home-hub-card
        default_page: today
        idle_return_seconds: 120
        people_style: photos        # or: initials
        calendar_scale: 0.85        # Today calendar text size, 0.5 to 1.2
        number_weight: 500          # clock and temperature digits, 400 to 700
        vibrance: 1                 # 0.3 to 1, lowers colour saturation
        nav_autohide_seconds: 7     # 0 keeps the Hub/Today switch always visible
        header_autohide_seconds: 90
        entities:
          weather: weather.my_home
          # ...see below
```

## Your entities

The defaults in `home-hub-card.js` are placeholders (the same ones the demo uses). Override any of them under `entities:`. Anything you leave out falls back to the placeholder, so list everything you use.

| Key | What it is |
|---|---|
| `theme_entity` | `input_select` with `Auto` plus the theme names |
| `weather`, `sun_rising`, `sun_setting` | weather entity and the two sun sensors |
| `people` | list of `{ entity, status, name }` |
| `calendars` | list of `{ entity, color }` |
| `car` | battery, range, charging state, cable, lock, and a script for the seat heater |
| `power` | list of `{ entity, name }` switches. Add `confirm: off` to ask "Are you sure?" before switching one off, or `confirm: always` to ask both ways. Optional `confirm_message` sets the explanation. |
| `sprinkler` | controller entities and zone switches |
| `alarm`, `doors`, `windows`, `leaks` | alarm panel and contact or leak sensors |
| `media`, `media_app` | a media player and its active-app sensor |
| `battery_sensors`, `battery_names` | battery sensors that report a percentage |
| `station`, `thermostat` | optional indoor and outdoor sensors and a climate entity |

Battery low/OK flags are found automatically from any `binary_sensor.*_battery` entity.

## Notes

- The theme helper's options must match the theme names exactly: `Auto`, `Default`, `Winter`, `Spring`, `Summer`, `Fall`, `Halloween`, `Thanksgiving`, `Christmas`, `New Year`, `Memorial Day`, `July 4th/Labor Day`.
- Fonts (DM Sans and Fraunces) load from Google Fonts.
- Forecasts use Home Assistant's `weather.get_forecasts` action with `hourly` and `daily`. Integrations that only offer `twice_daily` will show a High/Low computed from the hourly data.
- Not affiliated with or endorsed by Home Assistant or any device maker.
