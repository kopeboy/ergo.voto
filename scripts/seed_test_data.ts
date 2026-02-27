import { directus } from '../src/lib/directus.js';
import { createItem } from '@directus/sdk';

async function seedTestData() {
	try {
		console.log('Creating test debate...');
		
		// Create debate
		const debate = await directus.request(
			createItem('debates', {
				topic: 'Intelligenza Artificiale nella Sanità',
				type: 'question',
				question: 'L\'uso dell\'intelligenza artificiale dovrebbe essere obbligatorio per le diagnosi mediche?',
				intro: 'L\'intelligenza artificiale sta rivoluzionando il settore sanitario, offrendo strumenti sempre più precisi per la diagnosi e il trattamento delle malattie. Tuttavia, emergono questioni etiche e pratiche riguardo la sua implementazione obbligatoria.',
				status: 'published'
			})
		);

		console.log(`Debate created with ID: ${debate.id}`);

		// Pro arguments
		const proArgs = [
			{
				text: 'L\'intelligenza artificiale ha dimostrato di raggiungere tassi di accuratezza diagnostica superiori al 95% in molte specialità mediche, superando significativamente le performance dei medici umani in condizioni controllate. Studi recenti pubblicati su Nature Medicine mostrano che i sistemi di AI possono identificare tumori in fase precoce con una precisione del 97%, riducendo drasticamente i falsi negativi che potrebbero costare vite umane.',
				score: 15
			},
			{
				text: 'L\'implementazione dell\'AI ridurrebbe significativamente i costi sanitari a lungo termine. Secondo uno studio del McKinsey Global Institute, l\'automazione diagnostica potrebbe far risparmiare al sistema sanitario globale fino a 150 miliardi di dollari all\'anno entro il 2030, liberando risorse per trattamenti e prevenzione. Inoltre, l\'AI può analizzare migliaia di casi in pochi secondi, riducendo i tempi di attesa per i pazienti.',
				score: 12
			},
			{
				text: 'La standardizzazione delle diagnosi attraverso l\'AI eliminerebbe le disparità regionali nell\'accesso alle cure di qualità. Attualmente, la qualità della diagnosi dipende fortemente dall\'esperienza del medico locale, creando ingiustizie tra aree urbane e rurali. Un sistema di AI centralizzato garantirebbe lo stesso livello di eccellenza diagnostica ovunque, democratizzando l\'accesso alla medicina di precisione.',
				score: 8
			}
		];

		console.log('Creating Pro arguments...');
		const createdProArgs = [];
		for (const arg of proArgs) {
			const created = await directus.request(
				createItem('arguments', {
					debate: debate.id,
					argument: arg.text,
					is_objection: false,
					vote_score: arg.score
				})
			);
			createdProArgs.push(created);
			console.log(`Pro argument created: ${created.id}`);
		}

		// Contro arguments
		const controArgs = [
			{
				text: 'L\'intelligenza artificiale manca della capacità di comprendere il contesto umano completo che è fondamentale per una diagnosi accurata. I medici considerano non solo i sintomi fisici, ma anche fattori psicologici, sociali e ambientali che un algoritmo non può cogliere. La medicina non è solo scienza dei dati, ma anche arte dell\'ascolto e dell\'empatia, elementi che nessuna AI può replicare.',
				score: 18
			},
			{
				text: 'I sistemi di AI sono vulnerabili a bias sistemici derivanti dai dati di addestramento. Se i dataset utilizzati per addestrare l\'AI contengono prevalentemente dati di popolazioni specifiche (ad esempio, caucasici maschi), il sistema potrebbe essere meno accurato per donne, minoranze etniche o gruppi sottorappresentati. Questo potrebbe aggravare le disuguaglianze sanitarie esistenti invece di risolverle.',
				score: 14
			},
			{
				text: 'La responsabilità legale in caso di errore diagnostico diventa estremamente problematica con l\'AI obbligatoria. Chi è responsabile se l\'algoritmo sbaglia: il programmatore, l\'ospedale, il medico che ha seguito le indicazioni dell\'AI? Questa zona grigia legale potrebbe paralizzare il sistema giudiziario e lasciare i pazienti danneggiati senza possibilità di ricorso adeguato.',
				score: 10
			}
		];

		console.log('Creating Contro arguments...');
		const createdControArgs = [];
		for (const arg of controArgs) {
			const created = await directus.request(
				createItem('arguments', {
					debate: debate.id,
					argument: arg.text,
					is_objection: true,
					vote_score: arg.score
				})
			);
			createdControArgs.push(created);
			console.log(`Contro argument created: ${created.id}`);
		}

		// Child arguments for first Pro argument
		console.log('Creating child arguments...');
		
		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				parent: createdProArgs[0].id,
				argument: 'Oltre alla diagnosi oncologica, l\'AI eccelle anche nella rilevazione di malattie cardiovascolari, diabete e patologie neurologiche. Il sistema Watson di IBM ha dimostrato di identificare mutazioni genetiche rare in pazienti oncologici con una precisione del 96%, suggerendo terapie personalizzate che i medici non avrebbero considerato. Questo salva vite e migliora la qualità della vita dei pazienti.',
				is_objection: false,
				vote_score: 7
			})
		);

		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				parent: createdProArgs[0].id,
				argument: 'Gli studi citati sono stati condotti in ambienti controllati e non riflettono la complessità della pratica clinica reale. In condizioni di laboratorio, l\'AI può eccellere, ma nella realtà quotidiana degli ospedali, con dati incompleti, pazienti non collaborativi e situazioni di emergenza, le performance crollano significativamente. Uno studio del 2023 su JAMA ha mostrato che l\'accuratezza dell\'AI scende al 78% in contesti clinici reali.',
				is_objection: true,
				vote_score: 5
			})
		);

		// Child arguments for first Contro argument
		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				parent: createdControArgs[0].id,
				argument: 'Esattamente, e questo è particolarmente critico in psichiatria e medicina generale, dove la relazione medico-paziente è terapeutica in sé. Un paziente che si sente ascoltato e compreso ha migliori outcome clinici, indipendentemente dalla diagnosi tecnica. L\'AI potrebbe ridurre la medicina a un processo meccanico, perdendo la dimensione umana che è parte integrante della guarigione.',
				is_objection: false,
				vote_score: 6
			})
		);

		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				parent: createdControArgs[0].id,
				argument: 'L\'AI può essere programmata per considerare fattori contestuali attraverso questionari strutturati e analisi multimodale che include dati socio-economici, storia familiare e stile di vita. Sistemi moderni di AI utilizzano Natural Language Processing per analizzare le note cliniche e identificare pattern che un medico potrebbe perdere. L\'empatia non diagnostica malattie, i dati sì.',
				is_objection: true,
				vote_score: 4
			})
		);

		console.log('✅ Test data created successfully!');
		console.log(`Debate ID: ${debate.id}`);
		console.log(`Visit: http://localhost:5173/debate/${debate.id}`);
		
	} catch (error) {
		console.error('Error seeding test data:', error);
		throw error;
	}
}

seedTestData();
