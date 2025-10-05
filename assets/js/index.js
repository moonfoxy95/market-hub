import { ozonKey, ozonClientID, yandexKey, yandexCampaign, aliexpressKey } from './keys.js';

// ДАТЫ 
//let timeNow = ;
let time7DaysAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
let time14DaysAhead = new Date(new Date().setDate(new Date().getDate() + 14)).toISOString();

// ЭЛЕМЕНТЫ ОЗОН
const ozonButton = document.querySelector('#ozon-button');
const ozonTextArea = document.querySelector('#ozon-textarea');
const ozonOrdersCount = document.querySelector('.ozon-orders-count');
const ozonGoodsCount = document.querySelector('.ozon-goods-count');
const ozonLastloadTime = document.querySelector('.ozon-lastload-time');
const ozonCopyButton = document.querySelector('#ozon-copy-button');

// ЭЛЕМЕНТЫ ЯНДЕКС
const yandexButton = document.querySelector('#yandex-button');

// ЭЛЕМЕНТЫ АЛИЭКСПРЕСС
const aliexpressButton = document.querySelector('#aliexpress-button');

// КНОПКА ОЗОН
ozonButton.addEventListener('click', () => {
  const data = {
    "dir": "ASC",
    "filter": {
      "cutoff_from": time7DaysAgo,
      "cutoff_to": time14DaysAhead,
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

  ozonButton.disabled = true;

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
    let articlesArr = [];

    postingsArr.forEach((posting) => {
      posting.products.forEach((product) => {
        let articleObj = {};

        articleObj.article = product.offer_id;
        articleObj.quantity = product.quantity;
        articleObj.name = product.name;
        articlesArr.push(articleObj);
        allPostingsCount += 1;
      })
    });

    articlesArr.sort((a, b) => a.article.localeCompare(b.article));;
    articlesArr.forEach((e) => {
      allPostingsText += `${e.article} |${e.quantity} шт| ${e.name}\n`;
    });

    ozonOrdersCount.textContent = resultLenght;
    ozonTextArea.value = allPostingsText;
    ozonGoodsCount.textContent = allPostingsCount;
    ozonLastloadTime.textContent = new Date().toLocaleTimeString();
    
    ozonButton.style.backgroundColor = 'var(--color-green)';
    setTimeout(() => {
      ozonButton.style.backgroundColor = 'revert-layer',
      ozonButton.disabled = false;
    }, 2000);
  })
  .catch(error => {
    console.error('Ошибка запроса:', error);
    ozonButton.disabled = false;
  });
});

// КНОПКА КОПИРОВАТЬ
document.querySelectorAll('.section__copy-button').forEach((marketButton, index) => {
  marketButton.addEventListener('click', () => {
  navigator.clipboard.writeText(document.querySelectorAll('.section__textarea')[index].value).then(() => {
    marketButton.style.backgroundColor = 'var(--color-green)';
    marketButton.disabled = true;
    setTimeout(() => {
      marketButton.style.backgroundColor = 'revert-layer',
      marketButton.disabled = false;
    }, 2000);
  }).catch(() => alert('Ошибка копирования'));
  });
});

// КНОПКА ЯНДЕКС
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
});
*/

// КНОПКА АЛИЭКСПРЕСС
/*
aliexpressButton.addEventListener('click', () => {
  const data = {
    "order_statuses": "Finished"
	};

  fetch('https://openapi.aliexpress.ru/seller-api/v1/order/get-order-list', {
    method: 'POST',
    headers: {
      'Host': 'api-seller.ozon.ru',
      'x-auth-token': aliexpressKey,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log('Ответ сервера:', result);
  })
  .catch(error => {
    console.error('Ошибка запроса:', error);
  });
});
*/