// Pink Paprikaa — website rate card. Mirror of the Notion rate cards (Homely Meals + Catering, 27 Sep 2026).
// RULE: change Notion first, then copy the number here. Every price on the site reads from this file.
window.PP_RATES = {
  wa: '919090704001',
  phone: '+919090704001',
  phoneDisplay: '+91 90907 04001',
  email: 'business@pinkpaprikaa.com',
  address: 'Booth No. 67P, HSVP Market (MKM Market), Sector 57, Gurgaon 122003',
  hours: '8am – 11:30pm, every day',
  fssai: '10825005001702',
  gst: 0.05,
  google: { rating: null, count: null, url: 'https://g.page/r/TODO',
    // Real, verified Google reviews only. Add like: { name, meta: 'Homely Meals · Sep 2026', rating: 5, quote, url }
    reviews: [
      { name: 'Raj Chrome', meta: 'Restaurant · Google review', rating: 5, quote: 'I ordered Mahararaja Thali, steamed Momos and other few extras for the first time. The experience and taste was great😋 A1. Restaurant customer support over phone were well spoken. I will recommend this to my friends. Looking forward to order more from Pink Paprika. Packing was great👌Hatts of Team', url: 'https://maps.app.goo.gl/uGhWvzmZW7To5etbA' },
      { name: 'Vikas Kumar', meta: 'Restaurant · Google review', rating: 5, quote: 'Very nice and economical food or very tasty food as home', url: 'https://maps.app.goo.gl/32n6SYDUMejsa3NeA' },
      { name: 'Abhishek Aggarwal', meta: 'Restaurant · Google review', rating: 4, quote: 'Good place for indian main course at reasonable price in gurgaon sector 57', url: 'https://maps.app.goo.gl/GB38hi9T2G2UfQdG9' },
      { name: 'Shrideep Chatterjee', meta: 'Restaurant · Google review', rating: 4, quote: 'Had Honey chili potato and it was good 👍', url: 'https://maps.app.goo.gl/s1ghZv4qg3f773Gn8' }
    ] },
  payments: 'UPI, cards and Pluxee (Sodexo) meal cards', // TODO real rating + count
  links: {
    orderOnline: 'https://pinkpaprikaa.com/order', // TODO
    swiggy: 'https://www.swiggy.com/', // TODO outlet link
    zomato: 'https://www.zomato.com/', // TODO outlet link
    directions: 'https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon'
  },

  homely: {
    from: 120,
    appMeal: 250,
    launch: { price: 130, bothPrice: 120, seats: 50, ends: '2026-10-31T23:59:59+05:30' },
    plates: [
      { id: 'everyday', name: 'Everyday', price: 120, roti: 2, rice: 200,
        blurb: 'Home-style basics, kept simple.',
        points: ['4 home dals, 7 seasonal sabjis', '2 fresh tawa roti + steamed rice', 'Home-style paneer once a week', 'Biryani once a week, with raita'],
        box: { dal: '1, from 4 home dals', sabji: '1, from 7 seasonal home sabjis', raita: 'Twice a week, one with biryani', paneer: 'Mon lunch · Wed dinner — home-style Matar Paneer', soup: '', dessert: '', biryani: 'Fri lunch · Tue dinner — with Salan + Raita' },
        group: [{ min: 20, price: 99, label: '20+ people' }] },
      { id: 'classic', name: 'Classic', price: 140, launchPrice: 130, recommended: true, roti: 3, rice: 200,
        blurb: 'The full Pink Paprikaa menu. Our recommendation.',
        points: ['30 dishes: Rajma, Chole, Dal Makhani, Kofta, Gatte', '3 fresh tawa roti + rice, jeera rice Tue & Wed', 'Raita three times a week', 'Weekly biryani + Gulab Jamun', 'Restaurant-style paneer once a week'],
        box: { dal: '1, from 8 dals incl. Rajma, Chole, Dal Makhani', sabji: '1, from 18 sabjis incl. Mix Veg, Kofta, Gatte', raita: '3× a week, incl. biryani day', paneer: 'Mon lunch · Wed dinner — restaurant-style', soup: '', dessert: 'Biryani day only', biryani: 'Fri lunch · Tue dinner — with Salan, Raita, Gulab Jamun' },
        both: { regular: 125, launch: 120 }, upfront: 125,
        group: [{ min: 2, price: 130, label: '2 people' }, { min: 3, price: 125, label: '3–7 people' }, { min: 8, price: 120, label: '8–10 people' }, { min: 20, price: 119, label: '20+ people' }] },
      { id: 'signature', name: 'Signature', price: 200, roti: 3, rice: 200,
        blurb: 'A different plate, every single day.',
        points: ['Everything in Classic', 'Restaurant-style paneer gravy every day', 'Dessert and papad daily', 'Soup twice a week', 'Raita every day'],
        box: { dal: '1, rotating — lighter, the gravy carries the plate', sabji: 'Seasonal sabji + restaurant paneer gravy daily', raita: 'Every day', paneer: 'Every day, bigger portion', soup: 'Twice a week', dessert: 'Every day', biryani: 'Fri lunch · Tue dinner — with Salan, Raita, Gulab Jamun' },
        group: [{ min: 2, price: 185, label: '2 people' }, { min: 3, price: 180, label: '3–7 people' }, { min: 8, price: 170, label: '8–10 people' }] }
    ],
    lengths: [
      { id: 'trial', label: 'Trial', meals: 5, sub: '5 meals · any days within a week', welcome: 0 },
      { id: 'weekday', label: 'Weekday plan', meals: 24, sub: '24 meals · Mon–Sat', welcome: 1 },
      { id: 'full', label: 'Full month', meals: 30, sub: '30 meals · every day', welcome: 1 }
    ],
    // Promotional, not part of the base plan. Set on:false (or let it expire) to remove it everywhere.
    freeMealOffer: { on: true, label: 'Limited offer', ends: '2026-10-31T23:59:59+05:30', endsLabel: '31 Oct' },
    noOnionGarlic: 30,
    addons: [
      { id: 'paneer', name: 'Upgrade sabji to paneer gravy', price: 40 },
      { id: 'makhani', name: 'Upgrade dal to Dal Makhani', price: 30 },
      { id: 'sabji', name: 'Extra sabji (150–180g)', price: 35 },
      { id: 'dal', name: 'Extra dal (150–180ml)', price: 25 },
      { id: 'raita', name: 'Boondi or Kheera Raita', price: 25 },
      { id: 'lassi', name: 'Sweet Lassi (250ml)', price: 49 },
      { id: 'kheer', name: 'Rice Kheer', price: 39 },
      { id: 'gj', name: 'Gulab Jamun (1pc)', price: 15 },
      { id: 'chaas', name: 'Masala Chaas (200ml)', price: 39 },
      { id: 'papad', name: 'Roasted Papad', price: 20 },
      { id: 'roti', name: '2 extra Tawa Roti', price: 30 }
    ],
    referral: [{ n: 1, reward: '10% off your next month' }, { n: 3, reward: '20% off your next month' }, { n: 5, reward: '1 week free' }, { n: 10, reward: '1 month free' }],
    friendGets: 'Your friend gets one extra free meal in their first month.',
    memberPerk: 'Flat 10% off anything else from our restaurant menu, for plan members.',
    slots: { lunch: '12:00 – 1:30pm', dinner: '7:30 – 9:00pm' },
    freeKm: 3, freeZone: 'Most of Sectors 52–57 and 61',
    menu: {
      classic: {
        dals: ['Arhar Dal Tadka', 'Yellow Moong Dal', 'Mix Dal Panchmel', 'Masoor Dal', 'Kadhi Pakoda', 'Rajma Masala', 'Amritsari Chole', 'Dal Makhani'],
        sabjis: ['Bhindi Masala', 'Aloo Bhindi Do Pyaza', 'Aloo Kaddu', 'Kaddu Khatta Meetha', 'Aloo Shimla Mirch', 'Soya Chunks Aloo', 'Aloo Kala Chana', 'Arbi Masala', 'Lauki Chana', 'Aloo Jeera', 'Aloo Patal Bhujiya', 'Aloo Gobi Bhujiya', 'Turai Aloo', 'Banarsi Dum Aloo', 'Veg Kofta Curry', 'Lauki Kofta', 'Gatte ki Sabji', 'Mix Veg'],
        paneer: ['Paneer Lababdar', 'Kadhai Paneer', 'Paneer Do Pyaza', 'Paneer Butter Masala'],
        note: 'In October, bhindi, kaddu, lauki and arbi step aside for gobi, palak, matar and patta gobi.'
      },
      everyday: {
        dals: ['Arhar Dal Tadka', 'Yellow Moong Dal', 'Masoor Dal', 'Kadhi Pakoda'],
        winter: ['Gobi Matar', 'Patta Gobi Matar', 'Palak Chana', 'Methi Matar', 'Gajar Matar', 'Soya Chunks Masala', 'Aloo Jeera'],
        summer: ['Bhindi Masala', 'Tinda Masala', 'Besan Shimla Mirch', 'Lauki Chana', 'Kaddu Khatta Meetha', 'Soya Chunks Masala', 'Aloo Jeera'],
        note: 'Paneer day: home-style Matar Paneer, Monday lunch and Wednesday dinner. Biryani day: Veg Dum Biryani with Mirchi ka Salan and Raita, Friday lunch and Tuesday dinner. Raita twice a week. No jeera rice on Everyday.'
      },
      weekClassic: [
        { day: 'Mon', tag: 'Paneer Day', lunch: 'Yellow Moong Dal · Paneer Lababdar · Steamed Rice', dinner: 'Dal Makhani · Aloo Gobi Bhujiya · Steamed Rice' },
        { day: 'Tue', tag: 'Jeera Rice Day', lunch: 'Amritsari Chole · Aloo Shimla Mirch · Jeera Rice', dinner: 'Veg Dum Biryani · Mirchi ka Salan · Raita · Gulab Jamun' },
        { day: 'Wed', tag: 'Jeera Rice Day', lunch: 'Kadhi Pakoda · Gobi Matar · Jeera Rice', dinner: 'Mix Dal Panchmel · Kadhai Paneer · Jeera Rice' },
        { day: 'Thu', tag: '', lunch: 'Rajma Masala · Arbi Masala · Steamed Rice', dinner: 'Arhar Dal Tadka · Gatte ki Sabji · Steamed Rice' },
        { day: 'Fri', tag: 'Biryani Day', lunch: 'Veg Dum Biryani · Mirchi ka Salan · Raita · Gulab Jamun', dinner: 'Masoor Dal · Mix Veg · Steamed Rice' },
        { day: 'Sat', tag: '', lunch: 'Kadhi Pakoda · Soya Chunks Aloo · Steamed Rice', dinner: 'Mix Dal Panchmel · Banarsi Dum Aloo · Steamed Rice · Raita' },
        { day: 'Sun', tag: '', lunch: 'Yellow Moong Dal · Lauki Chana · Steamed Rice', dinner: 'Arhar Dal Tadka · Aloo Gobi Bhujiya · Steamed Rice' }
      ],
      weekEveryday: [
        { day: 'Mon', tag: 'Paneer Day', lunch: 'Yellow Moong Dal · Home-style Matar Paneer · Steamed Rice', dinner: 'Arhar Dal Tadka · Soya Chunks Masala · Steamed Rice' },
        { day: 'Tue', tag: 'Biryani Day', lunch: 'Kadhi Pakoda · Aloo Jeera · Steamed Rice', dinner: 'Veg Dum Biryani · Mirchi ka Salan · Raita' },
        { day: 'Wed', tag: 'Paneer Day', lunch: 'Yellow Moong Dal · Palak Chana · Steamed Rice · Raita', dinner: 'Arhar Dal Tadka · Home-style Matar Paneer · Steamed Rice' },
        { day: 'Thu', tag: '', lunch: 'Kadhi Pakoda · Methi Matar · Steamed Rice', dinner: 'Masoor Dal · Gobi Matar · Steamed Rice' },
        { day: 'Fri', tag: 'Biryani Day', lunch: 'Veg Dum Biryani · Mirchi ka Salan · Raita', dinner: 'Arhar Dal Tadka · Aloo Jeera · Steamed Rice' },
        { day: 'Sat', tag: '', lunch: 'Kadhi Pakoda · Patta Gobi Matar · Steamed Rice', dinner: 'Masoor Dal · Palak Chana · Steamed Rice · Raita' },
        { day: 'Sun', tag: '', lunch: 'Yellow Moong Dal · Gajar Matar · Steamed Rice', dinner: 'Arhar Dal Tadka · Methi Matar · Steamed Rice' }
      ]
    },
    terms: [
      'Prices are per person, per meal, plus GST at 5%.',
      'Limited offer, while it runs: 1 free meal a month on Weekday plans (25 for 24) and Full months (31 for 30). Not on the trial.',
      'The trial is 5 meals on any days within a week, paid at its own price and not taken off your first plan.',
      'Group, launch and upfront prices don’t combine. You get the lowest per-meal price you qualify for. A referral reward can’t be used in the same month as a household price; the bigger one applies.',
      'If you cancel partway through a plan, the free meal is counted as charged when we work out the refund.',
      'If you stop a 3-month upfront plan early, we refund the unused meals after charging the meals you’ve had at the regular ₹140.'
    ]
  },

  zones: [
    { name: 'Sector 57', free: true }, { name: 'Sector 56', free: true }, { name: 'Sector 55', free: true },
    { name: 'Sector 54', free: true }, { name: 'Sector 53', free: true }, { name: 'Sector 52', free: true },
    { name: 'Sector 61', free: true }, { name: 'Sector 58', free: false }, { name: 'Sector 50', free: false },
    { name: 'Sector 49', free: false }, { name: 'Sector 48', free: false }, { name: 'Golf Course Road', free: false },
    { name: 'Sohna Road', free: false }, { name: 'Other area in Gurgaon', free: false }
  ],

  office: {
    minPeople: 20,
    plates: [
      { id: 'everyday', name: 'Everyday', price: 99, desc: '4 home dals, 7 seasonal sabjis, 2 roti, rice, salad. Home-style paneer and biryani once a week.' },
      { id: 'classic', name: 'Classic', price: 119, desc: 'The full 30-dish menu, 3 roti, jeera rice twice a week, weekly biryani.' }
    ],
    lengths: [{ label: 'Weekday plan', meals: 24, sub: '24 meals · Mon–Sat' }, { label: 'Full month', meals: 30, sub: '30 meals · every day' }]
  },

  catering: {
    from: 99, dawatFrom: 149, minGuests: 15, advance: 0.5, freeKm: 8,
    notice: [{ upTo: 50, hours: 24 }, { upTo: 99999, hours: 48 }],
    trial: 'Take one Dawat as a trial at the normal per-head rate — collect it from the restaurant, or we deliver at what the bike actually costs. When you confirm your order, the full trial amount comes off your bill.',
    referral: { min: 25, off: 500 },
    why: [
      { icon: 'store', t: 'We are a restaurant, not a contractor', d: 'Come and eat here before you book. What you taste at our table is exactly what reaches yours.' },
      { icon: 'flame', t: 'Cooked the same day, for you', d: 'Gravies, breads and starters are made for your order on the morning of. Nothing is reheated.' },
      { icon: 'receipt', t: 'One price per head, and that is it', d: 'Food, packing and delivery are inside the number we quote. No fuel line, no service line.' },
      { icon: 'pencil', t: 'Your menu, not ours', d: 'Swap any gravy, dal, rice or starter. Tell us what your family actually eats.' },
      { icon: 'truck', t: 'The transport is our problem', d: 'We book the vehicle ourselves, in insulated trays, so food arrives hot and in one piece.' },
      { icon: 'users', t: 'Staff and setup, if you want it', d: 'Buffet tables, chafing dishes, serving staff for the evening, and we clear up afterwards.' }
    ],
    dawats: [
      { id: 'classic', name: 'Classic Dawat', price: 149,
        blurb: 'Honest, homely food, and plenty of it.',
        items: ['Mix Veg — seasonal, light homely masala', 'Dal Fry — jeera and hing tadka', '4 Butter Tandoori Roti', 'Steamed Rice', 'Boondi Raita', 'Sirka Pyaaz', 'Mint Chutney', 'Roasted Papad (2 pc)'],
        bestFor: 'Office lunches, pooja prasad, small family gatherings, staff meals', upgrades: ['paneer', 'makhani', 'jeera', 'lachha'] },
      { id: 'signature', name: 'Signature Dawat', price: 199, tag: 'Most ordered',
        blurb: 'The one we would put in front of our own family.',
        items: ['Paneer gravy — Do Pyaza, Matar or Kadhai', 'Mix Veg', 'Dal Fry', '4 Butter Tandoori Roti', 'Steamed Rice', 'Boondi Raita', 'Kachumber Salad', 'Mint Chutney', 'Roasted Papad (2 pc)', 'Gulab Jamun (1 pc)'],
        choice: { label: 'Paneer gravy', options: ['Paneer Do Pyaza', 'Matar Paneer', 'Kadhai Paneer'] },
        bestFor: 'Birthdays, family functions, client lunches, house parties', upgrades: ['makhani', 'jeera', 'lachha', 'gj2'] },
      { id: 'maharaja', name: 'Maharaja Dawat', price: 269,
        blurb: 'For the days that deserve a proper table.',
        items: ['Premium paneer — Butter Masala, Lababdar or Tawa', 'Mix Veg', 'Dal Makhani — slow-cooked overnight', '3 Butter Tandoori Roti + 1 Lachha Paratha', 'Jeera Rice', 'Mix Veg Raita', 'Kachumber Salad', 'Mint Chutney', 'Roasted Papad (2 pc)', 'Gulab Jamun (2 pc)'],
        choice: { label: 'Premium paneer gravy', options: ['Paneer Butter Masala', 'Paneer Lababdar', 'Tawa Paneer Masala'] },
        bestFor: 'Anniversaries, engagements, festivals', upgrades: [] },
      { id: 'royal', name: 'Royal Dawat', price: 549, minGuests: 50,
        blurb: 'The full evening, course by course. 50 guests and above.',
        items: ['Soup — Manchow, Tomato or Sweet Corn', '4 starters — Chilli Potato, Veg Manchurian, Hakka Noodles, Tandoori Veg Seekh', 'Premium paneer gravy + Soya Chaap', 'Mix Veg · Dal Makhani', '3 Butter Tandoori Roti + 1 Lachha Paratha', 'Veg Dum Biryani with Mirchi ka Salan', 'Boondi Raita · Kachumber · Chutney · Papad', 'Gulab Jamun (2 pc) + Rice Kheer', 'Shikanji'],
        choice: { label: 'Premium paneer gravy', options: ['Paneer Butter Masala', 'Paneer Lababdar', 'Tawa Paneer Masala'] },
        choice2: { label: 'Soup', options: ['Manchow', 'Tomato', 'Sweet Corn'] },
        bestFor: 'Large corporate events, big family functions, milestones', upgrades: [] }
    ],
    glance: [
      { k: 'Sabji', v: ['Mix Veg', 'Mix Veg + Paneer', 'Mix Veg + premium Paneer'] },
      { k: 'Dal', v: ['Dal Fry', 'Dal Fry', 'Dal Makhani'] },
      { k: 'Bread', v: ['4 Tandoori Roti', '4 Tandoori Roti', '3 Roti + Lachha Paratha'] },
      { k: 'Rice', v: ['Steamed', 'Steamed', 'Jeera Rice'] },
      { k: 'Raita', v: ['Boondi Raita', 'Boondi Raita', 'Mix Veg Raita'] },
      { k: 'Salad', v: ['Sirka Pyaaz', 'Kachumber', 'Kachumber'] },
      { k: 'Sweet', v: ['—', 'Gulab Jamun 1 pc', 'Gulab Jamun 2 pc'] }
    ],
    upgrades: [
      { id: 'paneer', name: 'Paneer gravy instead of Mix Veg', price: 25 },
      { id: 'makhani', name: 'Dal Makhani instead of Dal Fry', price: 25 },
      { id: 'jeera', name: 'Jeera Rice instead of Steamed Rice', price: 20 },
      { id: 'lachha', name: 'Lachha Paratha in place of one roti', price: 25 },
      { id: 'gj2', name: 'Gulab Jamun, 2 pc instead of 1', price: 15 }
    ],
    starterPick: 3,
    starterCombos: [
      { id: 'veg', name: 'Veg Starter Combo', price: 149, items: ['Chilli Potato', 'Honey Chilli Potato', 'Veg Manchurian', 'Veg Hakka Noodles', 'Veg Chowmein', 'Veg Spring Roll', 'Hara Bhara Kebab'] },
      { id: 'paneer', name: 'Paneer & Tandoori Starter Combo', price: 199, items: ['Chilli Paneer', 'Paneer Manchurian', 'Paneer 65', 'Paneer Tikka', 'Afghani Paneer Tikka', 'Tandoori Veg Seekh Kebab', 'Bharwa Mushroom Tikka'] }
    ],
    platters: [
      { id: 'snClassic', group: 'Snacks', name: 'Classic Snacks Platter', price: 99, items: '2 Samosa · 1 Dal Kachori · 1 Bread Pakoda · Jal Jeera or Chaas' },
      { id: 'snChaat', group: 'Snacks', name: 'Chaat Snacks Platter', price: 119, items: 'Samosa Chole · Masala Papad · Pyaaz Kachori · Jal Jeera or Chaas' },
      { id: 'snSandwich', group: 'Snacks', name: 'Sandwich Snacks Platter', price: 129, items: 'Veg Grilled Sandwich · Bread Pakoda · Jal Jeera or Chaas' },
      { id: 'moVeg', group: 'Momos', name: 'Veg Momos Platter', price: 149, items: '6 a head: 2 Steamed + 2 Pan-Fried + 2 Kurkure' },
      { id: 'moPaneer', group: 'Momos', name: 'Paneer Momos Platter', price: 179, items: '6 a head: 2 Steamed + 2 Pan-Fried + 2 Kurkure' }
    ],
    momoUpgrades: [{ id: 'tandoori', name: 'Tandoori Momos instead', price: 30 }, { id: 'afghani', name: 'Afghani Paneer Momos instead', price: 40 }],
    snackMin: 50,
    snacks: [
      { id: 'samosa', name: 'Samosa', d: 'Hand-folded, spiced aloo', price: 17 },
      { id: 'dalKachori', name: 'Dal Kachori', d: 'Flaky, red and green chutney', price: 20 },
      { id: 'pyaazKachori', name: 'Pyaaz Kachori', d: 'Flaky, onion-stuffed', price: 30 },
      { id: 'breadPakoda', name: 'Bread Pakoda', d: 'Besan-coated, fried to order', price: 25 },
      { id: 'masalaPapad', name: 'Masala Papad', d: 'Onion, tomato, chaat masala', price: 25 },
      { id: 'samosaChole', name: 'Samosa Chole', d: 'Two samosas, chole, imli, mint', price: 45 },
      { id: 'cheeseSandwich', name: 'Veg Cheese Sandwich', d: 'Grilled till the cheese pulls', price: 70 },
      { id: 'mixPakoda', name: 'Mix Pakoda', d: 'Mixed veg fritters, green chutney', price: 80 },
      { id: 'matarKulcha', name: 'Matar Kulcha', d: 'White matar, tandoori kulcha', price: 80 },
      { id: 'bedmi', name: 'Bedmi Poori with Aloo', d: 'Old Delhi style, rasedar aloo', price: 81 },
      { id: 'grilledSandwich', name: 'Veg Grilled Sandwich', d: 'Buttered, mint chutney inside', price: 85 },
      { id: 'choleBhature', name: 'Chole Bhature', d: 'Amritsari chole, two bhature', price: 99 },
      { id: 'pavBhaji', name: 'Pav Bhaji', d: 'Butter bhaji, two buttered pav', price: 99 },
      { id: 'paneerPakoda', name: 'Paneer Pakoda', d: 'Thick paneer in spiced besan', price: 102 },
      { id: 'paneerTikkaSandwich', name: 'Paneer Tikka Sandwich', d: 'Tandoori paneer, grilled', price: 119 },
      { id: 'club', name: 'Club Sandwich', d: 'Vegetable, cheese and chutney', price: 145 }
    ],
    extras: [
      { id: 'vegBiryani', name: 'Veg Dum Biryani + Salan', price: 129 },
      { id: 'paneerBiryani', name: 'Paneer Dum Biryani + Salan', price: 169 },
      { id: 'soup', name: 'Soup', price: 79 },
      { id: 'lassi', name: 'Sweet Lassi', price: 79 },
      { id: 'jalebi', name: 'Jalebi (80–100g)', price: 49 },
      { id: 'kheer', name: 'Rice Kheer or Rasgulla', price: 49 },
      { id: 'roti', name: 'Extra Tandoori Roti', price: 15 }
    ],
    service: [
      { id: 'delivered', name: 'Delivered', price: 0, desc: 'Sealed insulated trays. Free up to 8 km, beyond billed at actual.' },
      { id: 'disposables', name: 'Delivered with disposables', price: 25, desc: 'Plus plates, spoons, napkins and serving spoons.' },
      { id: 'setup', name: 'Full setup and service', price: null, min: 25, desc: 'Buffet tables, chafing dishes, serving staff, cleanup. Quoted for your venue.' }
    ],
    faqs: [
      { q: 'Can you make Jain or satvik food?', a: 'Yes. No onion, no garlic, and no root vegetables if you need. Tell us when you book, not on the day — it changes how we shop.' },
      { q: 'What if the guest count changes?', a: 'Tell us up to 24 hours before and we adjust. After that we have already shopped for the confirmed number.' },
      { q: 'Can we taste the food before booking?', a: 'Yes, and we would rather you did. Take one Dawat as a trial at the normal per-head rate. When you confirm, the whole trial amount is credited against your bill.' },
      { q: 'Do you deliver outside Gurgaon?', a: 'Across Delhi NCR. Transport beyond 8 km is billed at what the vehicle actually costs, nothing on top.' },
      { q: 'How do you keep it hot?', a: 'Sealed insulated trays for delivery, and chafing dishes with fuel if you take the setup option.' },
      { q: 'Can we mix packages?', a: 'Yes. Signature for the family and Classic for staff and drivers, on the same order.' },
      { q: 'We have never ordered catering before.', a: 'Then start small. A Snacks Platter for a tea round, or a Classic Dawat for fifteen, and see how we handle it.' }
    ]
  },

  restaurant: {
    bestsellers: [ // TODO replace with the real top 6
      { name: 'Paneer Lababdar', price: 279 }, { name: 'Dal Makhani', price: 219 },
      { name: 'Veg Dum Biryani', price: 239 }, { name: 'Chole Bhature', price: 189 },
      { name: 'Paneer Tikka', price: 269 }, { name: 'Veg Momos', price: 149 }
    ]
  }
};

window.ppWa = function (page, msg) {
  window.open('https://wa.me/' + window.PP_RATES.wa + '?text=' + encodeURIComponent('[Web-' + page + '] ' + msg), '_blank');
};
window.ppFreeMealOn = function () { var o = window.PP_RATES.homely.freeMealOffer; return !!(o && o.on && Date.now() < new Date(o.ends).getTime()); };
window.ppRs = function (n) { return '₹' + Math.round(n).toLocaleString('en-IN'); };

// Homely Meals price engine — lowest per-meal price wins, offers never combine.
window.ppHomelyPrice = function (plateId, opts) {
  var H = window.PP_RATES.homely, p = H.plates.find(function (x) { return x.id === plateId; }) || H.plates[1];
  var o = opts || {}, launchOn = Date.now() < new Date(H.launch.ends).getTime();
  var c = [{ price: p.price, why: 'Regular price' }];
  if (p.launchPrice && launchOn) c.push({ price: p.launchPrice, why: 'Launch price' });
  if (o.both && p.both) c.push({ price: launchOn ? p.both.launch : p.both.regular, why: 'Lunch + dinner' });
  if (!o.trial) {
    if (o.upfront && p.upfront) c.push({ price: p.upfront, why: '3 months upfront' });
    var g = (p.group || []).filter(function (x) { return (o.people || 1) >= x.min; }).pop();
    if (g) c.push({ price: g.price, why: g.label + ' at one address' });
  }
  c.sort(function (a, b) { return a.price - b.price; });
  // Price-drop prompt: household tiers only (2–10), at most 5 extra people, none from 8 people up.
  var ppl = o.people || 1, next = null;
  if (!o.trial && ppl < 8) (p.group || []).forEach(function (x) {
    if (!next && x.min <= 10 && x.min > ppl && x.min - ppl <= 5 && x.price < c[0].price) next = x;
  });
  return { plate: p, price: c[0].price, why: c[0].why, regular: p.price, next: next, pgHint: ppl >= 8, launchOn: launchOn };
};

// This-week menu: split "Dal · Sabji · Rice · Extra" into labelled, tagged parts.
window.ppMealParts = function (str, dayIdx, isClassic, isDinner) {
  var P = window.PP_RATES.homely.menu.classic.paneer, p = str.split(' · ');
  var T = {
    Seasonal: { background: 'var(--mint-soft)', color: '#1d6e52' },
    'Paneer day': { background: 'var(--pink-100)', color: 'var(--pink-700)' },
    'Biryani night': { background: 'var(--turmeric-soft)', color: '#7a5510' },
    'Jeera rice day': { background: 'var(--turmeric-soft)', color: '#7a5510' },
    'Signature only': { background: 'var(--ink-900)', color: '#fff' }
  };
  var mk = function (k, v, tag) { return { k: k, v: v, hasTag: !!tag, tag: tag || '', tagStyle: Object.assign({ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }, T[tag] || {}) }; };
  var out;
  if (/Biryani/.test(p[0])) out = [mk('Main', p[0], 'Biryani night'), mk('Sides', p.slice(1).join(', '))];
  else {
    out = [mk('Dal', p[0]), mk('Sabji', p[1], /Paneer/.test(p[1]) ? 'Paneer day' : 'Seasonal'), mk('Rice', p[2], /Jeera/.test(p[2]) ? 'Jeera rice day' : '')];
    if (p.length > 3) out.push(mk('Extra', p.slice(3).join(', ')));
  }
  out.push(mk('With', (isClassic ? '3' : '2') + ' tawa roti · salad · chutney'));
  if (isClassic) out.push(mk('Paneer', P[(dayIdx * 2 + (isDinner ? 1 : 0)) % P.length] + ' + dessert & papad', 'Signature only'));
  return out;
};
