const express = require("express") // npm i express
const app = express();
const fs = require('fs'); // npm i fs
const ms = require('ms'); // npm i ms
const topics = require("muslim-bag"); // npm i muslim-bag
const moment = require('moment'); // npm i moment
//const { SlashCommandBuilder } = require('@discordjs/builders');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const Canvas = require('canvas');


var listener = app.listen(process.env.PORT || 2000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
app.listen(() => console.log("I'm Ready To Work..! 24H"));
app.get('/', (req, res) => {
  res.send(`
  <body>
  <center><h1>Bot 24H ON!</h1></center
  </body>`)
});

require('dotenv').config();
const { 
  Client,
  Intents,
  MessageAttachment,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  Modal,
  TextInputComponent,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  ButtonBuilder,
  ButtonStyle,
  Events,
  GatewayIntentBits,
  StringSelectMenuBuilder
} = require('discord.js');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILD_VOICE_STATES, 
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS, // تأكد من استخدام Intents.FLAGS
        Intents.FLAGS.MESSAGE_CONTENT // أضف هذا إذا كنت تحتاج الوصول لمحتوى الرسائل
    ],
    partials: ['CHANNEL'] // تأكد من تضمين الـ partials للتعامل مع الرسائل الخاصة
});
//const prefix = '=';
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
client.setMaxListeners(99999);
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const prefix = config.prefix;


const yes = "<a:yes:890521096821014539>";
const yes2 = "<a:yes2:931328135654416384>";
const no = "<a:gif10:931328070013583391>";
const like = "<:Like:931640040164032524>";
const dislike = "<:Dislike:931640039878828033>";
const warn = "<:warn:929436641330884608>"; //مثلث تحذير
const police = "<a:police:930968126965821461>";
const dance = "<a:gif18:892141765283426368>"; //طفل يرقص
const emo1 = "<a:gif14:930968078957838397>"; //ايموجي سهم ملون
const emo2 = "<a:gif21:892141696782061628>"; //ايموجي كوبوي
const emo3 = "<a:gif20:892141730185490483>"; //ايموجي سواق
const emo4 = "<:emoji17:892141689223933982>"; // بنت رافعة ايديها
const boost = "<a:gif07:932563717151924244>"; // قط ريمبو يرقص
const news = "<a:news:938583285725036604>"; //ايموجي جديد
const hmm = "<:hmm:894334999623503972>"; // ايموجي شك
const cute = "<:cuteheart:890924622361559060>"; // ايموجي كيوت قبل




// تخزين معلومات الرومات المؤقتة
const tempChannels = new Map();

client.once('ready', () => {
  console.log(`✅ ${client.user.tag} جاهز للعمل!`);
});

client.on('messageCreate', async message => {
  if (!message.member.permissions.has('ADMINISTRATOR')) return;
  
  if (message.content === '!إنشاء-روم') {
    // الحصول على جميع الفئات (categories) في السيرفر
    const categories = message.guild.channels.cache.filter(ch => ch.type === 'GUILD_CATEGORY');
    
    if (categories.size === 0) {
      return message.reply('لا توجد فئات متاحة في السيرفر!');
    }
    
    // إنشاء القائمة المنسدلة
    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('select_category')
          .setPlaceholder('اختر الفئة المطلوبة')
          .addOptions(
            categories.map(category => ({
              label: category.name,
              value: category.id
            }))
      ));
    
    await message.reply({
      content: '**اختر الفئة التي تريد إنشاء الروم الصوتي فيها:**',
      components: [row]
    });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;
  
  if (interaction.customId === 'select_category') {
    await interaction.deferReply({ ephemeral: true });
    
    const categoryId = interaction.values[0];
    const category = interaction.guild.channels.cache.get(categoryId);
    
    // إنشاء الروم الرئيسي الذي سينشئ الرومات المؤقتة
    const voiceChannel = await interaction.guild.channels.create('إنشاء روم صوتي', {
      type: 'GUILD_VOICE',
      parent: category,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          allow: ['VIEW_CHANNEL', 'CONNECT']
        }
      ]
    });
    
    // تخزين معلومات الروم
    tempChannels.set(voiceChannel.id, {
      categoryId,
      creatorId: interaction.user.id,
      count: 0
    });
    
    await interaction.editReply(`✅ تم إنشاء روم إنشاء الرومات في الفئة: ${category.name}\nعند دخول أي عضو سيتم إنشاء روم صوتي خاص به.`);
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  // عند دخول عضو إلى الروم الرئيسي
  if (tempChannels.has(newState.channelId)) {
    const tempData = tempChannels.get(newState.channelId);
    const member = newState.member;
    
    // زيادة العداد
    tempData.count++;
    
    // إنشاء الروم الجديد
    const newChannel = await newState.guild.channels.create(`روم 🔊 ${member.displayName} # ${tempData.count}`, {
      type: 'GUILD_VOICE',
      parent: tempData.categoryId,
      permissionOverwrites: [
        {
          id: member.id,
          allow: ['MUTE_MEMBERS', 'MOVE_MEMBERS', 'DEAFEN_MEMBERS']
        },
        {
          id: newState.guild.id,
          allow: ['VIEW_CHANNEL', 'CONNECT']
        }
      ]
    });
    
    // نقل العضو إلى الروم الجديد
    await member.voice.setChannel(newChannel);
    
    // تخزين معلومات الروم الجديد
    tempChannels.set(newChannel.id, {
      creatorId: member.id,
      parentId: newState.channelId
    });
  }
  
  // عند مغادرة العضو للروم المؤقت
  if (tempChannels.has(oldState.channelId) && oldState.channel.members.size === 0) {
    const channelData = tempChannels.get(oldState.channelId);
    
    // التأكد أن الروم ليس الروم الرئيسي
    if (channelData.parentId) {
      await oldState.channel.delete();
      tempChannels.delete(oldState.channelId);
    }
  }
});

/*

client.once('ready', async () => {

    // الحصول على جميع السيرفرات
    const guilds = client.guilds.cache;
    
    for (const guild of guilds.values()) {
        try {
            // حذف جميع أوامر السلاش من السيرفر
            await guild.commands.set([]);
            console.log(`تم حذف جميع أوامر السلاش من السيرفر: ${guild.name}`);
        } catch (error) {
            console.error(`فشل حذف الأوامر من السيرفر ${guild.name}: ${error.message}`);
        }
    }
});
*/
const TARGET_CHANNEL_ID = '1092252538553770054'; // استبدل هذا بمعرف القناة المطلوبة

client.on('messageCreate', async message => {
    // تجاهل الرسائل من البوتات وتجاهل الرسائل خارج القناة المحددة
    if (message.author.bot || message.channel.id !== TARGET_CHANNEL_ID) return;

    try {
        // حذف الرسالة الأصلية
        await message.delete();

        // إنشاء مُضمّن (Embed) للرسالة الجديدة
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(message.content)
            .setFooter({
                text: `تم الإرسال في ${message.createdAt.toLocaleString()}`
            })
            .setTimestamp();

        // إذا كانت الرسالة تحتوي على مرفقات (صور/ملفات)
        if (message.attachments.size > 0) {
            embed.setImage(message.attachments.first().url);
        }

        // إرسال الرسالة الجديدة كمُضمّن
        const sentMessage = await message.channel.send({ embeds: [embed] });

        // إضافة ردود الفعل (Reactions)
        const reactions = ['👍', '👎', '❤️', '😂']; // يمكنك تغيير هذه الردود
        for (const reaction of reactions) {
            await sentMessage.react(reaction);
        }

    } catch (error) {
        console.error('حدث خطأ:', error);
    }
});




client.on('messageCreate', message => {
  if (message.channel.type === 'DM') {
    if (message.author.bot) return;
    message.reply('# وصلت رسالتك للادارة .. شكرا 😎 .');
  }
});


//////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const firstReactionWords = ["الحمد لله"]; 
  const firstReactionEmoji = '💞';
  const secondReactionWords = ['حمدلله','حمد الله','الحمد الله','حمدالله','الحمدالله','الحمدلله']; 
  const secondReactionEmoji = '❌';
  for (const word of firstReactionWords) {
    if (message.content.includes(word)) {
      try {
        await message.react(firstReactionEmoji);
      } catch (error) {
        console.error(`حدث خطأ أثناء وضع الرياكشن: ${error}`);
  
      }
        }
    }
    for (const word of secondReactionWords) {
        if (message.content.includes(word)) {
            try {
                await message.react(secondReactionEmoji);
            } catch (error) {
                console.error(`حدث خطأ أثناء وضع الرياكشن: ${error}`);
            }
        }
    }
});
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const firstReactionWords = ["ان شاء الله"]; 
  const firstReactionEmoji = '❤️';
  const secondReactionWords = ['انشاء الله','انشالله','انشا الله','ان شالله',]; 
  const secondReactionEmoji = '❌';
  for (const word of firstReactionWords) {
    if (message.content.includes(word)) {
      try {
        await message.react(firstReactionEmoji);
      } catch (error) {
        console.error(`حدث خطأ أثناء وضع الرياكشن: ${error}`);
  
      }
        }
    }
    for (const word of secondReactionWords) {
        if (message.content.includes(word)) {
            try {
                await message.react(secondReactionEmoji);
            } catch (error) {
                console.error(`حدث خطأ أثناء وضع الرياكشن: ${error}`);
            }
        }
    }
});

//////////////////////////////////////////////////////////////////////////////
const azazazazaz = require('moment-timezone');
client.on('messageCreate', async (message) => {
    if (message.content === '=ساعة') {
        // إعداد الوقت بتوقيت السعودية
        const now = azazazazaz().tz('Asia/Riyadh');

        // إنشاء صورة باستخدام Canvas
        const canvas = Canvas.createCanvas(400, 400);
        const ctx = canvas.getContext('2d');

        // تحميل الخلفية المناسبة
        const background = await Canvas.loadImage('https://i.pinimg.com/564x/6e/da/52/6eda52e13ebd30adced6aa0d0aaed653.jpg'); // ضع مسار الصورة هنا
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // عقرب الساعات
        const hour = now.hours() % 12;
        const hourAngle = (hour + now.minutes() / 60) * (Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.lineTo(200 + Math.cos(hourAngle - Math.PI / 2) * 100, 200 + Math.sin(hourAngle - Math.PI / 2) * 100);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.stroke();

        // عقرب الدقائق
        const minuteAngle = (now.minutes() + now.seconds() / 60) * (Math.PI / 30);
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.lineTo(200 + Math.cos(minuteAngle - Math.PI / 2) * 140, 200 + Math.sin(minuteAngle - Math.PI / 2) * 140);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.stroke();

        // عقرب الثواني
        const secondAngle = now.seconds() * (Math.PI / 30);
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.lineTo(200 + Math.cos(secondAngle - Math.PI / 2) * 160, 200 + Math.sin(secondAngle - Math.PI / 2) * 160);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.stroke();

        // إرسال الصورة كـ Attachment
        const attachment = new MessageAttachment(canvas.toBuffer(), 'saudi-clock.png');
        message.channel.send({ files: [attachment] });
    }
});

//////////////////////////////////////////////////////////////////////////////



client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'العاب') {
    const link = 'https://discord.com/api/oauth2/authorize?client_id=894642311781314580&permissions=8&scope=bot%20applications.commands';

    const embed1 = new MessageEmbed()
      .setTitle('أوامر الألعاب (الصفحة 1/4)')
      .setDescription(`**
      
      نعمل حاليا على اضافة العاب في البوت ...
      
=> [ اضغط هنا ](${link}) <= لاضافة البوت الى سيرفرك
**`)
      .setThumbnail(client.user.avatarURL())
      .setColor('#0099ff')
      .setFooter({ text: message.guild.name })
      .setTimestamp();

    const embed2 = new MessageEmbed()
      .setTitle('أوامر الألعاب (الصفحة 2/4)')
      .setDescription(`**
      
      لاتوجد معلومات في هذه الصفحة حاليا
      
=> [ اضغط هنا ](${link}) <= لاضافة البوت الى سيرفرك
**`)
      .setColor('#0099ff')
      .setFooter({ text: message.guild.name })
      .setThumbnail(client.user.avatarURL())
      .setTimestamp();

    const embed3 = new MessageEmbed()
      .setTitle('أوامر الألعاب (الصفحة 3/4)')
      .setDescription(`**
      
      لاتوجد معلومات في هذه الصفحة حاليا
      
=> [ اضغط هنا ](${link}) <= لاضافة البوت الى سيرفرك
**`)
      .setColor('#0099ff')
      .setThumbnail(client.user.avatarURL())
      .setFooter({ text: message.guild.name })
      .setTimestamp();

    const embed4 = new MessageEmbed()
      .setTitle('صفحة آخر التحديثات على البوت')
      .setDescription(`**
      
      لاتوجد معلومات في هذه الصفحة حاليا
      
=> [ اضغط هنا ](${link}) <= لاضافة البوت الى سيرفرك
**`)
      .setColor('#0099ff')
      .setThumbnail(client.user.avatarURL())
      .setFooter({ text: message.guild.name })
      .setTimestamp();

    message.channel.send({ embeds: [embed1] }).then((msg) => {
      msg.react('1️⃣')
        .then(() => msg.react('2️⃣'))
        .then(() => msg.react('3️⃣'))
        .then(() => msg.react('4️⃣'))
        .catch(() => console.error('فشل في إضافة الرياكشنات'));

      const filter = (reaction, user) => {
        return ['1️⃣', '2️⃣', '3️⃣', '4️⃣'].includes(reaction.emoji.name) && !user.bot;
      };

      const collector = msg.createReactionCollector({ filter });

      collector.on('collect', (reaction, user) => {
        if (reaction.emoji.name === '1️⃣') {
          msg.edit({ embeds: [embed1] });
        } else if (reaction.emoji.name === '2️⃣') {
          msg.edit({ embeds: [embed2] });
        } else if (reaction.emoji.name === '3️⃣') {
          msg.edit({ embeds: [embed3] });
        } else if (reaction.emoji.name === '4️⃣') {
          msg.edit({ embeds: [embed4] });
        }

        reaction.users.remove(user.id).catch(console.error); // حذف رد الفعل من المستخدم
      });
    });
  }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// كود ارسال رسالة لخاص شخص معين
client.on('messageCreate', async message => {
    // تجاهل رسائل البوت أو الرسائل التي لا تبدأ بالبريفكس
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'msg') {
        // التأكد من وجود منشن ورسالة
        const targetUser = message.mentions.users.first();
        const messageToSend = args.slice(1).join(' ');

        if (!targetUser || !messageToSend) {
            return message.reply(`❌ الاستخدام الصحيح: \`!msg @المستخدم الرسالة\``);
        }

        const embed = new MessageEmbed()
            .setTitle('رسالة خاصة جديدة :')
            .setDescription(`**${messageToSend}**`)
            .setColor('#00FF00')
            .setFooter({ text: `تم الإرسال بواسطة : ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

        try {
            await targetUser.send({ embeds: [embed] });
            await message.reply(`✅ تم إرسال الرسالة بنجاح إلى ${targetUser.tag}.`);
        } catch (error) {
            console.error(`فشل في إرسال الرسالة إلى ${targetUser.tag}.`, error);
            await message.reply(`❌ تعذر إرسال الرسالة. ربما قام ${targetUser.tag} بإغلاق رسائل الخاص.`);
        }
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// امر يعيد ارسال رسالتك
client.on('messageCreate', async message => {
    // تجاهل رسائل البوت أو الرسائل التي لا تبدأ بالبريفكس
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'say') {
        const messageToSay = args.join(' ');

        if (!messageToSay) {
            return message.reply('❌ الرجاء كتابة الرسالة بعد الأمر. مثال: `!say مرحبًا بالجميع`');
        }

        // منع منشن everyone و here
        if (messageToSay.includes('@everyone') || messageToSay.includes('@here')) {
            return message.reply('⚠️ لا يمكنك منشن everyone أو here.');
        }

        const embed = new MessageEmbed()
            .setTitle('رسالة جديدة:')
            .setDescription(messageToSay)
            .setColor('#00FF00')
            .setFooter({ text: `تم الإرسال بواسطة: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        await message.channel.send({ embeds: [embed] });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// امر اضهار صورتك او صورة شخص تمنشنه

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'pic') {
        // إذا تم منشن شخص، استخدمه، وإلا استخدم المرسل
        const targetUser = message.mentions.users.first() || message.author;

        const embed = new MessageEmbed()
            .setTitle(`صورة ${targetUser.tag}`)
            .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor('#00FF00')
            .setFooter({ text: `طلب من: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        message.channel.send({ embeds: [embed] });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// امر قياس بينق البوت
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        const ping = client.ws.ping;

        // حساب الجودة كنسبة مئوية (من 100%)
        let quality = Math.max(0, 100 - Math.floor(ping / 2));

        // إعداد شريط النسبة المئوية (10 أجزاء)
        const totalBars = 10;
        const filledBars = Math.round((quality / 100) * totalBars);
        const emptyBars = totalBars - filledBars;
        const percentageBar = '▰'.repeat(filledBars) + '▱'.repeat(emptyBars); // شريط مميز

        // تحديد اللون حسب الجودة
        let color;
        if (quality >= 75) color = 0x00FF00;
        else if (quality >= 50) color = 0xFFFF00;
        else if (quality >= 25) color = 0xFFA500;
        else color = 0xFF0000;

        // إنشاء Embed
        const embed = new MessageEmbed()
            .setTitle('📡 فحص سرعة الاتصال (Ping)')
            .setColor(color)
            .setDescription(
                `**📶 Ping:** \`${ping}ms\`\n\n` +
                `**جودة الاتصال:** \`${quality}%\`\n` +
                `${percentageBar}`
            )
            .setFooter({ text: `الطلب من: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// امر تقديم على الادارة

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'request') {
    // Create modal (النافذة المنبثقة)
    const modal = new Modal()
      .setCustomId('requestModal')
      .setTitle('طلب جديد')
      .addComponents(
        new MessageActionRow().addComponents(
          new TextInputComponent()
            .setCustomId('username')
            .setLabel('اسم العضو')
            .setStyle('SHORT')
            .setPlaceholder('اكتب اسمك هنا')
        ),
        new MessageActionRow().addComponents(
          new TextInputComponent()
            .setCustomId('age')
            .setLabel('عمرك')
            .setStyle('SHORT')
            .setPlaceholder('اكتب عمرك هنا')
        ),
        new MessageActionRow().addComponents(
          new TextInputComponent()
            .setCustomId('request')
            .setLabel('الطلب')
            .setStyle('PARAGRAPH')
            .setPlaceholder('اكتب طلب التقديم هنا')
        )
      );

    await interaction.showModal(modal);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'requestModal') {
    const username = interaction.fields.getTextInputValue('username');
    const age = interaction.fields.getTextInputValue('age');
    const request = interaction.fields.getTextInputValue('request');

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('طلب جديد')
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'اسم العضو', value: username, inline: true },
        { name: 'العمر', value: age, inline: true },
        { name: 'الطلب', value: request }
      )
      .setTimestamp();

    // إرسال رسالة الإيمبد إلى الروم المطلوب
    const channel = client.channels.cache.get('1281318684597682317'); // ضع هنا معرف الروم الذي تريد إرسال الرسالة فيه
    if (channel) {
      channel.send({ embeds: [embed] });
    }

    // إخبار المستخدم بنجاح الإرسال
    await interaction.reply({ content: 'تم إرسال طلبك بنجاح!', ephemeral: true });
  }
});

// تسجيل الأوامر الجديدة
client.on('ready', async () => {
  const data = [{
    name: 'request',
    description: 'افتح نافذة تقديم الطلب'
  }];

  await client.application.commands.set(data);
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// كود الكتابة مثل البوت

client.on('messageCreate', async (message) => {
    // تجاهل رسائل البوت أو التي لا تبدأ بالبريفكس
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'bot') {
        const content = args.join(' ');
        
        // التأكد من وجود رسالة بعد الأمر
        if (!content) {
            return message.reply('❌ يرجى كتابة رسالة بعد الأمر .');
        }

        try {
            // إنشاء Webhook باسم البوت
            const webhook = await message.channel.createWebhook('NQN Bot', {
                avatar: 'https://i.imgur.com/2PBEiVx.png',
            });

            // إرسال الرسالة بالويب هوك
            await webhook.send({
                content: content,
                username: message.member ? message.member.displayName : message.author.username,
                avatarURL: message.author.displayAvatarURL({ dynamic: true })
            });

            // حذف الويب هوك بعد الإرسال مباشرة
            await webhook.delete();
        } catch (error) {
            console.error('حدث خطأ:', error);
            message.reply('❌ حدث خطأ أثناء إرسال الرسالة.');
        }
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// امر تغيير لون الاسم

const roles = [
    { id: '891083372158390322', name: 'لون رقم : 1' },
    { id: '891083393629028392', name: 'لون رقم : 2' },
    { id: '891083402659381279', name: 'لون رقم : 3' },
    { id: '891083412092375060', name: 'لون رقم : 4' },
    { id: '891083424226500638', name: 'لون رقم : 5' },
    { id: '891083431990161440', name: 'لون رقم : 6' },
    { id: '891083441993568266', name: 'لون رقم : 7' },
    { id: '891083451426553868', name: 'لون رقم : 8' },
    { id: '891083459777400843', name: 'لون رقم : 9' },
    { id: '891083460029083650', name: 'لون رقم : 10' },
    { id: '891083508527792198', name: 'لون رقم : 11' },
    { id: '891083516392112128', name: 'لون رقم : 12' },
    { id: '891083519038717982', name: 'لون رقم : 13' },
    { id: '891083521223954513', name: 'لون رقم : 14' },
    { id: '891083523593744395', name: 'لون رقم : 15' },
    { id: '911275776727449670', name: 'لون رقم : 16' },
];

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'color') {
        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('role_select')
                .setPlaceholder('اختر لون او ازله')
                .addOptions([
                    ...roles.map(role => ({
                        label: role.name,
                        value: role.id
                    })),
                    {
                        label: 'إزالة اللون الحالي',
                        value: 'remove_role',
                    }
                ])
        );

        const embed = new MessageEmbed()
            .setColor('#00FF00')
            .setTitle('اختيار رتبة')
            .setDescription('اختر لون من القائمة أدناه لتعيينها لك أو اختر "إزالة اللون الحالي" لإزالته.');

        await message.reply({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isSelectMenu()) return;
    if (interaction.customId !== 'role_select') return;

    const roleId = interaction.values[0];
    const member = interaction.member;

    // إزالة كل الألوان الحالية
    const currentRoles = member.roles.cache.filter(role => roles.some(r => r.id === role.id));
    await member.roles.remove(currentRoles);

    if (roleId === 'remove_role') {
        if (currentRoles.size > 0) {
            await interaction.reply({ content: '✅ تمت إزالة اللون الحالي.', ephemeral: true });
        } else {
            await interaction.reply({ content: '❗ لا يوجد لون لإزالته.', ephemeral: true });
        }
    } else {
        const role = interaction.guild.roles.cache.get(roleId);
        if (role) {
            try {
                await member.roles.add(role);
                await interaction.reply({ content: `✅ تم تعيين اللون: ${role.name}`, ephemeral: true });
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: '❌ حدث خطأ أثناء تعيين اللون.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '❌ لم يتم العثور على اللون المطلوب.', ephemeral: true });
        }
    }
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// امر جلب الساعة
// عند استقبال رسالة تحتوي على الأمر !clock
client.on('messageCreate', async (message) => {
    // تجاهل الرسائل من البوتات أو بدون البريفكس
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'clock') {
        let clockMessage = await sendClockImage(message);

        // تحديث الصورة كل ثانية
        const interval = setInterval(async () => {
            try {
                if (!clockMessage.editable) {
                    clearInterval(interval); // إيقاف التحديث إذا لم تعد الرسالة قابلة للتعديل
                    return;
                }
                const attachment = await createClockImage();
                await clockMessage.edit({ files: [attachment] });
            } catch (error) {
                console.error('خطأ أثناء تحديث الساعة:', error);
                clearInterval(interval); // إيقاف التحديث عند الخطأ
            }
        }, 1000);
    }
});

// إرسال أول صورة للساعة
async function sendClockImage(message) {
    const attachment = await createClockImage();
    const sentMessage = await message.channel.send({ files: [attachment] });
    return sentMessage;
}

// إنشاء صورة الساعة
async function createClockImage() {
    const canvas = Canvas.createCanvas(200, 60);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const now = azazazazaz().tz('Asia/Riyadh');
    const timeString = now.format('HH:mm:ss');

    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(timeString, canvas.width / 2, canvas.height / 2 + 10);

    return new MessageAttachment(canvas.toBuffer(), 'clock.png');
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// معلومات السيرفر
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'server') {
        const guild = message.guild;

        // تحديث الكاش للحصول على عدد البوتات بشكل دقيق
        await guild.members.fetch();

        const serverInfoEmbed = new MessageEmbed()
            .setTitle(`معلومات السيرفر: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 اسم السيرفر:', value: guild.name, inline: true },
                { name: '🆔 ID السيرفر:', value: guild.id, inline: true },
                { name: '👑 مالك السيرفر:', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📆 تم إنشاء السيرفر في:', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '👥 عدد الأعضاء:', value: guild.memberCount.toString(), inline: true },
                { name: '🏷️ عدد الأدوار:', value: guild.roles.cache.size.toString(), inline: true },
                { name: '📺 عدد القنوات:', value: guild.channels.cache.size.toString(), inline: true },
                { name: '🌍 المنطقة:', value: guild.preferredLocale, inline: true },
                { name: '🤖 عدد البوتات:', value: guild.members.cache.filter(member => member.user.bot).size.toString(), inline: true },
                { name: '🔒 مستوى التحقق:', value: guild.verificationLevel.toString(), inline: true },
                { name: '🚀 عدد الـBoosts:', value: guild.premiumSubscriptionCount.toString(), inline: true },
                { name: '🎖️ مستوى الـBoost:', value: guild.premiumTier.toString(), inline: true }
            )
            .setColor('#0099ff')
            .setFooter({ text: `📨 طلب بواسطة: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        message.channel.send({ embeds: [serverInfoEmbed] });
    }
});




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// امر رسالة اقتاح ايمبد روم معين
client.on('messageCreate', async message => {
    // تجاهل رسائل البوت
    if (message.author.bot) return;

    // تحديد معرف القناة المسموح فيها
    const targetChannelId = '1184473749026783272'; // ← استبدل هذا بمعرف القناة الصحيح
    if (message.channel.id !== targetChannelId) return;

    // الإيموجيات (يمكن استخدام إيموجيات مخصصة أيضًا بصيغة <:name:id>)
    const like = '👍';
    const dislike = '👎';
    const dance = '💃';
    const hmm = '🤔';
    const emo1 = '📢'; // رمز قبل الرسالة

    try {
        // حفظ المحتوى قبل الحذف
        const messageContent = message.content;

        // حذف الرسالة الأصلية
        await message.delete();

        // إنشاء الإيمبد الجديد
        const embed = new MessageEmbed()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(`\n${emo1} **${messageContent || 'رسالة فارغة'}**`)
            .setFooter({ text: `أُرسلت في: ${message.createdAt.toLocaleString()}` })
            .setColor('#00FF00')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 512 }))
            .setImage('https://pa1.aminoapps.com/7321/8ada5eb7e59ed827596d480905017be98cec6111r1-833-250_hq.gif'); // صورة متحركة

        // إرسال الرسالة الجديدة
        const sentMessage = await message.channel.send({ embeds: [embed] });

        // إضافة التفاعلات على الرسالة الجديدة
        await sentMessage.react(like);
        await sentMessage.react(dislike);
        await sentMessage.react(dance);
        await sentMessage.react(hmm);

    } catch (error) {
        console.error('حدث خطأ أثناء المعالجة:', error);
    }
});


//////////////////////////////////////////////////////////////////////////////
const targetReactions = 5; // عدد التفاعلات المطلوب للوصول إلى الهدف
let reactionCount = 0; // عدد التفاعلات الحالية

client.on('messageCreate', async message => {
    if (message.content === '!goal') {
        // إنشاء رسالة Embed
        const embed = new MessageEmbed()
            .setTitle('Reaction Goal')
            .setDescription('**هدف التفاعل : اضغط على ✅ للوصول إلى الهدف !**')
            .addFields({ name: 'Progress', value: getProgressBar(0), inline: true })
            .setFooter({ text: `0/${targetReactions} reactions` })
            .setColor(0x00FF00);

        // إرسال الرسالة
        const sentMessage = await message.channel.send({ embeds: [embed] });
        await sentMessage.react('✅'); // إضافة رياكشن ✅

        // استماع للتفاعلات
        const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot; // تأكد أن المستخدم ليس بوت
        const collector = sentMessage.createReactionCollector({ filter, dispose: true });

        // عند إضافة رياكشن
        collector.on('collect', async (reaction, user) => {
            reactionCount = reaction.users.cache.filter(u => !u.bot).size; // استبعاد رياكشن البوت
            const progress = Math.min((reactionCount / targetReactions) * 100, 100); // حساب النسبة المئوية

            if (progress >= 100) {
                await sentMessage.delete(); // حذف الرسالة الأصلية عند الوصول للهدف
                // إرسال رسالة التهنئة
                await message.channel.send({
                    content: '🎉 **شكرا على التفاعل !** 🎉',
                    files: ['https://i.pinimg.com/originals/f5/e4/a8/f5e4a86b66810d37b7c77f2a212ba416.gif'] // استبدل الرابط بصورة متحركة تهنئة
                });
            } else {
                await updateEmbed(sentMessage, progress, reactionCount);
            }
        });

        // عند حذف رياكشن
        collector.on('remove', async (reaction, user) => {
            reactionCount = reaction.users.cache.filter(u => !u.bot).size; // استبعاد رياكشن البوت
            const progress = Math.min((reactionCount / targetReactions) * 100, 100); // حساب النسبة المئوية
            await updateEmbed(sentMessage, progress, reactionCount);
        });
    }
});

// دالة لتحديث رسالة الـ Embed
async function updateEmbed(message, progress, reactionCount) {
    const embed = new MessageEmbed()
        .setTitle('Reaction Goal')
        .setDescription('**هدف التفاعل : اضغط على ✅ للوصول إلى الهدف !**')
        .addFields({ name: 'Progress', value: getProgressBar(progress), inline: true })
        .setFooter({ text: `${reactionCount}/${targetReactions} reactions` })
        .setColor(progress >= 100 ? 0x00FF00 : 0xFFFF00); // تغيير اللون عند اكتمال الهدف

    await message.edit({ embeds: [embed] });
}

// دالة لإنشاء الشريط بنسبة مئوية
function getProgressBar(percentage) {
    const totalBars = 20; // عدد الشرائح
    const filledBars = Math.round((percentage / 100) * totalBars);
    const emptyBars = totalBars - filledBars;

    const bar = '█'.repeat(filledBars) + '░'.repeat(emptyBars); // الشريط
    return `${bar} ${Math.round(percentage)}%`;
}


////////////////////////////////////////////////////////////////////////////// كود اعطاء رتبة للعضو الجديد
const roleName = 'غير مفعل';

client.on('guildMemberAdd', async (member) => {
    // البحث عن الرتبة في السيرفر
    const role = member.guild.roles.cache.find(role => role.name === roleName);
    
    if (!role) {
        console.error(`الرتبة "${roleName}" غير موجودة على السيرفر.`);
        return;
    }

    try {
        // إعطاء الرتبة للعضو الجديد
        await member.roles.add(role);
        console.log(`تم إعطاء الرتبة "${roleName}" للعضو ${member.user.tag}.`);
    } catch (error) {
        console.error(`حدث خطأ أثناء محاولة إعطاء الرتبة للعضو ${member.user.tag}:`, error);
    }
});

////////////////////////////////////////////////////////////////////////////// كود الكلام الممنوع
const bannedWordsFile = './bannedWords.json';

// تحميل التحذيرات والكلمات الممنوعة
let bannedWords = JSON.parse(fs.readFileSync(bannedWordsFile, 'utf8') || '[]');

// متابعة الرسائل للكشف عن الكلمات الممنوعة
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    const userId = message.author.id;

    // التحقق من الكلمات الممنوعة
    for (const bannedWord of bannedWords) {
        if (content.includes(bannedWord)) {
            if (!warnings[userId]) {
                warnings[userId] = [];
            }

            const existingWarning = warnings[userId].find(warn => warn.reason === 'Use of banned word');
            
            if (existingWarning) {
                // منح تحذير جديد بسبب الكلمة الممنوعة
                warnings[userId].push({ reason: 'Use of banned word', date: new Date().toISOString() });
                fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));

                const embed = new MessageEmbed()
                    .setTitle('Warning Issued')
                    .setDescription(`You have been warned for using a banned word.`)
                    .addFields(
                        { name: 'Reason', value: 'Use of banned word' },
                        { name: 'Date', value: new Date().toLocaleString() }
                    )
                    .setColor('RED')
                    .setThumbnail(message.author.displayAvatarURL());

                message.channel.send({ embeds: [embed] });
            } else {
                // إرسال تنبيه أولي
                const embed = new MessageEmbed()
                    .setTitle('Warning Notice')
                    .setDescription(`Please refrain from using banned words. This is a warning.`)
                    .setColor('YELLOW')
                    .setThumbnail(message.author.displayAvatarURL());

                message.channel.send({ embeds: [embed] });

                warnings[userId].push({ reason: 'Initial warning for banned word', date: new Date().toISOString() });
                fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
            }
        }
    }
});

////////////////////////////////////////////////////////////////////////////// كود التحذيرات مطور
const warningsFile = './warnings.json';

// تحميل التحذيرات من الملف
let warnings = JSON.parse(fs.readFileSync(warningsFile, 'utf8') || '{}');

// أمر تحذير
client.on('messageCreate', async message => {
    if (message.content.startsWith (`${prefix}تحذير`) && message.member.permissions.has('ADMINISTRATOR')) {
        const args = message.content.split(' ');
        const user = message.mentions.users.first();
        const reason = args.slice(2).join(' ') || 'No reason provided';
        
        if (user) {
            const userId = user.id;
            if (!warnings[userId]) {
                warnings[userId] = [];
            }
            warnings[userId].push({ reason, date: new Date().toISOString() });

            fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));

            const embed = new MessageEmbed()
                .setTitle('Warning Issued')
                .setDescription(`You have warned ${user.tag}`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Date', value: new Date().toLocaleString() }
                )
                .setColor('RED');
            message.channel.send({ embeds: [embed] });
        } else {
            message.reply('Please mention a user to warn.');
        }
    }

    // أمر عرض التحذيرات
    if (message.content.startsWith(`${prefix}اخطائي`)) {
        const user = message.mentions.users.first();
        if (user) {
            const userId = user.id;
            const userWarnings = warnings[userId] || [];
            const embed = new MessageEmbed()
                .setTitle(`${user.tag}'s Warnings`)
                .setDescription(userWarnings.length > 0 ? userWarnings.map((warn, index) => `**${index + 1}.** ${warn.reason} - ${new Date(warn.date).toLocaleString()}`).join('\n') : 'No warnings found.')
                .setColor('ORANGE')
                .setThumbnail(user.displayAvatarURL());

            message.channel.send({ embeds: [embed] });
        } else {
            message.reply('Please mention a user to view their warnings.');
        }
    }

    // أمر حذف تحذير
    if (message.content.startsWith(`${prefix}حذف_تحذير`) && message.member.permissions.has('ADMINISTRATOR')) {
        const args = message.content.split(' ');
        const user = message.mentions.users.first();
        const index = parseInt(args[2], 10) - 1;

        if (user && !isNaN(index)) {
            const userId = user.id;
            if (warnings[userId] && warnings[userId][index]) {
                warnings[userId].splice(index, 1);
                if (warnings[userId].length === 0) {
                    delete warnings[userId];
                }
                fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
                
                message.channel.send(`Warning ${index + 1} removed from ${user.tag}.`);
            } else {
                message.reply('Invalid warning number or user.');
            }
        } else {
            message.reply('Please mention a user and provide the warning number.');
        }
    }

    // أمر تصفير التحذيرات
    if (message.content.startsWith(`${prefix}حذف_تحذيرات`) && message.member.permissions.has('ADMINISTRATOR')) {
        const user = message.mentions.users.first();

        if (user) {
            const userId = user.id;
            if (warnings[userId]) {
                delete warnings[userId];
                fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
                message.channel.send(`All warnings cleared for ${user.tag}.`);
            } else {
                message.reply('No warnings found for this user.');
            }
        } else {
            message.reply('Please mention a user.');
        }
    }

    // أمر عرض إجمالي التحذيرات
    if (message.content.startsWith(`${prefix}التحذيرات`) && message.member.permissions.has('ADMINISTRATOR')) {
        const embed = new MessageEmbed()
            .setTitle('All Warnings')
            .setDescription(Object.entries(warnings).map(([userId, userWarnings]) => {
                const user = client.users.cache.get(userId);
                return user ? `${user.tag}: ${userWarnings.length} warnings` : `${userId}: ${userWarnings.length} warnings`;
            }).join('\n'))
            .setColor('BLUE');

        message.channel.send({ embeds: [embed] });
    }
});


////////////////////////////////////////////////////////////////////////////// كود رسائل خاص البوت
const CHANNEL_ID = '890331117977219154'; // استبدل هذا بـ ID للقناة التي تريد إرسال الرسائل إليها
client.on('messageCreate', async message => {
    if (message.channel.type === 'DM' && !message.author.bot) {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (channel) {
                // تحقق إذا كانت الرسالة تحتوي على مرفق
                if (message.attachments.size > 0) {
                    // إذا كانت تحتوي على مرفق، أرسل المرفق إلى القناة
                    const attachments = message.attachments.map(attachment => attachment.url);
                    await channel.send({
                        content: `📨 **رسالة تحتوي على مرفق من ${message.author.tag}:**`,
                        files: attachments // إعادة إرسال المرفقات
                    });
                } else {
                    // إذا لم تكن تحتوي على مرفق، أرسل النص فقط
                    await channel.send(`📨 **رسالة من ${message.author.tag}:**\n${message.content}`);
                }
            }
        } catch (error) {
            console.error('Error sending message to the channel:', error);
        }
    }
});

////////////////////////////////////////////////////////////////////////////// كود تأكد من دخول
client.on('messageCreate', (message) => {
  if (message.content === 'join') {
    message.delete();
    if (!message.member.permissions.has('ADMINISTRATOR')) return;
    client.emit('guildMemberAdd', message.member);
  }
});

////////////////////////////////////////////////////////////////////////////// كود الترحيب بالاعضاء الجدد

client.on('guildMemberAdd', async member => {
    // احصل على الدعوات الخاصة بالسيرفر
    const invites = await member.guild.invites.fetch();
    const invite = invites.find(inv => inv.uses > 0);

    // احصل على عدد الأشخاص الذين قاموا بدعوتهم
    const inviter = invite ? invite.inviter : null;
    const inviteCount = invite ? invite.uses : 0;

    // إعداد الصورة
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // تحميل الصورة الثابتة من الرابط
    const background = await loadImage('https://cdn.glitch.global/60b80184-6759-4383-a7cb-e5f8786793b0/Image1.png?v=1725837014617');
    ctx.drawImage(background, 0, 0, width, height);

    // إعداد قناع دائري للصورة
    const avatarSize = 150;
    const avatarX = 50;
    const avatarY = 50;

    // إنشاء قناع دائري للصورة
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.clip();

    // تحميل صورة العضو الجديد
    const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png' }));
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize); // تعديل الحجم والموقع حسب الحاجة

    ctx.restore(); // استعادة الحالة الأصلية

        // رسم الدائرة حول الصورة
        ctx.strokeStyle = '#000000'; // لون الدائرة أسود
        ctx.shadowColor = 'rgba(255, 0, 0, 0.8)'; // لون الظل أحمر بتمريرية 80%
        ctx.shadowOffsetX = 1; // الإزاحة الأفقية للظل
        ctx.shadowOffsetY = 1; // الإزاحة الرأسية للظل
        ctx.shadowBlur = 10; // شدة ضبابية الظل
        ctx.lineWidth = 10; // سمك الدائرة
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2, true); // القطر مع إضافة بعض الهوامش
        ctx.stroke();

        // إعداد النصوص
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#000000'; // لون النص
        ctx.shadowColor = 'rgba(255, 0, 0, 0.8)'; // لون الظل أحمر بتمريرية 80%
        ctx.shadowOffsetX = 5; // الإزاحة الأفقية للظل
        ctx.shadowOffsetY = 5; // الإزاحة الرأسية للظل
        ctx.shadowBlur = 5; // شدة ضبابية الظل

        // إضافة اسم العضو
        ctx.fillText(member.user.username, 220, 120);

        // إضافة معلومات الدعوة
        ctx.font = 'bold 15px Arial';
        ctx.fillStyle = '#20fac8';
        ctx.fillText(`Invited by : ${inviter ? inviter.username : 'Unknown'}`, 20, 365);
        ctx.fillText(`Invite count : ${inviteCount}`, 20, 380);

    // حفظ الصورة
    const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.png');

    // إعداد الرسالة
    const welcomeMessage = `🎉 مرحباً ${member.user} في السيرفر! 🎉\n\n👤 **تمت دعوتك بواسطة :** ${inviter ? inviter.toString() : 'غير معروف'}\n👥 **عدد الأشخاص الذين قام بدعوتهم :** ${inviteCount}`;

    // إرسال الرسالة إلى القناة الترحيبية
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.id === '1278517565454548996'); // تأكد من تغيير '1280988295135760494' إلى معرف القناة المناسبة
    if (welcomeChannel) {
        welcomeChannel.send({ content: welcomeMessage, files: [attachment] });
    }
});


//////////////////////////////////////////////////////////////////////////////
client.on('messageCreate', (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.content.toLowerCase().startsWith(`${prefix}imposter`)) {
    let args = message.content.slice(prefix.length).trim().split(/ +/);
    args.shift(); // Remove the command part
    let Member = message.mentions.members.first();

    if (!Member)
      return message.channel.send(
        'منشنلي اي احد او منشن نفسك ☺ بعد الأمر طبعا .!'
      );

    let Colors = [
      'black', 'blue', 'brown', 'cyan', 'darkgreen', 'lime', 'orange',
      'pink', 'purple', 'red', 'white', 'yellow'
    ];

    let Colord = Colors[Math.floor(Math.random() * Colors.length)];
    let Impost = [true, false];
    let Impostor = Impost[Math.floor(Math.random() * Impost.length)];
    let Link = `https://vacefron.nl/api/ejected?name=${encodeURIComponent(Member.user.username)}&impostor=${Impostor}&crewmate=${Colord}`;

    let Embed = new MessageEmbed()
      .setColor(Colord.toUpperCase())
      .setAuthor({
        name: `${message.author.username} Decided To Eject ${Member.user.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setImage(Link)
      .setTimestamp()
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      });

    message.channel.send({ embeds: [Embed] })
      .catch(err => console.error('Failed to send the embed message:', err));
  }
});

//////////////////////////////////////////////////////////////////////////////
client.on('guildMemberAdd', (member) => {
  const accountAge = moment().diff(member.user.createdAt, 'days');

  if (accountAge < 7) {
    const createdDate = moment(member.user.createdAt).format('YYYY/MM/DD');
    const age = Math.floor((Date.now() - member.user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const embed = new MessageEmbed()
      .setTitle('🔰 __الإدارة المركزية !__')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**
تم طرد : [ ${member.user.username}#${member.user.discriminator} ] لان حسابه جديد .
__عمر الحساب__ : [ ${age} يوم ]
__تاريخ انشاء الحساب__ : [ ${createdDate} ]**`)
      .setColor('#00FF00')
      .setTimestamp();

    client.channels.cache
      .get('889971013872418819') // استبدل هذا بالـ ID الخاص بالقناة
      .send({ embeds: [embed] });

    member.kick('تم طردك من السيرفر لأن عمر حسابك أقل من 7 أيام.')
      .catch(console.error); // معالجة الأخطاء في حالة عدم القدرة على الطرد
  }
});

////////////////////////////////////////////////////////////////////////////// تحديث اخر وقت تم اعادة تشغيل البوت فيها
client.on('messageCreate', (msg) => {
  if (msg.content === `${prefix}تحديث`) {
    const uptime = client.uptime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor((uptime % 86400000) / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);

    msg.channel.send(`**
🔰 __الإدارة المركزية !__
آخر تحديث للبَوُت ڪيآس كان من ..
\`\`\`js\n${seconds} ثانية\n${minutes} دقيقة\n${hours} ساعة\n${days} يوم\`\`\`
بطلب من ${emo1} ${msg.author.username}**
`);
  }
});

////////////////////////////////////////////////////////////////////////////// امر رد عند كتابة كلمة باك
let replys = [];
client.once('ready', () => {
  fs.readFile('replies.json', (err, data) => {
    if (err) {
      console.error('Error reading replies.json:', err);
      return;
    }
    try {
      replys = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing replies.json:', parseErr);
    }
  });
});

client.on('messageCreate', (msg) => {
  if (msg.author.bot) return; // تجاهل رسائل البوتات

  if (msg.content.startsWith('باك')) {
    if (!msg.guild) return; // تجاهل الرسائل التي لا تأتي من الخادم
    const outputReply = replys[Math.floor(Math.random() * replys.length)];
    msg.channel.send(outputReply);
  }
});

////////////////////////////////////////////////////////////////////////////// كود اذكار وادعية
client.on("ready", async () => {
  const channelId = "1185699197693993001"; // معرف القناة
  const channel = client.channels.cache.get(channelId);

  if (!channel) {
    console.log("القناة غير موجودة.");
    return;
  }
  try {
    setInterval(async () => {
      try {
        const embed = new MessageEmbed()
          .setTitle("__**أذكار المسلم !**__")
          .setColor("GREEN")
          .setThumbnail("https://athkarapp.com/images/athkarLogo.png")
          .setTimestamp()
          .setDescription(`**${emo1} ${topics.Azkar()}**`);

        const msg = await channel.send({ embeds: [embed] });
        await msg.react("🤲");
        await msg.react("💕");
        await msg.react("💖");
      } catch (err) {
        console.error(`Error sending message or reacting: ${err}`);
      }
    }, 6 * 60 * 60 * 1000); // كل 5 ساعات
  } catch (err) {
    console.error(`Error in setInterval: ${err}`);
  }
});

////////////////////////////////////////////////////////////////////////////// كود مانع سبام بسجن 3 ايام

const usersMap = new Map();
const LIMIT = 10;
const TIME = 259200000; // 3 أيام
const DIFF = 10000; // الفرق الزمني بين الرسائل

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (usersMap.has(message.author.id)) {
    const userData = usersMap.get(message.author.id);
    const { lastMessage, timer } = userData;
    const difference = message.createdTimestamp - lastMessage.createdTimestamp;
    let msgCount = userData.msgCount;

    console.log(difference);

    if (difference > DIFF) {
      clearTimeout(timer);
      console.log("Cleared Timeout");
      userData.msgCount = 1;
      userData.lastMessage = message;
      userData.timer = setTimeout(() => {
        usersMap.delete(message.author.id);
        console.log("Removed from map.");
      }, TIME);
      usersMap.set(message.author.id, userData);
    } else {
      ++msgCount;
      if (msgCount === LIMIT) {
        let muterole = message.guild.roles.cache.find(
          (role) => role.name === "عضو معاقب"
        );

        if (!muterole) {
          try {
            muterole = await message.guild.roles.create({
              name: "عضو معاقب",
              permissions: [], // تعيين الأذونات إذا لزم الأمر
            });

            // تحديث أذونات القنوات بعد إنشاء الدور
            message.guild.channels.cache.forEach(async (channel) => {
              await channel.permissionOverwrites.edit(muterole, {
                SEND_MESSAGES: false,
              });
            });
          } catch (e) {
            console.log(e);
            return;
          }
        }

        await message.member.roles.add(muterole);
        const embed = new MessageEmbed()
          .setColor("RED")
          .setTitle(`${police} __ادارة السجن !__ ${police}`)
          .setDescription(`**${yes} | شكرا لك عزيزي/عزيزتي المواطن/ة <@!${message.author.id}> على السبام الحلو
عقاب السبام 3 ايام سجن .
**`);

        const replyMessage = await message.channel.send({ embeds: [embed] });
        setTimeout(() => {
          replyMessage.delete();
        }, 300000);

        setTimeout(() => {
          message.member.roles.remove(muterole);
        }, TIME);
      } else {
        userData.msgCount = msgCount;
        usersMap.set(message.author.id, userData);
      }
    }
  } else {
    const fn = setTimeout(() => {
      usersMap.delete(message.author.id);
      console.log("Removed from map.");
    }, TIME);

    usersMap.set(message.author.id, {
      msgCount: 1,
      lastMessage: message,
      timer: fn,
    });
  }
});

////////////////////////////////////////////////////////////////////////////// امر مسح الرسائل
client.on('messageCreate', async (message) => {
    // التأكد من أن الرسالة ليست من بوت
    if (message.author.bot) return;

    // التحقق من أمر المسح
    if (message.content.startsWith(`${prefix}مسح`)) {
        // التحقق من أن الشخص الذي يستخدم الأمر لديه صلاحية "Manage Messages"
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('ليس لديك الصلاحية اللازمة لمسح الرسائل.');
        }

        // استخراج العدد من الرسالة
        const args = message.content.split(' ')[1];
        let deleteCount = parseInt(args);

        // إذا لم يتم تحديد عدد، يتم تعيين العدد الافتراضي إلى 20
        if (!deleteCount || isNaN(deleteCount) || deleteCount < 1 || deleteCount > 100) {
            deleteCount = 20;
        }

        try {
            // مسح الرسائل
            await message.channel.bulkDelete(deleteCount, true);

            // إعداد رسالة الإيمبد
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('تم مسح الرسائل بنجاح')
                .setDescription(`تم مسح ${deleteCount} رسالة بواسطة ${message.author.tag}`)
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }))
                .setFooter({
                    text: 'عملية المسح',
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            // إرسال رسالة الإيمبد
            message.channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete(), 5000); // حذف رسالة التأكيد بعد 5 ثوانٍ
            });

        } catch (error) {
            console.error(error);
            message.reply('حدث خطأ أثناء محاولة مسح الرسائل.');
        }
    }
});

////////////////////////////////////////////////////////////////////////////// امر اسكات وفك الاسكات
const mutedRoleId = '1281013995473731726'; // ضع ID رتبة الـ Muted هنا

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // أمر إسكات
    if (message.content.startsWith(`${prefix}اسكت`)) {
        if (!message.member.permissions.has('MODERATE_MEMBERS')) {
            return message.reply('ليس لديك الصلاحية لاستخدام هذا الأمر.');
        }

        const args = message.content.split(' ');
        const member = message.mentions.members.first();
        const time = args[2];
        const reason = args.slice(3).join(' ') || 'لم يتم تقديم سبب';

        if (!member) {
            return message.reply('يرجى منشن العضو الذي تريد إسكاته.');
        }

        if (member.roles.cache.has(mutedRoleId)) {
            return message.reply('هذا العضو مُسكت بالفعل.');
        }

        if (!time) {
            return message.reply('يرجى تحديد مدة الإسكات.');
        }

        const muteDuration = ms(time);
        if (!muteDuration) {
            return message.reply('الرجاء إدخال مدة صالحة (مثال: "10m" أو "1h" أو "1d").');
        }

        const embed = new MessageEmbed()
            .setTitle('عضو تم إسكاته')
            .addFields(
                { name: 'العضو', value: `${member.user.tag}`, inline: true },
                { name: 'المسؤول', value: `${message.author.tag}`, inline: true },
                { name: 'المدة', value: time, inline: true },
                { name: 'السبب', value: reason, inline: true }
            )
            .setColor('#FF0000')
            .setTimestamp();

        try {
            // إضافة رتبة Muted
            await member.roles.add(mutedRoleId);
            await message.channel.send({ embeds: [embed] });

            // إرسال رسالة في الخاص للعضو المُعاقَب
            await member.send(`تم إسكاتك في السيرفر **${message.guild.name}** لمدة **${time}** بسبب: **${reason}**.`);

            // إزالة الرتبة بعد انتهاء المدة
            setTimeout(async () => {
                await member.roles.remove(mutedRoleId);
                await member.send(`تم فك الإسكات عنك في السيرفر **${message.guild.name}**.`);
                message.channel.send(`${member.user.tag} تم فك الإسكات عنه.`);
            }, muteDuration);
        } catch (error) {
            console.error(error);
            message.reply('حدث خطأ أثناء محاولة إسكات العضو.');
        }
    }

    // أمر فك الإسكات (تكلم)
    if (message.content.startsWith(`${prefix}تكلم`)) {
        if (!message.member.permissions.has('MODERATE_MEMBERS')) {
            return message.reply('ليس لديك الصلاحية لاستخدام هذا الأمر.');
        }

        const member = message.mentions.members.first();
        const reason = message.content.split(' ').slice(2).join(' ') || 'لم يتم تقديم سبب';

        if (!member) {
            return message.reply('يرجى منشن العضو الذي تريد فك إسكات عنه.');
        }

        if (!member.roles.cache.has(mutedRoleId)) {
            return message.reply('هذا العضو ليس مسكتًا.');
        }

        const embed = new MessageEmbed()
            .setTitle('عضو تم فك إسكاته')
            .addFields(
                { name: 'العضو', value: `${member.user.tag}`, inline: true },
                { name: 'المسؤول', value: `${message.author.tag}`, inline: true },
                { name: 'السبب', value: reason, inline: true }
            )
            .setColor('#00FF00')
            .setTimestamp();

        try {
            // إزالة رتبة Muted
            await member.roles.remove(mutedRoleId);
            await message.channel.send({ embeds: [embed] });

            // إرسال رسالة في الخاص للعضو
            await member.send(`تم فك الإسكات عنك في السيرفر **${message.guild.name}** بسبب: **${reason}**.`);
        } catch (error) {
            console.error(error);
            message.reply('حدث خطأ أثناء محاولة فك الإسكات عن العضو.');
        }
    }
});


//////////////////////////////////////////////////////////////////////////////
const corrections = {
    "حمدلله": "الحمد لله",
    "حمد الله": "الحمد لله",
    "الحمد الله": "الحمد لله",
    "حمدالله": "الحمد لله",
    "الحمدالله": "الحمد لله"
};

const correctPhrase = "الحمد لله";
const correctEmoji = `${yes}`; // صح
const incorrectEmoji = `${no}`; // خطأ

client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;
    if (!msg.channel.guild) return;

    try {
        if (msg.content === correctPhrase) {
            // إذا كانت الرسالة تطابق الجملة الصحيحة
            await msg.react(correctEmoji);
        } else if (corrections[msg.content]) {
            // إذا كانت الرسالة تطابق أحد البدائل الخاطئة
            await msg.react(incorrectEmoji);
            await msg.reply(`**الجملة الصحيحة هي: ${corrections[msg.content]}**`);
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

///////////////////////////////////////////////////////////////////////////// كود حذف الكلمات الغير لائقة
const badWordsData = JSON.parse(fs.readFileSync('./badWords.json', 'utf8'));
const badWords = badWordsData.badWords.map(word => word.toLowerCase());

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // التحقق مما إذا كانت الرسالة تحتوي على أي كلمة غير مقبولة
    const messageContent = message.content.toLowerCase();
    const foundBadWord = badWords.find(word => messageContent.includes(word));

    if (foundBadWord) {
        try {
            // حذف الرسالة
            await message.delete();

            // إرسال رسالة خاصة للمرسل
            await message.author.send(`**عذراً، تم حذف رسالتك لأنها تحتوي على كلمة غير مقبولة: "${foundBadWord}". يُفضل تجنب استخدام الكلمات غير المناسبة. شكراً لتفهمك!**`);
        } catch (error) {
            console.error('خطأ في إرسال رسالة خاصة:', error);
        }
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////
const responses = JSON.parse(fs.readFileSync("./respons.json"));

// عدد المنشنات المسموح بها لكل عضو في فترة زمنية محددة (10 دقائق في هذا المثال)
const maxMentionsPerInterval = 10;
const mentionInterval = 5 * 60 * 1000; // 10 minutes
const userMentions = new Map();

client.on("messageCreate", async (message) => {
  if (message.mentions.has(client.user.id)) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const userId = message.author.id;
    const mentionsCount = (userMentions.get(userId) || 0) + 1;

    if (mentionsCount > maxMentionsPerInterval) {
      return message.reply("**ماراح ارد عليك لانك ازعجتني بالمنشن .**");
    }

    userMentions.set(userId, mentionsCount);

    setTimeout(() => {
      userMentions.delete(userId);
    }, mentionInterval);

    const fetched = responses[Math.floor(Math.random() * responses.length)];
    message.reply(fetched);
  }
});

//////////////////////////////////////////////////////////////////// رسالة عند اضافة بوست للسيرفر
client.on('guildMemberUpdate', (oldMember, newMember) => {
    // التحقق مما إذا كان العضو قد قام بإعطاء Boost
    if (!oldMember.premiumSince && newMember.premiumSince) {
        // إعداد رسالة الإيمبد
        const embed = new MessageEmbed()
            .setTitle('🎉 شكرًا لك على إعطاء Boost! 🎉')
            .setDescription(`${newMember.user.tag} قام بإعطاء Boost للخادم! شكرًا لك على دعمك!`)
            .setColor('#FFC0CB')
            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
            .setImage("https://emoji.gg/assets/emoji/6494-discord-boost.gif") // استبدل هذا برابط الصورة التي تريد إضافتها داخل الإيمبد
            .setFooter({ text: 'نحن نقدّر دعمك!', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp().then((msg) => {
        msg.react(`😘`);
        msg.react(`❤️`);
      });

        // إرسال رسالة الإيمبد في القناة المحددة
        const logChannelId = '890000687746940949';
        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    }
});





////////////////////////////////////////////////////////////////////////////// امر اعطاء وازالة الرتب


// ID الخاص بالقناة التي سيتم إرسال الرسالة إليها
const logChannelId = '890212140907118624';

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.startsWith(`${prefix}اعط_رتبة`)) {
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.reply('ليس لديك الصلاحية لاستخدام هذا الأمر.');
        }

        const args = message.content.split(' ');
        const member = message.mentions.members.first();
        const roleName = args.slice(2).join(' ');

        if (!member || !roleName) {
            return message.reply('يرجى منشن الشخص وكتابة اسم الرتبة.');
        }

        const role = message.guild.roles.cache.find(role => role.name === roleName);
        if (!role) {
            return message.reply('لم أتمكن من العثور على الرتبة المحددة.');
        }

        try {
            await member.roles.add(role);

            //  **   إعداد رسالة الإيمبد
            const embed = new MessageEmbed()
                .setTitle('تم إعطاء رتبة')
                .setDescription(`**
تم إعطاء رتبة [ ${roleName} ] لـ ${member.user.tag} .

**`)
                .setColor('#00FF00')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `تمت العملية بواسطة: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            // إرسال رسالة الإيمبد في القناة التي قام المستخدم بإعطاء الرتبة فيها
            message.reply({ embeds: [embed] });

            // إرسال رسالة الإيمبد في القناة المحددة
            const logChannel = client.channels.cache.get(logChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            message.reply('حدث خطأ أثناء محاولة إعطاء الرتبة.');
        }
    }

    if (message.content.startsWith(`${prefix}ازالة_رتبة`)) {
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.reply('ليس لديك الصلاحية لاستخدام هذا الأمر.');
        }

        const args = message.content.split(' ');
        const member = message.mentions.members.first();
        const roleName = args.slice(2).join(' ');

        if (!member || !roleName) {
            return message.reply('يرجى منشن الشخص وكتابة اسم الرتبة.');
        }

        const role = message.guild.roles.cache.find(role => role.name === roleName);
        if (!role) {
            return message.reply('لم أتمكن من العثور على الرتبة المحددة.');
        }

        try {
            await member.roles.remove(role);

            // إعداد رسالة الإيمبد
            const embed = new MessageEmbed()
                .setTitle('تم إزالة رتبة')
                .setDescription(`**
${message.author.tag} تم إزالة رتبة [ ${roleName} ] من ${member.user.tag}

**`)
                .setColor('#FF0000')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `تمت العملية بواسطة: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            // إرسال رسالة الإيمبد في القناة التي قام المستخدم بإزالة الرتبة فيها
            message.reply({ embeds: [embed] });

            // إرسال رسالة الإيمبد في القناة المحددة
            const logChannel = client.channels.cache.get(logChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            message.reply('حدث خطأ أثناء محاولة إزالة الرتبة.');
        }
    }
});

///////////////////////////////////////////////////////////////////////////// بريفيكس البوت

let settings = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

// تحديث بادئة الأوامر
function updatePrefix(newPrefix) {
    settings.prefix = newPrefix;
    fs.writeFileSync('config.json', JSON.stringify(settings, null, 2));
}


client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // التحقق من صلاحيات المستخدم لتغيير البادئة
    if (message.content.startsWith(settings.prefix + 'تغيير_البادئة')) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('ليس لديك الصلاحية لتغيير بادئة الأوامر.');
        }

        const args = message.content.split(' ');
        const newPrefix = args[1];

        if (!newPrefix) {
            return message.reply('يرجى تحديد البادئة الجديدة.');
        }

        // تحديث البادئة وحفظها في ملف الضبط
        updatePrefix(newPrefix);

        message.channel.send(`تم تغيير بادئة الأوامر إلى: \`${newPrefix}\``);
    }

    // استخدام البادئة من ملف الضبط
    if (message.content.startsWith(settings.prefix + 'أمر_مثال')) {
        // تنفيذ الأمر هنا
        message.channel.send('تم تنفيذ الأمر!');
    }
});


////////////////////////////////////////////////////////////////////// امر تفعيل الاعضاء
const allowedRoleName = '891419789510209607'; // اسم الرتبة المسموح لها باستخدام الأمر
const allowedChannelName = '898843333709950986'; // اسم القناة المسموح بها

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.guild) {
        console.log('الرسالة مرسلة في الرسائل الخاصة (DM)، لا يوجد كائن member.');
        return;
    }
    if (!message.member) {
        console.log('تعذر الوصول إلى العضو (member).');
        return;
    }

      // التحقق من أن المستخدم لديه الرتبة المسموح بها
    const hasAllowedRole = message.member.roles.cache.some(role => role.id === allowedRoleName);
    // التحقق من أن الرسالة أرسلت في القناة المسموح بها
    const isInAllowedChannel = message.channel.id === allowedChannelName;

    if (!hasAllowedRole || !isInAllowedChannel) {
        return; // إذا لم يكن المستخدم لديه الرتبة أو لم تكن الرسالة في القناة الصحيحة، يتم تجاهلها
    }

    // التحقق من أمر التفعيل
    if (message.content.startsWith(`${prefix}تفعيل`)) {
        // إنشاء الكابتشا
        const captcha = generateCaptcha();
        const attachment = new MessageAttachment(captcha.image, 'captcha.png');

        // إرسال الكابتشا للمستخدم
        const filter = response => response.author.id === message.author.id;
        message.channel.send({
            content: 'من فضلك أدخل النص الموجود في الصورة أدناه للتحقق:',
            files: [attachment]
        }).then(() => {
            message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                .then(async collected => {
                    const response = collected.first();
                    if (response.content === captcha.text) {
                        // إعطاء رتبة الدخول وإزالة رتبة الزائرين
                        const member = message.member;
                        const visitorRole = message.guild.roles.cache.find(role => role.name === 'غير مفعل');
                        const entryRole = message.guild.roles.cache.find(role => role.name === 'عضو عادي');

                        if (visitorRole) await member.roles.remove(visitorRole);
                        if (entryRole) await member.roles.add(entryRole);

                        message.reply('تم التحقق منك! لقد تم منحك الآن حق الدخول الكامل.');
                    } else {
                        message.reply('الكابتشا غير صحيحة. حاول مرة أخرى.');
                    }
                })
                .catch(() => {
                    message.reply('لقد انتهى الوقت. حاول مرة أخرى.');
                });
        });
    }
});

//////////////////// وظيفة إنشاء الكابتشا
function generateCaptcha() {
    const canvas = Canvas.createCanvas(200, 60);
    const ctx = canvas.getContext('2d');

    // خلفية الكابتشا
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // نص الكابتشا
    const text = Math.random().toString(36).substring(2, 8).toUpperCase(); // توليد نص عشوائي
    ctx.font = '40px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(text, 20, 45);

    // بعض الخطوط العشوائية لإضافة تعقيد
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `#${Math.floor(Math.random()*16777215).toString(20)}`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    return {
        text: text,
        image: canvas.toBuffer()
    };
}


////////////////////////////////////////////////////////////////// امر ايموجي على الصور
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // التحقق مما إذا كانت الرسالة تحتوي على مرفقات (صور)
    if (message.attachments.size > 0) {
        // التحقق مما إذا كان المرفق هو صورة
        message.attachments.forEach(async attachment => {
            if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                try {
                    // إضافة ثلاثة رياكشن مختلفة
                    await message.react('👍'); // رياكشن 1
                    await message.react('❤️'); // رياكشن 2
                    await message.react('😂'); // رياكشن 3
                } catch (error) {
                    console.error('Error reacting to image message:', error);
                }
            }
        });
    }
});







///////////////////////////////////////////////////////// كود لفل بنجوم رتبة
// تحميل مستويات الأعضاء من ملف JSON
let levels = {};
if (fs.existsSync('levels.json')) {
    levels = JSON.parse(fs.readFileSync('levels.json', 'utf8'));
}

// حفظ مستويات الأعضاء في ملف JSON
function saveLevels() {
    fs.writeFileSync('levels.json', JSON.stringify(levels, null, 2), 'utf8');
}

// كسب كلمات عند إرسال رسالة
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    if (!levels[guildId]) levels[guildId] = {};
    if (!levels[guildId][userId]) levels[guildId][userId] = { words: 0, level: 1 };

    const userLevelData = levels[guildId][userId];
    const wordCount = message.content.split(/\s+/).length; // حساب عدد الكلمات في الرسالة
    userLevelData.words += wordCount;

    const levelsThresholds = {
        1: 50,
        2: 200,
        3: 500,
        4: 1500,
        5: 4000
    };

    let newLevel = userLevelData.level;

    for (const [lvl, wordThreshold] of Object.entries(levelsThresholds)) {
        if (userLevelData.words >= wordThreshold) {
            newLevel = parseInt(lvl);
        }
    }

    if (newLevel > userLevelData.level) {
        userLevelData.level = newLevel;
        await levelUp(message.member, newLevel, message.guild);
        message.channel.send(`تهانينا ، ${message.author}! لقد تحصلت على نجمة تفاعل ${newLevel}.`);
    }

    saveLevels();
});

// إعطاء رتبة عند مستوى معين وحذف الرتبة السابقة
async function levelUp(member, level, guild) {
    const roles = {
        1: '⭐',
        2: '⭐⭐',
        3: '⭐⭐⭐',
        4: '⭐⭐⭐⭐',
        5: '⭐⭐⭐⭐⭐',
    };

    const currentRole = roles[level];
    const prevRole = roles[level - 1];

    if (currentRole) {
        const role = guild.roles.cache.find(r => r.name === currentRole);
        if (role) {
            await member.roles.add(role);
        }
    }

    if (prevRole) {
        const previousRole = guild.roles.cache.find(r => r.name === prevRole);
        if (previousRole) {
            await member.roles.remove(previousRole);
        }
    }
}



















let logChannelId2 = ''; // لتخزين معرف روم اللوق

// أمر لتحديد روم اللوق باستخدام قائمة منسدلة
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('setlog')) {
        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply('يرجى ذكر روم اللوق الذي تريد تعيينه!');
        }
        logChannelId2 = channel.id;
        return message.reply(`تم تعيين روم اللوق إلى <#${channel.id}>`);
    }
});

// دالة لإرسال اللوق
const sendLog = async (embed) => {
    if (!logChannelId2) return; // إذا لم يكن هناك روم محدد
    const channel = await client.channels.fetch(logChannelId2);
    if (channel) {
        channel.send({ embeds: [embed] });
    }
};

// تتبع الأحداث المختلفة
client.on('guildMemberAdd', (member) => {
    const embed = new MessageEmbed()
        .setTitle('دخول عضو')
        .setDescription(`انضم عضو جديد: ${member.user.tag}`)
        .setColor('GREEN')
        .setTimestamp();
    sendLog(embed);
});

client.on('guildMemberRemove', (member) => {
    const embed = new MessageEmbed()
        .setTitle('خروج عضو')
        .setDescription(`غادر عضو: ${member.user.tag}`)
        .setColor('RED')
        .setTimestamp();
    sendLog(embed);
});

client.on('guildBanAdd', async (guild, user) => {
    const embed = new MessageEmbed()
        .setTitle('عضو محظور')
        .setDescription(`تم حظر ${user.tag}`)
        .setColor('RED')
        .setTimestamp();
    sendLog(embed);
});

client.on('guildBanRemove', async (guild, user) => {
    const embed = new MessageEmbed()
        .setTitle('رفع الحظر عن عضو')
        .setDescription(`تم رفع الحظر عن ${user.tag}`)
        .setColor('GREEN')
        .setTimestamp();
    sendLog(embed);
});

client.on('guildMemberKick', (member) => {
    const embed = new MessageEmbed()
        .setTitle('عضو مطرود')
        .setDescription(`تم طرد ${member.user.tag}`)
        .setColor('RED')
        .setTimestamp();
    sendLog(embed);
});

client.on('guildMemberRoleAdd', (member, role) => {
    const embed = new MessageEmbed()
        .setTitle('تم إعطاء رتبة')
        .setDescription(`تم إعطاء ${role.name} لـ ${member.user.tag}`)
        .setColor('BLUE')
        .setTimestamp();
    sendLog(embed);
});

client.on('guildMemberRoleRemove', (member, role) => {
    const embed = new MessageEmbed()
        .setTitle('تم إزالة رتبة')
        .setDescription(`تم إزالة ${role.name} من ${member.user.tag}`)
        .setColor('ORANGE')
        .setTimestamp();
    sendLog(embed);
});

client.on('roleCreate', (role) => {
    const embed = new MessageEmbed()
        .setTitle('إنشاء رتبة جديدة')
        .setDescription(`تم إنشاء رتبة: ${role.name}`)
        .setColor('PURPLE')
        .setTimestamp();
    sendLog(embed);
});

client.on('roleDelete', (role) => {
    const embed = new MessageEmbed()
        .setTitle('حذف رتبة')
        .setDescription(`تم حذف رتبة: ${role.name}`)
        .setColor('RED')
        .setTimestamp();
    sendLog(embed);
});

client.on('roleUpdate', (oldRole, newRole) => {
    const embed = new MessageEmbed()
        .setTitle('تحديث رتبة')
        .setDescription(`تم تحديث رتبة: ${oldRole.name}`)
        .addFields('اللون القديم:', oldRole.color || 'لا يوجد لون')
        .addFields('اللون الجديد:', newRole.color || 'لا يوجد لون')
        .setColor('YELLOW')
        .setTimestamp();
    sendLog(embed);
});

// تحديث الخادم
client.on('channelCreate', (channel) => {
    const embed = new MessageEmbed()
        .setTitle('إنشاء غرفة كتابة')
        .setDescription(`تم إنشاء غرفة: ${channel.name}`)
        .setColor('BLUE')
        .setTimestamp();
    sendLog(embed);
});

client.on('channelDelete', (channel) => {
    const embed = new MessageEmbed()
        .setTitle('حذف غرفة كتابة')
        .setDescription(`تم حذف غرفة: ${channel.name}`)
        .setColor('RED')
        .setTimestamp();
    sendLog(embed);
});

client.on('voiceChannelCreate', (channel) => {
    const embed = new MessageEmbed()
        .setTitle('إنشاء غرفة صوتية')
        .setDescription(`تم إنشاء غرفة صوتية: ${channel.name}`)
        .setColor('BLUE')
        .setTimestamp();
    sendLog(embed);
});

client.on('voiceChannelDelete', (channel) => {
    const embed = new MessageEmbed()
        .setTitle('حذف غرفة صوتية')
        .setDescription(`تم حذف غرفة صوتية: ${channel.name}`)
        .setColor('RED')
        .setTimestamp();
    sendLog(embed);
});

// تحديثات الرسائل
client.on('messageDelete', (message) => {
    if (!message.partial) {
        const embed = new MessageEmbed()
            .setTitle('🗑️ حذف رسالة')
            .setDescription(`تم حذف رسالة من **${message.author.tag}** في <#${message.channel.id}>`)
            .addFields({ name: '📄 المحتوى:', value: message.content || 'لا يوجد محتوى' })
            .setColor('ORANGE')
            .setTimestamp();

        sendLog(embed); // تأكد أن sendLog ترسل الرسالة إلى اللوج
    }
});

// دخول وخروج من الغرف الصوتية
client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.channelId === null && newState.channelId !== null) {
        const embed = new MessageEmbed()
            .setTitle('دخول غرفة صوتية')
            .setDescription(`${newState.member.user.tag} دخل غرفة صوتية: ${newState.channel.name}`)
            .setColor('GREEN')
            .setTimestamp();
        sendLog(embed);
    } else if (oldState.channelId !== null && newState.channelId === null) {
        const embed = new MessageEmbed()
            .setTitle('خروج من غرفة صوتية')
            .setDescription(`${oldState.member.user.tag} غادر غرفة صوتية: ${oldState.channel.name}`)
            .setColor('RED')
            .setTimestamp();
        sendLog(embed);
    }
});

// كتم الصوت وإزالته
client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.serverMute !== newState.serverMute) {
        const embed = new MessageEmbed()
            .setTitle(newState.serverMute ? 'كتم صوت' : 'إلغاء كتم صوت')
            .setDescription(`${newState.member.user.tag} ${newState.serverMute ? 'تم كتم صوته' : 'تم إلغاء كتم صوته'}`)
            .setColor(newState.serverMute ? 'RED' : 'GREEN')
            .setTimestamp();
        sendLog(embed);
    }
});







client.login(process.env.TOKEN);
