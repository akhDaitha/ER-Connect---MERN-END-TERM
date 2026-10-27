const adjectives = [
  'Quiet', 'Calm', 'Gentle', 'Warm', 'Serene', 'Kind', 'Patient', 'Peaceful',
  'Mellow', 'Silver', 'Golden', 'Swift', 'Bright', 'Steady', 'Amber', 'Humble',
  'Tranquil', 'Brave', 'Thoughtful', 'Compassionate', 'Resilient', 'Mindful'
];

const animals = [
  'Fox', 'Otter', 'Deer', 'Panda', 'Sparrow', 'Robin', 'Falcon', 'Dolphin',
  'Owl', 'Koala', 'Badger', 'Wolf', 'Hedgehog', 'Fawn', 'Lynx', 'Bear',
  'Rabbit', 'Dove', 'Swan', 'Crane', 'Seal', 'Hawk'
];

/**
 * Generates an anonymous friendly alias like "QuietFox42"
 */
function generateAlias() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${adj}${animal}${num}`;
}

module.exports = {
  generateAlias
};
