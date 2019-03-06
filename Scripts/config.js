const port = process.env.PORT || 3001;                                                 // porta a escutar

module.exports = {
  // Ao exportar os 
  // objectos estamos a 
  // permitir que estes
  // sejam usados dentro 
  // de outros ficheiros
  // usando o 
  // require('./config');

  'url': 'mongodb://Goldenheaven:SDistribuidos1@ds044979.mlab.com:44979/clouddrive',   // url do mlab
  'port': port,                                                                        // porta a escutar
  'clientSecret': '_Vku0atp3Bm9W9AZg-p4bWzDx2AEnlZ1vcFut6ZBhhdkjihyB6uoBR3CMQlu6OOX'   // segredo do auth0
};