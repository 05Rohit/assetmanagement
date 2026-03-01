
const authenticateToken = (req, res, next) => {
    //console.log("csalled");
   
  const token = req.cookies.jwt;
  if (!token)
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return next(new AppError("Token is invalid or has expired.", 403));
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
