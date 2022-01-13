exports.getIndex = (req, res, next) => {
  res.render('client/index', {
    titlePage: 'Home page',
    path: '/'
  });
};

exports.getAbout = (req, res, next) => {
  res.render('client/about', {
    titlePage: 'About',
    path: '/about',
    devName: 'Muhammad Zakia Avlach'
  })
}