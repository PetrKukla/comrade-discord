import {
    type APIAnnouncementThreadChannel,
    type APIInteractionDataResolvedGuildMember,
    type APIRole,
    type ApplicationCommandOptionAllowedChannelType,
    type Attachment,
    type CategoryChannel,
    ChannelType,
    type DMChannel,
    type ForumChannel,
    type GuildMember,
    type NewsChannel,
    type PartialGroupDMChannel,
    type PrivateThreadChannel,
    type PublicThreadChannel,
    type Role,
    type TextChannel,
    type User
} from 'discord.js';

type ChannelTypeMap = {
    [ChannelType.DM]: DMChannel;
    [ChannelType.GroupDM]: PartialGroupDMChannel;
    [ChannelType.GuildText]: TextChannel;
    [ChannelType.GuildAnnouncement]: NewsChannel;
    [ChannelType.PublicThread]: PublicThreadChannel;
    [ChannelType.PrivateThread]: PrivateThreadChannel;
    [ChannelType.AnnouncementThread]: APIAnnouncementThreadChannel;
    [ChannelType.GuildForum]: ForumChannel;
    [ChannelType.GuildCategory]: CategoryChannel;
};

type ChannelFromTypes<T extends readonly ChannelType[]> =
    T[number] extends keyof ChannelTypeMap ? ChannelTypeMap[T[number]] : never;

type BaseOption = {
    name: string;
    description: string;
    required: boolean;
};

export type Option =
    | ({ type: 'attachment' } & BaseOption)
    | ({ type: 'boolean' } & BaseOption)
    | ({
    type: 'channel';
    channelTypes: ApplicationCommandOptionAllowedChannelType[];
} & BaseOption)
    | ({ type: 'integer' } & BaseOption)
    | ({ type: 'mentionable' } & BaseOption)
    | ({ type: 'number' } & BaseOption)
    | ({ type: 'role' } & BaseOption)
    | ({ type: 'string' } & BaseOption)
    | ({ type: 'user' } & BaseOption);

export type OptionValue<T> = T extends { type: 'string' }
    ? string
    : T extends { type: 'number' }
        ? number
        : T extends { type: 'integer' }
            ? number
            : T extends { type: 'boolean' }
                ? boolean
                : T extends { type: 'attachment' }
                    ? Attachment
                    : T extends { type: 'user' }
                        ? User
                        : T extends { type: 'role' }
                            ? Role | APIRole
                            : T extends { type: 'mentionable' }
                                ? // TODO: Řešit nějak APIRole?
                                | User
                                | Role
                                | GuildMember
                                | APIRole
                                | APIInteractionDataResolvedGuildMember
                                : T extends {
                                        type: 'channel';
                                        channelTypes: readonly ChannelType[];
                                    }
                                    ? ChannelFromTypes<T['channelTypes']>
                                    : never;

export type OptionsToObject<T extends readonly Option[]> = {
    [O in T[number] as O['name']]: O['required'] extends true
        ? OptionValue<O>
        : OptionValue<O> | undefined;
};
