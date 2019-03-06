let session;

const UpdateSession = function (newSession) {
    session = newSession;
}

const GetSession = function () {
    return session;
}

module.exports = {
    UpdateSession: UpdateSession,
    GetSession: GetSession
}