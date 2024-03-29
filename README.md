# Discord Tunes
Discord tunes is a framework to set up your own audio playing bot for discord, operated with slash commands on discord. Currently only YouTube videos are supported.

## Setup

### Initial setup
You will need to create and register an application and bot on the Discord developer portal [here](https://discord.com/developers/docs/intro). Additionally, Discord Tunes requires Node v16.14.2 or later

### Installation
1. If you do not have it already, download and install [Node JS](https://nodejs.org/en/) for your platform

2. Download code repository onto your machine\

3. Rename `/config/options.template.json` to `/config/options.json`

3. Add credentials to `/config/options.json`. See below for explanation of each variable.

3. Open a console window and navigate to the code directory

4. Run `npm i` to install all necessary dependencies

5. Run `npm deploy-commands` to deploy slash commands to your server. This may take a few minutes to register.

5. Run `npm start` to activate the service.

## System options
The file in `/config/options.json` contains important items in order to run your bot.

`clientId` - also known as the application id, this can be found on the General Information page on your application page in the discord dev porrtal

`token` - this is the token for the bot itself. this is shown to you when you create the bot in the dev portal.

(optional) `devGuildId` - this is the id for your "dev guild" where you will be able to use as a sandbox.

(optional) `mainGuildId` - this is the id for your main server that you will be running the bot in. while commands will be set globally, setting your guild id here will have the commands be applied to your server instantly

(optional) `loggerChannel` - this is the channel where log messages can be printed. if no logger channel is set, console messages will be printed to the console. errors will always be printed to the console regardless of whether a logger channel is set or not

## Deploying the bot
The service must be running for the bot to work. While you can run it on any machine, running then service on a cloud computing service allows it to be persistent.

1. Sign up for a cloud computing service like [Vultr](https://www.vultr.com/?ref=8987028-8H) (click the link to get an $100 credit)
2. Configure the server and install node js
3. Follow the instructions above to install on the cloud computer
4. It is recommended to install pm2 which is a process manager. This will allow you to run and manage the process without blocking the console
5. run `npm install pm2 -g` to install pm2
6. run `pm2 start <path to index.js>` to start the process
  - run `pm2 start <path to index.js> --name <bot name>` to run process with name
7. to stop the service, run `pm2 stop <bot name>`
