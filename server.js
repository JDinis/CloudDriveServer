const session = require('./Scripts/Session'),
    app = require('./Scripts/expressDados').app,
    db = require('./Scripts/db'),
    UserRoutes = require('./Routes/UserRoutes').UserRoutes(app, session, db),
    AdminRoutes = require('./Routes/AdminRoutes').AdminRoutes(app, session, db),
    DriveRoutes = require('./Routes/DriveRoutes').DriveRoutes(app, session, db),
    path = require('path');

UserRoutes;
AdminRoutes;
DriveRoutes;

app.get('*', function (req, res) {
    session.UpdateSession(req.session);
    res.sendFile(path.resolve('clouddrive/build/index.html'))
});