import { createDirectus, rest, readCollections, readFields } from '@directus/sdk';
import fs from 'fs';
import path from 'path';

const directusUrl = process.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
const directus = createDirectus(directusUrl).with(rest());

async function generateTypes() {
	try {
		console.log('Fetching schema from Directus...');
		
		const collections = await directus.request(readCollections());
		const fields = await directus.request(readFields());

		let typeDefinitions = `// Auto-generated from Directus schema
// Do not edit manually - run 'npm run generate-types' to update

`;

		// Generate types based on collections
		for (const collection of collections) {
			if (collection.collection.startsWith('directus_')) continue;

			typeDefinitions += `export interface ${toPascalCase(collection.collection)} {\n`;
			
			const collectionFields = fields.filter((f: any) => f.collection === collection.collection);
			
			for (const field of collectionFields) {
				const tsType = mapDirectusTypeToTS(field.type);
				const optional = field.schema?.is_nullable ? '?' : '';
				typeDefinitions += `\t${field.field}${optional}: ${tsType};\n`;
			}
			
			typeDefinitions += `}\n\n`;
		}

		const outputPath = path.join(process.cwd(), 'src/lib/generated-types.ts');
		fs.writeFileSync(outputPath, typeDefinitions);
		
		console.log('✅ Types generated successfully at:', outputPath);
	} catch (error) {
		console.error('❌ Error generating types:', error);
		process.exit(1);
	}
}

function toPascalCase(str: string): string {
	return str
		.split('_')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');
}

function mapDirectusTypeToTS(directusType: string): string {
	const typeMap: Record<string, string> = {
		'string': 'string',
		'text': 'string',
		'integer': 'number',
		'bigInteger': 'number',
		'float': 'number',
		'decimal': 'number',
		'boolean': 'boolean',
		'date': 'string',
		'time': 'string',
		'datetime': 'string',
		'timestamp': 'string',
		'json': 'any',
		'uuid': 'string',
		'hash': 'string',
		'csv': 'string[]',
	};
	
	return typeMap[directusType] || 'any';
}

generateTypes();
