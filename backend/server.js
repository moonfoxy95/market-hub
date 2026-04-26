import express from 'express';
import cors from 'cors';
import keys from './keys.json' with { type: 'json' };

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// health
app.get('/api/server-status', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ozon orders
app.post('/api/ozon/orders', async (req, res) => {
  try {
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
        'Client-Id': keys.OZON_CLIENT_ID,
        'Api-Key': keys.OZON_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    res.status(response.status).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка на сервере',
      error: String(error)
    });
  }
});

// yandex campaigns
app.get('/api/yandex/campaigns', async (req, res) => {
  try {
    const response = await fetch('https://api.partner.market.yandex.ru/v2/campaigns?limit=10&pageSize=1', {
      method: 'GET',
      headers: {
        'Api-Key': keys.YANDEX_API_TOKEN
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

    let response = await fetch(`https://api.partner.market.yandex.ru/v1/businesses/${keys.YANDEX_BUSINESS_ID}/orders`, {
      method: 'POST',
      headers: {
        'Api-Key': keys.YANDEX_API_TOKEN,
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

// ali orders
app.post('/api/ali/orders', async (req, res) => {
  try {
    //"delivery_statuses": ["Init"],
    const data = {
      "page_size": 100,
      "page": 1
    };

    let response = await fetch('https://openapi.aliexpress.ru/seller-api/v1/order/get-order-list', {
      method: 'POST',
      headers: {
        'x-auth-token': keys.ALI_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    res.status(response.status).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка в получении запроса',
      error: String(error)
    });
  }
})

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});