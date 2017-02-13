'use strict';

var util = require('util');
var path = require('path');
var Bot = require('slackbots');
var request = require("request");
var format = require('date-format');

var dev_url = 'http://localhost:3000/bancohoras?matricula=';
var prod_url = 'http://srvfinanceiro:8035/api/bancohoras/';

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "time-watcher-bot")
 *
 * @param {object} settings
 * @constructor
 *
 * @author Anderson Fernando Custódio <afcustodioo@gmail.com>
 */
var TimeWatcherBot = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'time-watcher-bot';
  this.settings.environment = this.settings.environment || 'PROD';
  this.user = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(TimeWatcherBot, Bot);

/**
 * Run the bot
 * @public
 */
TimeWatcherBot.prototype.run = function () {
  TimeWatcherBot.super_.call(this, this.settings);

  this.on('message', this._onStart);
  this.on('message', this._onMessage);
};

/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
TimeWatcherBot.prototype._onStart = function () {
  this._loadBotUser();
};

/**
 * On message callback, called when a message (of any type) is detected with the real time messaging API
 * @param {object} message
 * @private
 */
TimeWatcherBot.prototype._onMessage = function (message) {
  if (this._isChatMessage(message) &&
    this._isChannelConversation(message) && !this._isFromTimeWatcherBot(message) &&
    this._isMentioningKeyWord(message)
  ) {
    this._replyWithHourBankBalance(message);
  }
};

/**
 * Replyes to a message with a hour bank balance
 * @param {object} originalMessage
 * @private
 */
TimeWatcherBot.prototype._replyWithHourBankBalance = function (originalMessage) {
  var self = this;
  var channel = self._getChannelById(originalMessage.channel);

  var matricula = originalMessage.text.split('banco ')[1];

  self.getSaldo(matricula, function (body) {

    var parsedBody = self.parse(body);

    var name = parsedBody.nome.split(' ')[0];
    var signal = parsedBody.devedor ? '-' : '+';
    var time = self.convertDuration(parsedBody.horas);
    var dateFormatted = format.asString('dd/MM/yyyy', new Date(parsedBody.data));

    self.postMessageToChannel(channel.name, `Olá ${name}! Seu saldo é de ${signal}${time} até ${dateFormatted}.`, {as_user: true});
  });

};

TimeWatcherBot.prototype.convertDuration = function(date) {
  var hour = date.match(/\d*H/);
  var minute = date.match(/\d*M/);

  if(hour) {
    return hour + minute;
  }

  return minute;
};

/**
 * Loads the user object representing the bot
 * @private
 */
TimeWatcherBot.prototype._loadBotUser = function () {
  var self = this;
  this.user = this.users.filter(function (user) {
    return user.name === self.name;
  })[0];
};

/**
 * Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
TimeWatcherBot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && Boolean(message.text);
};

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
TimeWatcherBot.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' &&
    message.channel[0] === 'C'
    ;
};

/**
 * Util function to check if a given real time message is mentioning 'banco' or the time-watcher-bot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
TimeWatcherBot.prototype._isMentioningKeyWord = function (message) {
  return message.text.toLowerCase().search('banco ') > -1 ||
    message.text.toLowerCase().indexOf(this.name) > -1;
};

/**
 * Util function to check if a given real time message has ben sent by the time-watcher-bot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
TimeWatcherBot.prototype._isFromTimeWatcherBot = function (message) {
  return message.user === this.user.id;
};

/**
 * Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
TimeWatcherBot.prototype._getChannelById = function (channelId) {
  return this.channels.filter(function (item) {
    return item.id === channelId;
  })[0];
};

TimeWatcherBot.prototype.getSaldo = function (matricula, onSuccess) {
  var options = {
    method: 'GET',
    url: this.getAPI() + matricula,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/plain, */*'
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    onSuccess(body);
  });
};

TimeWatcherBot.prototype.parse = function (body) {
  if (this.settings.environment === 'PROD') {
    return JSON.parse(body);
  } else {
    return JSON.parse(body)[0];
  }
};

TimeWatcherBot.prototype.getAPI = function () {

  if (this.settings.environment === 'PROD') {
    return prod_url;
  }
  return dev_url;
};

module.exports = TimeWatcherBot;
