'use strict'

const BACKEND_URL = 'http://localhost:3000';

let getOzonOrdersFromBrowser = async function (market, section) {
  const ozonKey = 'f6e35d96-e8a3-4f32-aacf-f86ce60ef9df';
  const ozonClientID = 36739;

  let time7DaysAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
  let time14DaysAhead = new Date(new Date().setDate(new Date().getDate() + 14)).toISOString();

  let sectionButton = section.querySelector('.section__load-button');

  const requestBody = {
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

  sectionButton.disabled = true;

  try {
    let response = await fetch('https://api-seller.ozon.ru/v3/posting/fbs/unfulfilled/list', {
      method: 'POST',
      headers: {
        'Host': 'api-seller.ozon.ru',
        'Client-Id': ozonClientID,
        'Api-Key': ozonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Ошибка при получении заказов озон из браузера: ${response.status} ${response.statusText}`)
    }

    let result = await response.json();
    console.log(`Ответ от запроса браузера к ${market}:\n`, result);
    processOrders(result, market, section);

  } catch (error) {
    console.error('Ошибка при запросе из браузера:', error);
  } finally {
    sectionButton.style.backgroundColor = 'var(--color-green)';
    setTimeout(() => {
      sectionButton.style.backgroundColor = 'revert-layer',
        sectionButton.disabled = false;
    }, 2000);
  }
}

let getOrdersFromServer = async function (market, section) {
  let sectionButton = section.querySelector('.section__load-button');

  sectionButton.disabled = true;

  try {
    let response = await fetch(`${BACKEND_URL}/api/${market}/orders`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Наш сервер выдал ошибку: ${response.status} ${response.statusText}`);
    }

    let result = await response.json();
    console.log(`Ответ от запроса сервера к ${market}:\n`, result);
    processOrders(result, market, section);

  } catch (error) {
    console.error('Ошибка при запросе:', error);
    sectionButton.disabled = false;
  } finally { // TODO: сделать при catch темный background в setTimeout
    sectionButton.style.backgroundColor = 'var(--color-green)';
    setTimeout(() => {
      sectionButton.style.backgroundColor = 'revert-layer',
        sectionButton.disabled = false;
    }, 2000);
  }
};

let processOrders = function (data, market, section) {
  let sectionButton = section.querySelector('.section__load-button');
  let sectionTextArea = section.querySelector('.section__textarea');
  let sectionOrdersCount = section.querySelector('.orders-count');
  let sectionGoodsCount = section.querySelector('.goods-count');
  let sectionLastloadTime = section.querySelector('.section__lastload-time');
  let sectionCopyButton = section.querySelector('.section__copy-button');

  let marketProperties = [
    {
      'market': 'ozon',
      'ordersArray': ['result', 'postings'],
      'productsArray': 'products',
      'article': 'offer_id',
      'name': 'name',
      'quantity': 'quantity',
    },
    {
      'market': 'yandex',
      'ordersArray': ['orders'],
      'productsArray': 'items',
      'article': 'offerId',
      'name': 'offerName',
      'quantity': 'count',
    },
    {
      'market': 'ali',
      'ordersArray': ['data', 'orders'],
      'productsArray': 'order_lines',
      'article': 'sku_code',
      'name': 'name',
      'quantity': 'quantity',
    },
  ]

  let currentMarket = marketProperties.find((obj) => obj.market === market);
  let ordersArray = currentMarket.ordersArray.reduce((sum, value) => {
    return sum[value];
  }, data);

  let ordersQuantity = ordersArray.length;
  let allProductsText = '';
  let allProductsCount = 0;
  let articlesArr = [];
  let noArticleCounter = 1;

  ordersArray.forEach((order) => {
    order[currentMarket.productsArray].forEach((product) => {

      // в АЛИ есть товары без артикула
      let article = product[currentMarket.article];
      if (!article) {
        article = `БЕЗ_АРТИКУЛА_${noArticleCounter}`;
        noArticleCounter++
      }

      // обрезка A_
      while (article.startsWith('A_')) {
        article = article.substring(2) || 'no-article';
      };

      let articleObj = {
        article: article,
        name: product[currentMarket.name],
        quantity: product[currentMarket.quantity],
      };
      articlesArr.push(articleObj);

      allProductsCount += 1;
    })
  });

  // сортировка
  articlesArr.sort((a, b) => a.article.localeCompare(b.article, undefined, { numeric: true }));

  // группировка 1 + 1
  for (let i = 0; i < articlesArr.length - 1; i++) {
    if (articlesArr[i].article === articlesArr[i + 1].article) {
      articlesArr[i].quantity += ` + ${articlesArr[i + 1].quantity}`;
      articlesArr.splice(i + 1, 1);
      i--; // Чтобы проверить текущий элемент с новым следующим
    }
  }

  articlesArr.forEach((e) => {
    allProductsText += `${e.article} |${e.quantity} шт| ${e.name}\n`;
  });

  sectionOrdersCount.textContent = ordersQuantity;
  sectionTextArea.value = allProductsText;
  sectionGoodsCount.textContent = allProductsCount;
  sectionLastloadTime.textContent = new Date().toLocaleTimeString();
}

let fetchOrders = function (event) {
  let button = event.target.closest('.section__load-button');
  //if (!button) return;

  let section = event.target.closest('.section');
  let serverCheckbox = section.querySelector('.toggle-server-checkbox');

  if (button.id === 'ozon-button') {
    if (serverCheckbox.checked) {
      getOrdersFromServer('ozon', section);
    } else {
      getOzonOrdersFromBrowser('ozon', section);
    }

  } else if (button.id === 'yandex-button') {
    if (serverCheckbox.checked) {
      getOrdersFromServer('yandex', section);
    } else {
      console.log('Отправка только с сервера');
    }

  } else if (button.id === 'aliexpress-button') {
    if (serverCheckbox.checked) {
      getOrdersFromServer('ali', section);
    } else {
      console.log('Отправка только с сервера');
    }
  }
}

let copyTextareaOrders = async function () {
  let button = event.target.closest('.section__copy-button');
  if (!button) return;

  let section = event.target.closest('.section');
  let copyButton = section.querySelector('.section__copy-button')
  let textarea = section.querySelector('.section__textarea');

  try {
    await navigator.clipboard.writeText(textarea.value);
    copyButton.style.backgroundColor = 'var(--color-green)';
    copyButton.disabled = true;

    setTimeout(() => {
      copyButton.style.backgroundColor = 'revert-layer',
        copyButton.disabled = false;
    }, 2000);

  } catch (error) {
    alert('Ошибка копирования')
  };
}

let pingServer = async function () {
  try {
    renderPingCircle('⌛', 'Ожидание ответа');
    let response = await fetch(`${BACKEND_URL}/api/server-status`, {
      cache: 'no-cache'
    });

    if (response.ok) {
      renderPingCircle('🟢', 'Включен');
    } else {
      renderPingCircle('🔴', 'Включен, но что-то не так');
    }
  } catch {
    renderPingCircle('⚪', 'Выключен');
  }
}

let renderPingCircle = function (coloredCircle, titleText) {
  let circle = document.body.querySelector('.server-status');
  circle.textContent = coloredCircle;
  circle.title = titleText;
}

document.body.addEventListener('click', (event) => {
  if (event.target.closest('.section__load-button')) fetchOrders(event);
  copyTextareaOrders(event);
  if (event.target.closest('#ping-button')) pingServer(event);
})

pingServer();