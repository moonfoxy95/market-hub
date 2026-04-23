import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: true,
  cretdentials: true
}));
app.use(express.json());


// ozon orders
app.post('/api/ozon/unfulfilled-list', async (req, res) => {
  try {
    const OzonClientId = 36739;
    const OzonApiKey = 'f6e35d96-e8a3-4f32-aacf-f86ce60ef9df';
    const time7DaysAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
    const time14DaysAhead = new Date(new Date().setDate(new Date().getDate() + 14)).toISOString();

    const data = {
      dir: 'ASC',
      filter: {
        cutoff_from: time7DaysAgo,
        cutoff_to: time14DaysAhead,
        delivery_method_id: [],
        is_quantum: false,
        provider_id: [],
        status: 'awaiting_packaging',
        warehouse_id: []
      },
      limit: 100,
      offset: 0,
      with: {
        analytics_data: true,
        barcodes: true,
        financial_data: true,
        legal_info: false,
        translit: true
      }
    };

    const response = await fetch('https://api-seller.ozon.ru/v3/posting/fbs/unfulfilled/list', {
      method: 'POST',
      headers: {
        'Client-Id': OzonClientId,
        'Api-Key': OzonApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    res.status(response.status).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: String(error)
    });
  }
});

// yandex
app.get('/api/yandex/campaigns', async (req, res) => {
  try {
    let yandexKey = 'ACMA:ExCOgXcviQINftWJ33Aw7Y2XXB6FWIvX003eJvwm:1bf855e1';
    let yandexCampaign = '21868557';
    const response = await fetch('https://api.partner.market.yandex.ru/v2/campaigns?limit=10&pageSize=1', {
      method: 'GET',
      headers: {
        'Api-Key': yandexKey
      }
    });

    const result = await response.json();
    res.status(response.status).json(result);

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: String(error)
    });
  }
});

// yandex orders
app.post('/api/yandex/orders', async (req, res) => {
  try {
    let yandexKey = 'ACMA:ExCOgXcviQINftWJ33Aw7Y2XXB6FWIvX003eJvwm:1bf855e1';
    let yandexCampaign = '21868557';

    const data = {
      "programTypes": [
        "FBS"
      ],
      "statuses":
        [
          "PROCESSING"
        ],
      "substatuses":
        [
          "STARTED"
        ],
      "fake": false,
      "sourcePlatforms": [
        "MARKET"
      ]
    };

    let response = await fetch('https://api.partner.market.yandex.ru/v1/businesses/748599/orders', {
      method: 'POST',
      headers: {
        'Api-Key': yandexKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    res.status(response.status).json(result);
  }
  catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: String(error)
    });
  }
})



app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});


/* TESTS
//yandex cabinets test
let yandexKey = 'ACMA:ExCOgXcviQINftWJ33Aw7Y2XXB6FWIvX003eJvwm:1bf855e1';
let yandexCampaign = '21868557';

fetch('https://api.partner.market.yandex.ru/v2/campaigns?limit=10&pageSize=1', {
  method: 'GET',
  headers: {
    'Api-Key': yandexKey
  }
})
  .then(response => {
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Request failed: ', error));


// yandex orders text
let yandexKey = 'ACMA:ExCOgXcviQINftWJ33Aw7Y2XXB6FWIvX003eJvwm:1bf855e1';
let yandexCampaign = '21868557';

const data = {
  "programTypes": [
    "FBS"
  ],
  "statuses":
    [
      "PROCESSING"
    ],
  "substatuses":
    [
      "STARTED"
    ],
  "fake": false,
  "sourcePlatforms": [
    "MARKET"
  ]
};

fetch('https://api.partner.market.yandex.ru/v1/businesses/748599/orders', {
  method: 'POST',
  headers: {
    'Api-Key': yandexKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
  .then(response => {
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Request failed: ', error));
*/