require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  isDebug : false,
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  limitImageSize : 5,
  pageSize : 6,
  iconPath : 'https://s3.eu-central-1.amazonaws.com/omzug.com/favicon/apple-icon.png',
  noImagePath : 'https://s3.eu-central-1.amazonaws.com/omzug.com/favicon/no-image.jpg',
  mainGifPath : "https://s3.eu-central-1.amazonaws.com/omzug.com/gif/main.gif",
  app: {
    title: 'Omzug',//head changeable
    description: '找到心仪的家',
    introduction: '"撑起我们葡萄枝嫩叶般的家。"',
    head: {
      titleTemplate: 'Omzug : %s',
      meta: [
        {name: 'description', content: '找到心仪的家'},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'Omzug'},
        {property: 'og:image', content: 'https://react-redux.herokuapp.com/logo.jpg'},
        {property: 'og:locale', content: 'en_US'},
        {property: 'og:title', content: 'Omzug'},
        {property: 'og:description', content: 'Locate yourself in another lovely place.'},
        {property: 'og:card', content: 'summary'},
        {property: 'og:site', content: '@hanwencheng'},
        {property: 'og:creator', content: '@hanwencheng'},
        {property: 'og:title', content: 'DeLocate'},
        {property: 'og:description', content: 'Locate yourself in another lovely place.'},
      ]
    }
  },

}, environment);
