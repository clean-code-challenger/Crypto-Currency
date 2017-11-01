const {
  MONGO_URI: mongoUri
} = process.env;

const mongoose = require('mongoose');

module.exports = (function () {
  mongoose.Promise = global.Promise;

  return {
    connect () {
      mongoose.connect(mongoUri, {
        useMongoClient: true
      }).then(
        () => {
          console.log('Succesfully connected to mongodb');
        }
      );
    }
  };
})();