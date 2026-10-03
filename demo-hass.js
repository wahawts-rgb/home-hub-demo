/*
 * Fake Home Assistant for the Home Hub demo.
 * Builds a believable, completely made-up household and answers the same calls the card makes
 * (callService, callWS for forecasts, callApi for calendars). No network, no real data.
 */
(function (root) {
  'use strict';

  /* Optional clock shift so the demo can pretend it is another day (used for the seasonal themes). */
  const RealDate = Date;
  let offsetMs = 0;
  function installClock() {
    class DemoDate extends RealDate {
      constructor(...a) { if (a.length === 0) super(RealDate.now() + offsetMs); else super(...a); }
      static now() { return RealDate.now() + offsetMs; }
    }
    root.Date = DemoDate;
    globalThis.Date = DemoDate;
  }
  function setPretendDate(yyyyMmDd) {
    if (!yyyyMmDd) { offsetMs = 0; return; }
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    const real = new RealDate();
    const target = new RealDate(y, m - 1, d, real.getHours(), real.getMinutes(), real.getSeconds());
    offsetMs = target.getTime() - real.getTime();
  }

  const avatar = (bg, fg) => 'data:image/svg+xml,' + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='" + bg + "'/>" +
    "<circle cx='50' cy='38' r='18' fill='" + fg + "'/><path d='M14 100c0-22 16-36 36-36s36 14 36 36z' fill='" + fg + "'/></svg>");

  function createDemo(onChange) {
    const states = {};
    const timers = [];
    const set = (id, state, attrs) => {
      states[id] = { entity_id: id, state: String(state), attributes: attrs || {}, last_changed: new Date().toISOString() };
    };
    const at = (dayOffset, h, m) => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate() + dayOffset, h, m || 0, 0); };

    function build() {
      Object.keys(states).forEach((k) => delete states[k]);
      const n = new Date();

      // people (illustrated avatars, invented names and places)
      [['alex', 'Alex', 'home', 'Home', '#cfe3ee', '#5f7f96'],
        ['sam', 'Sam', 'not_home', 'Riverside Community Library', '#e6d5ee', '#8a6a9e'],
        ['jordan', 'Jordan', 'home', 'Home', '#d5eadb', '#5f8f72'],
        ['casey', 'Casey', 'not_home', 'Work', '#f1e1c9', '#a8834e']].forEach((p) => {
        set('person.' + p[0], p[2], { friendly_name: p[1], entity_picture: avatar(p[4], p[5]) });
        set('sensor.' + p[0] + '_location', p[3], { friendly_name: p[1] + ' Location' });
      });

      // weather + sun
      set('weather.home', 'sunny', { friendly_name: 'Home', temperature: 71, humidity: 48 });
      const sunset = at(0, 19, 5); const sunrise = at(0, 7, 20);
      const nextSet = n < sunset ? sunset : at(1, 19, 4);
      const nextRise = n < sunrise ? sunrise : at(1, 7, 21);
      set('sensor.sun_next_setting', nextSet.toISOString());
      set('sensor.sun_next_rising', nextRise.toISOString());

      // helpers
      set('input_select.dashboard_theme', 'Auto', { options: ['Auto'] });
      set('input_boolean.kiosk_header', 'off');

      // car
      set('sensor.roadster_battery_level', 68); set('sensor.roadster_battery_range', 214);
      set('sensor.roadster_charging', 'complete'); set('binary_sensor.roadster_charge_cable', 'on');
      set('lock.roadster_lock', 'locked'); set('script.warm_seat', 'off');

      // power
      set('switch.desk_lamp', 'off'); set('switch.office_fan', 'off'); set('switch.pc', 'on');
      set('switch.porch_lights', 'on'); set('switch.spare_socket', 'unavailable');

      // sprinklers
      set('binary_sensor.sprinklers_connectivity', 'on'); set('binary_sensor.sprinklers_rain', 'off');
      set('switch.sprinklers_standby', 'off'); set('switch.sprinklers_rain_delay', 'off');
      ['Front lawn', 'Back lawn', 'Garden beds', 'Side yard'].forEach((z, i) => {
        set('switch.sprinklers_zone_' + (i + 1), 'off', { friendly_name: 'Backyard Sprinklers ' + z });
      });

      // security: contacts, leak sensors and their batteries
      set('alarm_control_panel.home_alarm', 'disarmed', { wall_power_level: 900, battery_backup_power_level: 5000, wifi_strength: -52, rf_jamming: false });
      [['front_door', 'Front door'], ['back_door', 'Back door'], ['garage_door', 'Garage door'], ['shed_door', 'Shed door']].forEach((d) => {
        set('binary_sensor.' + d[0] + '_contact', 'off', { friendly_name: d[1] + ' Entry Door' });
        set('binary_sensor.' + d[0] + '_battery', 'off', { friendly_name: d[1] + ' Entry Battery' });
      });
      ['North', 'South', 'East', 'West'].forEach((w) => {
        const k = w.toLowerCase();
        set('binary_sensor.window_' + k + '_contact', 'off', { friendly_name: w + ' window Entry Door' });
        set('binary_sensor.window_' + k + '_battery', 'off', { friendly_name: w + ' window Entry Battery' });
      });
      [['water_heater_leak', 'Water heater'], ['basement_leak', 'Basement'], ['laundry_leak', 'Laundry'], ['kitchen_leak', 'Kitchen']].forEach((l) => {
        set('binary_sensor.' + l[0], 'off', { friendly_name: l[1] + ' Leak Moisture' });
        set('binary_sensor.' + l[0].replace('_leak', '') + '_leak_battery', 'off', { friendly_name: l[1] + ' Leak Battery' });
      });
      set('binary_sensor.main_keypad_battery', 'off', { friendly_name: 'Main Keypad Battery' });
      set('binary_sensor.keychain_remote_battery', 'off', { friendly_name: 'Keychain Remote Battery' });
      set('sensor.motion_outside_battery', 97, { friendly_name: 'Outside Battery' });
      set('sensor.motion_inside_battery', 79, { friendly_name: 'Inside Battery' });

      // media
      set('media_player.living_room_tv', 'playing', { friendly_name: 'Living room TV', source: 'Streaming', media_title: 'Nature Documentary' });
      set('sensor.living_room_tv_active_app', 'Streaming');

      // system
      set('sensor.backup_last_successful_automatic_backup', at(0, 5, 14).toISOString());
      set('sensor.backup_next_scheduled_automatic_backup', at(1, 5, 14).toISOString());
      set('sensor.backup_backup_manager_state', 'idle');
      set('binary_sensor.system_problem_detected', 'off');
    }
    build();

    const hass = {
      states,
      entities: {},
      callService(domain, service, data) {
        const id = data && data.entity_id;
        const s = id && states[id];
        if (s) {
          if (service === 'toggle') s.state = s.state === 'on' ? 'off' : 'on';
          else if (service === 'turn_off') s.state = 'off';
          else if (service === 'turn_on') {
            s.state = 'on';
            if (domain === 'script') timers.push(setTimeout(() => { s.state = 'off'; onChange && onChange(); }, 3500));
          } else if (service === 'alarm_arm_away') s.state = 'armed_away';
          else if (service === 'alarm_arm_night') s.state = 'armed_night';
          else if (service === 'alarm_disarm') s.state = 'disarmed';
          else if (service === 'media_play_pause') s.state = s.state === 'playing' ? 'paused' : 'playing';
          else if (service === 'select_option') s.state = data.option;
        }
        onChange && onChange();
        return Promise.resolve();
      },
      callWS(msg) {
        if (msg && msg.type === 'call_service' && msg.domain === 'weather') {
          const id = msg.target.entity_id;
          const type = msg.service_data.type;
          const now = new Date();
          const out = [];
          if (type === 'hourly') {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
            for (let i = 0; i < 48; i++) {
              const t = new Date(start.getTime() + i * 3600e3);
              const h = t.getHours();
              out.push({
                datetime: t.toISOString(),
                condition: h < 6 || h >= 20 ? 'clear-night' : (i % 7 === 3 ? 'partlycloudy' : 'sunny'),
                temperature: Math.round(64 + 12 * Math.sin((h - 9) * Math.PI / 12)),
              });
            }
          } else {
            for (let i = 0; i < 7; i++) {
              out.push({ datetime: at(i, 12, 0).toISOString(), condition: 'sunny', temperature: 74 + (i % 3), templow: 50 + (i % 2) });
            }
          }
          return Promise.resolve({ response: { [id]: { forecast: out } } });
        }
        return Promise.resolve({});
      },
      callApi(method, path) {
        const m = /^calendars\/([^?]+)/.exec(path);
        const entity = m && m[1];
        const timed = (title, day, h1, m1, h2, m2, loc) => ({ summary: title, location: loc || '', start: { dateTime: at(day, h1, m1).toISOString() }, end: { dateTime: at(day, h2, m2).toISOString() } });
        const allDay = (title, day, loc) => {
          const f = (d) => { const x = at(d, 0, 0); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
          return { summary: title, location: loc || '', start: { date: f(day) }, end: { date: f(day + 1) } };
        };
        const data = {
          'calendar.family': [timed('Family dinner', 0, 18, 30, 20, 0), timed('Soccer practice', 1, 16, 30, 17, 30, 'Riverside Field'), timed('Movie night', 3, 19, 0, 21, 30)],
          'calendar.work': [allDay('Recycling pickup', 0), timed('Parent-teacher call', 1, 8, 15, 8, 45), timed('Book club', 4, 18, 30, 20, 0, 'City Library'), timed('Farmers market run', 5, 9, 0, 11, 0)],
          'calendar.hobbies': [timed('Garden club', 2, 10, 0, 11, 30, 'Community Center'), timed('Car service', 4, 9, 0, 10, 0, 'Main Street Garage')],
          'calendar.birthdays': [allDay("Sam's birthday", 3)],
          'calendar.shared': [timed('Lorem ipsum dolor sit amet', 2, 13, 0, 14, 0)],
        };
        return Promise.resolve(data[entity] || []);
      },
    };

    const scenarios = {
      door: () => { states['binary_sensor.front_door_contact'].state = 'on'; },
      lowBattery: () => { states['binary_sensor.main_keypad_battery'].state = 'on'; },
      offline: () => { states['binary_sensor.basement_leak'].state = 'unavailable'; states['binary_sensor.basement_leak_battery'].state = 'unavailable'; },
      rainDelay: () => { states['switch.sprinklers_rain_delay'].state = 'on'; },
      unplugged: () => { states['binary_sensor.roadster_charge_cable'].state = 'off'; states['sensor.roadster_charging'].state = 'disconnected'; },
      leak: () => { states['binary_sensor.laundry_leak'].state = 'on'; },
      reset: () => {
        const theme = states['input_select.dashboard_theme'].state;
        build();
        states['input_select.dashboard_theme'].state = theme;
      },
    };

    return { hass, scenarios, rebuild: build, setTheme: (t) => { states['input_select.dashboard_theme'].state = t; } };
  }

  root.HomeHubDemo = { createDemo, installClock, setPretendDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.HomeHubDemo;
})(typeof window !== 'undefined' ? window : globalThis);
