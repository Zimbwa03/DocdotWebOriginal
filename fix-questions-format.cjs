const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing question answer format inconsistencies...');

// Read the questions file
const questionsPath = path.join('client', 'public', 'docdot-questions.json');
let questionsData;

try {
  const rawData = fs.readFileSync(questionsPath, 'utf8');
  questionsData = JSON.parse(rawData);
  console.log(`📊 Loaded ${questionsData.length} questions`);
} catch (error) {
  console.error('❌ Error reading questions file:', error.message);
  process.exit(1);
}

// Count inconsistencies before fixing
let stringTrueCount = 0;
let stringFalseCount = 0;
let numericTrueCount = 0;
let numericFalseCount = 0;

questionsData.forEach(question => {
  if (question.answer === "True") stringTrueCount++;
  else if (question.answer === "False") stringFalseCount++;
  else if (question.answer === 1) numericTrueCount++;
  else if (question.answer === 0) numericFalseCount++;
});

console.log('\n📈 Current answer format distribution:');
console.log(`- Numeric 1 (True): ${numericTrueCount}`);
console.log(`- Numeric 0 (False): ${numericFalseCount}`);
console.log(`- String "True": ${stringTrueCount}`);
console.log(`- String "False": ${stringFalseCount}`);

// Fix inconsistencies
let fixedCount = 0;
questionsData.forEach(question => {
  if (question.answer === "True") {
    question.answer = 1;
    fixedCount++;
  } else if (question.answer === "False") {
    question.answer = 0;
    fixedCount++;
  }
});

console.log(`\n🔄 Fixed ${fixedCount} inconsistent answers`);

// Validate final format
let finalTrueCount = 0;
let finalFalseCount = 0;

questionsData.forEach(question => {
  if (question.answer === 1) finalTrueCount++;
  else if (question.answer === 0) finalFalseCount++;
});

console.log('\n✅ Final answer format distribution:');
console.log(`- Numeric 1 (True): ${finalTrueCount}`);
console.log(`- Numeric 0 (False): ${finalFalseCount}`);

// Write the corrected data back to file
try {
  fs.writeFileSync(questionsPath, JSON.stringify(questionsData, null, 2));
  console.log('\n💾 Successfully saved corrected questions file');
} catch (error) {
  console.error('❌ Error writing questions file:', error.message);
  process.exit(1);
}

console.log('✨ Question format standardization complete!');