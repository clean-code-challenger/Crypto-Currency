require('dotenv').config();

const db = require('db');
const poloniex = require('lib/poloniex');
const ExchangeRate = require('db/models/ExchangeRate');

const socket = require('./socket');
const {parseJSON, polyfill} = require('lib/common');

db.connect();
socket.connect();

const messageHandler = {
  1002: async (data) => {
    if (!data) return;
    console.log('----------------------------------');
    const converted = poloniex.convertToTickerObject(data);
    console.log(converted);
    const {name} = converted;
    const rest = polyfill.objectWithoutProperties(converted, 'name');

    try {
      const updated = await ExchangeRate.updateTicker(name, rest);
      console.log(updated);
    } catch (e) {
      console.error(e);
    }
  }
};

socket.handleMessage = (message) => {
  const parsed = parseJSON(message);
  if (!parsed) {
    return null;
  }

  const [type, meta, data] = parsed;
  
  // if (typeof data === 'object') {
  //   message = poloniex.convertToTickerObject(data);
  //   console.log(message);
  // }

  if (messageHandler[type]) {
    messageHandler[type](data);
  }
};

async function registerInitialExchangeRate () {

  // remove database
  await ExchangeRate.drop();

  const tickers = await poloniex.getTickers();
  const keys = Object.keys(tickers);
  console.log(keys.length);
  const promises = keys.map( 
    key => {
      const ticker = tickers[key];

      const data = Object.assign({name: key}, ticker);
      const exchangeRate = new ExchangeRate(data);      
      return exchangeRate.save();
    }
  );

  try {
    await Promise.all(promises);
  } catch (e) {
    console.log(e);
  }

  console.log('succed');
}

// registerInitialExchangeRate();