exports.error404 = (req, res, next) => {
  res.status(404).render('error404', {
    titlePage: 'Page Not Found',
    path: '/404',
    isAuthenticated: req.session.isLogedIn
  });
};


exports.error500 = (req, res, next) => {
  res.status(500).render('error500', {
    titlePage: 'Error Occured', 
    path: '/500',
    isAuthenticated: req.session.isLogedIn
  });
}