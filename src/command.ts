import {
    ChannelType,
    type ChatInputCommandInteraction,
    type DMChannel,
    type Guild,
    type GuildTextBasedChannel,
    InteractionContextType,
    type PartialGroupDMChannel,
    type PermissionsBitField,
    type User
} from 'discord.js';
import type { Option, OptionsToObject } from './option';

type ContextMap = {
    [InteractionContextType.Guild]: {
        guild: Guild;
        channel: GuildTextBasedChannel;
    };

    [InteractionContextType.BotDM]: {
        channel: DMChannel;
    };

    [InteractionContextType.PrivateChannel]: {
        channel: PartialGroupDMChannel;
    };
};

export type AllowedContextChannel<T extends InteractionContextType> =
    ContextMap[T]['channel'];

export function channelTypesFromContexts(contexts: InteractionContextType[]) {
    return contexts.flatMap((ctx) => {
        switch (ctx) {
            case InteractionContextType.BotDM: {
                return [ChannelType.DM];
            }
            case InteractionContextType.PrivateChannel: {
                return [ChannelType.GroupDM];
            }
            case InteractionContextType.Guild: {
                return [
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement,
                    ChannelType.PublicThread,
                    ChannelType.PrivateThread,
                    ChannelType.AnnouncementThread,
                    ChannelType.GuildForum,
                    ChannelType.GuildMedia,
                    ChannelType.GuildCategory
                ];
            }
            default:
                return [];
        }
    });
}

type ContextExtras<T extends readonly InteractionContextType[]> =
    ContextMap[T[number]];

export type CommandCtx<
    TContexts extends readonly InteractionContextType[],
    TOptions extends readonly Option[]
> = {
    user: User;
    interaction: ChatInputCommandInteraction;
} & ContextExtras<TContexts> &
    (TOptions['length'] extends 0
        ? Record<string, never>
        : {
              options: OptionsToObject<TOptions>;
          });

export type Command<
    TContexts extends InteractionContextType[],
    TOptions extends readonly Option[]
> = {
    name: string;
    description: string;
    contexts: TContexts;
    options: TOptions;
    defaultMemberPermissions: readonly (keyof typeof PermissionsBitField.Flags)[];
    callback: (ctx: CommandCtx<TContexts, TOptions>) => Promise<void>;
};

export function createCommand<
    const TContexts extends InteractionContextType[],
    const TOptions extends readonly Option[]
>(cmd: Command<TContexts, TOptions>) {
    return cmd;
}
