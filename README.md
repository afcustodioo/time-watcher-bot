**Slackbot to see hour bank balance.**<br>

Instructions:

1 Generate a Slackbot and get your APIKEY.<br>
2 Run <code>npm install</code>

**To run in DEV mode:**

A. <code>json-server --watch db.json</code><br>
B. <code>BOT_API_KEY=your_slackbot_api_key ENVIRONMENT=DEV node bin/bot.js</code>


**To run in PROD mode:**

<code>BOT_API_KEY=your_slackbot_api_key node bin/bot.js</code><br>
 
 
PS: You can put your APIKEY in token.js and then simple run <code>node bin/bot.js</code>
 
 

 
Based on: <link>https://github.com/lmammino/norrisbot</link>
