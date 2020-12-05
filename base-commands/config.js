const init = (context) => {
    // run through client.guilds, check configs in nosql db, if not there, create default
    //const foundConfig = context.nosql.get('config')
        //.find({"serverID": context.guild.id})
    context.guilds.cache.forEach((guild, guildId) => {
        const foundConfig = context.nosql.get('config')
            .find({serverID: guildId})
            .value()
        if (!foundConfig) {
            console.log("config not found, generating a new one")
            context.nosql.get('config')
                .push({
                    serverID: guildId, config: {
                        "administrators": [guild.owner.id],

                        "starEmoji": "⭐",
                        "starEmbedColor": 15844367,
                        "starMinCount": 1,

                        "retryCount": 3,
                        "hangmanTimeout": 600000,

                        "maxVideoSize": 10000000,
                        "videoDownloadTimeout": 5000
                    }
                })
                .write()
        }
    })
    // per server, get highest role of server, add people with that role to admin list
}

const edit = (context) => {
    // list all config properties for the current server, in dms
    // have user select one of the properties
    // after selection, await new input // TODO: MAKE ROBUST ERROR CHECKING
}

module.exports = {
    init,
    edit
}