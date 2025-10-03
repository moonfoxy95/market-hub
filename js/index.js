//import { ozonKey, ozonClientID, yandexKey, yandexCampaign } from './js/keys.js';

const ozonButton = document.querySelector('#ozon-button');
const yandexButton = document.querySelector('#yandex-button');

const ozonTextArea = document.querySelector('#ozon-textarea');
const ozonOrdersCount = document.querySelector('.ozon-orders-count');
const ozonGoodsCount = document.querySelector('.ozon-goods-count');

ozonButton.addEventListener('click', () => {
  const data = {
    "dir": "ASC",
    "filter": {
        "cutoff_from": "2025-08-24T14:15:22Z",
        "cutoff_to": "2025-10-31T14:15:22Z",
        "delivery_method_id": [],
        "is_quantum": false,
        "provider_id": [],
        "status": "awaiting_packaging",
        "warehouse_id": []
    },
    "limit": 100,
    "offset": 0,
    "with": {
        "analytics_data": true,
        "barcodes": true,
        "financial_data": true,
        "legal_info": false,
        "translit": true
    }
	};

  fetch('https://api-seller.ozon.ru/v3/posting/fbs/unfulfilled/list', {
    method: 'POST',
    headers: {
      'Host': 'api-seller.ozon.ru',
	    'Client-Id': ozonClientID,
	    'Api-Key': ozonKey,
	    'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log('Ответ сервера:', result);
    let resultLenght = result.result.count;
    let postingsArr = result.result.postings;
    let allPostingsText = '';
    let allPostingsCount = 0; 

    postingsArr.forEach((posting) => {
      posting.products.forEach((product) => {
        allPostingsText += `${product.offer_id} |${product.quantity} шт| ${product.name}\n`;
        allPostingsCount += 1;
      })
    })

    ozonOrdersCount.textContent += resultLenght;
    ozonTextArea.value = allPostingsText;
    ozonGoodsCount.textContent += allPostingsCount;

  })
  .catch(error => {
    console.error('Ошибка запроса:', error);
  });
});

/*
yandexButton.addEventListener('click', () => {
	fetch(`https://api.partner.market.yandex.ru/v2/campaigns/${yandexCampaign}/orders?substatus=STARTED`, {
		method: 'GET',
		headers: {
	    'Api-Key': yandexKey,
	    'Content-Type': 'application/json',
	    'Accept': 'application/json'
    },
    body: JSON.stringify()
	})
  .then(response => {
    if (!response.ok) {
      throw new Error('Ошибка сети: ' + response.status);
    }
    return response.json();  // или response.text(), если нужен текст
  })
  .then(data => {
    console.log('Полученные данные:', data);
    // Здесь можно обработать и вывести данные на страницу
  })
  .catch(error => {
    console.error('Ошибка запроса:', error);
  });
})
*/