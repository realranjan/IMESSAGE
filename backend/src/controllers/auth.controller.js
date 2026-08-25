export async function checkAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "unAuthorized" });
  }

  res.status(200).json(req.user);
}
// this shows the user on frontend we can remove if
