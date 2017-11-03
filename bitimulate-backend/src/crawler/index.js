require('dotenv').config();

const db = require('db');
const poloniex = require('lib/poloniex');
const ExchangeRate = require('db/models/ExchangeRate');

const socket = require('./socket');
const {parseJSON, polyfill} = require('lib/common');

db.connect();
socket.connect();

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

async function updateEntireRate() {
  const tickers = await poloniex.getTickers();

  const keys = Object.keys(tickers);

  const promises = keys.map(
    key => {
      return ExchangeRate.updateTicker(key, tickers[key]);
    }
  );

  try {
    await Promise.all(promises);
  } catch (e) {
    console.error('Oops, failed to update entire rate!');
    return;
  }

  console.log('Updated entire rate.');
}

const messageHandler = {
  1002: async (data) => {
    if (!data) return;
    const converted = poloniex.convertToTickerObject(data);
    const { name } = converted;
    const rest = polyfill.objectWithoutProperties(converted, 'name');

    try {
      // console.log('----------------------------------');
      const updated = await ExchangeRate.updateTicker(name, rest);
      // console.log('[Update]', name, new Date());
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

socket.handleRefresh = () => {
  updateEntireRate();
};

// registerInitialExchangeRate();
