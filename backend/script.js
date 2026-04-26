'use strict'

const BACKEND_URL = 'http://localhost:3000';

{
  let getOzonOrdersButton = document.querySelector('#getOzonOrders');
  let getYandexCampaignsButton = document.querySelector('#getYandexCampaigns');
  let getYandexOrdersButton = document.querySelector('#getYandexOrders');
  let getAliOrdersButton = document.querySelector('#getAliOrders');

  getOzonOrdersButton.addEventListener('click', e => {
    getOzonOrders();
  });
  getYandexCampaignsButton.addEventListener('click', e => {
    getYandexCampaigns();
  })
  getYandexOrdersButton.addEventListener('click', e => {
    getYandexOrders();
  })
  getAliOrdersButton.addEventListener('click', e => {
    getAliOrders();
  })

  let getOzonOrders = function () {
    fetch(`${BACKEND_URL}/api/ozon/unfulfilled-list`, {
      method: 'POST'
    })
      .then(r => r.json())
      .then(console.log);
  }

  let getYandexCampaigns = function () {
    fetch(`${BACKEND_URL}/api/yandex/campaigns`)
      .then(r => r.json())
      .then(console.log);
  }

  let getYandexOrders = function () {
    fetch(`${BACKEND_URL}/api/yandex/orders`, {
      method: 'POST'
    })
      .then(r => r.json())
      .then(console.log);
  }

  let getAliOrders = function () {
    fetch(`${BACKEND_URL}/api/ali/orders`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(console.log);
  }
}

{
  async function checkServerStatus() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/server-status`, {
        method: 'GET',
        cache: 'no-cache'
      });
      // сервер включен или ошибка метода
      const statusText = response.ok ? '🟢' : `🔴 (${response.status}: ${response.statusText} ${response.url})`;

      console.log(`Server: ${statusText}`);
    } catch (error) { // сервер выключен
      console.log(
        `Server: 🔴 (${error.name}: ${error.message})`
      );

    }
  }

  // сразу первый раз
  checkServerStatus();

  // каждые 5 секунд
  //setInterval(checkServerStatus, 5000);
}

