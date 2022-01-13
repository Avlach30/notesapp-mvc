module.exports = (req, res, next) => {
  if (!req.session.isLogedIn) { //Jika user belum login
    console.log(`Sorry, you must login`);
    return res.redirect('/auth/login');
  }
  next() //Meneruskan ke middleware selanjutnya
}