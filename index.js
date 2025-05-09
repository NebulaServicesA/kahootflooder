const express = require('express');
const Kahoot = require("kahoot.js-latest");
const words = require('an-array-of-english-words');
const random = require('random-name');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const activeBots = new Map();

app.post('/join-kahoot', async (req, res) => {
  const { pin, botCount, useRandomNames, botName, useNameBypass, controlManually } = req.body;

  function getRandomName() {
    const ran = Math.floor(Math.random() * 5) + 1;
    if (ran === 4) return words[Math.floor(Math.random() * words.length)];
    if (ran === 3) return random.first();
    if (ran === 2) return random.first() + random.middle() + random.last();
    return random.first() + random.last();
  }

  try {
        const joinPromises = [];
        for(let i = 0; i < botCount; i++) {
            const name = useRandomNames ? getRandomName() : `${botName}${i}`;
            const finalName = useNameBypass ?
        name.replace(/[a-zA-Z]/g, char => {
          const special = {'a':'ᗩ','b':'ᗷ','c':'ᑕ','d':'ᗪ','e':'E','f':'ᖴ','g':'G','h':'ᕼ','i':'I','j':'ᒍ','k':'K','l':'ᒪ','m':'ᗰ','n':'ᑎ','o':'O','p':'ᑭ','q':'ᑫ','r':'ᖇ','s':'Տ','t':'T','u':'ᑌ','v':'ᐯ','w':'ᗯ','x':'᙭','y':'Y','z':'ᘔ'};
          return special[char.toLowerCase()] || char;
        }) : name;

      const client = new Kahoot();

      client.on("Joined", () => {
        console.log(`Bot ${finalName} joined!`);
      });

      client.on("QuestionStart", question => {
        if (!controlManually) {
          setTimeout(() => {
            const answers = question.quizQuestionAnswers[question.questionIndex];
            const randomAnswer = Math.floor(Math.random() * (answers || 4));
            client.answer(randomAnswer);
          }, Math.random() * 5000);
        }
      });

      client.on("Disconnect", () => {
        console.log(`Bot ${finalName} disconnected`);
      });

      client.on("QuizEnd", () => {
        console.log(`Quiz ended for ${finalName}`);
      });

      joinPromises.push(
        client.join(pin, finalName)
          .then(() => client)
          .catch(err => {
            console.error(`Failed to join with bot ${finalName}:`, err);
            return null;
          })
      );
    }
    const bots = await Promise.all(joinPromises);

    activeBots.set(pin, bots);
    res.json({ success: true, message: `Successfully joined with ${bots.length} bots` });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/leave-kahoot', async (req, res) => {
  const { pin } = req.body;
  try {
    const bots = activeBots.get(pin);
    if (bots) {
      bots.forEach(bot => bot.leave());
      activeBots.delete(pin);
      res.json({ success: true, message: 'All bots disconnected' });
    } else {
      res.json({ success: false, message: 'No active bots found for this PIN' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});