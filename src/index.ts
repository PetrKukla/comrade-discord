import {
    type Channel,
    type ChatInputCommandInteraction,
    InteractionContextType,
    PermissionsBitField,
    REST,
    Routes,
    SlashCommandBuilder,
    type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import {
    type AllowedContextChannel,
    type Command,
    channelTypesFromContexts,
    createCommand
} from './command';
import type { Option, OptionsToObject, OptionValue } from './option';

/** Wrapper for slash command creation and their interaction handling.
 * */
class Comrade {
    public constructor(private commands: Command<any, any>[]) {}

    public async register(appId: string, token: string) {
        const _commands = this.commands.map((cmd) => {
            const builder = new SlashCommandBuilder()
                .setName(cmd.name)
                .setDescription(cmd.description)
                .setContexts(cmd.contexts)
                .setDefaultMemberPermissions(
                    cmd.defaultMemberPermissions.reduce(
                        (acc, curr) => acc | PermissionsBitField.Flags[curr],
                        BigInt(0)
                    )
                );

            return this.addOptions(builder, cmd.options);
        });

        const rest = new REST({ version: '10' }).setToken(token);
        await rest.put(Routes.applicationCommands(appId), {
            body: _commands
        });
    }

    /** Returns true if an interaction callback was called, otherwise returns false. */
    public async passInteraction(
        interaction: ChatInputCommandInteraction
    ): Promise<boolean> {
        const cmd = this.commands.find(
            (cmd) => cmd.name === interaction.commandName
        );
        if (!cmd) return false;

        // Checks, whether contexts allow the channel.
        if (
            !interaction.channel ||
            !this.isAllowedChannel(cmd, interaction.channel)
        ) {
            throw new Error(
                `${interaction.channel!.type} is not allowed channel for ${cmd.name} command.`
            );
        }

        // Checks, whether guild is present in situation of guild-only contexts.
        if (
            cmd.contexts.includes(InteractionContextType.Guild) &&
            cmd.contexts.length === 1 &&
            !interaction.guild
        ) {
            throw new Error(
                `Guild missing in ${cmd.name} command, where it is mandatory.`
            );
        }

        await cmd.callback({
            user: interaction.user,
            interaction,
            channel: interaction.channel,
            guild: interaction.guild,
            options: this.parseOptions(interaction, cmd.options)
        });
        return true;
    }

    private parseOptions<T extends readonly Option[]>(
        interaction: ChatInputCommandInteraction,
        options: T
    ): OptionsToObject<T> {
        const res: Record<string, any> = {};
        for (const option of options) {
            switch (option.type) {
                case 'attachment': {
                    this.handleOptionParse(
                        res,
                        option,
                        interaction.options.getAttachment(option.name)
                    );
                    break;
                }
                case 'boolean': {
                    this.handleOptionParse(
                        res,
                        option,
                        interaction.options.getBoolean(option.name)
                    );
                    break;
                }
                case 'channel': {
                    this.handleOptionParse(
                        res,
                        option,
                        interaction.options.getChannel(option.name) as any
                    );
                    break;
                }
                case 'integer': {
                    this.handleOptionParse(
                        res,
                        option,
                        interaction.options.getInteger(option.name)
                    );
                    break;
                }
                case 'mentionable': {
                    this.handleOptionParse(
                        res,
                        option,
                        interaction.options.getMentionable(option.name)
                    );
                    break;
                }
                case 'number': {
                    this.handleOptionParse(
                        res,
                        option,
                        interaction.options.getNumber(option.name)
                    );
                    break;
                }
                case 'role': {
                    this.handleOptionParse(
                        res,
                        option,
                        interaction.options.getRole(option.name)
                    );
                    break;
                }
                case 'string': {
                    this.handleOptionParse(
                        res,
                        option,
                        interaction.options.getString(option.name)
                    );
                    break;
                }
                case 'user': {
                    this.handleOptionParse(
                        res,
                        option,
                        interaction.options.getUser(option.name)
                    );
                    break;
                }
            }
        }
        return res as OptionsToObject<T>;
    }

    private handleOptionParse<T extends Option>(
        res: Record<string, any>,
        option: T,
        value: OptionValue<T> | null
    ) {
        res[option.name] = value ?? undefined;
        if (option.required && res[option.name] === undefined) {
            throw new Error(
                `Missing required option ${option.name} of type ${option.type}.`
            );
        }
    }

    private isAllowedChannel<TContexts extends InteractionContextType[]>(
        command: Command<TContexts, any>,
        channel: Channel
    ): channel is AllowedContextChannel<TContexts[number]> {
        const channelTypes = channelTypesFromContexts(command.contexts);
        return channelTypes.includes(channel.type);
    }

    private addOptions(
        builder: SlashCommandBuilder,
        options: readonly Option[]
    ) {
        let optionsBuilder: SlashCommandOptionsOnlyBuilder | null = null;
        for (const option of options) {
            optionsBuilder = this.addOption(builder, option);
        }
        return optionsBuilder ?? builder;
    }

    private addOption(builder: SlashCommandBuilder, option: Option) {
        switch (option.type) {
            case 'attachment': {
                return builder.addAttachmentOption((opt) =>
                    opt
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                );
            }
            case 'boolean': {
                return builder.addBooleanOption((opt) =>
                    opt
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                );
            }
            case 'channel': {
                return builder.addChannelOption((opt) =>
                    opt
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                        .addChannelTypes(option.channelTypes)
                );
            }
            case 'integer': {
                return builder.addIntegerOption((opt) =>
                    opt
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                );
            }
            case 'mentionable': {
                return builder.addMentionableOption((opt) =>
                    opt
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                );
            }
            case 'number': {
                return builder.addNumberOption((opt) =>
                    opt
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                );
            }
            case 'role': {
                return builder.addRoleOption((opt) =>
                    opt
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                );
            }
            case 'string': {
                return builder.addStringOption((opt) =>
                    opt
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                );
            }
            case 'user': {
                return builder.addUserOption((opt) =>
                    opt
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                );
            }
        }
    }
}

export default Comrade;
export { createCommand };
