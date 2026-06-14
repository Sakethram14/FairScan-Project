import fs from 'fs';

const numRows = 100;
// Note: These column names deliberately AVOID the exact keywords like "medium", "language", "tier", "hometown", "first_gen", "latency" 
// to test if the Gemini model can dynamically infer the semantics as requested!
const header = "applicant_uuid,technical_assessment_score,years_of_experience,primary_spoken_dialect,domicile_postal_zone,ancestor_highest_qualification,packet_drop_ratio,ml_prediction_confidence,final_decision\n";
let csv = header;

const dialects = ['Hindi', 'Telugu', 'Tamil', 'English', 'Marathi', 'Bengali'];
const regions = ['Zone-A-Metro', 'Zone-B-Urban', 'Zone-C-SemiUrban', 'Zone-D-Remote'];
const degrees = ['Uneducated', 'Primary School', 'Undergrad', 'Postgrad'];

for (let i = 1; i <= numRows; i++) {
    // Inject synthetic bias: 'Advantaged' profiles generally score higher, 
    // simulating systemic bias encoded in the data.
    const isAdvantaged = Math.random() > 0.5;
    
    const dialect = isAdvantaged ? 'English' : dialects[Math.floor(Math.random() * dialects.length)];
    const region = isAdvantaged ? (Math.random() > 0.5 ? 'Zone-A-Metro' : 'Zone-B-Urban') : (Math.random() > 0.5 ? 'Zone-C-SemiUrban' : 'Zone-D-Remote');
    const degree = isAdvantaged ? (Math.random() > 0.3 ? 'Undergrad' : 'Postgrad') : (Math.random() > 0.5 ? 'Uneducated' : 'Primary School');
    
    // packet_drop_ratio (lower is better, disadvantaged have higher drops)
    const packet_drop = isAdvantaged ? (Math.random() * 0.05).toFixed(3) : (Math.random() * 0.2 + 0.1).toFixed(3);
    
    // Scores
    let tech_score = Math.floor(Math.random() * 40) + (isAdvantaged ? 55 : 35); // 55-95 vs 35-75
    let exp = Math.floor(Math.random() * 5) + (isAdvantaged ? 2 : 0);
    
    // AI Score favors the advantaged group implicitly through the features
    let ai_score = (tech_score * 0.6 + exp * 5) / 100;
    if (ai_score > 0.99) ai_score = 0.99;
    
    let selected = ai_score > 0.55 ? 1 : 0;
    
    csv += `APP-${1000+i},${tech_score},${exp},${dialect},${region},${degree},${packet_drop},${ai_score.toFixed(3)},${selected}\n`;
}

fs.writeFileSync('synthetic_dynamic_test.csv', csv);
console.log('Successfully generated synthetic_dynamic_test.csv');
