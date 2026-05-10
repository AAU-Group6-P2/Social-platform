/*This function checks the users role  */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) { //user is not logged in
      return res.status(401).send("Not logged in");
    }

    if (req.session.user.role !== role) { //loged in but has wrong role 
      return res.status(403).send("Not allowed");
    }

    next(); // allowes as has correct role
  };
}