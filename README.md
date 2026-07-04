# comrade-discord

A lightweight, strictly-typed wrapper for Discord.js slash commands and their interaction routing. Built to handle interaction contexts, permissions, and command options with full TypeScript inference.

## Features

- **Type-safe Options:** Command arguments are automatically parsed and strongly typed inside your callback as `options`.
- **Context Awareness:** Automatically handles and types `guild` and `channel` properties based on whether the command has been run in a Guild, DM, or group DM channel.
- **Automated Registration:** Maps commands straight to the Discord REST API with correct permission bitfields.

## Installation

### Bun

```bash
bun add comrade-discord
```

### pnpm

```
pnpm add comrade-discord
```

### npm

```
npm add comrade-discord
```

## Quickstart

### 1. Define a command

_Use createCommand to get full type inference for your options and context._

```typescript
// commands/ping.ts
import { createCommand } from 'comrade-discord';
import { ChannelType, InteractionContextType } from 'discord.js';

const ping = createCommand({
    name: 'send',
    description: 'Sends a message to a channel.',
    contexts: [InteractionContextType.Guild], // Can only be run in Guilds.
    defaultMemberPermissions: ['SendMessages'],
    options: [
        {
            name: 'channel',
            description: 'The target channel.',
            type: 'channel',
            required: true,
            channelTypes: [ChannelType.GuildText, ChannelType.PublicThread]
        },
        {
            name: 'message',
            description: 'Message content.',
            type: 'string',
            required: true
        }
    ],
    callback: async (ctx) => {
        await ctx.channel.send({
            content: `**${ctx.user.displayName} says:** ${ctx.options.message}`
        });

        await ctx.interaction.reply({
            content: `Message sent :thumbs_up:`
        });
    }
});

export default ping;
```

### 2. Register commands

_Run separate script via your package manager or add the registration directly into your bot script._

```typescript
// register.ts
import Comrade from 'comrade-discord';
import ping from './commands/ping';

const comrade = new Comrade([ping]);
await comrade.register(process.env.DISCORD_APP_ID!, process.env.DISCORD_TOKEN!);
console.log('Successfully registered slash commands.');
```

### 3. Handle interactions

_You just need to pass the interaction and comrade will handle it for you :)_

```typescript
// bot.ts
import { Client, GatewayIntentBits } from 'discord.js';
import Comrade from 'comrade-discord';
import ping from './commands/ping';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const comrade = new Comrade([ping]);

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        await comrade.passInteraction(interaction);
    }
});

client.login(process.env.DISCORD_TOKEN);
```

## Roadmap

- [x] `guild` and `channel` in ctx
- [x] Correctly typed `options` in ctx
- [x] Parser
- [x] Command registration
- [ ] Subcommands support
- [ ] Subcommand groups support
