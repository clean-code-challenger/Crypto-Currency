require('dotenv').config();

const db = require('db');
const poloniex = require('lib/poloniex');
const ExchangeRate = require('db/models/ExchangeRate');

db.connect();

async function registerInitialExchangeRate () {
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

registerInitialExchangeRate();