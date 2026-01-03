
import { KotlinParser } from './src/build/kotlin-parser';
import { Tokenizer } from './src/build/tokenizer';

const code = `
FloatingActionButton(
    onClick = { showAddDialog = true },
    containerColor = MaterialTheme.colorScheme.primary
) {
    Icon(Icons.Default.Add, contentDescription = "Add Note")
}
`;

const tokenizer = new Tokenizer(code);
const tokens = tokenizer.tokenize();
const parser = new KotlinParser(tokens, new Map());
const ast = parser.parse();

console.log(JSON.stringify(ast, null, 2));
