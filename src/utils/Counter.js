const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // 例：'orderNumber'
  letter: { type: String, default: 'A' },
  number: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

async function getNextOrderNumber() {
  let counter = await Counter.findByIdAndUpdate(
    { _id: 'orderNum' },
    { $inc: { number: 1 } },
    { new: true, upsert: true }
  );

  let { letter, number } = counter;

  if (number > 99999) {
    letter = String.fromCharCode(letter.charCodeAt(0) + 1);
    number = 1;
    counter = await Counter.findByIdAndUpdate(
      { _id: 'orderNum' },
      { letter, number },
      { new: true }
    );
  }

  const numberStr = number.toString().padStart(5, '0');
  return `${counter.letter}${numberStr}`;
}

module.exports = { getNextOrderNumber };
