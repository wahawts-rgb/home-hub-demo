/*
 * Home Hub card for Home Assistant  -  v1.13.2
 * One custom card, two pages: Hub (data) and Today (big clock + calendar).
 * Designed on a 1080 x 1920 canvas and scaled to whatever width it is given.
 *
 * Dashboard config (panel view):
 *   type: custom:home-hub-card
 *   default_page: today          # today | hub
 *   idle_return_seconds: 120     # return to default page after no touches
 *   people_style: photos         # photos | initials
 *   vibrance: 1                  # 0.3 - 1, lowers colour saturation of themes
 *   layout: tablet               # tablet | tv  (tv = landscape wall screen: quote, clock, weather, word / this day in history)
 *   rotate_seconds: 45           # tv layout: how long each Word / History panel stays up
 *   quote_source: web            # web | builtin   (web = a ~1,400-quote online list, falling back to the built-in list)
 *   word_source: web             # web | builtin   (web = a ~400-word list with live definitions, falling back to the built-in list)
 *   quotes: [ {text, author} ]   # tv layout: your own quotes instead of the built-in list
 *   page_transition: slide       # slide | fade | none  (how Hub and Today swap)
 *   transition_ms: 420           # length of that animation
 *   fit_parent: false            # true = size to the parent element instead of the browser window (used by the demo page)
 *   entities: { ... }            # your own entity ids; anything you leave out falls back to the placeholder
 *                                #   defaults in DEFAULTS below (which the demo page uses)
 */
(() => {
  const VERSION = '1.13.2';
  const FONT_HREF = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap';

  /* ------------------------------------------------------------------ *
   * Entities. Everything the card reads is listed here so it is easy to
   * change. Anything set to null is simply not shown or not linked yet.
   * ------------------------------------------------------------------ */
  const DEFAULTS = {
    theme_entity: 'input_select.dashboard_theme',
    media_label: 'Living room',
    seat_label: 'Warm seat',
    header_toggle: 'input_boolean.kiosk_header', // on = show Home Assistant's top bar
    weather: 'weather.home',
    sun_rising: 'sensor.sun_next_rising',
    sun_setting: 'sensor.sun_next_setting',
    // Weather station / room sensor. Leave null until you have one.
    station: { outdoor_temp: null, outdoor_humidity: null, indoor_temp: null, indoor_humidity: null },
    thermostat: null, // e.g. 'climate.living_room'
    people: [
      { entity: 'person.alex', status: 'sensor.alex_location', name: 'Alex' },
      { entity: 'person.sam', status: 'sensor.sam_location', name: 'Sam' },
      { entity: 'person.jordan', status: 'sensor.jordan_location', name: 'Jordan' },
      { entity: 'person.casey', status: 'sensor.casey_location', name: 'Casey' },
    ],
    calendars: [
      { entity: 'calendar.family', color: '#a259d9' },
      { entity: 'calendar.work', color: '#51b749' },
      { entity: 'calendar.hobbies', color: '#3b82f6' },
      { entity: 'calendar.birthdays', color: '#6b7686' },
      { entity: 'calendar.shared', color: '#6b7686' },
    ],
    car: {
      name: 'Roadster',
      battery: 'sensor.roadster_battery_level',
      range: 'sensor.roadster_battery_range',
      charging: 'sensor.roadster_charging',
      cable: 'binary_sensor.roadster_charge_cable',
      lock: 'lock.roadster_lock',
      seat_script: 'script.warm_seat',
    },
    power: [
      { entity: 'switch.desk_lamp', name: 'Desk lamp' },
      { entity: 'switch.office_fan', name: 'Office fan' },
      { entity: 'switch.pc', name: 'PC', confirm: 'off', confirm_message: "Cutting power right away can interrupt a stream or an update that's still running." },
      { entity: 'switch.porch_lights', name: 'Porch lights' },
      { entity: 'switch.spare_socket', name: 'Spare socket', hide_when_unavailable: true },
    ],
    sprinkler: {
      prefix: 'Backyard Sprinklers',
      standby: 'switch.sprinklers_standby',
      rain_delay: 'switch.sprinklers_rain_delay',
      connectivity: 'binary_sensor.sprinklers_connectivity',
      rain: 'binary_sensor.sprinklers_rain',
      zones: [
        'switch.sprinklers_zone_1',
        'switch.sprinklers_zone_2',
        'switch.sprinklers_zone_3',
        'switch.sprinklers_zone_4',
      ],
    },
    alarm: 'alarm_control_panel.home_alarm',
    doors: [
      { entity: 'binary_sensor.front_door_contact', name: 'Front door' },
      { entity: 'binary_sensor.back_door_contact', name: 'Back door' },
      { entity: 'binary_sensor.garage_door_contact', name: 'Garage door' },
      { entity: 'binary_sensor.shed_door_contact', name: 'Shed door' },
    ],
    windows: [
      { entity: 'binary_sensor.window_north_contact', name: 'North window' },
      { entity: 'binary_sensor.window_south_contact', name: 'South window' },
      { entity: 'binary_sensor.window_east_contact', name: 'East window' },
      { entity: 'binary_sensor.window_west_contact', name: 'West window' },
    ],
    leaks: [
      { entity: 'binary_sensor.water_heater_leak', name: 'Water heater' },
      { entity: 'binary_sensor.basement_leak', name: 'Basement' },
      { entity: 'binary_sensor.laundry_leak', name: 'Laundry' },
      { entity: 'binary_sensor.kitchen_leak', name: 'Kitchen' },
    ],
    media: 'media_player.living_room_tv',
    media_app: 'sensor.living_room_tv_active_app',
    backup: 'sensor.backup_last_successful_automatic_backup',
    system_problem: 'binary_sensor.system_problem_detected',
    battery_sensors: ['sensor.motion_outside_battery', 'sensor.motion_inside_battery'],
    battery_names: { 'sensor.motion_outside_battery': 'Outside motion sensor', 'sensor.motion_inside_battery': 'Inside motion sensor' },
    backup_next: 'sensor.backup_next_scheduled_automatic_backup',
    backup_state: 'sensor.backup_backup_manager_state',
  };

  /* ------------------------------------------------------------------ *
   * Themes
   * ------------------------------------------------------------------ */
  const THEMES = {
    'Default': { mode: 'light', base: '#98a3b1', c1: '#5f8fae', c2: '#2f6f7a', c3: '#d5d9df', c4: '#a9c0d2', c5: '#44566b', accent: '#1f6f7c', onAccent: '#ffffff' },
    'Winter': { mode: 'dark', base: '#979ca2', c1: '#2f77c3', c2: '#1126a5', c3: '#031730', c4: '#010a13', c5: '#1126a5', accent: '#2f77c3', onAccent: '#ffffff' },
    'Spring': { mode: 'light', base: '#d9e4d2', c1: '#e7c4e1', c2: '#aec6db', c3: '#95ab60', c4: '#cd759a', c5: '#aec6db', accent: '#486d26', onAccent: '#ffffff' },
    'Summer': { mode: 'light', base: '#7cc9ad', c1: '#006a5c', c2: '#02ab82', c3: '#eee296', c4: '#61bf9a', c5: '#053f43', accent: '#006a5c', onAccent: '#ffffff' },
    'Fall': { mode: 'light', base: '#d4803f', c1: '#b11509', c2: '#fc5e1d', c3: '#eb9911', c4: '#fe8b4c', c5: '#680e03', accent: '#b11509', onAccent: '#ffffff' },
    'Halloween': { mode: 'dark', base: '#2a1b26', c1: '#a8542d', c2: '#6b2834', c3: '#505a3f', c4: '#9a7847', c5: '#493044', accent: '#a8542d', onAccent: '#ffffff' },
    'Thanksgiving': { mode: 'light', base: '#cdb89b', c1: '#cc6a1f', c2: '#6b7a4e', c3: '#eadcc6', c4: '#8b3a32', c5: '#6b4a3a', accent: '#8b3a32', onAccent: '#ffffff' },
    'Christmas': { mode: 'light', base: '#cbbfa9', c1: '#6b1a2a', c2: '#4a5648', c3: '#e8e0cf', c4: '#a68b6d', c5: '#4a5648', accent: '#6b1a2a', onAccent: '#ffffff' },
    'New Year': { mode: 'dark', base: '#191a21', c1: '#444e67', c2: '#775d49', c3: '#c9c2c9', c4: '#d9a862', c5: '#444e67', accent: '#d9a862', onAccent: '#191a21' },
    'Memorial Day': { mode: 'light', base: '#a9b09b', c1: '#8d0f0f', c2: '#626d58', c3: '#d4c78c', c4: '#8f9b84', c5: '#30332b', accent: '#8d0f0f', onAccent: '#ffffff' },
    'July 4th/Labor Day': { mode: 'light', base: '#c8d4e5', c1: '#2c3f70', c2: '#a5231c', c3: '#e8ebed', c4: '#8089d2', c5: '#2c3f70', accent: '#2c3f70', onAccent: '#ffffff' },
  };
  const LIGHT = { ink: '#181c20', muted: '#353b42', glass: 'rgba(255,255,255,0.46)', gborder: 'rgba(255,255,255,0.6)', gshadow: '0 10px 36px rgba(30,40,55,0.18), inset 0 1px 0 rgba(255,255,255,0.55)', chip: 'rgba(255,255,255,0.55)', chipb: 'rgba(255,255,255,0.7)', btn: 'rgba(255,255,255,0.35)', btnb: 'rgba(255,255,255,0.6)', line: 'rgba(24,28,32,0.14)', track: 'rgba(24,28,32,0.14)', ringoff: 'rgba(24,28,32,0.25)', halo: 'rgba(255,255,255,0.85)', panel: 'rgba(244,246,249,0.9)', alert: '#c0392b', caution: '#a8650a', onAlert: '#ffffff', glassFlat: 'rgba(255,255,255,0.66)' };
  const DARK = { ink: '#f2f5f9', muted: '#cdd5e0', glass: 'rgba(14,20,32,0.5)', gborder: 'rgba(255,255,255,0.16)', gshadow: '0 10px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)', chip: 'rgba(255,255,255,0.12)', chipb: 'rgba(255,255,255,0.2)', btn: 'rgba(255,255,255,0.1)', btnb: 'rgba(255,255,255,0.16)', line: 'rgba(255,255,255,0.18)', track: 'rgba(255,255,255,0.22)', ringoff: 'rgba(255,255,255,0.35)', halo: 'rgba(0,0,0,0.55)', panel: 'rgba(14,20,32,0.92)', alert: '#ff7a6b', caution: '#f2b84b', onAlert: '#2a0a07', glassFlat: 'rgba(14,20,32,0.72)' };

  function adj(hex, v) {
    if (v >= 1) return hex;
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = h / 6;
    }
    s = s * v;
    if (s === 0) { const k = Math.round(l * 255).toString(16).padStart(2, '0'); return '#' + k + k + k; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return '#' + [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  }

  function themeVals(name, vibrance) {
    const t = THEMES[name] || THEMES['Default'];
    const tok = t.mode === 'dark' ? DARK : LIGHT;
    const v = typeof vibrance === 'number' ? Math.min(1, Math.max(0.3, vibrance)) : 1;
    return Object.assign({}, tok, {
      base: adj(t.base, v), c1: adj(t.c1, v), c2: adj(t.c2, v), c3: adj(t.c3, v), c4: adj(t.c4, v), c5: adj(t.c5, v),
      accent: t.accent, onAccent: t.onAccent,
    });
  }

  /* Automatic theme: holiday windows (2 days before to 2 days after) win,
     then Saturday/Sunday use the season, and weekdays use Default. */
  function nthWeekday(year, month, weekday, n) {
    const first = new Date(year, month, 1);
    const offset = (weekday - first.getDay() + 7) % 7;
    return new Date(year, month, 1 + offset + (n - 1) * 7);
  }
  function lastWeekday(year, month, weekday) {
    const last = new Date(year, month + 1, 0);
    const back = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month, last.getDate() - back);
  }
  function holidays(y) {
    return [
      ['New Year', new Date(y, 0, 1)],
      ['Memorial Day', lastWeekday(y, 4, 1)],
      ['July 4th/Labor Day', new Date(y, 6, 4)],
      ['July 4th/Labor Day', nthWeekday(y, 8, 1, 1)],
      ['Halloween', new Date(y, 9, 31)],
      ['Thanksgiving', nthWeekday(y, 10, 4, 4)],
      ['Christmas', new Date(y, 11, 25)],
    ];
  }
  function seasonFor(d) {
    const md = (d.getMonth() + 1) * 100 + d.getDate();
    if (md >= 1221 || md <= 319) return 'Winter';
    if (md <= 620) return 'Spring';
    if (md <= 921) return 'Summer';
    return 'Fall';
  }
  function autoTheme(now) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (const y of [day.getFullYear() - 1, day.getFullYear(), day.getFullYear() + 1]) {
      for (const [name, date] of holidays(y)) {
        const diff = Math.round((day - date) / 86400000);
        if (Math.abs(diff) <= 2) return name;
      }
    }
    const wd = day.getDay();
    if (wd === 0 || wd === 6) return seasonFor(day);
    return 'Default';
  }

  /* ------------------------------------------------------------------ *
   * Small helpers
   * ------------------------------------------------------------------ */
  const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DOW3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const AMBER = '#f2b84b';
  const RED = '#d64545';
  const GREEN = '#2e9e5b'; // "good" status colour, the same in every theme
  const pad2 = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : null; };
  const deg = (v) => (v == null ? '—' : Math.round(v) + '°');
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
  function parseDateOnly(s) { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); }
  function fmtTime(d) { let h = d.getHours(); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + ':' + pad2(d.getMinutes()) + ' ' + ap; }
  function fmtHour(d) { let h = d.getHours(); const ap = h >= 12 ? 'p' : 'a'; h = h % 12 || 12; return h + ap; }
  function fmtDay(d) { return DOW[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); }
  function fmtBackup(iso) {
    if (!iso || iso === 'unknown' || iso === 'unavailable') return '—';
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    const diff = dayDiff(new Date(), d);
    if (diff === 0) return 'Today, ' + fmtTime(d);
    if (diff === 1) return 'Yesterday, ' + fmtTime(d);
    return MON3[d.getMonth()] + ' ' + d.getDate() + ', ' + fmtTime(d);
  }
  const pretty = (n) => String(n || '').replace(/\s*battery$/i, '').replace(/\bSw\b/g, 'SW').replace(/\bNw\b/g, 'NW').replace(/Waterheater/i, 'Water heater').replace(/\s+/g, ' ').trim();
  const cap = (s) => { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' '); };

  const COND_LABEL = {
    'clear-night': 'Clear', cloudy: 'Cloudy', exceptional: 'Exceptional', fog: 'Fog', hail: 'Hail', lightning: 'Thunderstorms',
    'lightning-rainy': 'Thunderstorms', partlycloudy: 'Partly cloudy', pouring: 'Heavy rain', rainy: 'Rain', snowy: 'Snow',
    'snowy-rainy': 'Sleet', sunny: 'Sunny', windy: 'Windy', 'windy-variant': 'Windy',
  };
  const COND_ICON = {
    sunny: 'sun', 'clear-night': 'moon', partlycloudy: 'cloudsun', cloudy: 'cloud', rainy: 'rain', pouring: 'rain',
    snowy: 'snow', 'snowy-rainy': 'snow', hail: 'snow', lightning: 'bolt', 'lightning-rainy': 'bolt', fog: 'wind',
    windy: 'wind', 'windy-variant': 'wind', exceptional: 'warn',
  };

  /* Built-in content for the TV layout. Quotes are from public-domain sources. */
  const QUOTES = [
    ['Take away thy opinion, and then there is taken away the complaint, \u2018I have been harmed.\u2019', 'Marcus Aurelius \u00b7 Meditations IV.7'],
    ['Such as are thy habitual thoughts, such also will be the character of thy mind; for the soul is dyed by the thoughts.', 'Marcus Aurelius \u00b7 Meditations V.16'],
    ['The best way of avenging thyself is not to become like the wrong-doer.', 'Marcus Aurelius \u00b7 Meditations VI.6'],
    ['Confine thyself to the present.', 'Marcus Aurelius \u00b7 Meditations VII.29'],
    ['No longer talk at all about the kind of man that a good man ought to be, but be such.', 'Marcus Aurelius \u00b7 Meditations X.16'],
    ['If it is not right, do not do it; if it is not true, do not say it.', 'Marcus Aurelius \u00b7 Meditations XII.17'],
    ['Men are disturbed, not by the things which happen, but by the opinions about the things.', 'Epictetus \u00b7 Enchiridion 5'],
    ['First say to yourself what you would be; and then do what you have to do.', 'Epictetus \u00b7 Discourses III.23'],
    ['We suffer more often in imagination than in reality.', 'Seneca \u00b7 Letters 13'],
    ['Well done is better than well said.', 'Benjamin Franklin \u00b7 Poor Richard\u2019s Almanack'],
    ['Little strokes fell great oaks.', 'Benjamin Franklin \u00b7 Poor Richard\u2019s Almanack'],
    ['Lost time is never found again.', 'Benjamin Franklin \u00b7 Poor Richard\u2019s Almanack'],
    ['Nothing great was ever achieved without enthusiasm.', 'Ralph Waldo Emerson \u00b7 Circles'],
    ['Write it on your heart that every day is the best day in the year.', 'Ralph Waldo Emerson \u00b7 Work and Days'],
    ['The only way to have a friend is to be one.', 'Ralph Waldo Emerson \u00b7 Friendship'],
    ['To be great is to be misunderstood.', 'Ralph Waldo Emerson \u00b7 Self-Reliance'],
    ['The question is not what you look at, but what you see.', 'Henry David Thoreau \u00b7 Journal, 1851'],
    ['Simplify, simplify.', 'Henry David Thoreau \u00b7 Walden'],
    ['The mountains are calling and I must go.', 'John Muir \u00b7 Letter, 1873'],
    ['No act of kindness, no matter how small, is ever wasted.', 'Aesop'],
    ['Slow and steady wins the race.', 'Aesop \u00b7 The Hare and the Tortoise'],
    ['A journey of a thousand miles begins with a single step.', 'Lao Tzu \u00b7 Tao Te Ching'],
    ['Our doubts are traitors, and make us lose the good we oft might win, by fearing to attempt.', 'William Shakespeare \u00b7 Measure for Measure'],
    ['There is nothing either good or bad, but thinking makes it so.', 'William Shakespeare \u00b7 Hamlet'],
    ['Nothing will ever be attempted, if all possible objections must first be overcome.', 'Samuel Johnson \u00b7 Rasselas'],
    ['There is no charm equal to tenderness of heart.', 'Jane Austen \u00b7 Emma'],
    ['No one is useless in this world who lightens the burden of it for anyone else.', 'Charles Dickens \u00b7 Our Mutual Friend'],
    ['We are all in the gutter, but some of us are looking at the stars.', 'Oscar Wilde \u00b7 Lady Windermere\u2019s Fan'],
    ['To travel hopefully is a better thing than to arrive.', 'Robert Louis Stevenson \u00b7 El Dorado'],
    ['Courage is resistance to fear, mastery of fear, not absence of fear.', 'Mark Twain \u00b7 Pudd\u2019nhead Wilson'],
    ['Isn\u2019t it nice to think that tomorrow is a new day with no mistakes in it yet?', 'L. M. Montgomery \u00b7 Anne of Green Gables'],
    ['I am not afraid of storms, for I am learning how to sail my ship.', 'Louisa May Alcott \u00b7 Little Women'],
    ['Although the world is full of suffering, it is full also of the overcoming of it.', 'Helen Keller \u00b7 Optimism'],
    ['A thing of beauty is a joy for ever.', 'John Keats \u00b7 Endymion'],
    ['Do what you can, with what you have, where you are.', 'Theodore Roosevelt'],
  ].map((q) => ({ text: q[0], author: q[1] }));

  const WORDS = [
    ['equanimity', 'noun', 'ee-kwuh-NIM-ih-tee', 'Mental calmness and evenness of temper, especially when things are difficult.', 'She met the delay with surprising equanimity.'],
    ['serendipity', 'noun', 'ser-un-DIP-ih-tee', 'The happy accident of finding something good while looking for something else.', 'Meeting her old teacher at the market was pure serendipity.'],
    ['resilient', 'adjective', 'rih-ZIL-yunt', 'Able to recover quickly after trouble or change.', 'The garden proved resilient after the late frost.'],
    ['gregarious', 'adjective', 'grih-GAIR-ee-us', 'Fond of company; enjoying being with other people.', 'Her gregarious uncle knew every guest by name.'],
    ['ephemeral', 'adjective', 'ih-FEM-er-ul', 'Lasting only a very short time.', 'The morning frost was beautiful and ephemeral.'],
    ['luminous', 'adjective', 'LOO-mih-nus', 'Giving off light; bright or glowing.', 'The lake looked luminous at dusk.'],
    ['alacrity', 'noun', 'uh-LAK-rih-tee', 'Cheerful readiness and speed.', 'He accepted the invitation with alacrity.'],
    ['benevolent', 'adjective', 'buh-NEV-uh-lunt', 'Kind and well-meaning; wanting to do good for others.', 'A benevolent neighbor shoveled the whole street.'],
    ['perseverance', 'noun', 'per-suh-VEER-uns', 'Steady effort toward a goal despite difficulty.', 'Perseverance carried him through the long winter.'],
    ['tenacious', 'adjective', 'tuh-NAY-shus', 'Holding firmly to something; not giving up easily.', 'A tenacious little vine climbed the whole fence.'],
    ['gratitude', 'noun', 'GRAT-ih-tood', 'The feeling of being thankful and ready to show appreciation.', 'She wrote a note of gratitude to every volunteer.'],
    ['mellifluous', 'adjective', 'muh-LIF-loo-us', 'Sweet and smooth to hear.', 'The choir\u2019s mellifluous harmony filled the hall.'],
    ['sanguine', 'adjective', 'SANG-gwin', 'Hopeful and optimistic, especially when things are uncertain.', 'He stayed sanguine about the forecast.'],
    ['verdant', 'adjective', 'VUR-dunt', 'Green with grass or plants.', 'Spring turned the hills verdant.'],
    ['candor', 'noun', 'KAN-der', 'Honest and open speech.', 'She answered with refreshing candor.'],
    ['sagacious', 'adjective', 'suh-GAY-shus', 'Having sound judgment and wisdom.', 'A sagacious friend gave simple advice.'],
    ['fortitude', 'noun', 'FOR-tih-tood', 'Strength of mind that lets a person face pain or hardship calmly.', 'The family showed great fortitude.'],
    ['nonchalant', 'adjective', 'non-shuh-LAHNT', 'Calm and relaxed, as if unconcerned.', 'He gave a nonchalant shrug.'],
    ['zeal', 'noun', 'zeel', 'Great energy or enthusiasm for a cause or goal.', 'She tackled the garden with zeal.'],
    ['solace', 'noun', 'SOL-is', 'Comfort in a time of sadness or worry.', 'He found solace in a quiet walk.'],
    ['industrious', 'adjective', 'in-DUS-tree-us', 'Hard-working and diligent.', 'The industrious bees never rested.'],
    ['whimsical', 'adjective', 'WIM-zih-kul', 'Playfully quaint or fanciful.', 'The garden gnomes had a whimsical charm.'],
    ['effervescent', 'adjective', 'ef-er-VES-ent', 'Bubbly and lively; giving off tiny bubbles.', 'Her effervescent laugh lifted the room.'],
    ['discern', 'verb', 'dih-SURN', 'To notice or understand something by careful attention.', 'He could discern a trail in the snow.'],
    ['contentment', 'noun', 'kun-TENT-ment', 'A state of quiet satisfaction.', 'Tea on the porch brought deep contentment.'],
    ['meticulous', 'adjective', 'muh-TIK-yuh-lus', 'Showing great attention to detail; very careful.', 'A meticulous baker measured every ingredient.'],
    ['amiable', 'adjective', 'AY-mee-uh-bul', 'Friendly and pleasant.', 'The amiable clerk remembered every customer.'],
    ['wanderlust', 'noun', 'WAHN-der-lust', 'A strong desire to travel and explore.', 'Old maps fed her wanderlust.'],
    ['harmony', 'noun', 'HAR-muh-nee', 'A pleasing agreement or blend of parts.', 'The family worked in easy harmony.'],
    ['radiant', 'adjective', 'RAY-dee-unt', 'Shining brightly; showing joy.', 'She looked radiant in the morning light.'],
  ].map((w) => ({ word: w[0], pos: w[1], pron: w[2], def: w[3], ex: w[4] }));

  /* Word list for the online word of the day: just the words. Definitions, pronunciation and an example are
     looked up live from a free dictionary service, so the pool is large without hand-written entries. */
  const WORD_LIST = Array.from(new Set(('abundant accolade acumen adamant adept admire adorn adventure affable affinity agile alacrity allure aloft altruism amble ambrosial ameliorate amicable ample anecdote anticipate apex applaud ardent aspire astute attune aura aurora authentic avid awe azure ' +
    'balmy banter beacon bedrock benevolent benign bequeath bliss bloom bolster bountiful bravado breeze brilliant bucolic buoyant burgeon cadence calm camaraderie candid candor capable captivate carefree cascade catalyst celebrate celestial cheerful cherish chivalrous civil clarity clemency cogent cohesive comfort commend compassion composure concord confide constant content convivial cordial courage courteous cozy craft creative crisp cultivate curiosity ' +
    'dapper dauntless dawn dazzle decorous dedicate delight devoted dexterity diligent discern distinct diverse dignity dynamic eager earnest eclectic effervescent elated elegant eloquent embrace emerge empathy enchant endeavor endure energetic enlighten enrapture ensemble enthusiasm equanimity equity esteem ethereal euphoria evergreen exalt exceed exhilarate exquisite exuberant ' +
    'fable fathom felicity fervent fidelity fleet flourish fluent focus foresight forthright fortitude fortune fragrant frolic frugal fulfill gallant garland generous genial gentle genuine gist glean glee glimmer gracious gratitude gregarious grove guidance halcyon hallmark handsome harbor harmony harvest haven heartfelt heritage hearth hilarity honest honor hopeful horizon hospitable humble humility ' +
    'idyllic illuminate imagine immerse impeccable incandescent ingenious inquire insight inspire integrity intrepid intuition invigorate jaunty jovial jubilant judicious keen kindle kindred kinship knack laudable lavish legacy lenient leisure levity liberty lilt linger lively lofty loyal lucid luminous lush lustrous magnanimous majestic marvel meadow mellow melody mentor meridian meticulous mirth modest momentum mosaic munificent muse ' +
    'nature navigate nimble noble nostalgia nourish novel nurture oasis observant opulent optimism orchard ornate panorama paragon passion pastoral patience peaceful perceptive perseverance pervade picturesque pinnacle pioneer placid plucky poise polished ponder potent pragmatic precious prestige prosper prudent pristine punctual quaint quest quiescent radiant rapport rapture reassure refresh rejoice relish remarkable renew resilient resolute resonate resourceful respite restore reverence revive rhapsody robust romp rustic ' +
    'sagacious sanctuary sanguine savor scenic scholar secure seed serene serendipity shimmer sincere skillful snug solace solitude soothe spirited splendid spontaneous sprightly stalwart steadfast stellar stewardship stoic stride sturdy sublime succor sunrise sunlit supple sustain symmetry synergy tact tapestry temperate tenacious tender thrive tranquil treasure trellis triumph trust twilight unity upbeat utopia valiant valor vast velvet venerate verdant versatile vibrant victory vigilant vigor virtue vista vivid vivacious voyage wander warmth wholesome whimsy wisdom wit wonder worthy yearn zeal zenith zephyr zest').split(' ')));
  const QUOTE_FEED = 'https://dummyjson.com/quotes?limit=0';
  const WORD_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  const lsGet = (k) => { try { return JSON.parse(window.localStorage.getItem(k)); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
  const dayNumber = (d) => Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTime() / 86400000);
  const isoDay = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  function fetchJson(url, ms) {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = setTimeout(() => { if (ctl) ctl.abort(); }, ms || 12000);
    return fetch(url, ctl ? { signal: ctl.signal } : undefined).then(
      (r) => { clearTimeout(t); if (!r.ok) throw new Error('http ' + r.status); return r.json(); },
      (e) => { clearTimeout(t); throw e; });
  }
  /* Turns a dictionary-service reply into one tidy word entry, or null if nothing short enough is in it. */
  function parseWord(data, fallbackWord) {
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry) return null;
    const tidy = (t) => { t = String(t || '').trim(); if (!t) return ''; t = t.charAt(0).toUpperCase() + t.slice(1); return /[.!?]$/.test(t) ? t : t + '.'; };
    for (const m of entry.meanings || []) {
      for (const d of m.definitions || []) {
        if (!d.definition || d.definition.length > 120) continue;
        const ph = entry.phonetic || ((entry.phonetics || []).find((p) => p && p.text) || {}).text || '';
        const ex = d.example && d.example.length <= 90 ? tidy(d.example) : '';
        return { word: entry.word || fallbackWord, pos: m.partOfSpeech || '', pron: ph, def: tidy(d.definition), ex };
      }
    }
    return null;
  }

  /* Picks three "On this day" entries from Wikipedia's feed, spread across different eras. */
  function pickHistory(data) {
    const ev = ((data && data.events) || []).filter((e) => e && e.text && typeof e.year === 'number');
    let pool = ev.filter((e) => e.year >= 1400 && e.text.length <= 120);
    if (pool.length < 3) pool = ev.filter((e) => e.text.length <= 160);
    if (!pool.length) return [];
    pool.sort((a, b) => a.year - b.year);
    const n = Math.min(3, pool.length);
    const out = [];
    for (let i = 0; i < n; i++) {
      const e = pool[Math.floor(pool.length * (i + 0.5) / n)];
      out.push({ year: String(e.year), text: e.text });
    }
    return out;
  }
  const dayOfYear = (d) => Math.floor((startOfDay(d) - new Date(d.getFullYear(), 0, 0)) / 86400000);

  const ICONS = {
    quote: '<path d="M3 21c3 0 7-1 7-8V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4c0 3-2 4-4 4z"/><path d="M15 21c3 0 7-1 7-8V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4c0 3-2 4-4 4z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    cloudsun: '<path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.95 12.65a4 4 0 0 0-5.93-4.13"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z"/>',
    rain: '<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
    snow: '<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/>',
    bolt: '<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/>',
    wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
    warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    therm: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
    drop: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    tv: '<rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>',
    pulse: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    dots: '<circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/>',
    pause: '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>',
  };
  const ic = (name, cls) => '<svg class="' + (cls || 'i28') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  const pill = (text, dot) => '<div class="pill"><span class="pd' + (dot === GREEN ? ' pdh' : '') + '" style="background:' + (dot || 'var(--accent)') + '"></span>' + esc(text) + '</div>';
  const warnPill = (severe) => '<div class="pill"><span class="wi" style="color:' + (severe ? 'var(--alert)' : 'var(--caution)') + '">' + ic('warn', 'i24') + '</span>Warning</div>';
  const lab = (icon, text) => '<div class="lab">' + ic(icon) + '<span>' + esc(text) + '</span></div>';

  /* ------------------------------------------------------------------ *
   * Styles. Sizes written as "40u" are design pixels on a 1080-wide
   * canvas, converted to calc(40 * var(--u)) so everything scales.
   * ------------------------------------------------------------------ */
  const U = (s) => s
    .replace(/(-?\d*\.?\d+)u\b/g, (m, n) => 'calc(' + n + ' * var(--u))')
    .replace(/(-?\d*\.?\d+)k\b/g, (m, n) => 'calc(' + n + ' * var(--u) * var(--cs, 1))');
  const CSS = U(`
:host{display:block;position:relative;width:100%;overflow:hidden;font-family:'DM Sans',system-ui,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;touch-action:manipulation}
*{box-sizing:border-box;margin:0}
button{font-family:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer}
.stage{position:relative;width:100%;height:100%;overflow:hidden;background:var(--base);color:var(--ink)}
.circ{position:absolute;border-radius:50%}
.dbg{position:absolute;top:6u;left:0;right:0;text-align:center;font-size:18u;color:var(--muted);pointer-events:none;z-index:5}
.c1{left:-180u;top:-120u;width:760u;height:760u;background:var(--c1)}
.c2{right:-220u;top:420u;width:720u;height:720u;background:var(--c2)}
.c3{left:-120u;top:1000u;width:560u;height:560u;background:var(--c3)}
.c4{left:380u;top:900u;width:340u;height:340u;background:var(--c4)}
.c5{right:60u;bottom:-160u;width:600u;height:600u;background:var(--c5)}
.wrap{position:relative;height:100%;padding:40u;display:flex;flex-direction:column;gap:24u}
.navfixed .wrap{padding-bottom:120u}
.page{flex:1;min-height:0;display:flex;flex-direction:column;gap:24u}
.wrap.out{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.wrap.moving{will-change:transform}
.wrap.moving .g{backdrop-filter:none;-webkit-backdrop-filter:none;background:var(--glass-flat)}
.g{padding:28u;border-radius:28u;background:var(--glass);backdrop-filter:blur(30u) saturate(1.15);-webkit-backdrop-filter:blur(30u) saturate(1.15);border:1px solid var(--gborder);box-shadow:var(--gshadow);overflow:hidden;display:flex;flex-direction:column;gap:12u;min-width:0}
.row{display:flex;align-items:center;justify-content:space-between;gap:12u}
.lab{display:flex;align-items:center;gap:10u;font-size:20u;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.pill{display:flex;align-items:center;gap:8u;padding:6u 14u;border-radius:999u;background:var(--chip);border:1px solid var(--chipb);font-size:20u;font-weight:600;white-space:nowrap}
.pd{width:10u;height:10u;border-radius:50%;flex-shrink:0}
.pd.pdh{box-shadow:0 0 0 2u var(--halo)}
.serif{font-family:'Fraunces',Georgia,serif;font-weight:var(--nw,500);font-variation-settings:'opsz' 36;letter-spacing:-.02em}
.muted{color:var(--muted)}
.acc{color:var(--accent)}
.i24{width:24u;height:24u}.i26{width:26u;height:26u}.i28{width:28u;height:28u}.i30{width:30u;height:30u}.i32{width:32u;height:32u}.i64{width:64u;height:64u}
/* Hub header */
.hhead{height:170u;flex-shrink:0;display:flex;align-items:center;justify-content:space-between}
.clk{display:flex;flex-direction:column;gap:6u}
.clk .t{display:flex;align-items:baseline;gap:12u}
.clk .tn{font-size:120u;line-height:1;letter-spacing:-.02em}
.clk .ta{font-size:40u;font-weight:500;color:var(--muted)}
.clk .d{font-size:30u;font-weight:500;color:var(--muted)}
.ppl{display:flex;gap:8u}
.per{width:136u;display:flex;flex-direction:column;align-items:center;gap:4u}
.av{width:84u;height:84u;border-radius:50%;border:3px solid var(--ringoff);object-fit:cover;display:block}
.ini{display:flex;align-items:center;justify-content:center;background:var(--chip);font-family:'Fraunces',Georgia,serif;font-weight:var(--nw,500);font-variation-settings:'opsz' 36;font-size:38u}
.pn{font-size:22u;font-weight:600}
.ps{font-size:19u;line-height:1.15;text-align:center;color:var(--muted);max-width:136u;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* Hub grid */
.grid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(12,minmax(0,1fr));gap:16u}
.weather{grid-column:1;grid-row:1/span 4}
.coming{grid-column:2;grid-row:1/span 6;gap:4u}
.climate{grid-column:1;grid-row:5/span 2}
.car{grid-column:1;grid-row:7/span 3}
.power{grid-column:1;grid-row:10/span 3}
.house{grid-column:2;grid-row:7/span 2}
.media{grid-column:2;grid-row:9/span 2}
.sys{grid-column:2;grid-row:11/span 2}
.wtemp{font-size:150u;line-height:.95;letter-spacing:-.03em}
.wcond{font-size:40u}
.wsub{font-size:24u;color:var(--muted)}
.sunl{font-size:22u;color:var(--muted)}
.hours{margin-top:auto;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4u;padding-top:14u;border-top:1px solid var(--line)}
.hr{display:flex;flex-direction:column;align-items:center;gap:8u}
.hl{font-size:20u;color:var(--muted)}
.ht{font-size:28u}
.dl{font-size:20u;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:10u}
.none{height:74u;display:flex;align-items:center;font-size:26u;color:var(--muted)}
.ev{display:flex;align-items:center;gap:14u;height:74u;flex-shrink:0}
.et{width:112u;flex-shrink:0;font-size:24u;font-weight:600}
.edot{width:16u;height:16u;flex-shrink:0;border-radius:50%}
.etx{display:flex;flex-direction:column;min-width:0}
.etl{font-size:28u;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.esub{font-size:22u;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16u}
.cl{font-size:20u;color:var(--muted)}
.cv{font-size:72u;line-height:1;letter-spacing:-.02em}
.cfoot{margin-top:auto;font-size:22u;color:var(--muted)}
.cbig{display:flex;align-items:baseline;justify-content:space-between}
.cpct{font-size:96u;line-height:1;letter-spacing:-.02em}
.cpct span{font-size:44u}
.crng{font-size:28u;font-weight:500}
.bar{height:12u;border-radius:6u;background:var(--track);flex-shrink:0}
.fill{height:100%;border-radius:6u}
.cst{font-size:24u;color:var(--muted)}
.btn{margin-top:auto;height:64u;border-radius:18u;background:var(--accent);color:var(--on-accent);font-size:24u;font-weight:600;display:flex;align-items:center;justify-content:center;gap:10u;flex-shrink:0}
.ico{display:flex;align-items:center;justify-content:center;width:26u;height:26u;flex-shrink:0}
.ico.warm{width:42u;height:42u;border-radius:50%;background:#fff;color:#d64545}
.btn:active,.pb:active,.seg:active,.play:active,.navb:active{opacity:.7}
.pgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12u;grid-auto-rows:100u}
.pgrid.p6{grid-auto-rows:66u}
.pb{border:1px solid var(--btnb);border-radius:20u;background:var(--btn);padding:14u 16u;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;text-align:left;min-width:0}
.pb.p6x{padding:8u 16u}
.pb.on{background:var(--accent);border-color:transparent;color:var(--on-accent)}
.pb.un{opacity:.5}
.pb .a{font-size:24u;font-weight:500}
.pb .b{font-size:20u;color:var(--muted)}
.pb.on .b{color:var(--on-accent)}
.foot{margin-top:auto;display:flex;align-items:center;gap:10u;font-size:22u;color:var(--muted)}
.hl1{font-size:28u;font-weight:500}
.hl2{font-size:22u;color:var(--muted)}
.hl2.bad{color:var(--ink);font-weight:600}
.segs{margin-top:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10u}
.seg{height:56u;border:1px solid var(--btnb);border-radius:16u;background:var(--btn);font-size:22u;font-weight:600}
.seg.on{background:var(--accent);border-color:transparent;color:var(--on-accent)}
.mrow{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:12u}
.mt{font-size:28u;font-weight:500}
.ms{font-size:22u;color:var(--muted)}
.play{width:76u;height:76u;border-radius:50%;background:var(--accent);color:var(--on-accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.warnb{display:flex;align-items:center;gap:12u;padding:10u 16u;border-radius:16u;background:#f2b84b;color:#3a2a05;font-size:22u;font-weight:600;line-height:1.2;flex-shrink:0}
.wi{display:flex;align-items:center;flex-shrink:0}
.wline{display:flex;align-items:center;gap:10u;font-size:22u;line-height:1.2;flex-shrink:0}
.wline .wt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wline .wm{flex-shrink:0;color:var(--muted)}
.warnb .wt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.warnb .wm{flex-shrink:0}
.srows{margin-top:auto;display:flex;flex-direction:column;gap:8u}
.sr{display:flex;justify-content:space-between;font-size:24u;gap:12u}
.sr .v{font-weight:500;text-align:right}
/* Today */
.tclock{padding:36u 40u;gap:8u}
.trow{display:flex;align-items:baseline;gap:20u}
.tbig{font-size:280u;line-height:.95;letter-spacing:-.03em}
.tam{font-size:78u;font-weight:500;color:var(--muted)}
.tdate{display:flex;align-items:center;justify-content:space-between}
.tdt{font-size:68u;font-weight:500}
.twx{display:flex;align-items:center;gap:18u}
.twt{font-size:68u}
.tcal{flex:1;min-height:0;padding:12u 36u 28u;gap:0}
.tday{display:flex;gap:28k;padding:22k 0;border-top:1px solid var(--line)}
.tday:first-child{border-top:0}
.tdn{width:150k;flex-shrink:0;display:flex;flex-direction:column;align-items:center}
.tdd{font-size:32k;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.tdnum{font-family:'Fraunces',Georgia,serif;font-weight:var(--nw,500);font-variation-settings:'opsz' 36;font-size:112k;line-height:1}
.tevs{flex:1;display:flex;flex-direction:column;min-width:0}
.tev{display:flex;align-items:flex-start;gap:22k;padding:14k 0}
.tdot{width:30k;height:30k;flex-shrink:0;margin-top:18k;border-radius:50%}
.ttx{display:flex;flex-direction:column;gap:2k;min-width:0}
.ttl{font-size:62k;font-weight:500;line-height:1.12;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tsub{font-size:38k;color:var(--muted)}
.tnone{font-size:56k;color:var(--muted);padding:60k 20k}
/* Systems detail panel */
.dtl{position:absolute;left:0;top:0;right:0;bottom:0;opacity:0;pointer-events:none;transition:opacity .18s ease;z-index:20}
.dtl.show{opacity:1;pointer-events:auto}
.dback{position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,.34)}
.dpanel{position:absolute;left:40u;right:40u;top:70u;bottom:70u;padding:32u 36u;border-radius:32u;background:var(--panel);color:var(--ink);border:1px solid var(--gborder);box-shadow:var(--gshadow);backdrop-filter:blur(30u);-webkit-backdrop-filter:blur(30u);overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:26u}
.drow0{display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.dtitle{font-size:56u;line-height:1}
.dclose{height:52u;padding:0 30u;border-radius:999u;background:var(--accent);color:var(--on-accent);font-size:24u;font-weight:600}
.dsec{display:flex;flex-direction:column;gap:10u;flex-shrink:0}
.dissue{font-size:26u;padding:12u 16u;border-radius:14u;background:#f2b84b;color:#3a2a05;font-weight:600}
.dissue.sev{background:var(--alert);color:var(--on-alert)}
.dbat{display:grid;grid-template-columns:minmax(0,1fr) 200u 84u;align-items:center;gap:16u;font-size:26u}
.dbar{height:12u;border-radius:6u;background:var(--track)}
.dbar>div{height:100%;border-radius:6u}
.dv{text-align:right;font-weight:600}
.dchips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2u 24u}
.dchip{display:flex;align-items:center;justify-content:space-between;gap:10u;font-size:24u;min-width:0;padding:9u 0;border-bottom:1px solid var(--line)}
.dchip .dn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.badge{flex-shrink:0;font-size:20u;font-weight:600;padding:2u 12u;border-radius:999u;color:var(--muted)}
.badge.low{background:#f2b84b;color:#3a2a05}
.badge.off{background:var(--alert);color:var(--on-alert)}
.dsub{font-size:22u;color:var(--muted)}
.kv{display:flex;justify-content:space-between;gap:12u;font-size:26u}
.vv{font-weight:500;text-align:right}
/* Confirm dialog */
.dlg{position:absolute;left:0;top:0;right:0;bottom:0;opacity:0;pointer-events:none;transition:opacity .18s ease;z-index:30;display:flex;align-items:center;justify-content:center}
.dlg.show{opacity:1;pointer-events:auto}
.dbox{position:relative;width:760u;max-width:calc(100% - 80u);padding:40u;border-radius:32u;background:var(--panel);color:var(--ink);border:1px solid var(--gborder);box-shadow:var(--gshadow);backdrop-filter:blur(30u);-webkit-backdrop-filter:blur(30u);display:flex;flex-direction:column;gap:18u}
.dq{font-size:46u;line-height:1.1}
.dmsg{font-size:26u;color:var(--muted)}
.dbtns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16u;margin-top:10u}
.dbtn{height:76u;border-radius:20u;font-size:28u;font-weight:600}
.dbtn:active{opacity:.7}
.dbtn.keep{background:var(--accent);color:var(--on-accent)}
.dbtn.go{background:var(--alert);color:var(--on-alert)}
/* Compact: used when the visible screen is shorter than the 1080 x 1920 design */
.compact .g{padding:22u;gap:8u}
.compact .coming{gap:4u}
.compact .tclock{padding:36u 40u;gap:8u}
.compact .tcal{padding:12u 36u 28u;gap:0}
.compact .wtemp{font-size:128u}
.compact .cv{font-size:60u}
.compact .cpct{font-size:80u}
.compact .cpct span{font-size:38u}
.compact .btn{height:58u}
.compact .pgrid{grid-auto-rows:92u}
.compact .pgrid.p6{grid-auto-rows:60u}
.compact .seg{height:50u}
.compact .hl1{font-size:26u}
.compact .sr{font-size:22u}
/* TV layout */
.tvmode .wrap{padding:56u 72u}
.tvmode .g{backdrop-filter:none;-webkit-backdrop-filter:none}
.tvmode .c1{left:-200u;top:-280u;width:860u;height:860u}
.tvmode .c2{right:-260u;top:260u;width:780u;height:780u}
.tvmode .c3{left:260u;top:auto;bottom:-340u;width:660u;height:660u}
.tvmode .c4{left:860u;top:80u;width:380u;height:380u}
.tvmode .c5{right:380u;bottom:-300u;width:560u;height:560u}
.tvgrid{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 600u;gap:28u}
.tvq{padding:56u 72u;gap:0}
.tvqb{flex:1;display:flex;flex-direction:column;justify-content:center;gap:36u;min-height:0}
.tvquote{font-family:'Fraunces',Georgia,serif;font-weight:var(--nw,500);font-variation-settings:'opsz' 36;letter-spacing:-.02em;line-height:1.14}
.tvquote.qs{font-size:128u}.tvquote.qm{font-size:96u}.tvquote.ql{font-size:80u}
.tvattr{font-size:30u;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
.tvcol{display:flex;flex-direction:column;gap:28u;min-height:0}
.tvclock{padding:34u 40u;gap:12u}
.tvtime{display:flex;align-items:baseline;gap:14u}
.tvtn{font-size:156u;line-height:.95;letter-spacing:-.03em}
.tvtp{font-size:46u;font-weight:500;color:var(--muted)}
.tvdate{font-size:38u;font-weight:500}
.tvhr{height:1px;background:var(--line);margin:6u 0}
.tvwx{display:flex;align-items:center;gap:20u}
.tvwt{font-size:72u;line-height:1}
.tvwc{font-size:32u;font-weight:500}
.tvwh{font-size:25u;color:var(--muted)}
.tvcard{padding:36u 40u;flex:1;min-height:0;gap:22u;overflow:hidden}
.tvbody{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden}
.tvin{margin:auto 0;display:flex;flex-direction:column;gap:20u}
.tvbody.fit1 .tvin{gap:14u}.tvbody.fit1 .tvword{font-size:72u}.tvbody.fit1 .tvdef{font-size:31u}.tvbody.fit1 .tvex{font-size:27u}.tvbody.fit1 .tvhist{gap:22u}.tvbody.fit1 .tvt{font-size:28u}.tvbody.fit1 .tvy{font-size:40u;width:100u}
.tvbody.fit2 .tvin{gap:10u}.tvbody.fit2 .tvword{font-size:62u}.tvbody.fit2 .tvdef{font-size:28u}.tvbody.fit2 .tvex{font-size:24u}.tvbody.fit2 .tvhist{gap:16u}.tvbody.fit2 .tvt{font-size:25u}.tvbody.fit2 .tvy{font-size:34u;width:88u}
.tvbody.fit3 .tvex{display:none}.tvbody.fit3 .tvh:nth-child(3){display:none}
.tvbody.swap{animation:tvin .8s ease both}
@keyframes tvin{from{opacity:0;transform:translateY(12u)}to{opacity:1;transform:none}}
.tvword{font-size:86u;line-height:1}
.tvpron{font-size:26u;color:var(--muted)}
.tvdef{font-size:35u;line-height:1.28}
.tvex{font-size:30u;line-height:1.3;color:var(--muted)}
.tvhist{display:flex;flex-direction:column;gap:30u}
.tvh{display:flex;gap:24u;align-items:baseline}
.tvy{font-size:46u;width:112u;flex-shrink:0;color:var(--accent)}
.tvt{font-size:31u;line-height:1.25}
.tvfoot{display:flex;flex-direction:column;gap:16u}
.tvpills{display:flex;gap:12u}
.tvpill{padding:8u 24u;border-radius:999u;font-size:23u;font-weight:600;background:var(--chip)}
.tvpill.on{background:var(--accent);color:var(--on-accent)}
.tvbar{height:8u;border-radius:4u;background:var(--track);overflow:hidden}
.tvfill{height:100%;width:100%;background:var(--accent);border-radius:4u;transform-origin:left;transform:scaleX(0);animation-name:tvbar;animation-timing-function:linear;animation-iteration-count:infinite}
@keyframes tvbar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
/* Navigation */
.nav{position:absolute;left:40u;right:40u;bottom:30u;display:flex;justify-content:center;pointer-events:none;opacity:0;transform:translateY(10u);transition:opacity .18s ease,transform .18s ease}
.nav.show{opacity:1;transform:none}
.nav.show .navs,.nav.show .more{pointer-events:auto}
.more{position:absolute;right:0;top:7u;width:52u;height:52u;border-radius:50%;background:var(--chip);border:1px solid var(--chipb);backdrop-filter:blur(24u);-webkit-backdrop-filter:blur(24u);display:flex;align-items:center;justify-content:center;color:var(--ink)}
.more:active{opacity:.7}
.more.on{background:var(--accent);color:var(--on-accent);border-color:transparent}
.navs{display:flex;gap:8u;padding:6u;border-radius:999u;background:var(--chip);border:1px solid var(--chipb);backdrop-filter:blur(24u);-webkit-backdrop-filter:blur(24u)}
.navb{height:52u;min-width:150u;padding:0 24u;border-radius:999u;font-size:24u;font-weight:600}
.navb.on{background:var(--accent);color:var(--on-accent)}
`);

  /* ------------------------------------------------------------------ *
   * Page builders. They take a plain "vm" object and return HTML.
   * ------------------------------------------------------------------ */
  function peopleHtml(vm) {
    return '<div class="ppl" data-act="people">' + vm.people.map((p) => {
      const ring = p.home ? 'var(--accent)' : 'var(--ringoff)';
      const av = (vm.peopleStyle === 'photos' && p.pic)
        ? '<img class="av" style="border-color:' + ring + '" src="' + esc(p.pic) + '" alt="">'
        : '<div class="av ini" style="border-color:' + ring + '">' + esc(p.initial) + '</div>';
      return '<div class="per">' + av + '<div class="pn">' + esc(p.name) + '</div><div class="ps">' + esc(p.status) + '</div></div>';
    }).join('') + '</div>';
  }

  function hubEvent(e) {
    const time = e.allDay ? 'All day' : fmtTime(e.start);
    const sub = e.location || (e.allDay ? '' : 'Until ' + fmtTime(e.end));
    return '<div class="ev"><div class="et">' + esc(time) + '</div><div class="edot" style="background:' + esc(e.color) + '"></div>' +
      '<div class="etx"><div class="etl">' + esc(e.title) + '</div>' + (sub ? '<div class="esub">' + esc(sub) + '</div>' : '') + '</div></div>';
  }

  function hubHtml(vm) {
    const w = vm.weather;
    const hours = w.hours.map((h) => '<div class="hr"><div class="hl">' + esc(h.label) + '</div>' + ic(h.icon, 'i30 acc') + '<div class="serif ht">' + esc(h.temp) + '</div></div>').join('');
    const days = vm.hubDays.map((d) => '<div class="dl">' + esc(d.label) + '</div>' +
      (d.events.length ? d.events.map(hubEvent).join('') : '<div class="none">Nothing scheduled</div>')).join('');
    const c = vm.climate;
    const car = vm.car;
    const power = vm.power;
    const h = vm.house;
    const m = vm.media;
    const s = vm.systems;
    return '' +
      '<div class="hhead"><div class="clk"><div class="t"><div class="serif tn">' + esc(vm.time.hm) + '</div><div class="ta">' + esc(vm.time.ap) + '</div></div><div class="d">' + esc(vm.time.date) + '</div></div>' + peopleHtml(vm) + '</div>' +
      '<div class="grid">' +
      // weather
      '<div class="g weather"><div class="row">' + lab('sun', 'Today') + '<div class="sunl">' + esc(w.sunText) + '</div></div>' +
      '<div class="serif wtemp">' + esc(w.temp) + '</div>' +
      '<div><div class="serif wcond">' + esc(w.cond) + '</div><div class="wsub">' + esc(w.hilo) + '</div></div>' +
      '<div class="hours">' + hours + '</div></div>' +
      // coming up
      '<div class="g coming">' + lab('cal', 'Coming up') + days + '</div>' +
      // climate
      '<div class="g climate"><div class="row">' + lab('therm', 'Climate') + pill(c.pill, c.pillDot) + '</div>' +
      '<div class="cgrid"><div><div class="cl">' + esc(c.outLabel) + '</div><div class="serif cv">' + esc(c.out) + '</div></div>' +
      '<div><div class="cl">' + esc(c.inLabel) + '</div><div class="serif cv">' + esc(c.in) + '</div></div></div>' +
      '<div class="cfoot">' + esc(c.foot) + '</div></div>' +
      // car
      '<div class="g car"><div class="row">' + lab('zap', car.name) + pill(car.pill, car.pillDot) + '</div>' +
      '<div class="cbig"><div class="serif cpct">' + esc(car.level) + '<span>%</span></div><div class="crng">' + esc(car.range) + '</div></div>' +
      '<div class="bar"><div class="fill" style="width:' + car.pct + '%;background:' + car.color + '"></div></div>' +
      '<div class="cst">' + esc(car.status) + '</div>' +
      '<button class="btn" data-act="seat"><span class="ico' + (car.warming ? ' warm' : '') + '">' + ic('therm', 'i26') + '</span><span>' + esc(car.seatText) + '</span></button></div>' +
      // power
      '<div class="g power">' + lab('power', 'Power') +
      '<div class="pgrid ' + (power.items.length > 4 ? 'p6' : '') + '">' + power.items.map((i) =>
        '<button class="pb ' + (i.on ? 'on ' : '') + (i.unavailable ? 'un ' : '') + (power.items.length > 4 ? 'p6x' : '') + '" data-act="toggle" data-ent="' + esc(i.entity) + '"' + (i.confirm ? ' data-confirm="' + esc(i.confirm) + '" data-name="' + esc(i.name) + '" data-msg="' + esc(i.message) + '"' : '') + '><span class="a">' + esc(i.name) + '</span><span class="b">' + esc(i.stateText) + '</span></button>').join('') + '</div>' +
      '<div class="foot">' + ic('drop', 'i26') + '<span>' + esc(power.sprinkler) + '</span></div></div>' +
      // house
      '<div class="g house"><div class="row">' + lab('shield', 'House') + pill(h.pill, h.pillDot) + '</div>' +
      '<div><div class="hl1">' + esc(h.line1) + '</div><div class="hl2 ' + (h.leakBad ? 'bad' : '') + '">' + esc(h.line2) + '</div></div>' +
      '<div class="segs">' +
      '<button class="seg ' + (h.state === 'armed_away' ? 'on' : '') + '" data-act="alarm" data-svc="alarm_arm_away">Away</button>' +
      '<button class="seg ' + (h.state === 'armed_night' ? 'on' : '') + '" data-act="alarm" data-svc="alarm_arm_night">Night</button>' +
      '<button class="seg ' + (h.state === 'disarmed' ? 'on' : '') + '" data-act="alarm" data-svc="alarm_disarm">Disarm</button></div></div>' +
      // media
      '<div class="g media"><div class="row">' + lab('tv', vm.labels.media) + pill(m.pill, m.pillDot) + '</div>' +
      '<div class="mrow"><div><div class="mt">' + esc(m.name) + '</div><div class="ms">' + esc(m.sub) + '</div></div>' +
      '<button class="play" data-act="media" aria-label="' + (m.playing ? 'Pause' : 'Play') + '">' + ic(m.playing ? 'pause' : 'play', 'i32') + '</button></div></div>' +
      // systems
      '<div class="g sys" data-act="detail" data-id="systems"><div class="row">' + lab('pulse', 'Systems') + (s.issues.length ? warnPill(s.severe) : pill(s.pill, s.pillDot)) + '</div>' +
      (s.issues.length ? '<div class="wline"><span class="wi" style="color:' + (s.severe ? 'var(--alert)' : 'var(--caution)') + '">' + ic('warn', 'i24') + '</span><span class="wt">' + esc(s.issues[0]) + '</span>' + (s.issues.length > 1 ? '<span class="wm">+' + (s.issues.length - 1) + '</span>' : '') + '</div>' : '') +
      '<div class="srows"><div class="sr"><span class="muted">Last backup</span><span class="v">' + esc(s.backup) + '</span></div>' +
      '<div class="sr"><span class="muted">Sensor batteries</span><span class="v">' + esc(s.batteries) + '</span></div></div></div>' +
      '</div>';
  }

  function confirmHtml(c) {
    const verb = c.next === 'off' ? 'Turn off' : 'Turn on';
    return '<div class="dback" data-act="confirm-cancel"></div><div class="dbox">' +
      '<div class="serif dq">' + esc(verb) + ' ' + esc(c.name) + '?</div>' +
      (c.message ? '<div class="dmsg">' + esc(c.message) + '</div>' : '') +
      '<div class="dbtns"><button class="dbtn keep" data-act="confirm-cancel">Cancel</button>' +
      '<button class="dbtn go" data-act="confirm-go">' + esc(verb) + '</button></div></div>';
  }

  function detailHtml(vm) {
    const d = vm.detail;
    const sec = (icon, title, body) => '<div class="dsec">' + lab(icon, title) + body + '</div>';
    const kv = (rows) => rows.map((r) => '<div class="kv"><span class="muted">' + esc(r[0]) + '</span><span class="vv">' + esc(r[1]) + '</span></div>').join('');
    let h = '<div class="dback" data-act="detail-close"></div><div class="dpanel">';
    h += '<div class="drow0"><div class="serif dtitle">Systems</div><button class="dclose" data-act="detail-close">Close</button></div>';
    if (d.issues.length) h += sec('warn', 'Needs attention', d.issues.map((i, n) => '<div class="dissue' + (d.issueSev[n] ? ' sev' : '') + '">' + esc(i) + '</div>').join(''));
    // batteries
    let bat = d.pctList.map((p) => {
      const v = p.v == null ? null : Math.max(0, Math.min(100, p.v));
      const color = v == null ? 'var(--track)' : v <= 5 ? RED : v < 20 ? AMBER : GREEN;
      return '<div class="dbat"><span>' + esc(p.name) + '</span><div class="dbar"><div style="width:' + (v == null ? 0 : v) + '%;background:' + color + '"></div></div><span class="dv">' + (v == null ? '—' : Math.round(v) + '%') + '</span></div>';
    }).join('');
    bat += '<div class="dsub">The other sensors only report OK or Low, not a percentage.</div>';
    bat += '<div class="dchips">' + d.flagList.map((f) =>
      '<div class="dchip"><span class="dn">' + esc(f.name) + '</span><span class="badge ' + (f.off ? 'off' : f.low ? 'low' : '') + '">' + (f.off ? 'Offline' : f.na ? 'No data' : f.low ? 'Low' : 'OK') + '</span></div>').join('') + '</div>';
    h += sec('zap', 'Batteries', bat);
    h += sec('pulse', 'Backup', kv(d.backup));
    if (d.security.length) h += sec('shield', 'Security panel', kv(d.security));
    h += sec('drop', 'Irrigation', kv(d.irrigation));
    return h + '</div>';
  }

  function tvHtml(vm) {
    const t = vm.tv, w = vm.weather, q = t.quote, wd = t.word;
    const qs = q.text.length < 45 ? 'qs' : q.text.length < 95 ? 'qm' : 'ql';
    const body = t.panel === 'history'
      ? '<div class="tvhist">' + t.history.map((h) => '<div class="tvh"><div class="serif tvy">' + esc(h.year) + '</div><div class="tvt">' + esc(h.text) + '</div></div>').join('') + '</div>'
      : '<div class="serif tvword">' + esc(wd.word.charAt(0).toUpperCase() + wd.word.slice(1)) + '</div><div class="tvpron">' + esc(wd.pos) + (wd.pron ? ' \u00b7 ' + esc(wd.pron) : '') + '</div>' +
        '<div class="tvdef">' + esc(wd.def) + '</div>' + (wd.ex ? '<div class="serif tvex">\u201c' + esc(wd.ex) + '\u201d</div>' : '');
    const pills = t.panels.map((p) => '<div class="tvpill' + (p === t.panel ? ' on' : '') + '">' + (p === 'word' ? 'Word' : 'History') + '</div>').join('');
    return '<div class="tvgrid">' +
      '<div class="g tvq">' + lab('quote', 'Quote of the day') +
      '<div class="tvqb"><div class="tvquote ' + qs + '">\u201c' + esc(q.text) + '\u201d</div>' + (q.author ? '<div class="tvattr">' + esc(q.author) + '</div>' : '') + '</div></div>' +
      '<div class="tvcol">' +
      '<div class="g tvclock"><div class="tvtime"><div class="serif tvtn">' + esc(vm.time.hm) + '</div><div class="tvtp">' + esc(vm.time.ap) + '</div></div>' +
      '<div class="tvdate">' + esc(vm.time.date) + '</div><div class="tvhr"></div>' +
      '<div class="tvwx"><span class="acc" style="display:flex">' + ic(w.icon, 'i64') + '</span><div class="serif tvwt">' + esc(w.temp) + '</div>' +
      '<div><div class="tvwc">' + esc(w.cond) + '</div><div class="tvwh">' + esc(w.hilo) + '</div></div></div></div>' +
      '<div class="g tvcard">' + (t.panel === 'history' ? lab('clock', 'On this day \u00b7 ' + t.dateLabel) : lab('book', 'Word of the day')) +
      '<div class="tvbody' + (t.swap ? ' swap' : '') + '"><div class="tvin">' + body + '</div></div>' +
      '<div class="tvfoot"><div class="tvpills">' + pills + '</div><div class="tvbar"><div class="tvfill"></div></div></div></div>' +
      '</div></div>';
  }

  function todayEvent(e) {
    const sub = (e.allDay ? 'All day' : fmtTime(e.start) + ' – ' + fmtTime(e.end)) + (e.location ? ' · ' + e.location : '');
    return '<div class="tev"><div class="tdot" style="background:' + esc(e.color) + '"></div><div class="ttx"><div class="ttl">' + esc(e.title) + '</div><div class="tsub">' + esc(sub) + '</div></div></div>';
  }

  function todayHtml(vm) {
    const w = vm.weather;
    const days = vm.todayDays.map((d) =>
      '<div class="tday"><div class="tdn"><div class="tdd">' + esc(d.dow) + '</div><div class="tdnum">' + esc(d.num) + '</div></div><div class="tevs">' + d.events.map(todayEvent).join('') + '</div></div>').join('');
    return '' +
      '<div class="g tclock"><div class="trow"><div class="serif tbig">' + esc(vm.time.hm) + '</div><div class="tam">' + esc(vm.time.ap) + '</div></div>' +
      '<div class="tdate"><div class="tdt">' + esc(vm.time.date) + '</div><div class="twx">' + ic(w.icon, 'i64 acc') + '<div class="serif twt">' + esc(w.temp) + '</div></div></div></div>' +
      '<div class="g tcal" data-act="calsize">' + (days || '<div class="tnone">Nothing coming up</div>') + '</div>';
  }

  function navHtml(vm) {
    return '<div class="navs">' +
      '<button class="navb ' + (vm.page === 'hub' ? 'on' : '') + '" data-act="page" data-page="hub">Hub</button>' +
      '<button class="navb ' + (vm.page === 'today' ? 'on' : '') + '" data-act="page" data-page="today">Today</button></div>' +
      (vm.headerToggle ? '<button class="more' + (vm.headerOn ? ' on' : '') + '" data-act="header" aria-label="Show or hide the top bar">' + ic('dots', 'i28') + '</button>' : '');
  }

  /* Pick events for a page, stopping when the height budget is used up. */
  function groupEvents(events, now, opts) {
    const today = startOfDay(now);
    const list = events
      .filter((e) => (e.allDay ? e.end > today : e.end >= now))
      .map((e) => Object.assign({}, e, { day: e.start < today ? today : startOfDay(e.start) }))
      .sort((a, b) => (a.day - b.day) || ((b.allDay ? 1 : 0) - (a.allDay ? 1 : 0)) || (a.start - b.start));
    const days = [];
    let used = opts.head;
    let count = 0;
    if (opts.alwaysToday) { days.push({ day: today, events: [] }); used += opts.dayH + opts.emptyH; }
    for (const e of list) {
      if (count >= opts.max) break;
      let d = days.find((x) => +x.day === +e.day);
      const evH = opts.evH(e);
      const need = evH + (d ? 0 : opts.dayH);
      if (used + need > opts.budget) break;
      if (!d) { d = { day: e.day, events: [] }; days.push(d); }
      if (opts.alwaysToday && +d.day === +today && d.events.length === 0) used -= opts.emptyH;
      d.events.push(e);
      used += need;
      count++;
    }
    return days;
  }

  /* ------------------------------------------------------------------ *
   * The card
   * ------------------------------------------------------------------ */
  class HomeHubCard extends HTMLElement {
    constructor() {
      super();
      this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = '<style>' + CSS + '</style><div class="stage"><div class="circ c1"></div><div class="circ c2"></div><div class="circ c3"></div><div class="circ c4"></div><div class="circ c5"></div><div class="wrap"></div><div class="nav"></div><div class="dtl"></div><div class="dlg"></div><div class="dbg"></div></div>';
      this._stage = this._root.querySelector('.stage');
      this._wrap = this._root.querySelector('.wrap');
      this._nav = this._root.querySelector('.nav');
      this._dtl = this._root.querySelector('.dtl');
      this._dlg = this._root.querySelector('.dlg');
      this._lastDlg = '';
      this._confirm = null;
      this._lastDtl = '';
      this._detail = null;
      this._swapId = 0;
      this._anims = [];
      this._animating = false;
      this._dirty = false;
      this._dbg = this._root.querySelector('.dbg');
      this._lastNav = '';
      this._hass = null;
      this._cfg = null;
      this._last = '';
      this._hourly = [];
      this._daily = [];
      this._events = [];
      this._flash = {};
      this._lastTouch = Date.now();
      this._timers = [];
      this._started = false;
      this._H = 1920;
      this._root.addEventListener('click', (e) => this._onClick(e));
      this.addEventListener('pointerdown', () => { this._lastTouch = Date.now(); this._revealNav(); }, true);
    }

    setConfig(config) {
      const c = config || {};
      const cfg = Object.assign({}, DEFAULTS, c.entities || {});
      cfg.station = Object.assign({}, DEFAULTS.station, (c.entities && c.entities.station) || {});
      cfg.idle = typeof c.idle_return_seconds === 'number' ? c.idle_return_seconds : 120;
      cfg.defaultPage = c.default_page === 'hub' ? 'hub' : 'today';
      cfg.vibrance = typeof c.vibrance === 'number' ? c.vibrance : 1;
      cfg.calendarScale = typeof c.calendar_scale === 'number' ? Math.min(1.2, Math.max(0.5, c.calendar_scale)) : 0.85;
      cfg.fitParent = !!c.fit_parent;
      cfg.layout = c.layout === 'tv' ? 'tv' : 'tablet';
      cfg.quoteSource = c.quote_source === 'builtin' ? 'builtin' : 'web';
      cfg.wordSource = c.word_source === 'builtin' ? 'builtin' : 'web';
      cfg.rotateSeconds = typeof c.rotate_seconds === 'number' ? Math.min(600, Math.max(10, c.rotate_seconds)) : 45;
      cfg.quotes = Array.isArray(c.quotes) ? c.quotes.filter((x) => x && x.text) : null;
      cfg.pageTransition = ['slide', 'fade', 'none'].indexOf(c.page_transition) >= 0 ? c.page_transition : 'slide';
      cfg.transitionMs = typeof c.transition_ms === 'number' ? Math.min(1500, Math.max(100, c.transition_ms)) : 420;
      cfg.numberWeight = typeof c.number_weight === 'number' ? Math.min(700, Math.max(400, c.number_weight)) : 500;
      cfg.debug = !!c.debug;
      cfg.navAutohide = typeof c.nav_autohide_seconds === 'number' ? c.nav_autohide_seconds : 7;
      cfg.headerAutohide = typeof c.header_autohide_seconds === 'number' ? c.header_autohide_seconds : 90;
      cfg.peopleStyle = c.people_style === 'initials' ? 'initials' : 'photos';
      this._cfg = cfg;
      this._stage.classList.toggle('navfixed', cfg.navAutohide === 0);
      this._stage.classList.toggle('tvmode', cfg.layout === 'tv');
      this._nav.classList.toggle('show', cfg.navAutohide === 0);
      if (!this._page) this._page = cfg.defaultPage;
      let saved = null;
      try { saved = window.localStorage.getItem('home_hub_people_style'); } catch (e) { /* ignore */ }
      let cs = null;
      try { cs = parseFloat(window.localStorage.getItem('home_hub_cal_scale')); } catch (e) { /* ignore */ }
      this._calLocal = isFinite(cs) && cs >= 0.5 && cs <= 1.2 ? cs : null;
      this._peopleStyle = saved === 'photos' || saved === 'initials' ? saved : cfg.peopleStyle;
    }

    set hass(hass) {
      this._hass = hass;
      if (!this._cfg) return;
      if (!this._started) this._start();
      this._schedule();
    }

    getCardSize() { return 12; }

    connectedCallback() {
      if (!document.getElementById('home-hub-fonts')) {
        const l = document.createElement('link');
        l.id = 'home-hub-fonts';
        l.rel = 'stylesheet';
        l.href = FONT_HREF;
        document.head.appendChild(l);
      }
      this._ro = new ResizeObserver(() => this._resize());
      this._ro.observe(this);
      if (this._cfg && this._cfg.fitParent && this.parentElement) this._ro.observe(this.parentElement);
      this._onWin = () => this._resize();
      window.addEventListener('resize', this._onWin);
      requestAnimationFrame(() => this._resize());
    }

    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
      if (this._onWin) window.removeEventListener('resize', this._onWin);
      this._timers.forEach((t) => clearInterval(t));
      this._timers = [];
      this._started = false;
    }

    _calScale() { return this._calLocal != null ? this._calLocal : this._cfg.calendarScale; }

    /* Hub and Today are ordered left to right like the switch. Going right pushes the old page out to the
       left and brings the new one in from the right; going left does the opposite.
       Tablet-friendly: only transform moves; the frosted blur is swapped for flat glass while it moves (blurring
       two full pages on every frame is what makes a tablet stutter); the animation starts a couple of frames
       after the new page is built so the build work doesn't land mid-move; and other redraws wait until it ends. */
    _swapPages(html, page) {
      const mode = this._cfg.pageTransition;
      const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (mode === 'none' || reduce || typeof this._wrap.animate !== 'function') { this._wrap.innerHTML = html; return; }
      this._endSwap();
      const id = ++this._swapId;
      const order = ['hub', 'today'];
      const dir = order.indexOf(page) >= order.indexOf(this._shownPage) ? 1 : -1;
      const w = this._stage.clientWidth || this.clientWidth || 1080;
      const ms = this._cfg.transitionMs;
      const fade = mode === 'fade';
      const out = this._wrap.cloneNode(true);
      out.classList.add('out', 'moving');
      this._stage.insertBefore(out, this._nav);
      this._out = out;
      this._wrap.innerHTML = html;
      this._wrap.classList.add('moving');
      const parked = fade ? '' : 'translateX(' + (dir * w) + 'px)';
      if (fade) this._wrap.style.opacity = '0'; else this._wrap.style.transform = parked;
      this._animating = true;
      let started = false;
      const finish = () => {
        if (id !== this._swapId) return;
        this._endSwap();
        if (this._dirty) { this._dirty = false; this._schedule(); }
      };
      const start = () => {
        if (started || id !== this._swapId) return;
        started = true;
        const ease = fade ? 'ease' : 'cubic-bezier(.22,.8,.3,1)';
        const opts = { duration: ms, easing: ease, fill: 'both' };
        const k1 = fade ? [{ opacity: 1 }, { opacity: 0 }] : [{ transform: 'translateX(0)' }, { transform: 'translateX(' + (-dir * w) + 'px)' }];
        const k2 = fade ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: parked }, { transform: 'translateX(0)' }];
        const a1 = out.animate(k1, opts);
        const a2 = this._wrap.animate(k2, opts);
        this._anims = [a1, a2];
        a2.onfinish = finish;
      };
      requestAnimationFrame(() => requestAnimationFrame(start));
      setTimeout(start, 120);
      setTimeout(finish, ms + 600);
    }

    _endSwap() {
      (this._anims || []).forEach((a) => { try { a.cancel(); } catch (e) { /* ignore */ } });
      this._anims = [];
      if (this._out) { this._out.remove(); this._out = null; }
      this._wrap.style.transform = '';
      this._wrap.style.opacity = '';
      this._wrap.classList.remove('moving');
      this._animating = false;
    }

    _revealNav() {
      if (!this._cfg || this._cfg.navAutohide === 0 || this._cfg.layout === 'tv') return;
      this._nav.classList.add('show');
      clearTimeout(this._navTimer);
      this._navTimer = setTimeout(() => this._nav.classList.remove('show'), this._cfg.navAutohide * 1000);
    }

    _isCompact(H) { return !(this._cfg && this._cfg.layout === 'tv') && H < (this._cfg && this._cfg.navAutohide === 0 ? 1850 : 1820); }

    _resize() {
      const w = this.clientWidth;
      if (!w) return;
      const top = Math.max(0, this.getBoundingClientRect().top);
      const h = this._cfg && this._cfg.fitParent && this.parentElement
        ? Math.max(300, Math.floor(this.parentElement.clientHeight))
        : Math.max(this._cfg && this._cfg.layout === 'tv' ? 300 : 600, Math.floor(window.innerHeight - top));
      // Tablet: fit the width, shrink further only if very short. TV: fit a 1920 x 1080 canvas.
      const u = this._cfg && this._cfg.layout === 'tv' ? Math.min(w / 1920, h / 1080) : Math.min(w / 1080, h / 1700);
      this._u = u;
      this._H = h / u;
      this.style.setProperty('--u', u + 'px');
      this.style.height = h + 'px';
      this._stage.classList.toggle('compact', this._isCompact(this._H));
      if (this._cfg && this._cfg.layout === 'tv') this._fitTv();
      this._schedule();
    }

    _start() {
      this._started = true;
      this._revealNav();
      this._loadForecast();
      this._timers.push(setInterval(() => this._loadForecast(), 20 * 60 * 1000));
      if (this._cfg.layout !== 'tv') {
        this._loadCalendars();
        this._timers.push(setInterval(() => this._loadCalendars(), 5 * 60 * 1000));
      }
      this._timers.push(setInterval(() => this._tick(), 5000));
    }

    _tick() {
      if (this._detail && Date.now() - this._lastTouch > 45000) this._detail = null;
      const ht = this._cfg.header_toggle;
      if (ht && this._hass && this._st(ht) === 'on' && this._cfg.headerAutohide > 0 && Date.now() - this._lastTouch > this._cfg.headerAutohide * 1000 && Date.now() - (this._hdrCall || 0) > 10000) {
        this._hdrCall = Date.now();
        this._hass.callService('input_boolean', 'turn_off', { entity_id: ht });
      }
      if (this._cfg.idle > 0 && this._page !== this._cfg.defaultPage && Date.now() - this._lastTouch > this._cfg.idle * 1000) {
        this._page = this._cfg.defaultPage;
      }
      this._schedule();
    }

    _schedule() {
      if (this._pending) return;
      this._pending = setTimeout(() => { this._pending = null; this._render(); }, 200);
    }

    async _loadForecast() {
      const id = this._cfg.weather;
      const call = async (type) => {
        const res = await this._hass.callWS({
          type: 'call_service', domain: 'weather', service: 'get_forecasts',
          service_data: { type }, target: { entity_id: id }, return_response: true,
        });
        return (res && res.response && res.response[id] && res.response[id].forecast) || [];
      };
      try { this._hourly = await call('hourly'); } catch (e) { /* keep old */ }
      try { this._daily = await call('daily'); } catch (e) { /* keep old */ }
      this._schedule();
    }

    async _loadCalendars() {
      const start = startOfDay(new Date());
      const end = new Date(start); end.setDate(end.getDate() + 14);
      const q = '?start=' + encodeURIComponent(start.toISOString()) + '&end=' + encodeURIComponent(end.toISOString());
      const all = await Promise.all(this._cfg.calendars.map(async (cal) => {
        try {
          const raw = await this._hass.callApi('GET', 'calendars/' + cal.entity + q);
          return (raw || []).map((e) => {
            const sd = e.start && (e.start.date || e.start.dateTime || e.start);
            const ed = e.end && (e.end.date || e.end.dateTime || e.end);
            const allDay = !!(e.start && e.start.date) || (typeof sd === 'string' && sd.length === 10);
            return {
              title: e.summary || '', location: e.location || '', allDay,
              start: allDay ? parseDateOnly(sd) : new Date(sd),
              end: allDay ? parseDateOnly(ed) : new Date(ed),
              color: cal.color,
            };
          });
        } catch (err) { return null; }
      }));
      // Keep earlier events for any calendar that failed this round.
      if (all.every((a) => a === null)) return;
      this._events = all.map((a) => a || []).flat();
      this._schedule();
    }

    _st(id) { const s = id && this._hass.states[id]; return s ? s.state : undefined; }
    _at(id, k) { const s = id && this._hass.states[id]; return s && s.attributes ? s.attributes[k] : undefined; }
    _name(id) { return this._at(id, 'friendly_name') || cap(String(id).split('.').pop()); }
    _val(id) { const s = this._st(id); return s === undefined || s === 'unknown' || s === 'unavailable' ? null : num(s); }

    _compute() {
      const cfg = this._cfg;
      const now = new Date();
      const st = (id) => this._st(id);

      // theme
      const sel = st(cfg.theme_entity);
      const theme = !sel || sel === 'Auto' || sel === 'unknown' || sel === 'unavailable' ? autoTheme(now) : (THEMES[sel] ? sel : 'Default');

      // clock
      let h = now.getHours(); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
      const time = { hm: h + ':' + pad2(now.getMinutes()), ap, date: fmtDay(now) };

      // weather
      const wid = cfg.weather;
      const cond = st(wid);
      const st2 = cfg.station;
      const stationOut = st2.outdoor_temp ? this._val(st2.outdoor_temp) : null;
      const curTemp = stationOut != null ? stationOut : num(this._at(wid, 'temperature'));
      const hourFloor = new Date(now); hourFloor.setMinutes(0, 0, 0);
      const next = (this._hourly || []).filter((f) => new Date(f.datetime) >= hourFloor).slice(0, 6);
      const hours = next.map((f, i) => ({
        label: i === 0 ? 'Now' : fmtHour(new Date(f.datetime)),
        icon: COND_ICON[f.condition] || 'cloud',
        temp: deg(num(f.temperature)),
      }));
      let hi = null, lo = null;
      const todayD = (this._daily || []).find((f) => dayDiff(new Date(f.datetime), now) === 0) || (this._daily || [])[0];
      if (todayD) { hi = num(todayD.temperature); lo = num(todayD.templow); }
      if (hi == null && next.length) { const ts = next.map((f) => num(f.temperature)).filter((x) => x != null); if (ts.length) { hi = Math.max.apply(null, ts); lo = Math.min.apply(null, ts); } }
      const rise = new Date(st(cfg.sun_rising) || NaN);
      const set = new Date(st(cfg.sun_setting) || NaN);
      let sunText = '';
      if (!isNaN(set) && (isNaN(rise) || set < rise)) sunText = 'Sunset ' + fmtTime(set);
      else if (!isNaN(rise)) sunText = 'Sunrise ' + fmtTime(rise);
      const weather = {
        temp: deg(curTemp),
        cond: !cond || cond === 'unavailable' || cond === 'unknown' ? 'Weather unavailable' : (COND_LABEL[cond] || cap(cond)),
        icon: COND_ICON[cond] || 'cloud',
        hilo: hi == null ? '' : 'High ' + deg(hi) + ' · Low ' + deg(lo),
        sunText, hours,
      };

      // climate
      const outT = stationOut != null ? stationOut : num(this._at(wid, 'temperature'));
      const outH = st2.outdoor_humidity ? this._val(st2.outdoor_humidity) : num(this._at(wid, 'humidity'));
      const inT = st2.indoor_temp ? this._val(st2.indoor_temp) : null;
      const inH = st2.indoor_humidity ? this._val(st2.indoor_humidity) : null;
      let foot = 'Thermostat not linked yet';
      if (cfg.thermostat && st(cfg.thermostat)) {
        const ct = num(this._at(cfg.thermostat, 'current_temperature'));
        foot = 'Thermostat ' + deg(ct) + ' · ' + cap(st(cfg.thermostat));
      }
      const climate = {
        pill: st2.outdoor_temp ? 'Weather station' : 'Forecast only',
        pillDot: st2.outdoor_temp ? 'var(--accent)' : 'var(--muted)',
        outLabel: 'Outside' + (outH != null ? ' · ' + Math.round(outH) + '%' : ''),
        inLabel: 'Inside' + (inH != null ? ' · ' + Math.round(inH) + '%' : ''),
        out: deg(outT), in: deg(inT), foot,
      };

      // car
      const car = cfg.car;
      const lvl = this._val(car.battery);
      const rng = this._val(car.range);
      const charging = st(car.charging);
      const plugged = st(car.cable) === 'on';
      const isCharging = charging === 'charging' || charging === 'starting';
      const chargeText = { complete: 'Charging complete', charging: 'Charging', starting: 'Starting to charge', stopped: 'Charging stopped', disconnected: 'Not charging', nopower: 'No power' }[charging] || (charging && charging !== 'unavailable' && charging !== 'unknown' ? cap(charging) : '');
      const lockText = st(car.lock) === 'locked' ? 'Locked' : st(car.lock) === 'unlocked' ? 'Unlocked' : '';
      const seatBusy = st(car.seat_script) === 'on' || (this._flash.seat && this._flash.seat > Date.now());
      const carVm = {
        name: car.name,
        pill: isCharging ? 'Charging' : plugged ? 'Plugged in' : 'Not plugged in',
        pillDot: isCharging ? AMBER : plugged ? GREEN : 'var(--muted)',
        level: lvl == null ? '—' : String(Math.round(lvl)),
        pct: lvl == null ? 0 : Math.max(0, Math.min(100, lvl)),
        color: lvl != null && lvl < 10 ? RED : lvl != null && lvl < 20 ? AMBER : 'var(--accent)',
        range: rng == null ? '' : Math.round(rng) + ' mi',
        status: [chargeText, lockText].filter(Boolean).join(' · '),
        seatText: seatBusy ? 'Warming…' : cfg.seat_label,
        warming: !!seatBusy,
      };

      // power
      const items = cfg.power.map((p) => {
        const s = st(p.entity);
        const unavailable = s === undefined || s === 'unavailable' || s === 'unknown';
        return { entity: p.entity, name: p.name, confirm: p.confirm || '', message: p.confirm_message || '', on: s === 'on', unavailable, stateText: unavailable ? 'Unavailable' : s === 'on' ? 'On' : 'Off', hide: p.hide_when_unavailable && unavailable };
      }).filter((i) => !i.hide).slice(0, 6);
      const sp = cfg.sprinkler;
      const zonesOn = sp.zones.filter((z) => st(z) === 'on').map((z) => String(this._name(z)).replace(sp.prefix, '').trim());
      let sprinkler = 'Sprinklers · all zones off';
      if (st(sp.standby) === 'on') sprinkler = 'Sprinklers · standby';
      else if (st(sp.rain_delay) === 'on') sprinkler = 'Sprinklers · rain delay';
      else if (zonesOn.length) sprinkler = 'Watering · ' + zonesOn.join(', ');

      // house
      const alarmState = st(cfg.alarm) || 'unknown';
      const open = cfg.doors.concat(cfg.windows).filter((d) => st(d.entity) === 'on').map((d) => d.name);
      const wet = cfg.leaks.filter((l) => st(l.entity) === 'on').map((l) => l.name);
      const alarmPill = { disarmed: ['Disarmed', 'var(--accent)'], armed_away: ['Armed · away', 'var(--accent)'], armed_night: ['Armed · night', 'var(--accent)'], armed_home: ['Armed · home', 'var(--accent)'], arming: ['Arming…', AMBER], pending: ['Pending…', AMBER], triggered: ['Triggered', RED] }[alarmState] || ['Unknown', 'var(--muted)'];
      const house = {
        state: alarmState, pill: alarmPill[0], pillDot: alarmPill[1],
        line1: open.length ? open.length + ' open: ' + open.slice(0, 2).join(', ') + (open.length > 2 ? ' +' + (open.length - 2) : '') : cfg.doors.length + ' doors · ' + cfg.windows.length + ' windows closed',
        line2: wet.length ? 'Leak: ' + wet.join(', ') : cfg.leaks.length + ' leak sensors dry',
        leakBad: wet.length > 0,
      };

      // media
      const ms = st(cfg.media);
      const appRaw = this._at(cfg.media, 'source') || st(cfg.media_app) || '';
      const appName = /^(roku( dynamic menu)?|home|home screen|unknown|unavailable)?$/i.test(String(appRaw).trim()) ? 'Home screen' : appRaw;
      const mediaTitle = this._at(cfg.media, 'media_title');
      const msText = { playing: 'Playing', paused: 'Paused', idle: 'Idle', standby: 'Off', off: 'Off', on: 'On', unavailable: 'Unavailable' }[ms] || cap(ms || 'unknown');
      const media = {
        name: String(this._name(cfg.media)).replace(cfg.media_label, '').trim() || 'Media player',
        sub: ms === 'off' || ms === 'standby' ? 'Screen off' : (mediaTitle || appName),
        pill: msText, pillDot: ms === 'playing' ? GREEN : 'var(--muted)', playing: ms === 'playing',
      };

      // systems
      const issues = [];
      let severe = false;
      const sevList = [];
      const add = (text, high) => { issues.push(text); sevList.push(!!high); if (high) severe = true; };
      const ap2 = (k) => this._at(cfg.alarm, k);
      const panelOff = st(cfg.alarm) === 'unavailable';
      const offline = new Set();
      const baseName = (id) => pretty(String(this._name(id)).replace(/\s+(door|moisture)$/i, ''));
      if (wet.length) add('Leak detected: ' + wet.join(', '), true);
      if (panelOff) add('Security: SimpliSafe offline (panel and sensors)', true);
      if (ap2('rf_jamming')) add('Security: possible RF jamming', true);
      if (ap2('wall_power_level') != null && num(ap2('wall_power_level')) < 500) add('Security: running on battery backup', true);
      if (ap2('battery_backup_power_level') != null && num(ap2('battery_backup_power_level')) < 2000) add('Security: battery backup low', false);
      if (ap2('wifi_strength') != null && num(ap2('wifi_strength')) < -80) add('Security: weak Wi-Fi signal', false);
      if (st(sp.connectivity) === 'off') add('Irrigation: controller offline', true);
      if (st(sp.rain) === 'on') add('Irrigation: rain detected, watering paused', false);
      if (st(sp.rain_delay) === 'on') add('Irrigation: rain delay active', false);
      if (st(sp.standby) === 'on') add('Irrigation: controller in standby', false);
      Object.keys(this._hass.states).forEach((id) => {
        if (!/^binary_sensor\..*_battery$/.test(id)) return;
        const v = this._hass.states[id].state;
        if (v === 'on') add('Low battery: ' + pretty(this._name(id)), false);
        else if (v === 'unavailable') offline.add(baseName(id));
      });
      const bats = cfg.battery_sensors.map((id) => this._val(id)).filter((x) => x != null);
      cfg.battery_sensors.forEach((id) => {
        const nm = (cfg.battery_names && cfg.battery_names[id]) || pretty(this._name(id));
        const v = this._val(id);
        if (st(id) === 'unavailable') add('Offline: ' + nm, true);
        else if (v != null && v <= 5) add('Dead battery: ' + nm + ' ' + Math.round(v) + '%', true);
        else if (v != null && v < 20) add('Low battery: ' + nm + ' ' + Math.round(v) + '%', false);
      });
      cfg.doors.concat(cfg.windows, cfg.leaks).forEach((d) => { if (st(d.entity) === 'unavailable') offline.add(baseName(d.entity)); });
      const reg = this._hass.entities || {};
      Object.keys(reg).forEach((id) => {
        if (reg[id] && reg[id].platform === 'simplisafe' && id !== cfg.alarm && st(id) === 'unavailable') offline.add(baseName(id));
      });
      if (!panelOff) offline.forEach((n) => add('Sensor offline: ' + n, true));
      const bk = st(cfg.backup);
      const bkDate = new Date(bk || NaN);
      if (!isNaN(bkDate) && dayDiff(now, bkDate) >= 3) add('Backup is overdue', true);
      if (!issues.length && st(cfg.system_problem) === 'on') add('Home Assistant reports a system problem', true);
      // serious issues first, so the one-line note on the card shows the worst one
      const ordered = issues.map((t, i) => ({ t, h: sevList[i] })).sort((x, y) => (y.h ? 1 : 0) - (x.h ? 1 : 0));
      issues.splice(0, issues.length, ...ordered.map((o) => o.t));
      sevList.splice(0, sevList.length, ...ordered.map((o) => o.h));
      const flagList = Object.keys(this._hass.states).filter((id) => /^binary_sensor\..*_battery$/.test(id)).map((id) => {
        const v = this._hass.states[id].state;
        return { name: pretty(this._name(id)), low: v === 'on', off: v === 'unavailable', na: v === 'unavailable' || v === 'unknown' };
      }).sort((a, b) => (b.low - a.low) || a.name.localeCompare(b.name));
      const pctList = cfg.battery_sensors.map((id) => ({ name: (cfg.battery_names && cfg.battery_names[id]) || pretty(this._name(id)), v: this._val(id) }))
        .sort((a, b) => ((a.v == null) - (b.v == null)) || (a.v - b.v));
      const lowFlags = flagList.filter((f) => f.low).length;
      const pctLow = bats.length && Math.min.apply(null, bats) < 20;
      const systems = {
        issues, severe, pill: issues.length ? 'Warning' : 'All normal', pillDot: GREEN,
        backup: fmtBackup(bk),
        batteries: pctLow ? 'Low · ' + Math.round(Math.min.apply(null, bats)) + '%' : lowFlags ? 'Low · tap for details' : bats.length ? 'OK · lowest ' + Math.round(Math.min.apply(null, bats)) + '%' : '—',
      };
      const wp = num(ap2('wall_power_level')), bb = num(ap2('battery_backup_power_level')), wf = num(ap2('wifi_strength'));
      const security = [];
      if (wp != null) security.push(['Wall power', wp < 500 ? 'On battery backup' : 'Normal']);
      if (bb != null) security.push(['Backup battery', bb < 2000 ? 'Low' : 'OK']);
      if (wf != null) security.push(['Wi-Fi signal', Math.round(wf) + ' dBm' + (wf < -80 ? ' (weak)' : '')]);
      if (ap2('rf_jamming') != null) security.push(['RF jamming', ap2('rf_jamming') ? 'Detected' : 'None']);
      const onoff = (id) => (st(id) === 'on' ? 'On' : st(id) === 'off' ? 'Off' : 'Unknown');
      const irrigation = [
        ['Controller', st(sp.connectivity) === 'on' ? 'Online' : st(sp.connectivity) === 'off' ? 'Offline' : 'Unknown'],
        ['Rain sensor', st(sp.rain) === 'on' ? 'Rain detected' : st(sp.rain) === 'off' ? 'Dry' : 'Unknown'],
        ['Rain delay', onoff(sp.rain_delay)], ['Standby', onoff(sp.standby)],
        ['Watering now', zonesOn.length ? zonesOn.join(', ') : 'Nothing'],
      ];
      const nextBk = st(cfg.backup_next);
      const backupRows = [['Last successful', fmtBackup(bk)], ['Next scheduled', fmtBackup(nextBk)], ['Backup manager', cap(st(cfg.backup_state) || 'unknown')]];
      const detail = { issues, issueSev: sevList, pctList, flagList, security, irrigation, backup: backupRows };

      // people
      const people = cfg.people.map((p) => {
        const stt = st(p.status) || st(p.entity) || '';
        const home = String(st(p.entity)).toLowerCase() === 'home' || String(stt).toLowerCase() === 'home';
        return { name: p.name, initial: p.name.charAt(0), status: cap(stt), home, pic: this._at(p.entity, 'entity_picture') };
      });

      // calendar
      const H = this._H || 1920;
      const cs = this._calScale();
      const fixedNav = cfg.navAutohide === 0;
      const compact = this._isCompact(H);
      const label = (d) => { const diff = dayDiff(d, now); return diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : DOW3[d.getDay()] + ' ' + d.getDate(); };
      const hubDays = groupEvents(this._events, now, { head: 0, dayH: 38, evH: () => 78, emptyH: 78, budget: Math.round(H / 2 - (fixedNav ? 274 : 233) + (compact ? 12 : 0)), max: 8, alwaysToday: true })
        .map((d) => ({ label: label(d.day), events: d.events }));
      const todayDays = groupEvents(this._events, now, { head: 0, dayH: 46 * cs, evH: (e) => (145 + (String(e.title).length > Math.floor(21 / cs) ? 69 : 0)) * cs, emptyH: 0, budget: Math.round((fixedNav ? 1250 : 1330) + (H - 1920) + (compact ? 12 : 0)), max: 9, alwaysToday: false })
        .map((d) => ({ dow: DOW3[d.day.getDay()], num: String(d.day.getDate()), events: d.events }));

      const headerToggle = !!(cfg.header_toggle && st(cfg.header_toggle) !== undefined);
      const headerOn = headerToggle && st(cfg.header_toggle) === 'on';
      return { labels: { media: cfg.media_label }, detail, headerToggle, headerOn, theme, page: this._page, time, weather, climate, car: carVm, power: { items, sprinkler }, house, media, systems, people, peopleStyle: this._peopleStyle, hubDays, todayDays };
    }

    _render() {
      if (!this._hass || !this._cfg) return;
      if (this._animating) { this._dirty = true; return; }
      let vm;
      try { vm = this._compute(); } catch (err) { console.error('home-hub-card', err); return; }
      if (this._cfg.layout === 'tv') { this._renderTv(vm); return; }
      this._applyTokens(themeVals(vm.theme, this._cfg.vibrance));
      const html = '<div class="page">' + (vm.page === 'hub' ? hubHtml(vm) : todayHtml(vm)) + '</div>';
      this._paintTablet(vm, html);
    }

    _applyTokens(tv) {
      const set = (k, v) => this._stage.style.setProperty(k, v);
      set('--nw', String(this._cfg.numberWeight));
      set('--cs', String(this._calScale()));
      set('--base', tv.base); set('--c1', tv.c1); set('--c2', tv.c2); set('--c3', tv.c3); set('--c4', tv.c4); set('--c5', tv.c5);
      set('--accent', tv.accent); set('--on-accent', tv.onAccent); set('--ink', tv.ink); set('--muted', tv.muted);
      set('--glass', tv.glass); set('--gborder', tv.gborder); set('--gshadow', tv.gshadow); set('--chip', tv.chip); set('--chipb', tv.chipb);
      set('--btn', tv.btn); set('--btnb', tv.btnb); set('--line', tv.line); set('--track', tv.track); set('--ringoff', tv.ringoff); set('--halo', tv.halo); set('--panel', tv.panel); set('--alert', tv.alert); set('--on-alert', tv.onAlert); set('--caution', tv.caution); set('--glass-flat', tv.glassFlat);
    }

    _fitTv() {
      const body = this._wrap && this._wrap.querySelector && this._wrap.querySelector('.tvbody');
      if (!body || typeof body.scrollHeight !== 'number') return;
      body.classList.remove('fit1', 'fit2', 'fit3');
      for (let i = 1; i <= 3 && body.scrollHeight > body.clientHeight + 1; i++) body.classList.add('fit' + i);
    }

    _renderTv(vm) {
      vm.tv = this._tvContent(new Date());
      const tv = themeVals(vm.theme, this._cfg.vibrance);
      // No blur on the TV: a stick-sized browser struggles with it, so the glass is a little more opaque instead.
      tv.glass = (THEMES[vm.theme] || THEMES['Default']).mode === 'dark' ? 'rgba(14,20,32,0.72)' : 'rgba(255,255,255,0.62)';
      this._applyTokens(tv);
      const html = '<div class="page">' + tvHtml(vm) + '</div>';
      if (html !== this._last) {
        this._wrap.innerHTML = html;
        this._last = html;
        const f = this._wrap.querySelector('.tvfill');
        if (f) { f.style.animationDuration = vm.tv.period + 's'; f.style.animationDelay = '-' + vm.tv.phase.toFixed(2) + 's'; }
        this._fitTv();
        if (!this._fontsHooked && document.fonts && document.fonts.ready) { this._fontsHooked = true; document.fonts.ready.then(() => this._fitTv()); }
      }
      this._nav.classList.remove('show');
      if (this._cfg.debug) this._dbg.textContent = 'v' + VERSION + ' · tv · ' + Math.round(this.clientWidth) + 'px wide · scale ' + (this._u || 0).toFixed(3) + ' · ' + vm.tv.panel + ' (' + vm.tv.period + 's) · quote: ' + this._srcQuote + ' · word: ' + this._srcWord + ' · history: ' + (vm.tv.history.length ? 'web' : 'none');
      else if (this._dbg.textContent) this._dbg.textContent = '';
    }

    /* Quote and word follow the day of the year; the history panel needs Wikipedia's feed and is skipped if it can't load. */
    _tvContent(now) {
      const cfg = this._cfg;
      const doy = dayOfYear(now);
      const hist = this._histFor(now);
      const panels = hist && hist.length ? ['word', 'history'] : ['word'];
      const period = cfg.rotateSeconds * 1000;
      const panel = panels[Math.floor(now.getTime() / period) % panels.length];
      const swap = this._tvShown !== undefined && this._tvShown !== panel;
      this._tvShown = panel;
      return {
        panel, panels, swap, period: cfg.rotateSeconds, phase: (now.getTime() % period) / 1000,
        quote: this._quoteFor(now, doy), word: this._wordFor(now, doy),
        history: hist || [], dateLabel: MON3[now.getMonth()] + ' ' + now.getDate(),
      };
    }

    /* Quote of the day: your own list if you gave one; otherwise a big online list (same quote on every screen
       each day, cached on the device), falling back to the built-in list when it can't load. */
    _quoteFor(now, doy) {
      const cfg = this._cfg;
      if (cfg.quotes && cfg.quotes.length) { this._srcQuote = 'your list'; return cfg.quotes[doy % cfg.quotes.length]; }
      if (cfg.quoteSource === 'web') {
        const list = this._webQuoteList();
        if (list && list.length) { const q = list[dayNumber(now) % list.length]; this._srcQuote = 'web (' + list.length + ')'; return { text: q[0], author: q[1] }; }
      }
      this._srcQuote = 'built-in (' + QUOTES.length + ')';
      return QUOTES[doy % QUOTES.length];
    }

    _webQuoteList() {
      if (this._webQuotes) return this._webQuotes;
      const cached = lsGet('home_hub_quotes_v1');
      const fresh = cached && Array.isArray(cached.list) && cached.list.length > 50 && Date.now() - cached.at < 14 * 86400000;
      if (fresh) { this._webQuotes = cached.list; return cached.list; }
      const stale = cached && Array.isArray(cached.list) && cached.list.length > 50 ? cached.list : null;
      if (typeof fetch !== 'function' || this._quotesBusy || (this._quotesFail && Date.now() - this._quotesFail < 30 * 60 * 1000)) return stale;
      this._quotesBusy = true;
      fetchJson(QUOTE_FEED, 20000).then((data) => {
        const list = ((data && data.quotes) || []).filter((q) => q && q.quote && q.quote.length <= 140).map((q) => [String(q.quote), String(q.author || '')]);
        if (list.length < 50) throw new Error('too few');
        this._webQuotes = list; this._quotesBusy = false; lsSet('home_hub_quotes_v1', { at: Date.now(), list }); this._schedule();
      }).catch(() => { this._quotesFail = Date.now(); this._quotesBusy = false; });
      return stale;
    }

    /* Word of the day: a word from the big list (one per day), with its definition, pronunciation and example
       looked up online. Until that arrives, or if it can't, the built-in entries are used. */
    _wordFor(now, doy) {
      const cfg = this._cfg;
      const builtin = WORDS[(doy + 7) % WORDS.length];
      if (cfg.wordSource !== 'web' || typeof fetch !== 'function') { this._srcWord = 'built-in (' + WORDS.length + ')'; return builtin; }
      const key = isoDay(now);
      this._words = this._words || {};
      const have = this._words[key];
      if (have) { this._srcWord = 'web (' + WORD_LIST.length + ')'; return have; }
      if (have === undefined) {
        const saved = lsGet('home_hub_word_v1');
        if (saved && saved.key === key && saved.word) { this._words[key] = saved.word; this._srcWord = 'web (' + WORD_LIST.length + ')'; return saved.word; }
        this._words[key] = null;
        this._fetchWord(key, dayNumber(now));
      }
      this._srcWord = 'built-in (' + WORDS.length + ')';
      return builtin;
    }

    _fetchWord(key, base) {
      const giveUp = () => { this._words[key] = false; setTimeout(() => { if (this._words && this._words[key] === false) delete this._words[key]; }, 30 * 60 * 1000); };
      const attempt = (i) => {
        if (i >= 5) { giveUp(); return; }
        const w = WORD_LIST[(base + i) % WORD_LIST.length];
        fetchJson(WORD_API + encodeURIComponent(w), 10000).then((data) => {
          const parsed = parseWord(data, w);
          if (!parsed) { attempt(i + 1); return; }
          this._words[key] = parsed; lsSet('home_hub_word_v1', { key, word: parsed }); this._schedule();
        }).catch((e) => { if (e && /^http 404/.test(String(e.message))) attempt(i + 1); else giveUp(); });
      };
      attempt(0);
    }

    _histFor(now) {
      const key = pad2(now.getMonth() + 1) + '/' + pad2(now.getDate());
      this._hist = this._hist || {};
      if (key in this._hist) return this._hist[key];
      this._hist[key] = null;
      if (typeof fetch !== 'function') { this._hist[key] = []; return []; }
      const ctl = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = setTimeout(() => { if (ctl) ctl.abort(); }, 10000);
      const retry = () => setTimeout(() => { if (this._hist) delete this._hist[key]; }, 30 * 60 * 1000);
      fetch('https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/' + key, ctl ? { signal: ctl.signal } : undefined)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http ' + r.status))))
        .then((data) => { clearTimeout(timer); this._hist[key] = pickHistory(data); if (!this._hist[key].length) retry(); this._schedule(); })
        .catch(() => { clearTimeout(timer); this._hist[key] = []; retry(); this._schedule(); });
      return null;
    }

    _paintTablet(vm, html) {
      if (html !== this._last) {
        if (this._shownPage && this._shownPage !== vm.page && this._last) this._swapPages(html, vm.page);
        else this._wrap.innerHTML = html;
        this._last = html;
      }
      this._shownPage = vm.page;
      if (this._cfg.debug) this._dbg.textContent = 'v' + VERSION + ' · ' + Math.round(this.clientWidth) + 'px wide · scale ' + (this._u || 0).toFixed(3) + ' · design height ' + Math.round(this._H) + (this._isCompact(this._H) ? ' · compact' : '') + ' · nav ' + this._cfg.navAutohide + 's · top bar helper ' + (this._st(this._cfg.header_toggle) || 'missing') + (this._st(this._cfg.header_toggle) === 'on' ? ' (hides in ' + Math.max(0, Math.round(this._cfg.headerAutohide - (Date.now() - this._lastTouch) / 1000)) + 's)' : '');
      else if (this._dbg.textContent) this._dbg.textContent = '';
      if (this._detail) {
        const dh = detailHtml(vm);
        if (dh !== this._lastDtl) { this._dtl.innerHTML = dh; this._lastDtl = dh; }
      }
      this._dtl.classList.toggle('show', !!this._detail);
      if (this._confirm) {
        const ch = confirmHtml(this._confirm);
        if (ch !== this._lastDlg) { this._dlg.innerHTML = ch; this._lastDlg = ch; }
      }
      this._dlg.classList.toggle('show', !!this._confirm);
      const nav = navHtml(vm);
      if (nav !== this._lastNav) { this._nav.innerHTML = nav; this._lastNav = nav; }
    }

    _onClick(e) {
      const el = e.target.closest && e.target.closest('[data-act]');
      if (!el || !this._hass) return;
      const act = el.dataset.act;
      const h = this._hass;
      const cfg = this._cfg;
      this._lastTouch = Date.now();
      if (act === 'page') { this._page = el.dataset.page; this._schedule(); }
      else if (act === 'people') {
        this._peopleStyle = this._peopleStyle === 'photos' ? 'initials' : 'photos';
        try { window.localStorage.setItem('home_hub_people_style', this._peopleStyle); } catch (err) { /* ignore */ }
        this._schedule();
      }
      else if (act === 'toggle') {
        const ent = el.dataset.ent;
        const policy = el.dataset.confirm;
        const cur = h.states[ent] && h.states[ent].state;
        if (policy && (policy === 'always' || (policy === 'off' && cur === 'on'))) {
          this._confirm = { entity: ent, name: el.dataset.name || ent, message: el.dataset.msg || '', next: cur === 'on' ? 'off' : 'on' };
          clearTimeout(this._cfTimer);
          this._cfTimer = setTimeout(() => { this._confirm = null; this._schedule(); }, 15000);
          this._render();
        } else {
          h.callService('homeassistant', 'toggle', { entity_id: ent });
        }
      }
      else if (act === 'confirm-go') {
        const c = this._confirm;
        this._confirm = null; clearTimeout(this._cfTimer);
        if (c) h.callService('homeassistant', 'toggle', { entity_id: c.entity });
        this._schedule();
      }
      else if (act === 'confirm-cancel') { this._confirm = null; clearTimeout(this._cfTimer); this._schedule(); this._render(); }
      else if (act === 'seat') {
        this._flash.seat = Date.now() + 4000;
        h.callService('script', 'turn_on', { entity_id: cfg.car.seat_script });
        this._schedule();
        setTimeout(() => this._schedule(), 4200);
      }
      else if (act === 'alarm') { h.callService('alarm_control_panel', el.dataset.svc, { entity_id: cfg.alarm }); }
      else if (act === 'detail') { this._detail = el.dataset.id; this._schedule(); }
      else if (act === 'detail-close') { this._detail = null; this._schedule(); }
      else if (act === 'calsize') {
        const steps = [1, 0.85, 0.7];
        const cur = this._calScale();
        let idx = 0; steps.forEach((v, i) => { if (Math.abs(v - cur) < Math.abs(steps[idx] - cur)) idx = i; });
        this._calLocal = steps[(idx + 1) % steps.length];
        try { window.localStorage.setItem('home_hub_cal_scale', String(this._calLocal)); } catch (err) { /* ignore */ }
        this._schedule();
      }
      else if (act === 'header') { h.callService('input_boolean', 'toggle', { entity_id: cfg.header_toggle }); }
      else if (act === 'media') { h.callService('media_player', 'media_play_pause', { entity_id: cfg.media }); }
    }
  }

  console.info('%c HOME-HUB-CARD %c v' + VERSION, 'background:#1f6f7c;color:#fff;padding:2px 6px;border-radius:3px', 'color:#1f6f7c');
  if (!customElements.get('home-hub-card')) customElements.define('home-hub-card', HomeHubCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'home-hub-card', name: 'Home Hub', description: 'Hub and Today pages with seasonal themes (v' + VERSION + ')' });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseWord, HomeHubCardClass: HomeHubCard, WORD_LIST, tvHtml, pickHistory, QUOTES, WORDS, confirmHtml, detailHtml, autoTheme, themeVals, groupEvents, hubHtml, todayHtml, navHtml, THEMES, holidays, seasonFor, U, CSS, HomeHubCard };
  }
})();
