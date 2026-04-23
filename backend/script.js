'use strict'

let getOzonOrders = function () {
  fetch('http://localhost:3000/api/ozon/unfulfilled-list', {
    method: 'POST'
  })
    .then(r => r.json())
    .then(console.log);
}

let getYandexCampaigns = function () {
  fetch('http://localhost:3000/api/yandex/campaigns')
    .then(r => r.json())
    .then(console.log);
}

let getYandexOrders = function () {
  fetch('http://localhost:3000/api/yandex/orders', {
    method: 'POST'
  })
    .then(r => r.json())
    .then(console.log);
}