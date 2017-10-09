var restify = require('restify');
var builder = require('botbuilder');
var http = require('https');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back
var bot = new builder.UniversalBot(connector, [function (session) {
    session.beginDialog('welcome');
}]);

bot.dialog('welcome', [
    function (session) {
        session.send("Welcome to Trivia Bot!");
        builder.Prompts.text(session, "Type \'start\' to get a question");
    },
    function (session, results) {
        if (results.response == 'start') {
            session.beginDialog('startGame');
        } else {
            session.endDialog();
        }
    }
]);
bot.dialog('startGame', [
    function(session) {
        http.get('https://opentdb.com/api.php?amount=1&type=multiple', function(result) {
            result.setEncoding("utf8");
            let body = "";
            result.on("data", data => {
                body += data;
            });
            result.on("end", () => {
                body = JSON.parse(body);
                session.send('%s', body.results[0].question);
            });
        });
        session.endDialog();
    }
]);