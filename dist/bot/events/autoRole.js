"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (client, instance) => {
    client.on("guildMemberAdd", async (member) => {
        const autoroles = client.cache.autoroles.filter((r) => r.guildId === member.guild.id);
        if (!autoroles.length)
            return;
        const roles = autoroles.map((r) => r.roleId);
        await member.roles.add(roles, "AutoRole").catch(() => { });
    });
};
