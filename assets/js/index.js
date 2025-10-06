//import { ozonKey, ozonClientID, yandexKey, yandexCampaign, aliexpressKey } from './keys.js';
const ozonKey = '6f567181-7283-493c-a8cb-6579f5148054';
const ozonClientID = '36739';

const yandexKey = 'ACMA:ExCOgXcviQINftWJ33Aw7Y2XXB6FWIvX003eJvwm:1bf855e1';
const yandexCampaign = '21868557'; // ID кампании, campaign_id
const yandexBusiness =  '748599'; // ID кабинета, business_id

const aliexpressKey = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWxsZXJfaWQiOjEwMTQ1NDI3OTMsInRva2VuX2lkIjoxNDkwMn0.kV4WpA6MMKh5wt_t-asO9WDJ_7I0SdbcApzaIsfod5YLqLFdGGCZ5bGZW5e1IxYvoLm-9IRSDuk0Fsb8G0VeG5v1xc-QApwTulLTGdzRYdOr0YCcTbJ9r7jm7c44ptUxRte7YHy85H-XiE1Q4aMjEeldaGDr_7PMOzzdOO4wKe_5jJn6Nt10PfHAyRcBbAlCBD0KR5mdf_8QllpnJeQ9leg_ydQ6P8D8gJhI3bHjeJn4hhRfcPOrR1-pseSCyXjZjqaUmm9_c6Q8S_YKsNb4oN2NYqxGVytbw4JKtE-2Lu9tTSaowUVtrAPIiYwLbqk23FOcXEYKLzVVqqSJwJFEUi32rcwFc2bycJRbqJRBeUt08097Y4jgFQHbjjpb_TrtP3o97wvkkibmtMNHqrgThKWvGmNRvz4FCtFlUzTxAoGqVYCRgX4jA6YVpcD94sumhPtssqUXRS6Nnjkx-_FLNqoaC5nEUHxJqPgQeze_FQBMOR3_w84L5qWdGsx0N9WB9Mhx88ujrWoUo_YfQsNIzCxr9fx5CvtIZyZdp6TdWgmOkUzpVZRTlg07JP2rOQWrMKwZkoC8BIDOBrKZl2NOy0YvqG2WT3n2edXId2mg1xqyYh1qsrPMkCXreGe4h_FrAstK6fl6hu8kqVi-LVs-qyOjWIVbNE07IGI-hskgxeM';


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

        // обрезка A_
        while (product.offer_id.startsWith('A_')) {
          product.offer_id = product.offer_id.substring(2);
        };

        let articleObj = {
          article: product.offer_id,
          quantity: product.quantity,
          name: product.name
        };
        articlesArr.push(articleObj);

        allPostingsCount += 1;
      })
    });

    // сортировка
    articlesArr.sort((a, b) => a.article.localeCompare(b.article));

    // группировка 1 + 1
    for (let i = 0; i < articlesArr.length - 1; i++) {
      if (articlesArr[i].article === articlesArr[i + 1].article) {
        articlesArr[i].quantity += ` + ${articlesArr[i + 1].quantity}`;
        articlesArr.splice(i + 1, 1);
        i--; // Чтобы проверить текущий элемент с новым следующим
      }
    }

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