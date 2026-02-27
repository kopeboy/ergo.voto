import { createDirectus, rest, createItem, authentication } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
	.with(rest())
	.with(authentication('json'));

async function seedTestData() {
	try {
		// Login first
		console.log('Logging in to Directus...');
		await directus.login({ email: 'io@io.io', password: 'io' });
		console.log('✅ Logged in successfully\n');
		
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

		console.log(`✅ Debate created with ID: ${debate.id}`);

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
			console.log(`  ✅ Pro argument created: ${created.id}`);
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
			console.log(`  ✅ Contro argument created: ${created.id}`);
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
		console.log('  ✅ Child confirmation created');

		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				parent: createdProArgs[0].id,
				argument: 'Gli studi citati sono stati condotti in ambienti controllati e non riflettono la complessità della pratica clinica reale. In condizioni di laboratorio, l\'AI può eccellere, ma nella realtà quotidiana degli ospedali, con dati incompleti, pazienti non collaborativi e situazioni di emergenza, le performance crollano significativamente. Uno studio del 2023 su JAMA ha mostrato che l\'accuratezza dell\'AI scende al 78% in contesti clinici reali.',
				is_objection: true,
				vote_score: 5
			})
		);
		console.log('  ✅ Child objection created');

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
		console.log('  ✅ Child confirmation created');

		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				parent: createdControArgs[0].id,
				argument: 'L\'AI può essere programmata per considerare fattori contestuali attraverso questionari strutturati e analisi multimodale che include dati socio-economici, storia familiare e stile di vita. Sistemi moderni di AI utilizzano Natural Language Processing per analizzare le note cliniche e identificare pattern che un medico potrebbe perdere. L\'empatia non diagnostica malattie, i dati sì.',
				is_objection: true,
				vote_score: 4
			})
		);
		console.log('  ✅ Child objection created');

		// Add more varied content with negative scores
		console.log('Adding more varied arguments...');
		
		// More Pro arguments with varied quality
		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				argument: 'L\'AI non sbaglia mai, è sempre perfetta e i medici sbagliano sempre.',
				is_objection: false,
				vote_score: -3
			})
		);
		
		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				argument: 'Penso che l\'AI sia utile perché è moderna e tecnologica.',
				is_objection: false,
				vote_score: -1
			})
		);

		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				argument: 'L\'AI può operare 24/7 senza pause, riducendo i tempi di attesa e permettendo diagnosi immediate anche di notte o nei weekend.',
				is_objection: false,
				vote_score: 5
			})
		);

		// More Contro arguments with varied quality
		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				argument: 'Non mi fido dei computer.',
				is_objection: true,
				vote_score: -5
			})
		);

		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				argument: 'L\'AI è troppo costosa e complicata.',
				is_objection: true,
				vote_score: -2
			})
		);

		await directus.request(
			createItem('arguments', {
				debate: debate.id,
				argument: 'La privacy dei dati medici è a rischio con sistemi centralizzati di AI. Chi garantisce che i dati sensibili non vengano hackerati o usati impropriamente?',
				is_objection: true,
				vote_score: 7
			})
		);

		console.log('  ✅ Additional arguments created');

		// Add many child arguments with similar scores for reordering test
		console.log('Adding child arguments with similar scores...');
		
		const firstProId = createdProArgs[0].id;
		const firstControId = createdControArgs[0].id;
		
		// Children for first Pro argument with scores 6-9
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstProId,
			argument: 'I dati mostrano che l\'AI ha ridotto gli errori diagnostici del 40% negli ospedali pilota.',
			is_objection: false,
			vote_score: 9
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstProId,
			argument: 'Molti pazienti preferiscono una seconda opinione da AI prima di procedere con trattamenti invasivi.',
			is_objection: false,
			vote_score: 8
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstProId,
			argument: 'L\'AI può analizzare migliaia di casi simili in secondi, cosa impossibile per un medico.',
			is_objection: false,
			vote_score: 7
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstProId,
			argument: 'Gli studi dimostrano che l\'AI è particolarmente efficace nella diagnosi precoce.',
			is_objection: false,
			vote_score: 6
		}));

		// Objections to first Pro with scores 4-7
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstProId,
			argument: 'Ma l\'AI non può sostituire l\'esperienza clinica di decenni di un medico esperto.',
			is_objection: true,
			vote_score: 7
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstProId,
			argument: 'I costi iniziali di implementazione sono proibitivi per la maggior parte degli ospedali.',
			is_objection: true,
			vote_score: 6
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstProId,
			argument: 'Serve formazione specifica per interpretare correttamente i risultati dell\'AI.',
			is_objection: true,
			vote_score: 5
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstProId,
			argument: 'Non tutti i pazienti si fidano delle diagnosi fatte da una macchina.',
			is_objection: true,
			vote_score: 4
		}));

		// Children for first Contro argument with scores 5-8
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstControId,
			argument: 'La relazione umana è fondamentale per la compliance terapeutica del paziente.',
			is_objection: false,
			vote_score: 8
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstControId,
			argument: 'I medici considerano fattori culturali e sociali che l\'AI non può comprendere.',
			is_objection: false,
			vote_score: 7
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstControId,
			argument: 'L\'intuizione medica basata sull\'esperienza è insostituibile.',
			is_objection: false,
			vote_score: 6
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstControId,
			argument: 'Un medico può adattare la comunicazione al livello di comprensione del paziente.',
			is_objection: false,
			vote_score: 5
		}));

		// Objections to first Contro with scores 3-6
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstControId,
			argument: 'L\'AI può essere programmata per considerare fattori culturali attraverso database specifici.',
			is_objection: true,
			vote_score: 6
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstControId,
			argument: 'La "intuizione" spesso è solo bias cognitivo mascherato da esperienza.',
			is_objection: true,
			vote_score: 5
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstControId,
			argument: 'Sistemi di NLP possono generare spiegazioni personalizzate per ogni paziente.',
			is_objection: true,
			vote_score: 4
		}));
		
		await directus.request(createItem('arguments', {
			debate: debate.id,
			parent: firstControId,
			argument: 'L\'empatia non cura, i dati sì.',
			is_objection: true,
			vote_score: 3
		}));

		console.log('  ✅ Child arguments with similar scores created');

		console.log('\n🎉 Test data created successfully!');
		console.log(`\n📊 Debate ID: ${debate.id}`);
		console.log(`🌐 Visit: http://localhost:5173/debate/${debate.id}`);
		
	} catch (error) {
		console.error('❌ Error seeding test data:', error);
		throw error;
	}
}

seedTestData();
