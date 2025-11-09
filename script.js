const Chatbot = {
  defaultResponses: {
    'roshan pokhrel':'Yes, how can I help you?',
    'hello hi': `Hello! How can I help you?`,
    'how are you': `I'm doing great! How can I help you?`,
    'flip a coin': function () {
      const randomNumber = Math.random();
      if (randomNumber < 0.5) {
        return 'Sure! You got heads';
      } else {
        return 'Sure! You got tails';
      }
    },
    'roll a dice': function() {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      return `Sure! You got ${diceResult}`;
    },
    'what is the date today': function () {
      const now = new Date();
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = months[now.getMonth()];
      const day = now.getDate();

      return `Today is ${month} ${day}`;
    },
    'thank': 'No problem! Let me know if you need help with anything else!',
  },

  // === INFORMATION FILLED HERE ===

  additionalResponses: {
    // --- Basic Info ---
    'who is roshan pokharel': 'Roshan Pokharel is a passionate student of Computer Science and Information Technology (CSIT) at Butwal Multiple Campus.',
    'who are you': 'I am Roshan Pokharel, a passionate student of Computer Science and Information Technology (CSIT).',
    'what is your name': 'My name is Roshan Pokharel.',
    'tell me about yourself': 'I am Roshan Pokharel, a passionate and dedicated CSIT student at Butwal Multiple Campus. I love building modern web and app solutions.',

    // --- Contact Info ---
    'how can I contact you': 'You can reach me by phone at 9746385400 or by email at roshanpokharel890@gmail.com.',
    'what is your phone number': 'My phone number is 9746385400.',
    'what is your email': 'My email is roshanpokharel890@gmail.com.',
    'what is your address': 'I live in Bardaghat, Nawalparasi, Nepal.',
    'where do you live': 'I live in Bardaghat, Nawalparasi, Nepal.',

    // --- Education ---
    'where do you study': 'I am currently studying Computer Science and Information Technology (CSIT) at Butwal Multiple Campus.',
    'what is your college': 'I am a student at Butwal Multiple Campus.',
    'what are you studying': 'I am studying Computer Science and Information Technology (CSIT).',
    'where did you complete your see': 'I completed my SEE from Holy Care English Secondary School.',
    'where did you complete your +2': 'I completed my +2 education from Kumudini Homes.',
    'what is your education': 'I completed my SEE from Holy Care English Secondary School, my +2 from Kumudini Homes, and I am now studying CSIT at Butwal Multiple Campus.',

    // --- Skills & Interests ---
    'what are your skills': 'I have advanced skills in HTML, CSS, and JavaScript, intermediate knowledge of React, and basic skills in Node.js.',
    'what programming languages do you know': 'I am skilled in HTML, CSS, and JavaScript, and I am learning React and Node.js.',
    'what are your interests': 'I have a keen interest in web and app development, especially building modern, user-friendly applications.',

    // --- Projects ---
    'what projects have you worked on': 'I built a movie recommendation website, and I am currently developing an anonymous chat app (with WebRTC/Socket.IO) and a home camera monitoring web app.',
    'tell me about your projects': 'My projects include a movie recommendation site, an anonymous chat app with audio calling, and a home camera monitoring web app.',

    // --- Goals & Hobbies ---
    'what is your goal': 'My goal is to become a skilled software developer, building reliable, secure, and visually appealing applications.',
    'what are your hobbies': 'I maintain a disciplined routine, exercise regularly, dedicate time to learning, and am working on improving my English fluency.',
    'tell me a joke': 'Why do programmers prefer dark mode? Because light attracts bugs!',
    'joke':'Three SQL Database Admins walked into a NoSQL bar. A little while later they walked out because they couldnot find a table.'
  },


  // === END OF FILLED INFORMATION ===


  unsuccessfulResponse: `Sorry, I didn't quite understand that. Currently, I only know Infomation about Roshan Pokharel and a few basic commands. Please try asking something else!`,

  emptyMessageResponse: `Sorry, it looks like your message is empty. Please make sure you send a message and I will give you a response.`,

  addResponses: function (additionalResponses) {
   
    this.additionalResponses = {
      ...this.additionalResponses,
      ...additionalResponses
    };
  },

  getResponse: function (message) {
    if (!message) {
      return this.emptyMessageResponse;
    }

    // This spread operator (...) combines the 2 objects.
    const responses = {
      ...this.defaultResponses,
      ...this.additionalResponses,
    };

    const {
      ratings,
      bestMatchIndex,
    } = this.stringSimilarity(message, Object.keys(responses));

    const bestResponseRating = ratings[bestMatchIndex].rating;
    if (bestResponseRating <= 0.3) {
      return this.unsuccessfulResponse;
    }

    const bestResponseKey = ratings[bestMatchIndex].target;
    const response = responses[bestResponseKey];

    if (typeof response === 'function') {
      return response();
    } else {
      return response;
    }
  },

  getResponseAsync: function (message) {
    return new Promise((resolve) => {
      // Pretend it takes some time for the chatbot to response.
      setTimeout(() => {
        resolve(this.getResponse(message));
      }, 1000);
    });
  },

  compareTwoStrings: function (first, second) {
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram)
        ? firstBigrams.get(bigram) + 1
        : 1;

      firstBigrams.set(bigram, count);
    };

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram)
        ? firstBigrams.get(bigram)
        : 0;

      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
  },

  stringSimilarity: function (mainString, targetStrings) {
    const ratings = [];
    let bestMatchIndex = 0;

    for (let i = 0; i < targetStrings.length; i++) {
      const currentTargetString = targetStrings[i];
      const currentRating = this.compareTwoStrings(mainString, currentTargetString)
      ratings.push({target: currentTargetString, rating: currentRating})
      if (currentRating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i
      }
    }

    const bestMatch = ratings[bestMatchIndex]

    return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
  },
};

// Define the randomUUID() function if it doesn't exist.
function uuidPolyfill() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
    const randomNumber = Math.random() * 16 | 0;
    const result = char === 'x' ? randomNumber : (randomNumber & 0x3 | 0x8);
    return result.toString(16);
  });
}

// This code allows Chatbot to be used in both the browser and
// in NodeJS. This is called UMD (Universal Module Definition).
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory();
  } else {
    // Create a fallback if window.crypto is undefined.
    if (typeof root.crypto === 'undefined') {
      try {
        root.crypto = {};
      } catch (e) {}
    }

    // Create a fallback crypto.randomUUID() function.
    if (root.crypto && typeof root.crypto.randomUUID !== 'function') {
      try {
        root.crypto.randomUUID = uuidPolyfill;
      } catch (e) {}
    }

    // Browser global
    root.Chatbot = factory();
    root.chatbot = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return Chatbot;
}));